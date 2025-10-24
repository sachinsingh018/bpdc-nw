'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaUserFriends, FaHandshake, FaCheck, FaTimes, FaClock, FaUser, FaEnvelope, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import { toast } from 'sonner';
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
    Sparkles
} from 'lucide-react';
import { OptimizedNavbar } from '@/components/optimized-navbar';
import { PageLoading, SkeletonCard, NavigationLoading } from '@/components/loading-states';
import { useConnectionsData } from '@/hooks/useOptimizedData';
import { useSmoothNavigation } from '@/hooks/useSmoothNavigation';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';

interface Connection {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string;
    created_at: string;
    sender?: {
        id: string;
        name: string;
        email: string;
        linkedinInfo?: string;
    };
    receiver?: {
        id: string;
        name: string;
        email: string;
        linkedinInfo?: string;
    };
}

interface Notification {
    id: string;
    type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const OptimizedConnectionsPage = () => {
    const router = useRouter();
    const { isNavigating, navigateWithButtonFeedback, navigateWithCardFeedback } = useSmoothNavigation();
    const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'notifications'>('connections');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Use optimized data hook
    const { data: connectionsData, loading, error, refetch } = useConnectionsData();

    // Local state for immediate UI updates
    const [localConnectionsData, setLocalConnectionsData] = useState(connectionsData);

    // Update local state when hook data changes
    useEffect(() => {
        setLocalConnectionsData(connectionsData);
    }, [connectionsData]);

    // Check authentication
    useEffect(() => {
        const userEmail = getCookie('userEmail');
        if (!userEmail && !loading) {
            router.push('/login');
        }
    }, [router, loading]);
    //asas
    // Get current user ID
    useEffect(() => {
        const getCurrentUserId = async () => {
            const userEmail = getCookie('userEmail');
            if (!userEmail) return null;

            try {
                const response = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail }),
                });
                const data = await response.json();
                setCurrentUserId(data?.id);
            } catch (error) {
                console.error('Error getting current user ID:', error);
            }
        };

        if (!loading) {
            getCurrentUserId();
        }
    }, [loading]);



    const handleConnectionResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
        try {
            const userEmail = getCookie('userEmail') as string;
            if (!userEmail) {
                toast.error('Please log in to respond to connections');
                return;
            }

            const response = await fetch('/api/connections/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId, status, userEmail }),
            });

            if (response.ok) {
                toast.success(`Connection ${status} successfully`);

                // Update local state instead of refetching
                if (localConnectionsData) {
                    const updatedData = { ...localConnectionsData };

                    if (status === 'accepted') {
                        // Find the request and move it to connections
                        const requestIndex = updatedData.requests.findIndex((r: Connection) => r.id === connectionId);
                        if (requestIndex !== -1) {
                            const acceptedRequest = updatedData.requests[requestIndex];
                            // Update the status to accepted
                            acceptedRequest.status = 'accepted';
                            // Add to connections
                            updatedData.connections.push(acceptedRequest);
                            // Remove from requests
                            updatedData.requests.splice(requestIndex, 1);
                        }
                    } else {
                        // For rejected, just remove from requests
                        updatedData.requests = updatedData.requests.filter((r: Connection) => r.id !== connectionId);
                    }

                    // Update local state immediately for instant UI feedback
                    setLocalConnectionsData(updatedData);

                    // Refetch in background to sync with server
                    setTimeout(() => refetch(), 100);
                }
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to respond to connection request');
            }
        } catch (error) {
            console.error('Error responding to connection:', error);
            toast.error('Error responding to connection request');
        }
    };

    const getConnectionUser = (connection: Connection, currentUserId: string) => {
        if (connection.sender_id === currentUserId) {
            return connection.receiver;
        }
        return connection.sender;
    };

    const getConnectionType = (connection: Connection, currentUserId: string) => {
        if (connection.sender_id === currentUserId) {
            return 'sent';
        }
        return 'received';
    };

    // Show loading state
    if (loading) {
        return <PageLoading title="Loading Connections..." subtitle="Fetching your network data" />;
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="size-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Connections
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {error}
                    </p>
                    <Button onClick={refetch} className="bg-purple-600 hover:bg-purple-700">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    const { connections = [], requests = [], notifications = [] } = localConnectionsData || {};

    return (
        <>
            <NavigationLoading isVisible={isNavigating} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
                <OptimizedNavbar currentPage="connections" />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Tab Navigation - Mobile Optimized */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 dark:border-white/20 shadow-lg mb-8"
                    >
                        <div className="flex space-x-1">
                            {[
                                { key: 'connections', label: 'Connections', icon: FaUserFriends, count: connections.length },
                                { key: 'requests', label: 'Requests', icon: FaHandshake, count: requests.length },
                                { key: 'notifications', label: 'Notifications', icon: Bell, count: notifications.length }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                        }`}
                                >
                                    <tab.icon className="size-4" />
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.key
                                            ? 'bg-white/20 text-white'
                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Content Based on Active Tab */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'connections' && (
                            <div className="space-y-6">
                                <motion.h2
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    Your Connections ({connections.length})
                                </motion.h2>

                                {connections.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <FaUserFriends className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            No Connections Yet
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            Start building your network by connecting with other professionals
                                        </p>
                                        <Button
                                            onClick={(e) => {
                                                navigateWithButtonFeedback('/friends', e.currentTarget);
                                            }}
                                            className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                                        >
                                            Find Connections
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-4">
                                        {connections.map((connection: Connection, index: number) => (
                                            <motion.div
                                                key={connection.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow hover:ring-2 hover:ring-purple-400"
                                                onClick={e => {
                                                    if ((e.target as HTMLElement).closest('button')) return;
                                                    const user = getConnectionUser(connection, currentUserId || '');
                                                    if (user && typeof user === 'object' && user.email) {
                                                        navigateWithCardFeedback(`/friendprof?email=${encodeURIComponent(user.email)}`, e.currentTarget);
                                                    }
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="size-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                            {getConnectionUser(connection, currentUserId || '')?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                                {getConnectionUser(connection, currentUserId || '')?.name || 'Unknown User'}
                                                            </h3>
                                                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                                                {getConnectionUser(connection, currentUserId || '')?.email || 'No email'}
                                                            </p>
                                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                                Connected {new Date(connection.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
                                                        <span className="px-3 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-medium shadow-sm flex items-center gap-1.5 w-fit">
                                                            <div className="size-2 bg-white rounded-full animate-pulse"></div>
                                                            Connected
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const user = getConnectionUser(connection, currentUserId || '');
                                                                if (user && typeof user === 'object' && user.email) {
                                                                    navigateWithButtonFeedback(`/messages?email=${encodeURIComponent(user.email)}`, e.currentTarget);
                                                                }
                                                            }}
                                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                                                        >
                                                            <FaEnvelope className="size-3" />
                                                            Message
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="space-y-6">
                                <motion.h2
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    Pending Requests ({requests.length})
                                </motion.h2>

                                {requests.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <FaHandshake className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            No Pending Requests
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You don&apos;t have any pending connection requests
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-4">
                                        <AnimatePresence mode="popLayout">
                                            {requests.map((request: Connection, index: number) => (
                                                <motion.div
                                                    key={request.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100, scale: 0.8 }}
                                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow hover:ring-2 hover:ring-purple-400"
                                                    onClick={e => {
                                                        if ((e.target as HTMLElement).closest('button')) return;
                                                        if (request.receiver?.email) {
                                                            navigateWithCardFeedback(`/friendprof?email=${encodeURIComponent(request.receiver!.email)}`, e.currentTarget);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-4">
                                                            <div className="size-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                                {request.receiver?.name?.charAt(0) || 'U'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                                    {request.receiver?.name || 'Unknown User'}
                                                                </h3>
                                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                                                    {request.receiver?.email || 'No email'}
                                                                </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                                    Requested {new Date(request.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleConnectionResponse(request.id, 'accepted');
                                                                }}
                                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                            >
                                                                <FaCheck className="size-3" />
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleConnectionResponse(request.id, 'rejected');
                                                                }}
                                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                            >
                                                                <FaTimes className="size-3" />
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <motion.h2
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    Notifications ({notifications.length})
                                </motion.h2>

                                {notifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <Bell className="size-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            No Notifications
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You&apos;re all caught up!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        {notifications.filter((n: Notification) => !n.is_read).map((notification: Notification, index: number) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-white/20 shadow-lg ${!notification.is_read ? 'ring-2 ring-purple-400' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`size-3 rounded-full mt-2 ${notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-purple-500'
                                                        }`} />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                            {new Date(notification.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default OptimizedConnectionsPage; 