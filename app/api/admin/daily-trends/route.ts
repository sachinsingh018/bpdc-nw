import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { userActivityLogs } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateISO = startDate.toISOString();
        // Get daily activity trends
        const trends = await db
            .select({
                activity_date: sql<string>`date(${userActivityLogs.created_at})`,
                active_users: sql<number>`count(distinct ${userActivityLogs.user_id})`,
                total_actions: sql<number>`count(*)`,
                auth_actions: sql<number>`count(case when ${userActivityLogs.action_category} = 'authentication' then 1 end)`,
                social_actions: sql<number>`count(case when ${userActivityLogs.action_category} = 'social' then 1 end)`,
                content_actions: sql<number>`count(case when ${userActivityLogs.action_category} = 'content' then 1 end)`,
                job_actions: sql<number>`count(case when ${userActivityLogs.action_category} = 'jobs' then 1 end)`,
                community_actions: sql<number>`count(case when ${userActivityLogs.action_category} = 'communities' then 1 end)`,
            })
            .from(userActivityLogs)
            .where(sql`${userActivityLogs.created_at} >= ${startDateISO}`)
            .groupBy(sql`date(${userActivityLogs.created_at})`)
            .orderBy(sql`date(${userActivityLogs.created_at}) desc`);

        return NextResponse.json(trends);
    } catch (error) {
        console.error('Error fetching daily trends:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 