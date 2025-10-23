"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Users, Home, MessageSquare, MessageCircle, User, Menu, Briefcase, Calendar, MessageCircle as MessageCircleIcon, ArrowLeft, Plus, Clock, UserCheck, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Community {
    id: string;
    name: string;
    description: string | null;
    banner_image: string | null;
    created_at: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface CommunityMembership {
    id: string;
    community_id: string;
    user_id: string;
    status: 'pending' | 'approved';
    joined_at: string;
}

interface CommunityPost {
    id: string;
    community_id: string;
    user_id: string;
    content: string;
    type: 'event' | 'update';
    created_at: string;
}

interface CommunityData {
    community: Community;
    members: Array<{ user: User; membership: CommunityMembership }>;
    posts: Array<{ post: CommunityPost; user: User }>;
    userMembership: CommunityMembership | null;
}

export default function CommunityPage() {
    const router = useRouter();
    const params = useParams();
    const communityId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [communityData, setCommunityData] = useState<CommunityData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'posts'>('overview');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState<'event' | 'update'>('update');
    const [showNewPostForm, setShowNewPostForm] = useState(false);

    useEffect(() => {
        const fetchCommunityData = async () => {
            try {
                const response = await fetch(`/api/communities/${communityId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCommunityData(data);
                } else {
                    toast.error('Community not found');
                    router.push('/communities');
                }
            } catch (error) {
                console.error('Error fetching community data:', error);
                toast.error('Failed to load community data');
            } finally {
                setLoading(false);
            }
        };

        if (communityId) {
            fetchCommunityData();
        }
    }, [communityId, router]);

    const handleJoinCommunity = async () => {
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
                // Refresh community data
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to join community');
            }
        } catch (error) {
            console.error('Error joining community:', error);
            toast.error('Failed to join community');
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            toast.error('Please enter post content');
            return;
        }

        console.log('Creating post:', { communityId, content: newPostContent, type: newPostType, userMembership });

        try {
            const response = await fetch(`/api/communities/${communityId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newPostContent,
                    type: newPostType,
                }),
            });

            const data = await response.json();
            console.log('Post creation response:', { status: response.status, data });

            if (response.ok) {
                toast.success('Post created successfully!');
                setNewPostContent('');
                setShowNewPostForm(false);
                // Refresh community data
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to create post');
                console.error('Post creation failed:', data);
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!communityData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Community not found</h1>
                    <Button onClick={() => router.push('/communities')}>Back to Communities</Button>
                </div>
            </div>
        );
    }

    const { community, members, posts, userMembership } = communityData;
    const approvedMembers = members.filter(m => m.membership.status === 'approved');
    const pendingMembers = members.filter(m => m.membership.status === 'pending');
    const isMember = userMembership?.status === 'approved';
    const isPending = userMembership?.status === 'pending';

    console.log('Community data:', {
        community,
        userMembership,
        isMember,
        isPending,
        totalMembers: members.length,
        approvedMembers: approvedMembers.length
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950">
            {/* Enhanced Header */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/communities')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Button>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Networkqy
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/friends')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Users className="w-4 h-4" />
                            <span>Network</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/chat')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>AI Chat</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/connections')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <User className="w-4 h-4" />
                            <span>Connections</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/anonymous-feed')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Anonymous Feed</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/messages')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Messages</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/job-board')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>Job Board</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/communities')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        >
                            <Users className="w-4 h-4" />
                            <span>Communities</span>
                        </Button>
                    </div>

                    {/* Right side - Notifications, Theme Toggle, and Mobile Menu */}
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 transition-all flex items-center justify-center"
                            title="Sign Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12h-9m0 0l3-3m-3 3l3 3" />
                            </svg>
                        </button>
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/profile');
                                    setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start bg-purple-50 dark:bg-purple-900/20"
                            >
                                <Home className="w-4 h-4" />
                                <span>Home</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/friends');
                                    setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                            >
                                <Users className="w-4 h-4" />
                                <span>Network</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/chat');
                                    setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>AI Chat</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/connections');
                                    setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                            >
                                <User className="w-4 h-4" />
                                <span>Connections</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/anonymous-feed');
                                    setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Anonymous Feed</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push('/messages');
                                    setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Messages</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { router.push('/job-board'); setShowMobileMenu(false); }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>Job Board</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { router.push('/communities'); setShowMobileMenu(false); }}
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start bg-purple-50 dark:bg-purple-900/20"
                            >
                                <Users className="w-4 h-4" />
                                <span>Communities</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Community Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-200/50 dark:border-white/20 shadow-xl"
                >
                    <div className="flex items-start gap-6">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={community.banner_image || undefined} alt={community.name} />
                            <AvatarFallback>
                                <Sparkles className="w-8 h-8 text-purple-400" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {community.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                                {community.description || 'No description available'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{approvedMembers.length} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {formatDate(community.created_at)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {!userMembership ? (
                                <Button
                                    onClick={handleJoinCommunity}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 rounded-lg"
                                >
                                    Join Community
                                </Button>
                            ) : (
                                <Button
                                    disabled
                                    className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-md rounded-lg"
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Member
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
                            ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'members'
                            ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Members ({approvedMembers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'posts'
                            ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        Posts ({posts.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {activeTab === 'overview' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Community</h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {community.description || 'This community is a place for members to connect, share ideas, and collaborate on projects.'}
                                    </p>
                                </div>

                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                                    {posts.length > 0 ? (
                                        <div className="space-y-4">
                                            {posts.slice(0, 3).map(({ post, user }) => (
                                                <div key={post.id} className="border-l-4 border-purple-500 pl-4 py-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.name || user.email}
                                                        </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDate(post.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                        {post.content}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${post.type === 'event'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            }`}>
                                                            {post.type === 'event' ? 'Event' : 'Update'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'members' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Members</h2>
                                    <div className="space-y-4">
                                        {approvedMembers.map(({ user, membership }) => (
                                            <div key={membership.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={undefined} alt={user.name || user.email} />
                                                    <AvatarFallback>
                                                        <User className="w-5 h-5" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.name || user.email}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Member since {formatDate(membership.joined_at)}
                                                    </p>
                                                </div>
                                                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {pendingMembers.length > 0 && (
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Requests</h2>
                                        <div className="space-y-4">
                                            {pendingMembers.map(({ user, membership }) => (
                                                <div key={membership.id} className="flex items-center gap-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={undefined} alt={user.name || user.email} />
                                                        <AvatarFallback>
                                                            <User className="w-5 h-5" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {user.name || user.email}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Requested {formatDate(membership.joined_at)}
                                                        </p>
                                                    </div>
                                                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'posts' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {isMember && (
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                        {showNewPostForm ? (
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => setNewPostType('update')}
                                                        variant={newPostType === 'update' ? 'default' : 'outline'}
                                                        size="sm"
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button
                                                        onClick={() => setNewPostType('event')}
                                                        variant={newPostType === 'event' ? 'default' : 'outline'}
                                                        size="sm"
                                                    >
                                                        Event
                                                    </Button>
                                                </div>
                                                <textarea
                                                    value={newPostContent}
                                                    onChange={(e) => setNewPostContent(e.target.value)}
                                                    placeholder={`Write a ${newPostType}...`}
                                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                                    rows={4}
                                                />
                                                <div className="flex gap-2">
                                                    <Button onClick={handleCreatePost}>
                                                        Post
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => setShowNewPostForm(true)}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 rounded-lg"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create New Post
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Community Posts</h2>
                                    {posts.length > 0 ? (
                                        <div className="space-y-6">
                                            {posts.map(({ post, user }) => (
                                                <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                                                    <div className="flex items-start gap-4">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={undefined} alt={user.name || user.email} />
                                                            <AvatarFallback>
                                                                <User className="w-5 h-5" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {user.name || user.email}
                                                                </span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {formatDate(post.created_at)}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${post.type === 'event'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    }`}>
                                                                    {post.type === 'event' ? 'Event' : 'Update'}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                                                {post.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Community Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Total Members</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{approvedMembers.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Pending Requests</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{pendingMembers.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{posts.length}</span>
                                </div>
                            </div>
                        </div>

                        {!isMember && (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-500/30">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Join This Community</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                                    Connect with like-minded professionals and stay updated with the latest news and events.
                                </p>
                                <Button
                                    onClick={handleJoinCommunity}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 rounded-lg"
                                >
                                    Join Community
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 