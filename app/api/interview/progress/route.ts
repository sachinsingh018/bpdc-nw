import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { dailyInterviews, interviewProgress } from '@/lib/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';
import { getCookie } from 'cookies-next';
import { getUser } from '@/lib/db/queries';

// Helper function to get user ID from session or cookie
async function getUserId(request: NextRequest): Promise<string | null> {
    try {
        const session = await auth();
        if (session?.user?.id) {
            return session.user.id;
        }

        const userEmail = getCookie('userEmail', { req: request as any });
        if (userEmail && typeof userEmail === 'string') {
            const [userData] = await getUser(userEmail);
            return userData?.id || null;
        }

        return null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
}

// Helper function to normalize date to start of day for comparison
function normalizeToDayStart(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

// GET - Load interview progress
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const todayStart = normalizeToDayStart(now);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

        // Get today's interview
        const todayInterview = await db
            .select()
            .from(dailyInterviews)
            .where(
                and(
                    eq(dailyInterviews.userId, userId),
                    gte(dailyInterviews.interviewDate, todayStart),
                    lt(dailyInterviews.interviewDate, tomorrowStart),
                    eq(dailyInterviews.isCompleted, false) // Only in-progress interviews
                )
            )
            .limit(1);

        if (todayInterview.length === 0) {
            return NextResponse.json({
                hasProgress: false,
                category: null,
                answers: []
            });
        }

        const interview = todayInterview[0];

        // Get all progress for this interview
        const progress = await db
            .select()
            .from(interviewProgress)
            .where(eq(interviewProgress.dailyInterviewId, interview.id))
            .orderBy(interviewProgress.questionId);

        return NextResponse.json({
            hasProgress: true,
            dailyInterviewId: interview.id,
            category: interview.category,
            answers: progress.map(p => ({
                questionId: p.questionId,
                question: p.question,
                answer: p.answer,
                aiFeedback: p.aiFeedback
            }))
        });

    } catch (error) {
        console.error('Error loading interview progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Save interview progress (start interview or save answer)
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { category, questionId, question, answer, aiFeedback } = body;

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 });
        }

        const now = new Date();
        const todayStart = normalizeToDayStart(now);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

        // Check if user has an interview today
        const existingInterview = await db
            .select()
            .from(dailyInterviews)
            .where(
                and(
                    eq(dailyInterviews.userId, userId),
                    gte(dailyInterviews.interviewDate, todayStart),
                    lt(dailyInterviews.interviewDate, tomorrowStart)
                )
            )
            .limit(1);

        let dailyInterviewId: string;

        if (existingInterview.length > 0) {
            const interview = existingInterview[0];

            // If completed, reject
            if (interview.isCompleted) {
                return NextResponse.json({
                    error: 'Interview already completed',
                    message: 'You have already completed your interview for today'
                }, { status: 400 });
            }

            // If different category, reject
            if (interview.category !== category) {
                return NextResponse.json({
                    error: 'Cannot switch category',
                    message: `You have an interview in progress for ${interview.category}. Please complete that interview first.`
                }, { status: 400 });
            }

            dailyInterviewId = interview.id;
        } else {
            // Create new interview record
            const [newInterview] = await db
                .insert(dailyInterviews)
                .values({
                    userId,
                    interviewDate: todayStart,
                    category,
                    isCompleted: false,
                })
                .returning({ id: dailyInterviews.id });

            dailyInterviewId = newInterview.id;
        }

        // If saving an answer
        if (questionId !== undefined && question && answer) {
            // Check if answer already exists
            const existingAnswer = await db
                .select()
                .from(interviewProgress)
                .where(
                    and(
                        eq(interviewProgress.dailyInterviewId, dailyInterviewId),
                        eq(interviewProgress.questionId, questionId)
                    )
                )
                .limit(1);

            if (existingAnswer.length > 0) {
                // Update existing answer
                await db
                    .update(interviewProgress)
                    .set({
                        answer,
                        aiFeedback: aiFeedback || null,
                        answeredAt: now,
                    })
                    .where(eq(interviewProgress.id, existingAnswer[0].id));
            } else {
                // Insert new answer
                await db.insert(interviewProgress).values({
                    dailyInterviewId,
                    userId,
                    category,
                    questionId,
                    question,
                    answer,
                    aiFeedback: aiFeedback || null,
                });
            }
        }

        return NextResponse.json({
            success: true,
            dailyInterviewId,
            message: questionId !== undefined ? 'Answer saved successfully' : 'Interview started successfully'
        });

    } catch (error: any) {
        console.error('Error saving interview progress:', error);

        // Check for unique constraint violation (duplicate question answer)
        if (error?.code === '23505' || error?.message?.includes('unique_interview_question')) {
            return NextResponse.json({
                error: 'Answer already exists',
                message: 'This question has already been answered'
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

