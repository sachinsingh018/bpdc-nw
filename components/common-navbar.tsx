'use client';

import { useState, useEffect } from 'react';
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
    Briefcase,
    Rss,
    LogOut
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { signOut, useSession } from 'next-auth/react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

interface CommonNavbarProps {
    currentPage?: string;
    showThemeToggle?: boolean;
    showSignOut?: boolean;
    hideForPublic?: boolean;
}

export function CommonNavbar({ currentPage, showThemeToggle = true, showSignOut = true, hideForPublic = false }: CommonNavbarProps) {
    const router = useRouter();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { data: session, status } = useSession();
    const [userRole, setUserRole] = useState<string>('');
    const [roleLoading, setRoleLoading] = useState(true);

    // Fetch user role
    useEffect(() => {
        const fetchUserRole = async () => {
            setRoleLoading(true);
            try {
                const response = await fetch('/api/user/profile');
                if (response.ok) {
                    const profileData = await response.json();
                    setUserRole(profileData.role || '');
                }
            } catch (error) {
                console.error('Error fetching user role:', error);
            } finally {
                setRoleLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchUserRole();
        } else {
            setRoleLoading(false);
        }
    }, [status]);

    // Hide navbar for public users if hideForPublic is true
    if (hideForPublic && status !== 'loading' && !session) {
        return null;
    }

    // Filter out AI Chat for recruiters
    const allNavigationItems = [
        { path: '/profile', label: 'Home', icon: Home },
        { path: '/friends', label: 'Network', icon: Users },
        { path: '/chat', label: 'AI Chat', icon: MessageSquare, hideForRecruiters: true },
        { path: '/connections', label: 'Connections', icon: User },
        { path: '/anonymous-feed', label: 'Feed', icon: Rss },
        { path: '/messages', label: 'Messages', icon: MessageCircle },
        { path: '/job-board', label: 'Job Board', icon: Briefcase },
        { path: '/communities', label: 'Communities', icon: Users },
    ];

    const navigationItems = allNavigationItems.filter(item => {
        // Hide AI Chat for recruiters and admins
        // Only filter when role is loaded (not during loading state)
        if (!roleLoading && item.hideForRecruiters && (userRole === 'recruiter' || userRole === 'admin')) {
            return false;
        }
        return true;
    });

    const handleNavigation = (path: string) => {
        router.push(path);
        setShowMobileMenu(false);
    };

    return (
        <div className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border-b border-gray-200/50 dark:border-white/10 sticky top-0 z-50 w-full">
            <div className="flex items-center justify-between p-1.5 sm:p-2 md:p-3 w-full min-w-0 gap-1 sm:gap-2 md:gap-3 max-w-full overflow-hidden">
                {/* Logo and Brand */}
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0 min-w-0 max-w-[40%] sm:max-w-[45%]">
                    <button
                        type="button"
                        onClick={() => router.push('/profile')}
                        className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-black dark:text-black hover:opacity-80 transition-opacity group min-w-0"
                    >
                        {/* Logo Image */}
                        <div className="flex-shrink-0">
                            <img
                                src="/img.jpg"
                                alt="BITS Pilani Dubai Campus Logo"
                                className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 object-contain rounded-lg group-hover:scale-105 transition-transform"
                            />
                        </div>
                        {/* Brand Text - Hidden on very small screens, shown on md and up, truncated on smaller screens */}
                        <span className="hidden md:inline text-xs md:text-sm lg:text-base xl:text-lg font-semibold md:font-bold bg-gradient-to-r from-red-800 via-yellow-700 to-blue-900 bg-clip-text text-transparent whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] truncate max-w-[200px] lg:max-w-none">
                            BITS Pilani Dubai Campus
                        </span>
                    </button>
                </div>

                {/* Desktop Navigation - Only show on xl screens and above */}
                <div className="hidden xl:flex items-center gap-1 2xl:gap-2 flex-1 min-w-0 justify-center px-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;
                        return (
                            <Button
                                key={item.path}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation(item.path)}
                                className={`flex items-center gap-1 2xl:gap-1.5 text-black dark:text-black font-semibold 2xl:font-bold hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0 px-2 ${isActive ? 'opacity-90' : 'opacity-100'
                                    }`}
                            >
                                <Icon className="size-3.5 2xl:size-4 text-black dark:text-black flex-shrink-0" />
                                <span className="text-xs 2xl:text-sm">{item.label}</span>
                            </Button>
                        );
                    })}
                </div>

                {/* Large Desktop Navigation - Show fewer items with menu on lg screens */}
                <div className="hidden lg:flex xl:hidden items-center gap-0.5 flex-1 min-w-0 justify-center px-1">
                    {navigationItems.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;
                        return (
                            <Button
                                key={item.path}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation(item.path)}
                                className={`flex items-center gap-0.5 text-black dark:text-black font-semibold hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0 px-1.5 ${isActive ? 'opacity-90' : 'opacity-100'
                                    }`}
                            >
                                <Icon className="size-3.5 text-black dark:text-black flex-shrink-0" />
                                <span className="text-xs">{item.label}</span>
                            </Button>
                        );
                    })}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="flex items-center gap-0.5 text-black dark:text-black font-semibold hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0 px-1.5"
                        aria-label="Open menu"
                    >
                        <Menu className="size-3.5 text-black dark:text-black" />
                        <span className="text-xs">More</span>
                    </Button>
                </div>

                {/* Tablet Navigation - Show only 3 items with menu on md screens */}
                <div className="hidden md:flex lg:hidden items-center gap-0.5 flex-1 min-w-0 justify-center px-1">
                    {navigationItems.slice(0, 3).map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.path;
                        return (
                            <Button
                                key={item.path}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleNavigation(item.path)}
                                className={`flex items-center gap-0.5 text-black dark:text-black font-semibold hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0 px-1 ${isActive ? 'opacity-90' : 'opacity-100'
                                    }`}
                            >
                                <Icon className="size-3 text-black dark:text-black flex-shrink-0" />
                                <span className="text-xs">{item.label}</span>
                            </Button>
                        );
                    })}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="flex items-center gap-0.5 text-black dark:text-black font-semibold hover:opacity-80 transition-opacity whitespace-nowrap flex-shrink-0 px-1"
                        aria-label="Open menu"
                    >
                        <Menu className="size-3 text-black dark:text-black" />
                        <span className="text-xs">Menu</span>
                    </Button>
                </div>

                {/* Right side - Notifications, Sign Out, and Mobile Menu */}
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0 min-w-0">
                    <div className="flex-shrink-0">
                        <NotificationBell />
                    </div>
                    {/* Sign Out Button - Hidden on mobile/tablet, visible on xl and above */}
                    {showSignOut && (
                        <button
                            type="button"
                            onClick={async () => {
                                await signOut({
                                    redirect: false
                                });
                                router.push('/');
                            }}
                            className="hidden xl:flex p-1.5 2xl:p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-black dark:text-black font-bold hover:opacity-80 transition-opacity items-center justify-center flex-shrink-0"
                            title="Sign Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 2xl:size-5 text-black dark:text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12h-9m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
                    )}

                    {/* Mobile/Tablet Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="xl:hidden text-black dark:text-black font-bold hover:opacity-80 transition-opacity p-1 sm:p-1.5 flex-shrink-0"
                        aria-label="Open menu"
                    >
                        <Menu className="size-4 sm:size-5 text-black dark:text-black" />
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Menu - Sheet Component */}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetContent side="right" className="w-[85vw] sm:w-[400px] bg-white dark:bg-slate-800">
                    <SheetHeader>
                        <SheetTitle className="text-left text-black dark:text-white font-bold">
                            Menu
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col mt-6 space-y-1">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.path;
                            return (
                                <Button
                                    key={item.path}
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => handleNavigation(item.path)}
                                    className={`flex items-center gap-3 justify-start text-black dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors w-full ${isActive ? 'bg-gray-100 dark:bg-slate-700' : ''
                                        }`}
                                >
                                    <Icon className="size-5" />
                                    <span>{item.label}</span>
                                </Button>
                            );
                        })}

                        {/* Sign Out in Mobile Menu */}
                        {showSignOut && (
                            <>
                                <div className="border-t border-gray-200 dark:border-white/10 my-2" />
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={async () => {
                                        await signOut({
                                            redirect: false
                                        });
                                        router.push('/');
                                    }}
                                    className="flex items-center gap-3 justify-start text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                                >
                                    <LogOut className="size-5" />
                                    <span>Sign Out</span>
                                </Button>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
