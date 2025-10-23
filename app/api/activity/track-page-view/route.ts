import { NextRequest, NextResponse } from 'next/server';
import { activityTracker } from '@/lib/services/activity-tracker';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, pagePath, pageTitle, referrer, timeOnPage } = body;

        if (!userId || !pagePath) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, pagePath' },
                { status: 400 }
            );
        }

        // Get tracking context from request
        const context = {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            sessionId: request.cookies.get('sessionId')?.value || 'anonymous',
        };

        // Track page view
        await activityTracker.trackPageView(
            userId,
            pagePath,
            pageTitle,
            referrer,
            timeOnPage,
            context
        );

        // Also track as feature usage
        await activityTracker.trackFeatureUsage(
            userId,
            'page_navigation',
            'view',
            {
                path: pagePath,
                title: pageTitle,
                referrer,
                timeOnPage,
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking page view:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 