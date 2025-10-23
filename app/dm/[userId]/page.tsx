'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';

export default function DirectMessagePage() {
    const { userId: otherUserId } = useParams() as { userId: string };
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch current user ID from cookie
    useEffect(() => {
        const fetchUserId = async () => {
            let id = await getCookie('userId');
            if (!id) {
                const email = await getCookie('userEmail');
                if (email) {
                    // Fetch user by email from your API
                    const res = await fetch('/api/users/check', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        id = data?.id;
                    }
                }
            }
            setCurrentUserId(id as string);
        };
        fetchUserId();
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Use socket hook
    const { sendMessage, onNewMessage, isConnected } = useSocket();

    // Set up message listener
    useEffect(() => {
        if (!isConnected) return;

        const handleNewMessage = (msg: any) => {
            // Only add messages that are from or to the current user in this conversation
            if ((msg.senderId === currentUserId && msg.receiverId === otherUserId) ||
                (msg.senderId === otherUserId && msg.receiverId === currentUserId)) {
                setMessages((prev) => [...prev, {
                    senderId: msg.senderId,
                    text: msg.message,
                    timestamp: msg.timestamp,
                }]);
            }
        };

        onNewMessage(handleNewMessage);
    }, [isConnected, currentUserId, otherUserId, onNewMessage]);

    // Send message
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentUserId || !isConnected) return;

        const msg = {
            senderId: currentUserId,
            text: input,
            timestamp: new Date().toISOString(),
        };

        // Add message to local state immediately for optimistic UI
        setMessages((prev) => [...prev, msg]);

        // Send via socket
        sendMessage(otherUserId, input);
        setInput('');
    };

    if (!currentUserId) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col h-[80vh]">
                <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">Direct Message</h2>
                {!isConnected && (
                    <div className="text-center text-sm text-red-500 mb-4">Connecting to chat...</div>
                )}
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                    {messages.map((msg, index) => (
                        <div
                            key={`${msg.timestamp}-${msg.senderId}-${index}`}
                            className={`p-2 rounded-lg max-w-xs ${msg.senderId === currentUserId ? 'bg-purple-600 text-white ml-auto' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white mr-auto'}`}
                        >
                            <div className="text-sm">{msg.text}</div>
                            <div className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Type your message..."
                        disabled={!isConnected}
                    />
                    <Button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                        disabled={!isConnected || !input.trim()}
                    >
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
} 