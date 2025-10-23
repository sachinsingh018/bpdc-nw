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
            <div className="w-16 h-16 bg-purple-200/60 rounded-full" />
            <div className="h-4 w-24 bg-purple-100 rounded" />
            <div className="h-3 w-32 bg-purple-50 rounded flex-1" />
            <div className="h-8 w-20 bg-purple-200 rounded" />
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950">
            {/* Common Navbar */}
            <CommonNavbar currentPage="/communities" showSignOut={true} />

            {/* Hero Section */}
            <div className="max-w-3xl mx-auto text-center py-16 px-4">
                <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-3 rounded-full shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
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
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center gap-4 border border-purple-100 dark:border-slate-700 cursor-pointer h-80"
                                onClick={() => router.push(`/communities/${community.id}`)}
                            >
                                <Avatar className="w-16 h-16 mb-2">
                                    <AvatarImage src={community.banner_image || undefined} alt={community.name} />
                                    <AvatarFallback>
                                        <Sparkles className="w-6 h-6 text-purple-400" />
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 text-center">
                                    {community.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 text-center text-sm mb-2 flex-1">
                                    {community.description || 'No description available'}
                                </p>
                                <div className="flex gap-2 w-full mt-auto">
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 rounded-lg flex items-center justify-center h-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/communities/${community.id}`);
                                        }}
                                    >
                                        View
                                    </Button>
                                    {!membershipStatus ? (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-md hover:from-green-700 hover:to-green-800 rounded-lg flex items-center justify-center h-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoinCommunity(community.id);
                                            }}
                                        >
                                            Join
                                        </Button>
                                    ) : membershipStatus === 'approved' ? (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-md rounded-lg flex items-center justify-center h-10"
                                            disabled
                                        >
                                            Member
                                        </Button>
                                    ) : (
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-semibold shadow-md rounded-lg flex items-center justify-center h-10"
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