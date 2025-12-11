'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
    Home,
    Users,
    MessageSquare,
    User,
    Bell,
    Menu,
    Sparkles,
    MessageCircle,
    Briefcase
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { CommonNavbar } from '@/components/common-navbar';
import type { UIMessage } from 'ai';
import { toast } from 'sonner';

export default function ChatPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string>(generateUUID());
    const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
    const [isLoadingChat, setIsLoadingChat] = useState(false);

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

    useEffect(() => {
        // Check if user is authenticated
        const userEmail = getCookie('userEmail');
        const userName = getCookie('userName');

        if (userEmail && typeof userEmail === 'string') {
            // User is authenticated, set up chat
            setUserId(userEmail);
            setIsLoggedin(true);

            // Fetch user details from database to get proper ID
            const fetchUserDetails = async () => {
                try {
                    const response = await fetch('/profile/api', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail }),
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        if (userData && userData.id) {
                            // Create user object for sidebar with proper ID
                            setUser({
                                email: userEmail,
                                name: userName || userData.name || 'User',
                                id: userData.id // Use the actual database ID
                            });
                        } else {
                            // Fallback to email as ID if no database record
                            setUser({
                                email: userEmail,
                                name: userName || 'User',
                                id: userEmail
                            });
                        }
                    } else {
                        // Fallback to email as ID if API fails
                        setUser({
                            email: userEmail,
                            name: userName || 'User',
                            id: userEmail
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    // Fallback to email as ID if fetch fails
                    setUser({
                        email: userEmail,
                        name: userName || 'User',
                        id: userEmail
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserDetails();
        } else {
            // User is not authenticated, redirect to login
            router.push('/login');
        }
    }, [router]);

    const handleChatSelect = async (chatId: string, messages: UIMessage[]) => {
        if (chatId === currentChatId) return; // Already viewing this chat

        setIsLoadingChat(true);
        try {
            setInitialMessages(messages);
            setCurrentChatId(chatId);
        } catch (error) {
            console.error('Error loading chat:', error);
            toast.error('Failed to load chat messages');
        } finally {
            setIsLoadingChat(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(generateUUID());
        setInitialMessages([]);
    };

    if (isLoading) {
        return (
            <div 
                className="min-h-screen relative overflow-x-hidden flex items-center justify-center" 
                style={{
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
                    `,
                    touchAction: 'pan-y',
                    overscrollBehavior: 'auto'
                }}
            >
                <div className="text-center">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">
                        Loading AI Chat...
                    </h2>
                    <p className="text-black font-medium">
                        Preparing your AI assistant
                    </p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar user={user} />
            <SidebarInset>
                <div
                    className="min-h-screen relative overflow-x-hidden"
                    style={{
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
                        `,
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'auto',
                        touchAction: 'pan-y',
                        willChange: 'scroll-position'
                    }}
                >
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
                    <CommonNavbar currentPage="/chat" showThemeToggle={false} />

                    {isLoadingChat ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="size-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Loading Chat...
                                </h2>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Chat
                                userId={userId}
                                key={currentChatId}
                                id={currentChatId}
                                initialMessages={initialMessages}
                                selectedChatModel={DEFAULT_CHAT_MODEL}
                                selectedVisibilityType="public"
                                isReadonly={false}
                                isLoggedin={isLoggedin}
                                user={user}
                                onChatSelect={handleChatSelect}
                                onNewChat={handleNewChat}
                            />
                            <DataStreamHandler id={currentChatId} />
                        </>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
} 