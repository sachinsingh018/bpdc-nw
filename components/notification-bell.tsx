'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { getCookie } from 'cookies-next';

interface Notification {
    id: string;
    type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
    title: string;
    message: string;
    related_user_id?: string;
    related_connection_id?: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const fetchNotifications = async () => {
        try {
            // Get user email from cookie using cookies-next
            const userEmail = getCookie('userEmail') as string;

            console.log('Notification bell - userEmail from getCookie:', userEmail);

            if (!userEmail) {
                console.log('No user email found, skipping notification fetch');
                return;
            }

            const url = `/api/notifications?userEmail=${encodeURIComponent(userEmail)}`;
            console.log('Notification bell - fetching URL:', url);
            const response = await fetch(url);
            console.log('Notification bell - response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched notifications:', data.notifications);
                console.log('Connection request notifications:', data.notifications.filter((n: any) => n.type === 'connection_request'));

                // Only store unread notifications
                const unreadNotifications = data.notifications.filter((n: any) => !n.is_read);
                setNotifications(unreadNotifications);
                // Use the actual count of filtered unread notifications instead of API count
                setUnreadCount(unreadNotifications.length);
            } else {
                const errorData = await response.json();
                console.error('Notification bell - error response:', errorData);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
            });

            if (response.ok) {
                // Remove the notification from the UI immediately
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleConnectionResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
        try {
            // Get user email from cookie
            const userEmail = getCookie('userEmail') as string;
            if (!userEmail) {
                toast.error('User email not found. Please log in again.');
                return;
            }
            console.log('Handling connection response:', { connectionId, status, userEmail });

            // Show immediate feedback and store toast ID
            const toastId = toast.loading(`Processing ${status} request...`);

            const response = await fetch('/api/connections/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': userEmail,
                },
                body: JSON.stringify({
                    connectionId,
                    status,
                    userEmail,
                }),
            });

            // Always dismiss the loading toast
            toast.dismiss(toastId);

            if (response.ok) {
                const result = await response.json();
                console.log('Connection response success:', result);

                // Check if connection was already in the requested status
                if (result?.message?.includes('already') || result?.alreadyProcessed) {
                    toast.success(result.message || `Connection already ${status}`);
                } else {
                    toast.success(`Connection ${status}!`);
                }

                // Find and mark the notification as read in database
                const notificationToMark = notifications.find(notif => notif.related_connection_id === connectionId);
                if (notificationToMark) {
                    try {
                        await fetch(`/api/notifications/${notificationToMark.id}`, {
                            method: 'PATCH',
                        });
                        console.log('Notification marked as read in database');
                    } catch (error) {
                        console.error('Failed to mark notification as read:', error);
                    }
                }

                // Remove the notification from the UI immediately
                setNotifications(prev => {
                    const filtered = prev.filter(notif => notif.related_connection_id !== connectionId);
                    console.log('Notifications after removal:', filtered.length);
                    return filtered;
                });

                // Update unread count
                setUnreadCount(prev => Math.max(0, prev - 1));

                // Close the dropdown after successful action
                setIsOpen(false);
            } else {
                const errorData = await response.json();
                console.error('Connection response error:', errorData);
                toast.error(`Failed to ${status} connection request`);
            }
        } catch (error) {
            // Dismiss loading toast in case of error as well
            toast.dismiss();
            console.error('Failed to respond to connection:', error);
            toast.error('Error responding to connection request');
        }
    };

    // Calculate dropdown position when opening
    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
        setIsOpen(!isOpen);
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        // Cleanup function to remove stale notifications
        const cleanupInterval = setInterval(() => {
            setNotifications(prev => {
                const now = new Date();
                const filtered = prev.filter(notif => {
                    const notificationDate = new Date(notif.created_at);
                    const daysDiff = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24);
                    return daysDiff < 7; // Keep notifications for 7 days
                });
                if (filtered.length !== prev.length) {
                    console.log('Cleaned up stale notifications');
                }
                return filtered;
            });
        }, 60000); // Run cleanup every minute

        return () => {
            clearInterval(interval);
            clearInterval(cleanupInterval);
        };
    }, []);

    const dropdownContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="fixed w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
                    style={{
                        top: dropdownPosition.top,
                        right: dropdownPosition.right,
                        zIndex: 999999,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(147,51,234,0.8)]">
                                All caught up! 🎉
                            </h3>
                            <p className="text-sm text-gray-300 drop-shadow-[0_0_5px_rgba(147,51,234,0.6)]">
                                No unread notifications
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {notification.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                                                {format(new Date(notification.created_at), 'yyyy-MM-dd')}
                                            </p>
                                        </div>

                                        {!notification.is_read && (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(notification.id)}
                                                className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                                            >
                                                <Check className="size-4 text-green-500" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Connection request actions */}
                                    {notification.type === 'connection_request' && notification.related_connection_id && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    console.log('Accept button clicked for notification:', notification);
                                                    console.log('Connection ID:', notification.related_connection_id);
                                                    if (notification.related_connection_id) {
                                                        handleConnectionResponse(notification.related_connection_id, 'accepted');
                                                    }
                                                }}
                                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    console.log('Decline button clicked for notification:', notification);
                                                    console.log('Connection ID:', notification.related_connection_id);
                                                    if (notification.related_connection_id) {
                                                        handleConnectionResponse(notification.related_connection_id, 'rejected');
                                                    }
                                                }}
                                                className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                className="relative p-2 rounded-full bg-gradient-to-br from-purple-900 via-[#0E0B1E] to-black text-white hover:scale-105 transition-all duration-300 border border-purple-700 shadow-md"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
    );
} 