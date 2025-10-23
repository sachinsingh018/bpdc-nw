"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Users, Home, MessageSquare, MessageCircle, User, Menu, Briefcase, Calendar, MessageCircle as MessageCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommonNavbar } from "@/components/common-navbar";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface Community {
    id: string;
    name: string;
    description: string | null;
    banner_image: string | null;
    created_at: string;
}

interface UserMembership {
    id: string;
    community_id: string;
    user_id: string;
    status: 'pending' | 'approved';
    joined_at: string;
}

function ShimmerCard() {
    return (
        <div className="animate-pulse bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-md p-6 flex flex-col items-center gap-4 h-80">
            <div className="w-16 h-16 bg-bits-golden-yellow/20 rounded-full" />
            <div className="h-4 w-24 bg-bits-golden-yellow/10 rounded" />
            <div className="h-3 w-32 bg-bits-golden-yellow/5 rounded flex-1" />
            <div className="h-8 w-20 bg-bits-golden-yellow/20 rounded" />
        </div>
    );
}

export default function CommunitiesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [userMemberships, setUserMemberships] = useState<Record<string, UserMembership>>({});

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await fetch('/api/communities');
                if (response.ok) {
                    const data = await response.json();
                    setCommunities(data.communities || []);

                    // Fetch user memberships for each community
                    const memberships: Record<string, UserMembership> = {};
                    for (const community of data.communities || []) {
                        try {
                            const membershipResponse = await fetch(`/api/communities/${community.id}`);
                            if (membershipResponse.ok) {
                                const membershipData = await membershipResponse.json();
                                if (membershipData.userMembership) {
                                    memberships[community.id] = membershipData.userMembership;
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching membership for community:', community.id, error);
                        }
                    }
                    setUserMemberships(memberships);
                }
            } catch (error) {
                console.error('Error fetching communities:', error);
                toast.error('Failed to load communities');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    const handleJoinCommunity = async (communityId: string) => {
        try {
            const response = await fetch('/api/communities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ communityId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Successfully joined community!');
                // Update local state to show approved status
                setUserMemberships(prev => ({
                    ...prev,
                    [communityId]: {
                        id: 'temp',
                        community_id: communityId,
                        user_id: 'temp',
                        status: 'approved',
                        joined_at: new Date().toISOString(),
                    }
                }));
            } else {
                toast.error(data.error || 'Failed to join community');
            }
        } catch (error) {
            console.error('Error joining community:', error);
            toast.error('Failed to join community');
        }
    };

    const getMembershipStatus = (communityId: string) => {
        return userMemberships[communityId]?.status || null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-bits-golden-yellow/10 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
            {/* Vibrant Background Bubbles */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-bits-royal-blue/30 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute bottom-40 right-20 w-80 h-80 bg-bits-deep-purple/30 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-bits-golden-yellow/40 rounded-full blur-3xl opacity-70 animate-pulse delay-2000"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-bits-bright-red/25 rounded-full blur-3xl opacity-50 animate-pulse delay-500"></div>
                <div className="absolute top-1/2 left-1/4 w-88 h-88 bg-bits-golden-yellow/35 rounded-full blur-3xl opacity-65 animate-pulse delay-1500"></div>
            </div>
            
            {/* Common Navbar */}
            <CommonNavbar currentPage="/communities" showSignOut={true} />

            {/* Hero Section */}
            <div className="max-w-3xl mx-auto text-center py-16 px-4">
                <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-bits-golden-yellow to-bits-royal-blue p-3 rounded-full shadow-lg">
                        <Users className="w-8 h-8 text-bits-royal-blue dark:text-bits-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-bits-golden-yellow to-bits-royal-blue bg-clip-text text-transparent mb-4">
                    Join Powerful Communities
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-200 max-w-xl mx-auto">
                    Explore student chapters, alumni groups, professional circles, and more – powered by AI.
                </p>
            </div>

            {/* Community Cards Grid */}
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)
                    : communities.map((community) => {
                        const membershipStatus = getMembershipStatus(community.id);

                        return (
                            <div
                                key={community.id}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center gap-4 border border-bits-golden-yellow/20 dark:border-slate-700 cursor-pointer h-80"
                                onClick={() => router.push(`/communities/${community.id}`)}
                            >
                                <Avatar className="w-16 h-16 mb-2">
                                    <AvatarImage src={community.banner_image || undefined} alt={community.name} />
                                    <AvatarFallback>
                                        <Sparkles className="w-6 h-6 text-bits-golden-yellow" />
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-semibold text-bits-golden-yellow dark:text-bits-golden-yellow text-center">
                                    {community.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-2 flex-1">
                                    {community.description || 'No description available'}
                                </p>
                                <div className="flex gap-2 w-full mt-auto">
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-bits-golden-yellow to-bits-royal-blue text-bits-royal-blue dark:text-bits-white font-semibold shadow-md hover:from-bits-golden-yellow-600 hover:to-bits-royal-blue-600 rounded-lg flex items-center justify-center h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/communities/${community.id}`);
                                        }}
                                    >
                                        View
                                    </Button>
                                    {!membershipStatus ? (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-bits-royal-blue dark:text-bits-white font-semibold shadow-md hover:from-green-700 hover:to-green-800 rounded-lg flex items-center justify-center h-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoinCommunity(community.id);
                                            }}
                                        >
                                            Join
                                        </Button>
                                    ) : membershipStatus === 'approved' ? (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-bits-royal-blue dark:text-bits-white font-semibold shadow-md rounded-lg flex items-center justify-center h-10"
                                            disabled
                                        >
                                            Member
                                        </Button>
                                    ) : (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-bits-royal-blue dark:text-bits-white font-semibold shadow-md rounded-lg flex items-center justify-center h-10"
                                            disabled
                                        >
                                            Pending
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
            </div>

        </div>
    );
} 