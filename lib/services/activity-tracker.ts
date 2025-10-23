import { db } from '@/lib/db/queries';
import { userActivityLogs, userSessions, pageViews, featureUsage } from '@/lib/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface ActivityMetadata {
    [key: string]: any;
}

export interface TrackingContext {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
}

export class ActivityTracker {
    private static instance: ActivityTracker;

    private constructor() { }

    public static getInstance(): ActivityTracker {
        if (!ActivityTracker.instance) {
            ActivityTracker.instance = new ActivityTracker();
        }
        return ActivityTracker.instance;
    }

    /**
     * Log user activity
     */
    async logActivity(
        userId: string,
        actionType: string,
        actionCategory: string,
        context?: TrackingContext,
        metadata?: ActivityMetadata,
        resourceType?: string,
        resourceId?: string
    ) {
        try {
            await db.insert(userActivityLogs).values({
                user_id: userId,
                action_type: actionType,
                action_category: actionCategory,
                resource_type: resourceType,
                resource_id: resourceId,
                metadata: metadata || {},
                ip_address: context?.ipAddress,
                user_agent: context?.userAgent,
                session_id: context?.sessionId,
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't throw - activity tracking should not break main functionality
        }
    }

    /**
     * Track page view
     */
    async trackPageView(
        userId: string,
        pagePath: string,
        pageTitle?: string,
        referrer?: string,
        timeOnPage?: number,
        context?: TrackingContext
    ) {
        try {
            await db.insert(pageViews).values({
                user_id: userId,
                session_id: context?.sessionId,
                page_path: pagePath,
                page_title: pageTitle,
                referrer: referrer,
                time_on_page: timeOnPage,
            });
        } catch (error) {
            console.error('Failed to track page view:', error);
        }
    }

    /**
     * Track feature usage
     */
    async trackFeatureUsage(
        userId: string,
        featureName: string,
        action: string,
        metadata?: ActivityMetadata
    ) {
        try {
            await db.insert(featureUsage).values({
                user_id: userId,
                feature_name: featureName,
                action: action,
                metadata: metadata || {},
            });
        } catch (error) {
            console.error('Failed to track feature usage:', error);
        }
    }

    /**
     * Create or update user session
     */
    async createSession(
        userId: string,
        sessionToken: string,
        context?: TrackingContext
    ) {
        try {
            await db.insert(userSessions).values({
                user_id: userId,
                session_token: sessionToken,
                ip_address: context?.ipAddress,
                user_agent: context?.userAgent,
                device_type: this.getDeviceType(context?.userAgent),
                browser: this.getBrowser(context?.userAgent),
                os: this.getOS(context?.userAgent),
            });
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    }

    /**
     * Update session activity
     */
    async updateSessionActivity(sessionToken: string) {
        try {
            await db
                .update(userSessions)
                .set({ last_activity_at: new Date() })
                .where(eq(userSessions.session_token, sessionToken));
        } catch (error) {
            console.error('Failed to update session activity:', error);
        }
    }

    /**
     * End session
     */
    async endSession(sessionToken: string) {
        try {
            await db
                .update(userSessions)
                .set({
                    ended_at: new Date(),
                    is_active: false
                })
                .where(eq(userSessions.session_token, sessionToken));
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    }

    // Helper methods for device detection
    private getDeviceType(userAgent?: string): string {
        if (!userAgent) return 'unknown';
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile')) return 'mobile';
        if (ua.includes('tablet')) return 'tablet';
        return 'desktop';
    }

    private getBrowser(userAgent?: string): string {
        if (!userAgent) return 'unknown';
        const ua = userAgent.toLowerCase();
        if (ua.includes('chrome')) return 'chrome';
        if (ua.includes('firefox')) return 'firefox';
        if (ua.includes('safari')) return 'safari';
        if (ua.includes('edge')) return 'edge';
        return 'other';
    }

    private getOS(userAgent?: string): string {
        if (!userAgent) return 'unknown';
        const ua = userAgent.toLowerCase();
        if (ua.includes('windows')) return 'windows';
        if (ua.includes('mac')) return 'macos';
        if (ua.includes('linux')) return 'linux';
        if (ua.includes('android')) return 'android';
        if (ua.includes('ios')) return 'ios';
        return 'other';
    }
}

// Export singleton instance
export const activityTracker = ActivityTracker.getInstance(); 