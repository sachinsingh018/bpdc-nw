import { NextRequest, NextResponse } from 'next/server';
import { activityTracker } from '@/lib/services/activity-tracker';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, actionType, actionCategory, metadata, resourceType, resourceId } = body;

        if (!userId || !actionType || !actionCategory) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, actionType, actionCategory' },
                { status: 400 }
            );
        }

        // Get tracking context from request
        const context = {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            sessionId: request.cookies.get('sessionId')?.value || 'anonymous',
        };

        // Log the activity
        await activityTracker.logActivity(
            userId,
            actionType,
            actionCategory,
            context,
            metadata,
            resourceType,
            resourceId
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 