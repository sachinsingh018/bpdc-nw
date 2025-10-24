'use client';

import { useEffect, useState } from 'react';
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
    const [sendingRequest, setSendingRequest] = useState<string | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const email = getCookie('userEmail') as string;
            if (!email) {
                router.push('/login');
                return;
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router]);

    const fetchRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
            const email = getCookie('userEmail') as string;
            if (!email) return;

            const response = await fetch(`/api/users/recommendations?email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                const users = data.users || [];

                // Randomly select 4 users from the first 10
                const shuffled = [...users].sort(() => 0.5 - Math.random());
                const selectedUsers = shuffled.slice(0, 4);

                setRecommendations(selectedUsers);

                // Check connection statuses for recommendations
                await checkConnectionStatuses(selectedUsers);
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

    const checkConnectionStatuses = async (users: any[]) => {
        try {
            const currentUserEmail = getCookie('userEmail') as string;
            if (!currentUserEmail) return;

            // Get current user's ID
            const currentUserRes = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUserEmail }),
            });
            const currentUserData = await currentUserRes.json();
            if (!currentUserData?.id) return;

            // Get all connections for current user
            const allConnectionsRes = await fetch(`/api/connections/all?userEmail=${encodeURIComponent(currentUserEmail)}`);
            if (!allConnectionsRes.ok) return;

            const allConnectionsData = await allConnectionsRes.json();
            const allConnections = allConnectionsData.connections || [];

            // Check connection status for each user
            const statuses: Record<string, string> = {};

            for (const user of users) {
                const userObj = user.user || user;
                if (!userObj?.id || !userObj?.email) continue;

                // Get target user's ID
                const targetUserRes = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userObj.email }),
                });
                const targetUserData = await targetUserRes.json();
                if (!targetUserData?.id) continue;

                // Check if connection already exists
                const existingConnection = allConnections.find(
                    (conn: any) =>
                        (conn.sender_id === currentUserData.id && conn.receiver_id === targetUserData.id) ||
                        (conn.sender_id === targetUserData.id && conn.receiver_id === currentUserData.id)
                );

                if (existingConnection) {
                    statuses[userObj.id] = existingConnection.status;
                    if (existingConnection.status === 'pending') {
                        setSentRequests(prev => new Set(prev).add(userObj.id));
                    }
                }
            }

            setConnectionStatuses(statuses);
        } catch (error) {
            console.error('Error checking connection statuses:', error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setSearchResults([]);

        try {
            const email = getCookie('userEmail') as string;
            if (!email) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/users/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, email }),
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data || []);

                // Check connection statuses for search results
                await checkConnectionStatuses(data || []);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
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
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: `
                  radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
                  radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
                `
            }}>
                <div className="text-center">
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
        <div className="min-h-screen relative overflow-hidden" style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
              radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
              linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
            `
        }}>
            {/* Dynamic Vibrant Background Elements */}
            <div className="fixed inset-0 z-0">
                {/* Deep Royal Blue */}
                <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                {/* Bright Golden Yellow */}
                <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                {/* Crimson Red */}
                <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                {/* Charcoal Black */}
                <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                {/* Light Gray */}
                <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                {/* Mid-tone Blue */}
                <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                {/* Warm Golden Glow */}
                <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                {/* Vibrant Red */}
                <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                {/* Neon Purple */}
                <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
            </div>

            {/* Common Navbar */}
            <CommonNavbar currentPage="/friends" />

            {/* Main Content */}
            <div className="p-6 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-bits-royal-blue dark:text-black mb-2">
                        Find Your Network
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Discover and connect with professionals worldwide
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-gradient-to-br from-white/90 via-bits-golden-yellow/10 to-white/90 dark:from-slate-800/90 dark:via-bits-deep-purple/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20">
                    <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSearch}>
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, company, or skills..."
                                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-bits-royal-blue dark:text-black placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="default" className="h-full px-6 bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200">{isSearching ? 'Searching...' : 'Search'}</Button>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <MapPin className="size-4" />
                                <span>Dubai</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Briefcase className="size-4" />
                                <span>Industry</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
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
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-bits-royal-blue dark:text-black">
                                Closest Matches
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchRecommendations}
                                disabled={loadingRecommendations}
                                className="text-bits-golden-yellow border-bits-golden-yellow/20 hover:bg-bits-golden-yellow/10 dark:text-bits-golden-yellow dark:border-bits-golden-yellow/30 dark:hover:bg-bits-golden-yellow/20"
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
                                    const connectionStatus = connectionStatuses[user.id];
                                    const isPending = sentRequests.has(user.id) || connectionStatus === 'pending';

                                    return (
                                        <div
                                            key={user.id}
                                            className="bg-gradient-to-br from-white/90 via-purple-50/20 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 hover:shadow-2xl hover:shadow-bits-golden-yellow/20 dark:hover:shadow-bits-golden-yellow/30 transition-all duration-300 flex flex-col cursor-pointer hover:ring-2 hover:ring-bits-golden-yellow hover:scale-105"
                                            onClick={() => {
                                                if (user.email) {
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
                                                    <Button className="flex-1 bg-green-600 cursor-not-allowed" disabled>
                                                        Connected
                                                    </Button>
                                                ) : isPending ? (
                                                    <Button className="flex-1 bg-gray-400 cursor-not-allowed" disabled>
                                                        Pending
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="flex-1 bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200"
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
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
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
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-bits-royal-blue dark:text-black mb-2">
                                    No recommendations available
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Try refreshing to get new recommendations
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchQuery.trim() ? (
                        searchResults.length > 0 ? (
                            searchResults.map((rec: any) => {
                                const userObj = rec.user || rec;
                                const hasUser = userObj?.id && userObj?.email;
                                const connectionStatus = connectionStatuses[userObj.id];
                                const isPending = hasUser && (sentRequests.has(userObj.id) || connectionStatus === 'pending');
                                return (
                                    <div
                                        key={userObj.id || rec.userId}
                                        className="bg-gradient-to-br from-white/90 via-purple-50/20 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 hover:shadow-2xl hover:shadow-bits-golden-yellow/20 dark:hover:shadow-bits-golden-yellow/30 transition-all duration-300 flex flex-col cursor-pointer hover:ring-2 hover:ring-bits-golden-yellow hover:scale-105"
                                        onClick={e => {
                                            if ((e.target as HTMLElement).closest('button')) return;
                                            if (userObj.email) {
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
                                                    <Button className="flex-1 bg-green-600 cursor-not-allowed" disabled>
                                                        Connected
                                                    </Button>
                                                ) : isPending ? (
                                                    <Button className="flex-1 bg-gray-400 cursor-not-allowed" disabled>
                                                        Pending
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="flex-1 bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                                        onClick={() => handleConnect(userObj)}
                                                        disabled={sendingRequest === userObj.id}
                                                    >
                                                        {sendingRequest === userObj.id ? 'Sending...' : 'Connect'}
                                                    </Button>
                                                )}
                                                <Button
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                                    onClick={() => router.push(`/dm/${userObj.id}`)}
                                                >
                                                    Message
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button className="w-full bg-gray-400 cursor-not-allowed" disabled>
                                                Not Available
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Users className="size-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-bits-royal-blue dark:text-black mb-2">
                                    No results found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Try a different search term or check your spelling
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Search className="size-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-bits-royal-blue dark:text-black mb-2">
                                Start Your Search
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Search for professionals by name, company, or skills to find your next connection
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 