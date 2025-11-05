'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { signOut, useSession } from 'next-auth/react';

interface CommonNavbarProps {
    currentPage?: string;
    showThemeToggle?: boolean;
    showSignOut?: boolean;
    hideForPublic?: boolean;
}

export function CommonNavbar({ currentPage, showThemeToggle = true, showSignOut = false, hideForPublic = false }: CommonNavbarProps) {
    const router = useRouter();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { data: session, status } = useSession();

    // Hide navbar for public users if hideForPublic is true
    if (hideForPublic && status !== 'loading' && !session) {
        return null;
    }

    const navigationItems = [
        { path: '/profile', label: 'Home', icon: Home },
        { path: '/friends', label: 'Network', icon: Users },
        { path: '/chat', label: 'AI Chat', icon: MessageSquare },
        { path: '/connections', label: 'Connections', icon: User },
        { path: '/anonymous-feed', label: 'Anonymous Feed', icon: MessageCircle },
        { path: '/messages', label: 'Messages', icon: MessageCircle },
        { path: '/job-board', label: 'Job Board', icon: Briefcase },
        { path: '/communities', label: 'Communities', icon: Users },
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
        setShowMobileMenu(false);
    };

    return (
        <div className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border-b border-gray-200/50 dark:border-white/10 sticky top-0 z-50">
            <div className="flex items-center p-4 w-full">
                {/* Logo and Brand */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => router.push('/profile')}
                        className="flex items-center gap-1 md:gap-2 text-black dark:text-black hover:opacity-80 transition-opacity group"
                    >
                        <div className="size-6 md:size-8 bg-gradient-to-br from-bits-golden-yellow to-bits-royal-blue rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Sparkles className="size-3 md:size-5 text-black" />
                        </div>
                        <span className="text-base md:text-lg font-extrabold bg-gradient-to-r from-red-500 via-yellow-400 to-blue-600 bg-clip-text text-transparent whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                            BITS PILANI, DUBAI CAMPUS
                        </span>
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2 ml-8 flex-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;
                        return (
                            <Button
                                key={item.path}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation(item.path)}
                                className={`flex items-center gap-2 text-black dark:text-black font-bold hover:opacity-80 transition-opacity ${isActive ? 'opacity-90' : 'opacity-100'
                                    }`}
                            >
                                <Icon className="size-4 text-black dark:text-black" />
                                <span>{item.label}</span>
                            </Button>
                        );
                    })}
                </div>

                {/* Right side - Notifications, Sign Out, and Mobile Menu */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    <NotificationBell />
                    {showSignOut && (
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-black dark:text-black font-bold hover:opacity-80 transition-opacity flex items-center justify-center"
                            title="Sign Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-black dark:text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12h-9m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
                    )}

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden text-black dark:text-black font-bold hover:opacity-80 transition-opacity"
                    >
                        <Menu className="size-5 text-black dark:text-black" />
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-gray-200/50 dark:border-white/10 bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm">
                    <div className="flex flex-col p-4 space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.path;
                            return (
                                <Button
                                    key={item.path}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleNavigation(item.path)}
                                    className={`flex items-center gap-2 text-black dark:text-black font-bold hover:opacity-80 transition-opacity justify-start ${isActive ? 'opacity-90' : 'opacity-100'
                                        }`}
                                >
                                    <Icon className="size-4 text-black dark:text-black" />
                                    <span>{item.label}</span>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
