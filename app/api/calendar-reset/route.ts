import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { activityTracker } from '@/lib/services/activity-tracker';

// This endpoint should be called by a cron job or scheduled task weekly
export async function POST(request: NextRequest) {
    try {
        // Get all users who have calendar blocks
        const usersResult = await pool.query(
            `SELECT DISTINCT u.id, u.email, u.name, u.last_calendar_reset 
             FROM "User" u 
             INNER JOIN user_calendar_blocks ucb ON u.id = ucb.user_id
             WHERE ucb.week_start_date < NOW() - INTERVAL '7 days'`
        );

        const resetUsers: string[] = [];

        for (const user of usersResult.rows) {
            const userId = user.id;
            const userEmail = user.email;
            const userName = user.name;

            // Delete old calendar blocks (older than current week)
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Get Monday
            const weekStartStr = weekStart.toISOString().split('T')[0];

            await pool.query(
                `DELETE FROM user_calendar_blocks 
                 WHERE user_id = $1 AND week_start_date < $2`,
                [userId, weekStartStr]
            );

            // Update last_calendar_reset
            await pool.query(
                `UPDATE "User" SET last_calendar_reset = NOW() WHERE id = $1`,
                [userId]
            );

            // Send notification
            try {
                await activityTracker.logActivity(
                    userId,
                    'calendar_reset_reminder',
                    'profile',
                    undefined,
                    {
                        message: 'Your weekly calendar has been reset. Please update your availability.',
                        weekStart: weekStartStr,
                    },
                    'calendar',
                    userId
                );
            } catch (error) {
                console.error(`Error logging activity for user ${userId}:`, error);
            }

            resetUsers.push(userEmail);
        }

        return NextResponse.json({
            success: true,
            message: `Reset calendar for ${resetUsers.length} users`,
            users: resetUsers,
        });
    } catch (error) {
        console.error('Error resetting calendars:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

