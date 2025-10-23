'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getCookie } from 'cookies-next';
import {
    MessageCircle,
    Heart,
    Share2,
    MoreHorizontal,
    Send,
    Eye,
    EyeOff,
    Building2,
    Users,
    TrendingUp,
    Briefcase,
    Sparkles,
    Menu,
    Home,
    User,
    MessageSquare,
    Bell,
    Trash2,
    Edit,
    Check,
    X,
    Copy,
    Linkedin,
    Twitter,
    Image,
    X as XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommonNavbar } from '@/components/common-navbar';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface AnonymousPost {
    id: string;
    content: string;
    image_url?: string;
    is_anonymous: boolean;
    company_name?: string;
    industry?: string;
    topic: 'company_culture' | 'workplace_issues' | 'career_advice' | 'general';
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at?: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    anonymous_username?: string;
    anonymous_avatar?: string;
    is_liked?: boolean;
}

interface AnonymousComment {
    id: string;
    content: string;
    is_anonymous: boolean;
    likes_count: number;
    created_at: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    anonymous_username?: string;
    anonymous_avatar?: string;
    is_liked?: boolean;
}

const topics = [
    { value: 'company_culture', label: 'Company Culture', icon: Building2 },
    { value: 'workplace_issues', label: 'Workplace Issues', icon: Users },
    { value: 'career_advice', label: 'Career Advice', icon: TrendingUp },
    { value: 'general', label: 'General', icon: MessageCircle },
];

