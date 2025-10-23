'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { useRouter } from 'next/navigation';
import { FaUserFriends, FaHandshake, FaCheck, FaTimes, FaClock, FaUser, FaEnvelope, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import { toast } from 'sonner';
import { auth } from '@/app/(auth)/auth';
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
    Briefcase
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommonNavbar } from '@/components/common-navbar';

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

const ConnectionsPage = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'notifications'>('connections');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        const userEmail = getCookie('userEmail');
        if (!userEmail) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const initializeData = async () => {
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
            await fetchData();
        };
        initializeData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const userEmail = getCookie('userEmail') as string;
            if (!userEmail) {
                toast.error('Please log in to view connections');
                return;
            }

            // Fetch connections
            const connectionsResponse = await fetch(`/api/connections?userEmail=${encodeURIComponent(userEmail)}`);
            const connectionsData = await connectionsResponse.json();
            console.log('Connections data:', connectionsData);
            setConnections(connectionsData.connections || []);

            // Fetch pending requests
            const requestsResponse = await fetch(`/api/connections?type=requests&userEmail=${encodeURIComponent(userEmail)}`);
            const requestsData = await requestsResponse.json();
            console.log('Requests data:', requestsData);
            console.log('Requests array:', requestsData.requests);
            console.log('Requests length:', requestsData.requests?.length);
            setPendingRequests(requestsData.requests || []);

            // Fetch notifications
            const notificationsResponse = await fetch(`/api/notifications?userEmail=${encodeURIComponent(userEmail)}`);
            const notificationsData = await notificationsResponse.json();
            setNotifications(notificationsData.notifications || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

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
                fetchData(); // Refresh data
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to respond to connection request');
            }
        } catch (error) {
            console.error('Error responding to connection:', error);
            toast.error('Error responding to connection request');
        }
    };

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            if (response.ok) {
                // Update local state to mark notification as read
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? { ...notif, is_read: true }
                            : notif
                    )
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
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
            return data?.id;
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-bits-golden-yellow/10 to-gray-100 dark:from-slate-900 dark:via-bits-deep-purple/20 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-bits-golden-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading connections...</h2>
                    <p className="text-gray-600 dark:text-gray-400">Fetching your network</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-bits-golden-yellow/10 to-gray-100 dark:from-slate-900 dark:via-bits-deep-purple/20 dark:to-slate-900 relative overflow-hidden">
            {/* Vibrant Background Bubbles */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-bits-royal-blue/30 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-80 h-80 bg-bits-deep-purple/30 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-bits-golden-yellow/40 rounded-full blur-3xl opacity-70 animate-pulse delay-2000"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-bits-bright-red/25 rounded-full blur-3xl opacity-50 animate-pulse delay-500"></div>
                <div className="absolute top-1/2 left-1/4 w-88 h-88 bg-bits-golden-yellow/35 rounded-full blur-3xl opacity-65 animate-pulse delay-1500"></div>
            </div>
            
            {/* Common Navbar */}
            <CommonNavbar currentPage="/connections" />

            {/* Tab Navigation - Mobile Optimized */}
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1 bg-gradient-to-br from-white/90 via-bits-golden-yellow/10 to-white/90 dark:from-slate-800/90 dark:via-bits-deep-purple/20 dark:to-slate-800/90 rounded-lg p-1 mb-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20">
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-md transition-colors text-sm sm:text-base ${activeTab === 'connections'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <FaHandshake size={16} />
                        <span className="hidden sm:inline">Connections</span>
                        <span className="sm:hidden">Connections</span>
                        <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {connections.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-md transition-colors text-sm sm:text-base ${activeTab === 'requests'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <FaClock size={16} />
                        <span className="hidden sm:inline">Requests</span>
                        <span className="sm:hidden">Requests</span>
                        <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {pendingRequests.length}
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('notifications');
                            // Mark all unread notifications as read when viewing the tab
                            notifications.forEach(notif => {
                                if (!notif.is_read) {
                                    markNotificationAsRead(notif.id);
                                }
                            });
                        }}
                        className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-md transition-colors text-sm sm:text-base ${activeTab === 'notifications'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <FaEnvelope size={16} />
                        <span className="hidden sm:inline">Notifications</span>
                        <span className="sm:hidden">Notifications</span>
                        <span className="bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full text-xs">
                            {notifications.length}
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'connections' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Connections</h2>
                            {(!currentUserId) ? (
                                <div className="flex justify-center items-center py-12">
                                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                                </div>
                            ) : connections.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaUserFriends size={48} className="text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No connections yet</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">Start building your network by finding and connecting with other professionals.</p>
                                    <button
                                        onClick={() => router.push('/friends')}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                    >
                                        Find Connections
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {connections.map((connection) => (
                                        <motion.div
                                            key={connection.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow hover:ring-2 hover:ring-purple-400"
                                            onClick={e => {
                                                if ((e.target as HTMLElement).closest('button')) return;
                                                const user = getConnectionUser(connection, currentUserId);
                                                if (user && typeof user === 'object' && user.email) {
                                                    router.push(`/friendprof?email=${encodeURIComponent(user.email)}`);
                                                }
                                            }}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <FaUser className="text-purple-600 dark:text-purple-400" size={20} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                            {getConnectionUser(connection, currentUserId)?.name || 'Networkqy User'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {getConnectionUser(connection, currentUserId)?.email}
                                                        </p>
                                                        {getConnectionUser(connection, currentUserId)?.linkedinInfo && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                                                {getConnectionUser(connection, currentUserId)?.linkedinInfo}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
                                                    <span className="px-3 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-medium shadow-sm flex items-center gap-1.5 w-fit">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        Connected
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const user = getConnectionUser(connection, currentUserId);
                                                            console.log('Message button clicked:', { user, currentUserId, connection });
                                                            if (user && typeof user === 'object' && user.email) {
                                                                console.log('Navigating to messages with email:', user.email);
                                                                router.push(`/messages?email=${encodeURIComponent(user.email)}`);
                                                            } else {
                                                                console.error('User or email not found:', { user, currentUserId });
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        Message
                                                    </button>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 self-end sm:self-center">
                                                        {new Date(connection.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pending Requests</h2>
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaClock size={48} className="text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending requests</h3>
                                    <p className="text-gray-600 dark:text-gray-400">You don&apos;t have any pending connection requests.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Received Requests */}
                                    {currentUserId && pendingRequests.filter(request => request.receiver_id === currentUserId).length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Received Requests</h3>
                                            <div className="grid gap-4">
                                                {pendingRequests
                                                    .filter(request => request.receiver_id === currentUserId)
                                                    .map((request) => (
                                                        <motion.div
                                                            key={request.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow hover:ring-2 hover:ring-purple-400"
                                                            onClick={e => {
                                                                if ((e.target as HTMLElement).closest('button')) return;
                                                                if (request.sender?.email) {
                                                                    router.push(`/friendprof?email=${encodeURIComponent(request.sender.email)}`);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <FaUser className="text-blue-600 dark:text-blue-400" size={20} />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                                            {request.sender?.name || 'Networkqy User'}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                            {request.sender?.email}
                                                                        </p>
                                                                        {request.message && (
                                                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                                                                &quot;{request.message}&quot;
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                                    <button
                                                                        onClick={() => handleConnectionResponse(request.id, 'accepted')}
                                                                        className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                                                                    >
                                                                        <FaCheck size={14} />
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleConnectionResponse(request.id, 'rejected')}
                                                                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                                                                    >
                                                                        <FaTimes size={14} />
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sent Requests */}
                                    {currentUserId && pendingRequests.filter(request => request.sender_id === currentUserId).length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Sent Requests</h3>
                                            <div className="grid gap-4">
                                                {pendingRequests
                                                    .filter(request => request.sender_id === currentUserId)
                                                    .map((request) => (
                                                        <motion.div
                                                            key={request.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow hover:ring-2 hover:ring-purple-400"
                                                            onClick={e => {
                                                                if ((e.target as HTMLElement).closest('button')) return;
                                                                if (request.receiver?.email) {
                                                                    router.push(`/friendprof?email=${encodeURIComponent(request.receiver.email)}`);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <FaUser className="text-yellow-600 dark:text-yellow-400" size={20} />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                                            {request.receiver?.name || 'Networkqy User'}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                            {request.receiver?.email}
                                                                        </p>
                                                                        {request.message && (
                                                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                                                                &quot;{request.message}&quot;
                                                                            </p>
                                                                        )}
                                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                                            Sent on {new Date(request.created_at).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-medium shadow-sm flex items-center gap-1.5 w-fit">
                                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                                        Pending
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaEnvelope size={48} className="text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
                                    <p className="text-gray-600 dark:text-gray-400">You&apos;re all caught up!</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {notifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg cursor-pointer hover:shadow-xl transition-shadow ${!notification.is_read ? 'ring-2 ring-purple-500' : ''
                                                }`}
                                            onClick={() => {
                                                if (!notification.is_read) {
                                                    markNotificationAsRead(notification.id);
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 min-w-0 flex-1">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'connection_request' ? 'bg-blue-100 dark:bg-blue-600/20' :
                                                        notification.type === 'connection_accepted' ? 'bg-green-100 dark:bg-green-600/20' :
                                                            'bg-red-100 dark:bg-red-600/20'
                                                        }`}>
                                                        <FaEnvelope className={
                                                            notification.type === 'connection_request' ? 'text-blue-600 dark:text-blue-400' :
                                                                notification.type === 'connection_accepted' ? 'text-green-600 dark:text-green-400' :
                                                                    'text-red-600 dark:text-red-400'
                                                        } size={20} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                            {new Date(notification.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionsPage; 