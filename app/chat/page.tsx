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

export default function ChatPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const id = generateUUID();

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-bits-golden-yellow/10 to-gray-100 dark:from-slate-900 dark:via-bits-deep-purple/20 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-bits-golden-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Loading AI Chat...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
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
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-bits-golden-yellow/10 to-gray-100 dark:from-slate-900 dark:via-bits-deep-purple/20 dark:to-slate-900">
                    {/* Common Navbar */}
                    <CommonNavbar currentPage="/chat" showThemeToggle={false} />

                    <Chat
                        userId={userId}
                        key={id}
                        id={id}
                        initialMessages={[]}
                        selectedChatModel={DEFAULT_CHAT_MODEL}
                        selectedVisibilityType="public"
                        isReadonly={false}
                        isLoggedin={isLoggedin}
                    />
                    <DataStreamHandler id={id} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
} 