export default function AnonymousFeedPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<AnonymousPost[]>([]);
    const [comments, setComments] = useState<{ [postId: string]: AnonymousComment[] }>({});
    const [newPost, setNewPost] = useState('');
    const [newComment, setNewComment] = useState<{ [postId: string]: string }>({});
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState('general');
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
    const [currentUserAnonymousData, setCurrentUserAnonymousData] = useState<{
        anonymous_username?: string;
        anonymous_avatar?: string;
    }>({});
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editTopic, setEditTopic] = useState('general');
    const [editCompanyName, setEditCompanyName] = useState('');
    const [editIndustry, setEditIndustry] = useState('');
    const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [sharePost, setSharePost] = useState<AnonymousPost | null>(null);

    useEffect(() => {
        const userEmail = getCookie('userEmail') as string;
        if (!userEmail) {
            router.push('/login');
            return;
        }

        // Fetch user data to get the name
        const fetchUserData = async () => {
            try {
                const response = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail }),
                });

                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser({
                        name: userData.name,
                        email: userData.email
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        // User is authenticated, fetch data
        fetchUserData();
        fetchPosts();
        fetchCurrentUserAnonymousData();
    }, [router]);

    const fetchCurrentUserAnonymousData = async () => {
        const userEmail = getCookie('userEmail') as string;
        if (!userEmail) return;

        try {
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUserAnonymousData({
                    anonymous_username: data.anonymous_username,
                    anonymous_avatar: data.anonymous_avatar,
                });
            }
        } catch (error) {
            console.error('Error fetching anonymous data:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/anonymous-feed/posts');
            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId: string) => {
        try {
            const response = await fetch(`/api/anonymous-feed/posts/${postId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(prev => ({ ...prev, [postId]: data.comments }));
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleImageUpload = async (file: File): Promise<string | null> => {
        setIsUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return data.fileUrl;
            } else {
                const errorData = await response.json();
                console.error('Upload error response:', errorData);
                toast.error(errorData.error || 'Failed to upload image');
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            return null;
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type - match backend validation
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            setSelectedImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) {
            toast.error('Please enter some content');
            return;
        }

        let imageUrl: string | null = null;

        // Upload image if selected
        if (selectedImage) {
            imageUrl = await handleImageUpload(selectedImage);
            if (!imageUrl) {
                return; // Stop if image upload failed
            }
        }

        try {
            const response = await fetch('/api/anonymous-feed/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPost,
                    image_url: imageUrl,
                    is_anonymous: isAnonymous,
                    topic: selectedTopic,
                    company_name: companyName || null,
                    industry: industry || null,
                }),
            });

            if (response.ok) {
                setNewPost('');
                setCompanyName('');
                setIndustry('');
                setSelectedTopic('general');
                setSelectedImage(null);
                setImagePreview(null);
                toast.success('Post created successfully!');
                fetchPosts();
            } else {
                const errorData = await response.json();
                if (errorData.error) {
                    toast.error(errorData.error);
                } else {
                    toast.error('Failed to create post');
                }
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        }
    };

    const handleCreateComment = async (postId: string) => {
        const commentContent = newComment[postId];
        if (!commentContent?.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        const userEmail = getCookie('userEmail') as string;
        if (!userEmail) {
            toast.error('Session expired. Please log in again.');
            return;
        }

        // Optimistic update - add comment immediately to UI
        const optimisticComment: AnonymousComment = {
            id: `temp-${Date.now()}`,
            content: commentContent,
            is_anonymous: isAnonymous,
            likes_count: 0,
            created_at: new Date().toISOString(),
            user_id: userEmail,
            user_name: currentUser?.name || undefined,
            user_email: userEmail,
            anonymous_username: isAnonymous ? currentUserAnonymousData.anonymous_username : undefined,
            anonymous_avatar: isAnonymous ? currentUserAnonymousData.anonymous_avatar : undefined,
            is_liked: false,
        };

        // Update comments immediately
        setComments(prev => ({
            ...prev,
            [postId]: [optimisticComment, ...(prev[postId] || [])]
        }));

        // Update post comment count immediately
        setPosts(prev => prev.map(post =>
            post.id === postId
                ? { ...post, comments_count: post.comments_count + 1 }
                : post
        ));

        // Clear the input immediately
        setNewComment(prev => ({ ...prev, [postId]: '' }));

        try {
            const response = await fetch(`/api/anonymous-feed/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: commentContent,
                    is_anonymous: isAnonymous,
                }),
            });

            if (response.ok) {
                const newCommentData = await response.json();
                // Replace optimistic comment with real one
                setComments(prev => ({
                    ...prev,
                    [postId]: prev[postId]?.map(comment =>
                        comment.id === optimisticComment.id ? newCommentData.comment : comment
                    ) || []
                }));
                toast.success('Comment added successfully!');
            } else {
                // Revert optimistic updates on error
                setComments(prev => ({
                    ...prev,
                    [postId]: prev[postId]?.filter(comment => comment.id !== optimisticComment.id) || []
                }));
                setPosts(prev => prev.map(post =>
                    post.id === postId
                        ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
                        : post
                ));
                setNewComment(prev => ({ ...prev, [postId]: commentContent }));

                const errorData = await response.json();
                if (errorData.error) {
                    toast.error(errorData.error);
                } else {
                    toast.error('Failed to add comment');
                }
            }
        } catch (error) {
            console.error('Error creating comment:', error);
            // Revert optimistic updates on error
            setComments(prev => ({
                ...prev,
                [postId]: prev[postId]?.filter(comment => comment.id !== optimisticComment.id) || []
            }));
            setPosts(prev => prev.map(post =>
                post.id === postId
                    ? { ...post, comments_count: Math.max(0, post.comments_count - 1) }
                    : post
            ));
            setNewComment(prev => ({ ...prev, [postId]: commentContent }));
            toast.error('Failed to add comment');
        }
    };

    const handleLikePost = async (postId: string) => {
        // Optimistic update - update like immediately
        setPosts(prev => prev.map(post => {
            if (post.id === postId) {
                const newIsLiked = !post.is_liked;
                return {
                    ...post,
                    is_liked: newIsLiked,
                    likes_count: newIsLiked ? post.likes_count + 1 : post.likes_count - 1
                };
            }
            return post;
        }));

        try {
            const response = await fetch(`/api/anonymous-feed/posts/${postId}/like`, {
                method: 'POST',
            });

            if (!response.ok) {
                // Revert optimistic update on error
                setPosts(prev => prev.map(post => {
                    if (post.id === postId) {
                        const originalIsLiked = !post.is_liked;
                        return {
                            ...post,
                            is_liked: originalIsLiked,
                            likes_count: originalIsLiked ? post.likes_count + 1 : post.likes_count - 1
                        };
                    }
                    return post;
                }));
                toast.error('Failed to like post');
            }
        } catch (error) {
            console.error('Error liking post:', error);
            // Revert optimistic update on error
            setPosts(prev => prev.map(post => {
                if (post.id === postId) {
                    const originalIsLiked = !post.is_liked;
                    return {
                        ...post,
                        is_liked: originalIsLiked,
                        likes_count: originalIsLiked ? post.likes_count + 1 : post.likes_count - 1
                    };
                }
                return post;
            }));
            toast.error('Failed to like post');
        }
    };

    const handleLikeComment = async (commentId: string, postId: string) => {
        // Optimistic update - update comment like immediately
        setComments(prev => ({
            ...prev,
            [postId]: prev[postId]?.map(comment => {
                if (comment.id === commentId) {
                    const newIsLiked = !comment.is_liked;
                    return {
                        ...comment,
                        is_liked: newIsLiked,
                        likes_count: newIsLiked ? comment.likes_count + 1 : comment.likes_count - 1
                    };
                }
                return comment;
            }) || []
        }));

        try {
            const response = await fetch(`/api/anonymous-feed/comments/${commentId}/like`, {
                method: 'POST',
            });

            if (!response.ok) {
                // Revert optimistic update on error
                setComments(prev => ({
                    ...prev,
                    [postId]: prev[postId]?.map(comment => {
                        if (comment.id === commentId) {
                            const originalIsLiked = !comment.is_liked;
                            return {
                                ...comment,
                                is_liked: originalIsLiked,
                                likes_count: originalIsLiked ? comment.likes_count + 1 : comment.likes_count - 1
                            };
                        }
                        return comment;
                    }) || []
                }));
                toast.error('Failed to like comment');
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            // Revert optimistic update on error
            setComments(prev => ({
                ...prev,
                [postId]: prev[postId]?.map(comment => {
                    if (comment.id === commentId) {
                        const originalIsLiked = !comment.is_liked;
                        return {
                            ...comment,
                            is_liked: originalIsLiked,
                            likes_count: originalIsLiked ? comment.likes_count + 1 : comment.likes_count - 1
                        };
                    }
                    return comment;
                }) || []
            }));
            toast.error('Failed to like comment');
        }
    };

    const handleDeletePost = async (postId: string) => {
        toast.promise(
            fetch(`/api/anonymous-feed/posts/${postId}`, {
                method: 'DELETE',
            }).then(async (response) => {
                if (response.ok) {
                    fetchPosts();
                    return 'Post deleted successfully!';
                } else {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to delete post');
                }
            }),
            {
                loading: 'Deleting post...',
                success: (message) => message,
                error: (error) => error.message,
            }
        );
    };

    const handleEditPost = (post: AnonymousPost) => {
        setEditingPost(post.id);
        setEditContent(post.content);
        setEditTopic(post.topic);
        setEditCompanyName(post.company_name || '');
        setEditIndustry(post.industry || '');
    };

    const handleSaveEdit = async (postId: string) => {
        if (!editContent.trim()) {
            toast.error('Please enter some content');
            return;
        }

        toast.promise(
            fetch(`/api/anonymous-feed/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: editContent,
                    topic: editTopic,
                    company_name: editCompanyName || null,
                    industry: editIndustry || null,
                }),
            }).then(async (response) => {
                if (response.ok) {
                    const { post: updatedPost } = await response.json();
                    setPosts(prev => prev.map(post =>
                        post.id === postId ? { ...post, ...updatedPost } : post
                    ));
                    setEditingPost(null);
                    setEditContent('');
                    setEditTopic('general');
                    setEditCompanyName('');
                    setEditIndustry('');
                    return 'Post updated successfully!';
                } else {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update post');
                }
            }),
            {
                loading: 'Updating post...',
                success: (message) => message,
                error: (error) => error.message,
            }
        );
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setEditContent('');
        setEditTopic('general');
        setEditCompanyName('');
        setEditIndustry('');
    };

    const toggleComments = (postId: string) => {
        if (!showComments[postId]) {
            fetchComments(postId);
        }
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const getDisplayName = (post: AnonymousPost) => {
        if (post.is_anonymous) {
            return post.anonymous_username || `Anonymous User`;
        }
        return post.user_name || post.user_email?.split('@')[0] || 'Unknown User';
    };

    const getDisplayNameComment = (comment: AnonymousComment) => {
        if (comment.is_anonymous) {
            return comment.anonymous_username || `Anonymous User`;
        }
        return comment.user_name || comment.user_email?.split('@')[0] || 'Unknown User';
    };

    const handleSharePost = (post: AnonymousPost) => {
        setSharePost(post);
        setShareModalOpen(true);
    };

    const getPostUrl = (post: AnonymousPost) => `${window.location.origin}/anonymous-feed/${post.id}`;

    const handleCopyLink = () => {
        if (!sharePost) return;
        const postUrl = getPostUrl(sharePost);
        navigator.clipboard.writeText(postUrl);
        toast.success('Post link copied to clipboard!');
        setShareModalOpen(false);
    };

    const handleShareToLinkedIn = () => {
        if (!sharePost) return;
        const postUrl = getPostUrl(sharePost);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        window.open(linkedInUrl, '_blank');
        setShareModalOpen(false);
    };

    const handleShareToTwitter = () => {
        if (!sharePost) return;
        const postUrl = getPostUrl(sharePost);
        const shareText = sharePost.content;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
        window.open(twitterUrl, '_blank');
        setShareModalOpen(false);
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading...</h2>
                    <p className="text-gray-600 dark:text-gray-400">Checking authentication</p>
                </div>
            </div>
        );
    }

    // Check if user is authenticated
    const userEmail = getCookie('userEmail');
    if (!userEmail) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
            {/* Common Navbar */}
            <CommonNavbar currentPage="/anonymous-feed" />

            <div className="max-w-4xl mx-auto p-4 md:p-6">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 md:mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Anonymous Chat Feed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                        Share your thoughts about workplace culture, career advice, and more - anonymously
                    </p>
                </motion.div>

                {/* Create Post Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white/90 via-purple-50/40 to-blue-50/80 dark:bg-slate-800 rounded-2xl p-4 md:p-6 mb-6 md:mb-8 shadow-xl border border-purple-200/50 dark:border-white/20"
                >
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800">
                            <AvatarImage src={`https://avatar.vercel.sh/${currentUser?.email || userEmail}`} />
                            <AvatarFallback>
                                {currentUser?.name?.[0] || currentUser?.email?.[0] || (typeof userEmail === 'string' ? userEmail[0] : 'U')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium text-black text-sm md:text-base">
                                {currentUser?.name || currentUser?.email || userEmail}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className="flex items-center gap-1 text-xs"
                                >
                                    {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {isAnonymous ? 'Anonymous' : 'Public'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <Textarea
                            placeholder="Share your thoughts about workplace culture, career advice, or any work-related topic..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="min-h-[80px] md:min-h-[120px] resize-none text-sm"
                        />

                        {/* Image Upload Section */}
                        <div className="space-y-3">
                            {!imagePreview ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors text-sm text-gray-600 dark:text-gray-300"
                                    >
                                        <Image className="w-4 h-4" />
                                        Add Image
                                    </label>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Max 5MB, JPG/PNG/GIF
                                    </span>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full max-h-64 object-cover"
                                        />
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                        >
                                            <XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Uploading...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select topic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {topics.map((topic) => (
                                        <SelectItem key={topic.value} value={topic.value}>
                                            <div className="flex items-center gap-2">
                                                <topic.icon className="w-4 h-4" />
                                                {topic.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <input
                                type="text"
                                placeholder="Company name (optional)"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                            />

                            <input
                                type="text"
                                placeholder="Industry (optional)"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleCreatePost}
                                disabled={!newPost.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isAnonymous ? 'Post Anonymously' : 'Post'}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Posts Feed */}
                <div className="space-y-4 md:space-y-6">
                    {loading ? (
                        <div className="text-center py-8 md:py-12">
                            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-3 md:mt-4 text-gray-600 dark:text-gray-300 text-sm md:text-base">Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 md:py-12"
                        >
                            <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No posts yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                                Be the first to share your thoughts anonymously!
                            </p>
                        </motion.div>
                    ) : (
                        posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-white/90 via-purple-50/40 to-blue-50/80 dark:bg-slate-800 rounded-xl md:rounded-2xl shadow-lg border border-purple-200/50 dark:border-white/20 overflow-hidden"
                            >
                                <CardHeader className="pb-3 md:pb-4 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 dark:bg-transparent">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <Avatar className="w-8 h-8 md:w-10 md:h-10 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800">
                                                <AvatarImage
                                                    src={post.is_anonymous && post.anonymous_avatar
                                                        ? post.anonymous_avatar
                                                        : `https://avatar.vercel.sh/${post.user_email}`}
                                                />
                                                <AvatarFallback>
                                                    {getDisplayName(post)[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-black text-sm md:text-base">
                                                    {getDisplayName(post)}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                                    {formatTimeAgo(post.created_at)}
                                                    {post.updated_at && post.updated_at !== post.created_at && (
                                                        <span className="ml-1 text-xs text-gray-400">(edited)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md">
                                                {topics.find(t => t.value === post.topic)?.label}
                                            </Badge>
                                            {post.user_email === (currentUser?.email || userEmail) && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditPost(post)}
                                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {(post.company_name || post.industry) && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            {post.company_name && (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {post.company_name}
                                                </span>
                                            )}
                                            {post.industry && (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" />
                                                    {post.industry}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="pt-0 bg-gradient-to-br from-white/90 via-blue-50/40 to-purple-50/80 dark:bg-transparent">
                                    {editingPost === post.id ? (
                                        <div className="space-y-4">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                placeholder="Edit your post..."
                                                className="min-h-[100px] resize-none"
                                            />
                                            <div className="flex items-center gap-2">
                                                <Select value={editTopic} onValueChange={setEditTopic}>
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {topics.map((topic) => (
                                                            <SelectItem key={topic.value} value={topic.value}>
                                                                {topic.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input
                                                    type="text"
                                                    value={editCompanyName}
                                                    onChange={(e) => setEditCompanyName(e.target.value)}
                                                    placeholder="Company (optional)"
                                                    className="flex-1 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={editIndustry}
                                                    onChange={(e) => setEditIndustry(e.target.value)}
                                                    placeholder="Industry (optional)"
                                                    className="flex-1 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => handleSaveEdit(post.id)}
                                                    disabled={!editContent.trim()}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={handleCancelEdit}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <X className="w-3 h-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-black mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                                                {post.content}
                                            </p>

                                            {/* Image Display - LinkedIn Style */}
                                            {post.image_url && (
                                                <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                    <img
                                                        src={post.image_url}
                                                        alt="Post image"
                                                        className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                        onClick={() => {
                                                            // Open image in new tab for full view
                                                            window.open(post.image_url, '_blank');
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors pointer-events-none"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleLikePost(post.id)}
                                                className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm bg-gradient-to-r from-pink-200 to-purple-200 hover:from-purple-400 hover:to-pink-400 text-purple-700 hover:text-white shadow transition-all duration-200 ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                            >
                                                <Heart className={`w-3 h-3 md:w-4 md:h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                                <span>{post.likes_count}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleComments(post.id)}
                                                className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-purple-400 hover:to-blue-400 text-blue-700 hover:text-white shadow text-xs md:text-sm transition-all duration-200"
                                            >
                                                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                                                <span>{post.comments_count}</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSharePost(post)}
                                                className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-green-100 to-blue-100 hover:from-blue-400 hover:to-green-400 text-green-700 hover:text-white shadow text-xs md:text-sm transition-all duration-200"
                                            >
                                                <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                                                <span>Share</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    <AnimatePresence>
                                        {showComments[post.id] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700"
                                            >
                                                {/* Add Comment */}
                                                <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                                                    <Avatar className="w-6 h-6 md:w-8 md:h-8 shadow ring-2 ring-blue-100 dark:ring-blue-800">
                                                        <AvatarImage src={`https://avatar.vercel.sh/${currentUser?.email || userEmail}`} />
                                                        <AvatarFallback>
                                                            {currentUser?.name?.[0] || currentUser?.email?.[0] || (typeof userEmail === 'string' ? userEmail[0] : 'U')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <Textarea
                                                            placeholder="Add a comment..."
                                                            value={newComment[post.id] || ''}
                                                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                            className="min-h-[60px] md:min-h-[80px] resize-none text-sm"
                                                        />
                                                        <div className="flex items-center justify-between mt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setIsAnonymous(!isAnonymous)}
                                                                className="flex items-center gap-1 text-xs"
                                                            >
                                                                {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                                {isAnonymous ? 'Anonymous' : 'Public'}
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleCreateComment(post.id)}
                                                                disabled={!newComment[post.id]?.trim()}
                                                                size="sm"
                                                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                                                            >
                                                                <Send className="w-3 h-3 mr-1" />
                                                                Comment
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Comments List */}
                                                <div className="space-y-2 md:space-y-3">
                                                    {comments[post.id]?.map((comment) => (
                                                        <div key={comment.id} className="flex items-start gap-2 md:gap-3">
                                                            <Avatar className="w-6 h-6 md:w-8 md:h-8 shadow ring-2 ring-blue-100 dark:ring-blue-800">
                                                                <AvatarImage
                                                                    src={comment.is_anonymous && comment.anonymous_avatar
                                                                        ? comment.anonymous_avatar
                                                                        : `https://avatar.vercel.sh/${comment.user_email}`}
                                                                />
                                                                <AvatarFallback>
                                                                    {getDisplayNameComment(comment)[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 md:p-3">
                                                                    <div className="flex items-center justify-between mb-1 md:mb-2">
                                                                        <p className="font-medium text-xs md:text-sm text-gray-900 dark:text-white">
                                                                            {getDisplayNameComment(comment)}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {formatTimeAgo(comment.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-black text-xs md:text-sm">
                                                                        {comment.content}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1 md:mt-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleLikeComment(comment.id, post.id)}
                                                                        className={`flex items-center gap-1 text-xs bg-gradient-to-r from-pink-100 to-purple-100 hover:from-purple-400 hover:to-pink-400 text-purple-700 hover:text-white shadow transition-all duration-200 ${comment.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                                                    >
                                                                        <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-current' : ''}`} />
                                                                        <span>{comment.likes_count}</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Replace Dialog with AlertDialog for the share modal */}
            <AlertDialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Share this post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Share your anonymous post with your network!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-4 mt-2">
                        <Button variant="outline" onClick={handleCopyLink} className="flex items-center gap-2">
                            <Copy className="w-4 h-4" /> Copy Link
                        </Button>
                        <Button variant="outline" onClick={handleShareToLinkedIn} className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-blue-700" /> Share to LinkedIn
                        </Button>
                        <Button variant="outline" onClick={handleShareToTwitter} className="flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-blue-400" /> Share to Twitter
                        </Button>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 