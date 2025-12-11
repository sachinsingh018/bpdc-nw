import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { dailyInterviews } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
    try {
        console.log('[Test API] Testing database connection...');

        // Simple test query
        const result = await db.select().from(dailyInterviews).limit(1);

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            tableExists: true,
            recordCount: result.length,
        });
    } catch (error: any) {
        console.error('[Test API] Error:', error);
        return NextResponse.json({
            success: false,
            error: error?.message,
            code: error?.code,
            detail: error?.detail,
            hint: error?.hint,
        }, { status: 500 });
    }
}

