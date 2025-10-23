'use client';

import { useState, useCallback } from 'react';
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
    Loader2,
    Briefcase
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';

interface OptimizedNavbarProps {
    currentPage?: string;
}

export function OptimizedNavbar({ currentPage }: OptimizedNavbarProps) {
    const router = useRouter();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isNavigating, setIsNavigating] = useState<string | null>(null);

    const handleNavigation = useCallback(async (path: string) => {
        if (isNavigating) return; // Prevent multiple clicks

        setIsNavigating(path);
        setShowMobileMenu(false);

        try {
            // Add a small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 100));
            router.push(path);
        } catch (error) {
            console.error('Navigation error:', error);
        } finally {
            // Clear loading state after a delay
            setTimeout(() => setIsNavigating(null), 500);
        }
    }, [router, isNavigating]);

    const NavButton = ({
        path,
        icon: Icon,
        label,
        isActive = false
    }: {
        path: string;
        icon: any;
        label: string;
        isActive?: boolean;
    }) => (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation(path)}
            disabled={isNavigating === path}
            className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 ${isActive ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
        >
            {isNavigating === path ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Icon className="w-4 h-4" />
            )}
            <span>{label}</span>
        </Button>
    );

    return (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                {/* Logo and Brand */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => handleNavigation('/profile')}
                        disabled={isNavigating === '/profile'}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group disabled:opacity-50"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                            {isNavigating === '/profile' ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Networkqy
                        </span>
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                    <NavButton
                        path="/profile"
                        icon={Home}
                        label="Home"
                        isActive={currentPage === 'profile'}
                    />
                    <NavButton
                        path="/friends"
                        icon={Users}
                        label="Network"
                        isActive={currentPage === 'friends'}
                    />
                    <NavButton
                        path="/chat"
                        icon={MessageSquare}
                        label="AI Chat"
                        isActive={currentPage === 'chat'}
                    />
                    <NavButton
                        path="/connections"
                        icon={User}
                        label="Connections"
                        isActive={currentPage === 'connections'}
                    />
                    <NavButton
                        path="/anonymous-feed"
                        icon={MessageCircle}
                        label="Anonymous Feed"
                        isActive={currentPage === 'anonymous-feed'}
                    />
                    <NavButton
                        path="/job-board"
                        icon={Briefcase}
                        label="Job Board"
                        isActive={currentPage === 'job-board'}
                    />
                    <NavButton
                        path="/communities"
                        icon={Users}
                        label="Communities"
                        isActive={currentPage === 'communities'}
                    />
                </div>

                {/* Right side - Notifications, Theme Toggle, and Mobile Menu */}
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <ThemeToggle />

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <div className="flex flex-col p-4 space-y-2">
                        <NavButton
                            path="/profile"
                            icon={Home}
                            label="Home"
                            isActive={currentPage === 'profile'}
                        />
                        <NavButton
                            path="/friends"
                            icon={Users}
                            label="Network"
                            isActive={currentPage === 'friends'}
                        />
                        <NavButton
                            path="/chat"
                            icon={MessageSquare}
                            label="AI Chat"
                            isActive={currentPage === 'chat'}
                        />
                        <NavButton
                            path="/connections"
                            icon={User}
                            label="Connections"
                            isActive={currentPage === 'connections'}
                        />
                        <NavButton
                            path="/anonymous-feed"
                            icon={MessageCircle}
                            label="Anonymous Feed"
                            isActive={currentPage === 'anonymous-feed'}
                        />
                        <NavButton
                            path="/job-board"
                            icon={Briefcase}
                            label="Job Board"
                            isActive={currentPage === 'job-board'}
                        />
                        <NavButton
                            path="/communities"
                            icon={Users}
                            label="Communities"
                            isActive={currentPage === 'communities'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 