import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user, dailyInterviews, interviewProgress } from '@/lib/db/schema';
import { eq, sql, and, gte, lt } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';
import { getCookie } from 'cookies-next';
import { getUser } from '@/lib/db/queries';

// Helper function to get user ID from session or cookie
async function getUserId(request: NextRequest): Promise<string | null> {
    try {
        // Try NextAuth session first
        const session = await auth();
        if (session?.user?.id) {
            return session.user.id;
        }

        // Fallback to cookie-based authentication
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

// Helper function to get start and end of day in UTC
function getDayBounds(date: Date): { start: Date; end: Date } {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    return { start, end };
}

// Helper function to normalize date to start of day for comparison
function normalizeToDayStart(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's date (normalized to start of day)
        const now = new Date();
        const todayStart = normalizeToDayStart(now);
        const tomorrowStart = new Date(todayStart);
        tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

        // Check if user has an interview today (completed or in progress)
        const todayInterview = await db
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

        if (todayInterview.length > 0) {
            const interview = todayInterview[0];
            const nextDayStart = new Date(todayStart);
            nextDayStart.setUTCDate(nextDayStart.getUTCDate() + 1);

            if (interview.isCompleted) {
                // Interview is completed
                return NextResponse.json({
                    canStart: false,
                    hasDoneToday: true,
                    isInProgress: false,
                    lastInterviewDate: interview.interviewDate,
                    lastInterviewCategory: interview.category,
                    nextAvailableDate: nextDayStart,
                    message: 'You have already completed an interview today. Come back tomorrow for another interview!'
                });
            } else {
                // Interview is in progress - return the category they must continue
                return NextResponse.json({
                    canStart: true,
                    hasDoneToday: false,
                    isInProgress: true,
                    inProgressCategory: interview.category,
                    dailyInterviewId: interview.id,
                    message: `You have an interview in progress. Please continue with the ${interview.category} interview.`
                });
            }
        }

        // Get total interview count
        const totalInterviews = await db
            .select({ count: sql<number>`count(*)` })
            .from(dailyInterviews)
            .where(eq(dailyInterviews.userId, userId));

        const interviewCount = Number(totalInterviews[0]?.count || 0);

        return NextResponse.json({
            canStart: true,
            hasDoneToday: false,
            interviewCount,
            message: 'Ready for your interview!'
        });

    } catch (error) {
        console.error('Error checking interview eligibility:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request body for category
        const body = await request.json().catch(() => ({}));
        const category = body.category || null;

        // Get today's date (normalized to start of day)
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

            // If already completed, reject
            if (interview.isCompleted) {
                return NextResponse.json({
                    success: false,
                    error: 'You have already completed an interview today',
                    message: 'Only one interview per day is allowed'
                }, { status: 400 });
            }

            // If in progress but different category, reject
            if (interview.category !== category) {
                return NextResponse.json({
                    success: false,
                    error: 'Cannot switch interview category',
                    message: `You have an interview in progress for ${interview.category}. Please complete that interview first.`
                }, { status: 400 });
            }

            // Use existing interview ID
            dailyInterviewId = interview.id;

            // Mark as completed
            await db
                .update(dailyInterviews)
                .set({
                    isCompleted: true,
                    completedAt: now,
                    updatedAt: now,
                })
                .where(eq(dailyInterviews.id, dailyInterviewId));
        } else {
            // Create new interview record
            const [newInterview] = await db
                .insert(dailyInterviews)
                .values({
                    userId,
                    interviewDate: todayStart,
                    category,
                    isCompleted: true,
                    completedAt: now,
                })
                .returning({ id: dailyInterviews.id });

            dailyInterviewId = newInterview.id;
        }

        // Also update user table for backward compatibility
        await db
            .update(user)
            .set({
                lastInterviewDate: now,
                interviewCount: sql`COALESCE(${user.interviewCount}, 0) + 1`
            })
            .where(eq(user.id, userId));

        return NextResponse.json({
            success: true,
            message: 'Interview completed successfully'
        });

    } catch (error: any) {
        console.error('Error marking interview as completed:', error);

        // Check if it's a unique constraint violation (user already has interview today)
        if (error?.code === '23505' || error?.message?.includes('unique_user_interview_date')) {
            return NextResponse.json({
                success: false,
                error: 'You have already completed an interview today',
                message: 'Only one interview per day is allowed'
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
} 