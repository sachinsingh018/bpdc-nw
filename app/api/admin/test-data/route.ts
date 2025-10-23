import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { userActivityLogs, userSessions, pageViews, featureUsage } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        // Add sample activity logs
        const sampleActivities = [
            {
                user_id: 'test-user-1',
                action_type: 'login',
                action_category: 'authentication',
                resource_type: 'user',
                resource_id: 'test-user-1',
                metadata: { method: 'email' },
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Test Browser)',
                session_id: 'test-session-1',
            },
            {
                user_id: 'test-user-1',
                action_type: 'view_job_board',
                action_category: 'jobs',
                resource_type: 'page',
                resource_id: 'job-board',
                metadata: { page: 'job-board' },
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Test Browser)',
                session_id: 'test-session-1',
            },
            {
                user_id: 'test-user-2',
                action_type: 'post_job',
                action_category: 'jobs',
                resource_type: 'job',
                resource_id: 'job-1',
                metadata: { category: 'alumni' },
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Test Browser)',
                session_id: 'test-session-2',
            },
        ];

        // Add sample sessions
        const sampleSessions = [
            {
                user_id: 'test-user-1',
                session_token: 'test-session-1',
                started_at: new Date(),
                last_activity: new Date(),
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Test Browser)',
                device_type: 'desktop',
                browser: 'chrome',
                os: 'windows',
            },
            {
                user_id: 'test-user-2',
                session_token: 'test-session-2',
                started_at: new Date(),
                last_activity: new Date(),
                ip_address: '127.0.0.1',
                user_agent: 'Mozilla/5.0 (Test Browser)',
                device_type: 'mobile',
                browser: 'safari',
                os: 'ios',
            },
        ];

        // Add sample page views
        const samplePageViews = [
            {
                user_id: 'test-user-1',
                session_id: 'test-session-1',
                page_path: '/job-board',
                page_title: 'Job Board',
                referrer: '/',
                time_on_page: 120,
            },
            {
                user_id: 'test-user-2',
                session_id: 'test-session-2',
                page_path: '/admin/dashboard',
                page_title: 'Admin Dashboard',
                referrer: '/job-board',
                time_on_page: 300,
            },
        ];

        // Add sample feature usage
        const sampleFeatureUsage = [
            {
                user_id: 'test-user-1',
                feature_name: 'job_board',
                action: 'view',
                metadata: { category: 'all' },
            },
            {
                user_id: 'test-user-2',
                feature_name: 'job_posting',
                action: 'create',
                metadata: { category: 'alumni' },
            },
        ];

        // Insert sample data
        await db.insert(userActivityLogs).values(sampleActivities);
        await db.insert(userSessions).values(sampleSessions);
        await db.insert(pageViews).values(samplePageViews);
        await db.insert(featureUsage).values(sampleFeatureUsage);

        return NextResponse.json({
            message: 'Sample data added successfully',
            activities: sampleActivities.length,
            sessions: sampleSessions.length,
            pageViews: samplePageViews.length,
            featureUsage: sampleFeatureUsage.length
        });
    } catch (error) {
        console.error('Error adding sample data:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
} 