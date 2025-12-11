'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { Button } from '@/components/ui/button';
import {
    Home,
    Users,
    MessageSquare,
    MessageCircle,
    User,
    Bell,
    Menu,
    Sparkles,
    Search,
    Filter,
    MapPin,
    Briefcase,
    Heart
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommonNavbar } from '@/components/common-navbar';
import { toast } from 'sonner';

export default function FriendsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Track if search has been performed
    const [sendingRequest, setSendingRequest] = useState<string | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Enable smooth scrolling globally and optimize for all devices
    useEffect(() => {
        // Set smooth scrolling on html element
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.scrollBehavior = 'smooth';

        // Optimize for touch devices (Surface, tablets, etc.)
        document.documentElement.style.touchAction = 'pan-y';
        document.body.style.touchAction = 'pan-y';

        // Prevent scroll chaining issues
        document.documentElement.style.overscrollBehavior = 'auto';
        document.body.style.overscrollBehavior = 'auto';

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';
            document.documentElement.style.touchAction = '';
            document.body.style.touchAction = '';
            document.documentElement.style.overscrollBehavior = '';
            document.body.style.overscrollBehavior = '';
        };
    }, []);

    // Helper function to get current user ID
    const getCurrentUserId = async (): Promise<string | null> => {
        const userEmail = getCookie('userEmail');
        if (!userEmail) return null;

        try {
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            return data?.id || null;
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return null;
        }
    };

    // Helper function to track activity
    const trackActivity = async (actionType: string, actionCategory: string, metadata?: any) => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
            await fetch('/api/activity/track-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    actionType,
                    actionCategory,
                    resourceType: 'friends',
                    metadata: {
                        ...metadata,
                        pagePath: '/friends',
                        timestamp: new Date().toISOString(),
                    },
                }),
            }).catch(console.error);
        } catch (error) {
            console.error('Error tracking activity:', error);
        }
    };

    useEffect(() => {
        const checkAuth = () => {
            const email = getCookie('userEmail') as string;
            if (!email) {
                router.push('/login');
                return;
            }
            setIsLoading(false);

            // Track page access
            const trackPageAccess = async () => {
                const userId = await getCurrentUserId();
                if (!userId) return;

                try {
                    await fetch('/api/activity/track-event', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            actionType: 'page_accessed',
                            actionCategory: 'social',
                            resourceType: 'friends',
                            metadata: {
                                feature: 'friends',
                                pagePath: '/friends',
                                timestamp: new Date().toISOString(),
                            },
                        }),
                    }).catch(console.error);
                } catch (error) {
                    console.error('Error tracking activity:', error);
                }
            };
            trackPageAccess();
        };

        checkAuth();
    }, [router]);

    const fetchRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
            const email = getCookie('userEmail') as string;
            if (!email) return;

            // Get 10 random recommendations (connection statuses already included)
            const response = await fetch(`/api/users/recommendations?email=${encodeURIComponent(email)}&limit=10&randomize=true`);
            if (response.ok) {
                const data = await response.json();
                const users = data.users || [];

                // Randomly select 4 users from the first 10
                const shuffled = [...users].sort(() => 0.5 - Math.random());
                const selectedUsers = shuffled.slice(0, 4);

                setRecommendations(selectedUsers);

                // Connection statuses are already included in the API response
                const statuses: Record<string, string> = {};
                const sentRequestsSet = new Set<string>();

                selectedUsers.forEach((user: any) => {
                    if (user.connectionStatus) {
                        statuses[user.id] = user.connectionStatus;
                        if (user.connectionStatus === 'pending') {
                            sentRequestsSet.add(user.id);
                        }
                    }
                });

                setConnectionStatuses(statuses);
                setSentRequests(sentRequestsSet);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            fetchRecommendations();
        }
    }, [isLoading]);

    // Removed checkConnectionStatuses - now handled by optimized API endpoints
    // Connection statuses are included in the API responses

    // Debounced search function
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const email = getCookie('userEmail') as string;
            if (!email) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/users/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim(), email, page: 1, limit: 10 }),
            });

            if (response.ok) {
                const data = await response.json();
                const results = data.results || [];
                setSearchResults(results);

                // Connection statuses are already included in the API response
                const statuses: Record<string, string> = {};
                const sentRequestsSet = new Set<string>();

                results.forEach((user: any) => {
                    const userObj = user.user || user;
                    if (userObj.connectionStatus) {
                        statuses[userObj.id] = userObj.connectionStatus;
                        if (userObj.connectionStatus === 'pending') {
                            sentRequestsSet.add(userObj.id);
                        }
                    }
                });

                setConnectionStatuses(statuses);
                setSentRequests(sentRequestsSet);

                // Track search activity
                trackActivity('user_search', 'social', {
                    feature: 'friends',
                    searchQuery: query.trim(),
                    resultCount: results.length,
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.error || 'Failed to search users');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            toast.error('Failed to search users');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [router]);

    // Debounced search effect - triggers search 500ms after user stops typing
    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If query is empty, clear results immediately
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            setIsSearching(false);
            return;
        }

        // Set loading state immediately when user types
        setIsSearching(true);

        // Debounce the search
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(searchQuery);
        }, 500); // Wait 500ms after user stops typing

        // Cleanup
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, performSearch]);

    // Handle manual search button click (immediate search)
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any pending debounced search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Perform search immediately
        await performSearch(searchQuery);
    };

    const handleConnect = async (rec: any) => {
        if (!rec.id && !rec.user?.id) return;
        const userId = rec.id || rec.user?.id;
        const userEmail = rec.email || rec.user?.email;
        setSendingRequest(userId);
        try {
            const senderEmail = getCookie('userEmail') as string;
            if (!senderEmail) {
                toast.error('Please log in to send connection requests');
                setSendingRequest(null);
                return;
            }
            const response = await fetch('/api/connections/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail,
                    receiverEmail: userEmail,
                    message: `Hi ${rec.name || rec.user?.name || 'there'}! I would like to connect with you on Networkqy.`
                })
            });
            if (response.ok) {
                toast.success('Connection request sent!');
                setSentRequests(prev => new Set(prev).add(userId));
                setConnectionStatuses(prev => ({ ...prev, [userId]: 'pending' }));

                // Track friend request activity
                trackActivity('friend_request_sent', 'social', {
                    feature: 'friends',
                    receiverEmail: userEmail,
                    receiverId: userId,
                    receiverName: rec.name || rec.user?.name || 'Unknown',
                });
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send connection request');
            }
        } catch (error) {
            toast.error('Error sending connection request');
        } finally {
            setSendingRequest(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
                {/* Blurred Background */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed',
                        filter: 'blur(4px)'
                    }}
                />
                <div className="text-center relative z-10">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">
                        Loading Network Recommendations...
                    </h2>
                    <p className="text-black font-medium">
                        Finding the best connections for you
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-x-hidden"
            style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'auto',
                touchAction: 'pan-y',
                willChange: 'scroll-position'
            }}
        >
            {/* Blurred Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/bpdcbg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'scroll',
                    filter: 'blur(4px)',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                }}
            />

            {/* Common Navbar */}
            <CommonNavbar currentPage="/friends" />

            {/* Main Content */}
            <div
                className="p-6 max-w-7xl mx-auto pb-20"
                style={{
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    willChange: 'scroll-position',
                    minHeight: 'calc(100vh - 80px)'
                }}
            >
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Find Your Network
                    </h1>
                    <p className="text-white">
                        Discover and connect with professionals worldwide
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-gradient-to-br from-gray-200/95 via-gray-300/90 to-gray-200/95 dark:from-gray-700/95 dark:via-gray-600/90 dark:to-gray-700/95 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-400/50 dark:border-gray-500/50 shadow-xl">
                    <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSearch}>
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 size-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, company, or skills..."
                                    className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-gray-800/90 border-2 border-gray-400 dark:border-gray-500 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-md"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="default" className="h-full px-6 bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 text-black font-semibold">{isSearching ? 'Searching...' : 'Search'}</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-black bg-white/90 dark:bg-gray-800/90 border-2 border-gray-400 dark:border-gray-500 shadow-md font-semibold">
                                <MapPin className="size-4" />
                                <span>Dubai</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-black bg-white/90 dark:bg-gray-800/90 border-2 border-gray-400 dark:border-gray-500 shadow-md font-semibold">
                                <Briefcase className="size-4" />
                                <span>Industry</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-black bg-white/90 dark:bg-gray-800/90 border-2 border-gray-400 dark:border-gray-500 shadow-md font-semibold">
                                <Filter className="size-4" />
                                <span>Filters</span>
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Closest Matches Section */}
                {!searchQuery.trim() && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                Closest Matches
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchRecommendations}
                                disabled={loadingRecommendations}
                                className="text-black border-bits-golden-yellow/20 hover:bg-bits-golden-yellow/10 dark:text-black dark:border-bits-golden-yellow/30 dark:hover:bg-bits-golden-yellow/20"
                            >
                                {loadingRecommendations ? 'Refreshing...' : 'Refresh'}
                            </Button>
                        </div>

                        {loadingRecommendations ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-gradient-to-br from-white/90 via-purple-50/20 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 animate-pulse">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                                            </div>
                                        </div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recommendations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {recommendations.map((user) => {
                                    // Use connectionStatus from API response, fallback to state
                                    const connectionStatus = user.connectionStatus || connectionStatuses[user.id];
                                    const isPending = sentRequests.has(user.id) || connectionStatus === 'pending';

                                    return (
                                        <div
                                            key={user.id}
                                            className="bg-gradient-to-br from-white/90 via-purple-50/20 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 hover:shadow-2xl hover:shadow-bits-golden-yellow/20 dark:hover:shadow-bits-golden-yellow/30 transition-all duration-300 flex flex-col cursor-pointer hover:ring-2 hover:ring-bits-golden-yellow hover:scale-105"
                                            onClick={() => {
                                                if (user.email) {
                                                    // Track profile view
                                                    trackActivity('profile_viewed', 'social', {
                                                        feature: 'friends',
                                                        viewedEmail: user.email,
                                                        viewedId: user.id,
                                                        viewedName: user.name || 'Unknown',
                                                        source: 'recommendations',
                                                    });
                                                    router.push(`/friendprof?email=${encodeURIComponent(user.email)}`);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-12 bg-gradient-to-br from-bits-golden-yellow to-bits-royal-blue rounded-full flex items-center justify-center shadow-lg ring-2 ring-bits-golden-yellow/20 dark:ring-bits-golden-yellow/30">
                                                        <span className="text-bits-royal-blue dark:text-black font-semibold">
                                                            {user.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-bits-royal-blue dark:text-black">
                                                            {user.name || 'Professional'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {user.profilemetrics || user.headline || 'Technology Professional'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    <Heart className="size-4" />
                                                </Button>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                                {user.linkedinInfo || user.goals || 'Experienced professional looking to connect and collaborate.'}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {(user.strengths || '').split(',').slice(0, 2).map((skill: string, index: number) => (
                                                    <span key={`${user.id}-${skill}-${index}`} className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-bits-royal-blue dark:text-black text-xs rounded-full shadow-md font-medium">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                {connectionStatus === 'accepted' ? (
                                                    <Button className="flex-1 bg-green-600 cursor-not-allowed text-black" disabled>
                                                        Connected
                                                    </Button>
                                                ) : isPending ? (
                                                    <Button className="flex-1 bg-gray-400 cursor-not-allowed text-black" disabled>
                                                        Pending
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="flex-1 bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 text-black"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConnect(user);
                                                        }}
                                                        disabled={sendingRequest === user.id}
                                                    >
                                                        {sendingRequest === user.id ? 'Sending...' : 'Connect'}
                                                    </Button>
                                                )}
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-black"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dm/${user.id}`);
                                                    }}
                                                >
                                                    Message
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="size-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-black mb-2">
                                    No recommendations available
                                </h3>
                                <p className="text-black font-bold">
                                    Try refreshing to get new recommendations
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchQuery.trim() ? (
                        isSearching ? (
                            // Loading state while searching
                            <div className="col-span-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-gradient-to-br from-white/90 via-purple-50/20 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl animate-pulse">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="size-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                                            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : hasSearched && searchResults.length > 0 ? (
                            searchResults.map((rec: any) => {
                                const userObj = rec.user || rec;
                                const hasUser = userObj?.id && userObj?.email;
                                // Use connectionStatus from API response, fallback to state
                                const connectionStatus = userObj.connectionStatus || connectionStatuses[userObj.id];
                                const isPending = hasUser && (sentRequests.has(userObj.id) || connectionStatus === 'pending');
                                return (
                                    <div
                                        key={userObj.id || rec.userId}
                                        className="bg-gradient-to-br from-white/90 via-purple-50/20 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 hover:shadow-2xl hover:shadow-bits-golden-yellow/20 dark:hover:shadow-bits-golden-yellow/30 transition-all duration-300 flex flex-col cursor-pointer hover:ring-2 hover:ring-bits-golden-yellow hover:scale-105"
                                        onClick={e => {
                                            if ((e.target as HTMLElement).closest('button')) return;
                                            if (userObj.email) {
                                                // Track profile view
                                                trackActivity('profile_viewed', 'social', {
                                                    feature: 'friends',
                                                    viewedEmail: userObj.email,
                                                    viewedId: userObj.id,
                                                    viewedName: userObj.name || 'Unknown',
                                                    source: 'search_results',
                                                });
                                                router.push(`/friendprof?email=${encodeURIComponent(userObj.email)}`);
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 bg-gradient-to-br from-bits-golden-yellow to-bits-royal-blue rounded-full flex items-center justify-center shadow-lg ring-2 ring-bits-golden-yellow/20 dark:ring-bits-golden-yellow/30">
                                                    <span className="text-bits-royal-blue dark:text-black font-semibold">
                                                        {userObj.name?.charAt(0) || 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-bits-royal-blue dark:text-black">
                                                        {userObj.name || 'Professional'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {userObj.profilemetrics || userObj.industry || 'Technology'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Heart className="size-4" />
                                            </Button>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                            {userObj.linkedinInfo || userObj.bio || 'Experienced professional looking to connect and collaborate.'}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(userObj.strengths || userObj.skills || '').split(',').slice(0, 3).map((skill: string) => (
                                                <span key={`${userObj.id}-${skill}`} className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-bits-royal-blue dark:text-black text-xs rounded-full shadow-md font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        {hasUser ? (
                                            <div className="flex gap-2 mt-auto">
                                                {connectionStatus === 'accepted' ? (
                                                    <Button className="flex-1 bg-green-600 cursor-not-allowed text-black" disabled>
                                                        Connected
                                                    </Button>
                                                ) : isPending ? (
                                                    <Button className="flex-1 bg-gray-400 cursor-not-allowed text-black" disabled>
                                                        Pending
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="flex-1 bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 text-black"
                                                        onClick={() => handleConnect(userObj)}
                                                        disabled={sendingRequest === userObj.id}
                                                    >
                                                        {sendingRequest === userObj.id ? 'Sending...' : 'Connect'}
                                                    </Button>
                                                )}
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 text-black"
                                                    onClick={() => router.push(`/dm/${userObj.id}`)}
                                                >
                                                    Message
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button className="w-full bg-gray-400 cursor-not-allowed text-black" disabled>
                                                Not Available
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        ) : hasSearched && searchResults.length === 0 ? (
                            // No results found - only show after search has completed
                            <div className="col-span-full text-center py-12">
                                <Users className="size-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-black mb-2">
                                    No results found
                                </h3>
                                <p className="text-black font-bold mb-4">
                                    Try a different search term or check your spelling
                                </p>
                            </div>
                        ) : (
                            // Typing state - show helpful message while user is typing
                            <div className="col-span-full text-center py-12">
                                <Search className="size-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                                <h3 className="text-xl font-bold text-black mb-2">
                                    Searching...
                                </h3>
                                <p className="text-black font-bold">
                                    Finding matches for &quot;{searchQuery}&quot;
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Search className="size-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-black mb-2">
                                Start Your Search
                            </h3>
                            <p className="text-black font-bold mb-4">
                                Search for professionals by name, company, or skills to find your next connection
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 