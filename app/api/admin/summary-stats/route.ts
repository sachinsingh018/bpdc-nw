import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user, userActivityLogs, userSessions, job, jobApplication } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '7d';

        // Calculate date range
        const now = new Date();
        let startDate: Date;

        switch (range) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        const startDateISO = startDate.toISOString();
        // Get total users
        const totalUsersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(user);
        const totalUsers = totalUsersResult[0]?.count || 0;

        const newUsersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(user)
            .where(sql`"createdAt" >= ${startDateISO}`);
        const newUsers = newUsersResult[0]?.count || 0;
        // Get new jobs posted in date range
        const newJobsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(job)
            .where(sql`created_at >= ${startDateISO}`);
        const newJobs = newJobsResult[0]?.count || 0;

        // Job applications by users (excluding Aura Bot)
        const userApplicationsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(jobApplication)
            .where(sql`created_at >= ${startDateISO} AND name != 'Aura Bot'`);
        const userApplications = userApplicationsResult[0]?.count || 0;

        const auraBotApplicationsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(jobApplication)
            .where(sql`created_at >= ${startDateISO} AND name = 'Aura Bot'`);
        const auraBotApplications = auraBotApplicationsResult[0]?.count || 0;


        // Get active users in date range
        const activeUsersResult = await db
            .select({ count: sql<number>`count(distinct user_id)` })
            .from(userActivityLogs)
            .where(sql`created_at >= ${startDateISO}`);
        const activeUsers = activeUsersResult[0]?.count || 0;

        // Get total actions in date range
        const totalActionsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(userActivityLogs)
            .where(sql`created_at >= ${startDateISO}`);
        const totalActions = totalActionsResult[0]?.count || 0;

        // Get total sessions in date range
        const totalSessionsResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(userSessions)
            .where(sql`started_at >= ${startDateISO}`);
        const totalSessions = totalSessionsResult[0]?.count || 0;

        return NextResponse.json({
            totalUsers,
            newUsers,
            activeUsers,
            totalActions,
            totalSessions,
            newJobs,
            userApplications,
            auraBotApplications,
        });
    } catch (error) {
        console.error('Error fetching summary stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 