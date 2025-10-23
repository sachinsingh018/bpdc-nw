import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { userActivityLogs, user } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const userId = searchParams.get('userId');
        const category = searchParams.get('category');

        // Build query with conditions
        let conditions = [];
        if (userId) {
            conditions.push(eq(userActivityLogs.user_id, userId));
        }
        if (category) {
            conditions.push(eq(userActivityLogs.action_category, category));
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
                email: user.email,
                name: user.name,
            })
            .from(userActivityLogs)
            .leftJoin(user, eq(userActivityLogs.user_id, user.id))
            .where(conditions.length > 0 ? conditions[0] : undefined)
            .orderBy(desc(userActivityLogs.created_at))
            .limit(limit);

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 