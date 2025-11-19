import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { userActivityLogs } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '3');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const activities = await db
            .select({
                id: userActivityLogs.id,
                user_id: userActivityLogs.user_id,
                action_type: userActivityLogs.action_type,
                action_category: userActivityLogs.action_category,
                resource_type: userActivityLogs.resource_type,
                resource_id: userActivityLogs.resource_id,
                metadata: userActivityLogs.metadata,
                created_at: userActivityLogs.created_at,
            })
            .from(userActivityLogs)
            .where(eq(userActivityLogs.user_id, userId))
            .orderBy(desc(userActivityLogs.created_at))
            .limit(limit);

        return NextResponse.json(activities || []);
    } catch (error) {
        console.error('Error fetching user activities:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

