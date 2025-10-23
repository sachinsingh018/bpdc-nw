import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user, userActivityLogs, userSessions, pageViews } from '@/lib/db/schema';
import { sql, desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get user engagement data
        const engagementData = await db
            .select({
                id: user.id,
                email: user.email,
                name: user.name,
                registered_at: user.createdAt,
                total_actions: sql<number>`count(distinct ${userActivityLogs.id})`,
                total_sessions: sql<number>`count(distinct ${userSessions.id})`,
                total_page_views: sql<number>`count(distinct ${pageViews.id})`,
                last_activity: sql<string>`max(${userActivityLogs.created_at})`,
                social_actions: sql<number>`count(distinct case when ${userActivityLogs.action_category} = 'social' then ${userActivityLogs.id} end)`,
                content_actions: sql<number>`count(distinct case when ${userActivityLogs.action_category} = 'content' then ${userActivityLogs.id} end)`,
                job_actions: sql<number>`count(distinct case when ${userActivityLogs.action_category} = 'jobs' then ${userActivityLogs.id} end)`,
            })
            .from(user)
            .leftJoin(userActivityLogs, eq(user.id, userActivityLogs.user_id))
            .leftJoin(userSessions, eq(user.id, userSessions.user_id))
            .leftJoin(pageViews, eq(user.id, pageViews.user_id))
            .groupBy(user.id, user.email, user.name, user.createdAt)
            .orderBy(desc(sql`count(distinct ${userActivityLogs.id})`))
            .limit(limit);

        return NextResponse.json(engagementData);
    } catch (error) {
        console.error('Error fetching user engagement:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 