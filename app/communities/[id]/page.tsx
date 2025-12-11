"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, Users, User, Calendar, Plus, Clock, UserCheck, UserX, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CommonNavbar } from "@/components/common-navbar";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getCookie } from "cookies-next";

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
    isUserAdmin: boolean;
}

export default function CommunityPage() {
    const router = useRouter();
    const params = useParams();
    const communityId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [communityData, setCommunityData] = useState<CommunityData | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'posts'>('overview');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState<'event' | 'update'>('update');
    const [showNewPostForm, setShowNewPostForm] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Helper function to get current user ID
    const getCurrentUserId = async (): Promise<string | null> => {
        const userEmail = getCookie('userEmail');
        if (!userEmail) return null;

        try {
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            return data?.id || null;
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchUserId = async () => {
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
        };
        fetchUserId();
    }, []);

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

    // Update isAdmin state when community data is loaded
    useEffect(() => {
        if (communityData) {
            setIsAdmin(communityData.isUserAdmin);
        }
    }, [communityData]);

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

    const handleDeleteCommunity = async () => {
        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/communities/${communityId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Community deleted successfully');
                router.push('/communities');
            } else {
                toast.error(data.error || 'Failed to delete community');
            }
        } catch (error) {
            console.error('Error deleting community:', error);
            toast.error('Failed to delete community');
        } finally {
            setDeleteLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleRemoveMember = async (membershipId: string) => {
        setRemovingMemberId(membershipId);
        try {
            const response = await fetch(`/api/communities/${communityId}/members/${membershipId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Member removed successfully');
                // Refresh community data
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to remove member');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Failed to remove member');
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleDeletePost = async (postId: string) => {
        setDeletingPostId(postId);
        try {
            const response = await fetch(`/api/communities/${communityId}/posts/${postId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Post deleted successfully');
                // Refresh community data
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
        } finally {
            setDeletingPostId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
                {/* Blurred Background */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed',
                        filter: 'blur(4px)'
                    }}
                />
                <div className="animate-spin rounded-full size-32 border-b-2 border-purple-600 relative z-10"></div>
            </div>
        );
    }

    if (!communityData) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
                {/* Blurred Background */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed',
                        filter: 'blur(4px)'
                    }}
                />
                <div className="text-center relative z-10">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Community not found</h1>
                    <Button onClick={() => router.push('/communities')}>Back to Communities</Button>
                </div>
            </div>
        );
    }

    const { community, members, posts, userMembership, isUserAdmin } = communityData;
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
        <div className="min-h-screen relative overflow-hidden">
            {/* Blurred Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/bpdcbg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    filter: 'blur(4px)'
                }}
            />
            {/* Common Navbar */}
            <CommonNavbar currentPage="/communities" showSignOut={true} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Community Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-200/50 dark:border-white/20 shadow-xl"
                >
                    <div className="flex items-start gap-6">
                        <Avatar className="size-20">
                            <AvatarImage src={community.banner_image || undefined} alt={community.name} />
                            <AvatarFallback>
                                <Sparkles className="size-8 text-purple-400" />
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
                                    <Users className="size-4" />
                                    <span>{approvedMembers.length} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="size-4" />
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
                                    <UserCheck className="size-4 mr-2" />
                                    Member
                                </Button>
                            )}
                            {isAdmin && (
                                <Button
                                    onClick={() => setShowDeleteDialog(true)}
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md rounded-lg flex items-center gap-2"
                                >
                                    <Trash2 className="size-4" />
                                    Delete Community
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 relative z-10">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative z-10 pointer-events-auto ${activeTab === 'overview'
                            ? 'border-purple-600 text-white dark:text-white'
                            : 'border-transparent text-white dark:text-white hover:text-white dark:hover:text-white'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('members')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative z-10 pointer-events-auto ${activeTab === 'members'
                            ? 'border-purple-600 text-white dark:text-white'
                            : 'border-transparent text-white dark:text-white hover:text-white dark:hover:text-white'
                            }`}
                    >
                        Members ({approvedMembers.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('posts')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors relative z-10 pointer-events-auto ${activeTab === 'posts'
                            ? 'border-purple-600 text-white dark:text-white'
                            : 'border-transparent text-white dark:text-white hover:text-white dark:hover:text-white'
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
                                        {approvedMembers.map(({ user, membership }) => {
                                            const isCurrentUser = user.id === currentUserId;
                                            const canRemove = isAdmin && !isCurrentUser; // Admins can't remove themselves

                                            return (
                                                <div key={membership.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                    <Avatar className="size-10">
                                                        <AvatarImage src={undefined} alt={user.name || user.email} />
                                                        <AvatarFallback>
                                                            <User className="size-5" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {user.name || user.email}
                                                            {isCurrentUser && (
                                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Member since {formatDate(membership.joined_at)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="size-5 text-green-600 dark:text-green-400" />
                                                        {canRemove && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveMember(membership.id)}
                                                                disabled={removingMemberId === membership.id}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                title="Remove member"
                                                            >
                                                                {removingMemberId === membership.id ? (
                                                                    <Clock className="size-4 animate-spin" />
                                                                ) : (
                                                                    <UserX className="size-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {pendingMembers.length > 0 && (
                                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 dark:border-white/20">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pending Requests</h2>
                                        <div className="space-y-4">
                                            {pendingMembers.map(({ user, membership }) => (
                                                <div key={membership.id} className="flex items-center gap-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <Avatar className="size-10">
                                                        <AvatarImage src={undefined} alt={user.name || user.email} />
                                                        <AvatarFallback>
                                                            <User className="size-5" />
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
                                                    <Clock className="size-5 text-yellow-600 dark:text-yellow-400" />
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
                                                <Plus className="size-4 mr-2" />
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
                                                        <Avatar className="size-10">
                                                            <AvatarImage src={undefined} alt={user.name || user.email} />
                                                            <AvatarFallback>
                                                                <User className="size-5" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                                                                {isAdmin && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeletePost(post.id)}
                                                                        disabled={deletingPostId === post.id}
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 ml-auto"
                                                                        title="Delete post"
                                                                    >
                                                                        {deletingPostId === post.id ? (
                                                                            <Clock className="size-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="size-4" />
                                                                        )}
                                                                    </Button>
                                                                )}
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

            {/* Delete Community Confirmation Dialog */}
            {communityData && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent className="bg-white dark:bg-slate-800">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600 dark:text-red-400">
                                Delete Community
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                Are you sure you want to delete &quot;{communityData.community.name}&quot;? This action cannot be undone and will permanently delete the community, all its members, and posts.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteLoading}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteCommunity}
                                disabled={deleteLoading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
} 