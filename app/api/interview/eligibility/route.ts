import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get user's interview data
        const userData = await db
            .select({
                lastInterviewDate: user.lastInterviewDate,
                interviewCount: user.interviewCount
            })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (!userData.length) {
            return NextResponse.json({
                canStart: false,
                daysUntilNext: 0,
                lastInterviewDate: null,
                interviewCount: 0,
                message: 'User not found'
            });
        }

        const { lastInterviewDate, interviewCount } = userData[0];

        if (!lastInterviewDate) {
            // First interview - always allowed
            return NextResponse.json({
                canStart: true,
                daysUntilNext: 0,
                lastInterviewDate: null,
                interviewCount: interviewCount || 0,
                message: 'Ready for your first interview!'
            });
        }

        const now = new Date();
        const lastInterview = new Date(lastInterviewDate);
        const daysSinceLastInterview = Math.floor((now.getTime() - lastInterview.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilNext = Math.max(0, 7 - daysSinceLastInterview);

        return NextResponse.json({
            canStart: daysSinceLastInterview >= 7,
            daysUntilNext,
            lastInterviewDate: lastInterview,
            interviewCount: interviewCount || 0,
            message: daysSinceLastInterview >= 7
                ? 'Ready for your next interview!'
                : `Next interview available in ${daysUntilNext} days`
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
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Mark interview as completed
        await db
            .update(user)
            .set({
                lastInterviewDate: new Date(),
                interviewCount: sql`${user.interviewCount} + 1`
            })
            .where(eq(user.id, userId));

        return NextResponse.json({
            success: true,
            message: 'Interview completed successfully'
        });

    } catch (error) {
        console.error('Error marking interview as completed:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 