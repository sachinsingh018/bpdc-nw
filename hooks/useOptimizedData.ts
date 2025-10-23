import { useState, useEffect, useCallback } from 'react';
import { getCookie } from 'cookies-next';

interface UseOptimizedDataOptions {
    cacheKey?: string;
    cacheTime?: number; // in milliseconds
    immediate?: boolean;
}

interface UseOptimizedDataReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export function useOptimizedData<T>(
    fetchFunction: () => Promise<T>,
    options: UseOptimizedDataOptions = {}
): UseOptimizedDataReturn<T> {
    const { cacheKey, cacheTime = 5 * 60 * 1000, immediate = true } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (cacheKey && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey)!;
            if (Date.now() - cached.timestamp < cacheTime) {
                setData(cached.data);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFunction();
            setData(result);

            if (cacheKey) {
                cache.set(cacheKey, { data: result, timestamp: Date.now() });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, cacheKey, cacheTime]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [fetchData, immediate]);

    return { data, loading, error, refetch: fetchData };
}

// Specialized hook for user data
export function useUserData() {
    return useOptimizedData(
        async () => {
            const email = getCookie('userEmail') || 'sachintest@gmail.com';
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            return response.json();
        },
        { cacheKey: 'user-data', cacheTime: 2 * 60 * 1000 } // Cache for 2 minutes
    );
}

// Specialized hook for connections data
export function useConnectionsData() {
    return useOptimizedData(
        async () => {
            const userEmail = getCookie('userEmail') as string;
            if (!userEmail) {
                throw new Error('User not authenticated');
            }

            console.log('useConnectionsData - userEmail:', userEmail);
            console.log('useConnectionsData - userEmail type:', typeof userEmail);

            // Don't encode the email since it's stored as plain text in cookie
            const [connectionsResponse, requestsResponse, notificationsResponse] = await Promise.all([
                fetch(`/api/connections?userEmail=${encodeURIComponent(userEmail)}`),
                fetch(`/api/connections?type=requests&userEmail=${encodeURIComponent(userEmail)}`),
                fetch(`/api/notifications?userEmail=${encodeURIComponent(userEmail)}`)
            ]);

            console.log('useConnectionsData - notifications response status:', notificationsResponse.status);

            if (!notificationsResponse.ok) {
                const errorData = await notificationsResponse.json();
                console.error('useConnectionsData - notifications error:', errorData);
                throw new Error(`Notifications API error: ${errorData.error}`);
            }

            const [connectionsData, requestsData, notificationsData] = await Promise.all([
                connectionsResponse.json(),
                requestsResponse.json(),
                notificationsResponse.json()
            ]);

            return {
                connections: connectionsData.connections || [],
                requests: requestsData.requests || [],
                notifications: notificationsData.notifications || []
            };
        },
        { cacheKey: 'connections-data', cacheTime: 1 * 60 * 1000 } // Cache for 1 minute
    );
}

// Specialized hook for recommendations data
export function useRecommendationsData() {
    return useOptimizedData(
        async () => {
            const email = getCookie('userEmail');
            if (!email) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }

            return response.json();
        },
        { cacheKey: 'recommendations-data', cacheTime: 3 * 60 * 1000 } // Cache for 3 minutes
    );
}

// Clear cache function
export function clearCache(cacheKey?: string) {
    if (cacheKey) {
        cache.delete(cacheKey);
    } else {
        cache.clear();
    }
} 