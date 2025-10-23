import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { featureUsage } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateISO = startDate.toISOString();
        // Get feature usage data
        const usageData = await db
            .select({
                feature_name: featureUsage.feature_name,
                usage_count: sql<number>`count(*)`,
            })
            .from(featureUsage)
            .where(sql`${featureUsage.created_at} >= ${startDateISO}`)
            .groupBy(featureUsage.feature_name)
            .orderBy(desc(sql`count(*)`));

        return NextResponse.json(usageData);
    } catch (error) {
        console.error('Error fetching feature usage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 