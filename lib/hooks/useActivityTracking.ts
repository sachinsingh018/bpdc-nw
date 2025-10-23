import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface UseActivityTrackingOptions {
    userId?: string;
    trackPageViews?: boolean;
    trackTimeOnPage?: boolean;
    trackClicks?: boolean;
    trackScroll?: boolean;
}

export function useActivityTracking(options: UseActivityTrackingOptions = {}) {
    const {
        userId,
        trackPageViews = true,
        trackTimeOnPage = true,
        trackClicks = false,
        trackScroll = false,
    } = options;

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const startTimeRef = useRef<number>(Date.now());
    const pageStartTimeRef = useRef<number>(Date.now());

    // Track page view when pathname changes
    useEffect(() => {
        if (trackPageViews && userId && userId !== 'anonymous') {
            const fullPath = searchParams?.toString()
                ? `${pathname}?${searchParams.toString()}`
                : pathname;

            // Send page view to API
            fetch('/api/activity/track-page-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    pagePath: fullPath,
                    pageTitle: document.title,
                    referrer: document.referrer,
                }),
            }).catch(console.error);
        }

        // Reset page start time
        pageStartTimeRef.current = Date.now();
    }, [pathname, searchParams, trackPageViews, userId]);

    // Track time on page before unmount
    useEffect(() => {
        if (!trackTimeOnPage || !userId || userId === 'anonymous') return;

        const handleBeforeUnload = () => {
            const timeOnPage = Math.round((Date.now() - pageStartTimeRef.current) / 1000);

            // Send time on page data
            navigator.sendBeacon('/api/activity/track-time-on-page', JSON.stringify({
                userId,
                pagePath: pathname,
                timeOnPage,
            }));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [pathname, trackTimeOnPage, userId]);

    // Track clicks if enabled
    useEffect(() => {
        if (!trackClicks || !userId || userId === 'anonymous') return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            const className = target.className || '';
            const id = target.id || '';
            const text = target.textContent?.slice(0, 100) || '';

            // Only track meaningful clicks (buttons, links, etc.)
            if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
                fetch('/api/activity/track-interaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        action: 'click',
                        element: {
                            tagName,
                            className,
                            id,
                            text,
                        },
                        pagePath: pathname,
                    }),
                }).catch(console.error);
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname, trackClicks, userId]);

    // Track scroll if enabled
    useEffect(() => {
        if (!trackScroll || !userId || userId === 'anonymous') return;

        let scrollTimeout: NodeJS.Timeout;
        let maxScrollDepth = 0;

        const handleScroll = () => {
            clearTimeout(scrollTimeout);

            const scrollDepth = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
            }

            scrollTimeout = setTimeout(() => {
                // Send scroll data after user stops scrolling
                fetch('/api/activity/track-interaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        action: 'scroll',
                        metadata: {
                            scrollDepth: maxScrollDepth,
                            pagePath: pathname,
                        },
                    }),
                }).catch(console.error);
            }, 1000);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [pathname, trackScroll, userId]);

    // Helper function to track custom events
    const trackEvent = (actionType: string, actionCategory: string, metadata?: any) => {
        if (!userId || userId === 'anonymous') return;

        fetch('/api/activity/track-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                actionType,
                actionCategory,
                metadata: {
                    ...metadata,
                    pagePath: pathname,
                    timestamp: new Date().toISOString(),
                },
            }),
        }).catch(console.error);
    };

    return { trackEvent };
} 