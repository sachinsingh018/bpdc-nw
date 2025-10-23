'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { getCookie } from 'cookies-next';

interface Message {
    messageId: string;
    senderId: string;
    message: string;
    timestamp: string;
}

interface TypingStatus {
    userId: string;
    isTyping: boolean;
}

interface UseSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    sendMessage: (receiverId: string, message: string) => void;
    startTyping: (receiverId: string) => void;
    stopTyping: (receiverId: string) => void;
    markAsRead: (senderId: string, messageIds: string[]) => void;
    onNewMessage: (callback: (message: Message) => void) => void;
    onTypingStatus: (callback: (status: TypingStatus) => void) => void;
    onMessageSent: (callback: (data: { messageId: string; status: string }) => void) => void;
    onMessagesRead: (callback: (data: { readerId: string; messageIds: string[] }) => void) => void;
    onUserOnline: (callback: (data: { userId: string }) => void) => void;
    onUserOffline: (callback: (data: { userId: string }) => void) => void;
}

export const useSocket = (): UseSocketReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const userEmail = getCookie('userEmail') as string;

    // Initialize socket connection
    useEffect(() => {
        if (!userEmail) {
            console.log('No user email available, skipping Socket.IO connection');
            return;
        }

        console.log('Initializing Socket.IO connection with email:', userEmail);

        // Get the current URL for Socket.IO connection
        const getSocketUrl = () => {
            if (typeof window !== 'undefined') {
                // Use the current window location for production
                return window.location.origin;
            }
            // Fallback for SSR
            return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        };

        const socketUrl = getSocketUrl();
        console.log('Connecting to Socket.IO at:', socketUrl);

        const socket = io(socketUrl, {
            path: '/api/socketio',
            addTrailingSlash: false,
            transports: ['websocket', 'polling'], // Add polling as fallback
            timeout: 20000, // Increase timeout
            forceNew: true, // Force new connection
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to Socket.io');
            setIsConnected(true);

            // Authenticate user
            socket.emit('authenticate', { userEmail });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.io');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);

            // Log more details for debugging
            console.log('Socket connection details:', {
                url: getSocketUrl(),
                path: '/api/socketio',
                userEmail: userEmail ? 'present' : 'missing',
                error: error.message
            });

            // Try to reconnect after a delay
            setTimeout(() => {
                if (socket.disconnected) {
                    console.log('Attempting to reconnect...');
                    socket.connect();
                }
            }, 5000);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            socket.disconnect();
        };
    }, [userEmail]);

    // Send message
    const sendMessage = useCallback((receiverId: string, message: string) => {
        if (!socketRef.current || !isConnected) {
            console.error('Socket not connected');
            return;
        }

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get current user ID from cookie or session
        const getCurrentUserId = async () => {
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

        getCurrentUserId().then(senderId => {
            if (!socketRef.current) return;
            if (senderId) {
                socketRef.current.emit('send_message', {
                    senderId,
                    receiverId,
                    message,
                    messageId,
                });
            }
        });
    }, [isConnected, userEmail]);

    // Typing indicators
    const startTyping = useCallback((receiverId: string) => {
        if (!socketRef.current || !isConnected) return;

        // Get current user ID
        const getCurrentUserId = async () => {
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

        getCurrentUserId().then(senderId => {
            if (!socketRef.current) return;
            if (senderId) {
                socketRef.current.emit('typing_start', {
                    senderId,
                    receiverId,
                });
            }
        });
    }, [isConnected, userEmail]);

    const stopTyping = useCallback((receiverId: string) => {
        if (!socketRef.current || !isConnected) return;

        // Get current user ID
        const getCurrentUserId = async () => {
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

        getCurrentUserId().then(senderId => {
            if (!socketRef.current) return;
            if (senderId) {
                socketRef.current.emit('typing_stop', {
                    senderId,
                    receiverId,
                });
            }
        });
    }, [isConnected, userEmail]);

    // Mark messages as read
    const markAsRead = useCallback((senderId: string, messageIds: string[]) => {
        if (!socketRef.current || !isConnected) return;

        // Get current user ID
        const getCurrentUserId = async () => {
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

        getCurrentUserId().then(receiverId => {
            if (!socketRef.current) return;
            if (receiverId) {
                socketRef.current.emit('mark_read', {
                    senderId,
                    receiverId,
                    messageIds,
                });
            }
        });
    }, [isConnected, userEmail]);

    // Event listeners
    const onNewMessage = useCallback((callback: (message: Message) => void) => {
        if (!socketRef.current) return;
        socketRef.current.on('new_message', callback);
    }, []);

    const onTypingStatus = useCallback((callback: (status: TypingStatus) => void) => {
        if (!socketRef.current) return;
        socketRef.current.on('user_typing', callback);
    }, []);

    const onMessageSent = useCallback((callback: (data: { messageId: string; status: string }) => void) => {
        if (!socketRef.current) return;
        socketRef.current.on('message_sent', callback);
    }, []);

    const onMessagesRead = useCallback((callback: (data: { readerId: string; messageIds: string[] }) => void) => {
        if (!socketRef.current) return;
        socketRef.current.on('messages_read', callback);
    }, []);

    const onUserOnline = useCallback((callback: (data: { userId: string }) => void) => {
        if (!socketRef.current) return;
        socketRef.current.on('user_online', callback);
    }, []);

    const onUserOffline = useCallback((callback: (data: { userId: string }) => void) => {
        if (!socketRef.current) return;
        socketRef.current.on('user_offline', callback);
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        onNewMessage,
        onTypingStatus,
        onMessageSent,
        onMessagesRead,
        onUserOnline,
        onUserOffline,
    };
}; 