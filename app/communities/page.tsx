"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Users, Home, MessageSquare, MessageCircle, User, Menu, Briefcase, Calendar, MessageCircle as MessageCircleIcon, Plus, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommonNavbar } from "@/components/common-navbar";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { getCookie } from "cookies-next";
import { Loader2 } from "lucide-react";

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
            <div className="size-16 bg-bits-golden-yellow/20 rounded-full" />
            <div className="h-4 w-24 bg-bits-golden-yellow/10 rounded" />
            <div className="size-32 bg-bits-golden-yellow/5 rounded flex-1" />
            <div className="h-8 w-20 bg-bits-golden-yellow/20 rounded" />
        </div>
    );
}

export default function CommunitiesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [userMemberships, setUserMemberships] = useState<Record<string, UserMembership>>({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState("");
    const [newCommunityDescription, setNewCommunityDescription] = useState("");
    const [newCommunityBannerImage, setNewCommunityBannerImage] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Authentication check
    useEffect(() => {
        const initialize = async () => {
            // Check for NextAuth session first
            if (session?.user?.email) {
                // Set up userEmail cookie for Google users
                try {
                    const response = await fetch('/api/auth/google-setup');
                    if (response.ok) {
                        return;
                    }
                } catch (error) {
                    console.error('Error setting up Google session:', error);
                }
            }

            // Fallback to cookie-based authentication
            const userEmail = await getCookie('userEmail');
            if (!userEmail) {
                router.push('/login');
            }
        };

        // Only initialize after session status is determined
        if (status !== 'loading') {
            initialize();
        }
    }, [router, session, status]);

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

    // Helper function to track activity
    const trackActivity = async (actionType: string, actionCategory: string, metadata?: any) => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
            await fetch('/api/activity/track-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    actionType,
                    actionCategory,
                    resourceType: 'communities',
                    metadata: {
                        ...metadata,
                        pagePath: '/communities',
                        timestamp: new Date().toISOString(),
                    },
                }),
            }).catch(console.error);
        } catch (error) {
            console.error('Error tracking activity:', error);
        }
    };

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

        // Track page access
        const trackPageAccess = async () => {
            const userId = await getCurrentUserId();
            if (!userId) return;

            try {
                await fetch('/api/activity/track-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        actionType: 'page_accessed',
                        actionCategory: 'communities',
                        resourceType: 'communities',
                        metadata: {
                            feature: 'communities',
                            pagePath: '/communities',
                            timestamp: new Date().toISOString(),
                        },
                    }),
                }).catch(console.error);
            } catch (error) {
                console.error('Error tracking activity:', error);
            }
        };
        trackPageAccess();
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

                // Track community join activity
                const community = communities.find(c => c.id === communityId);
                trackActivity('community_joined', 'communities', {
                    feature: 'communities',
                    communityId: communityId,
                    communityName: community?.name || 'Unknown',
                    status: 'approved',
                });
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

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setSelectedImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleImageUpload = async (): Promise<string | null> => {
        if (!selectedImage) return null;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedImage);
            formData.append('folder', 'community-images');

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return data.fileUrl;
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to upload image');
                return null;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateCommunity = async () => {
        if (!newCommunityName.trim()) {
            toast.error('Community name is required');
            return;
        }

        setCreateLoading(true);
        try {
            // Upload image first if one is selected
            let bannerImageUrl = null;
            if (selectedImage) {
                bannerImageUrl = await handleImageUpload();
                if (!bannerImageUrl) {
                    setCreateLoading(false);
                    return; // Error already shown in handleImageUpload
                }
            }

            const response = await fetch('/api/communities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newCommunityName.trim(),
                    description: newCommunityDescription.trim() || null,
                    bannerImage: bannerImageUrl || newCommunityBannerImage.trim() || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Community created successfully!');
                setShowCreateModal(false);
                setNewCommunityName("");
                setNewCommunityDescription("");
                setNewCommunityBannerImage("");
                setSelectedImage(null);
                setImagePreview(null);
                // Refresh communities list
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to create community');
            }
        } catch (error) {
            console.error('Error creating community:', error);
            toast.error('Failed to create community');
        } finally {
            setCreateLoading(false);
        }
    };

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
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
                <div className="relative z-10 text-center">
                    <Loader2 className="size-8 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-black font-medium">Loading...</p>
                </div>
            </div>
        );
    }

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

            {/* Create Community Button - Upper Right */}
            <div className="max-w-6xl mx-auto px-4 pt-4 flex justify-end relative z-10">
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 rounded-lg flex items-center gap-2"
                >
                    <Plus className="size-4" />
                    Create Community
                </Button>
            </div>

            {/* Hero Section */}
            <div className="max-w-3xl mx-auto text-center pt-10 pb-16 px-4 relative z-10">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-500 p-3 rounded-full shadow-lg border-2 border-white">
                        <Users className="size-8 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    Join Powerful Communities
                </h1>
                <p className="text-lg text-white/95 font-bold max-w-xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
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
                                onClick={() => {
                                    // Track community view activity
                                    trackActivity('community_viewed', 'communities', {
                                        feature: 'communities',
                                        communityId: community.id,
                                        communityName: community.name,
                                    });
                                    router.push(`/communities/${community.id}`);
                                }}
                            >
                                <Avatar className="size-16 mb-2">
                                    <AvatarImage src={community.banner_image || undefined} alt={community.name} />
                                    <AvatarFallback>
                                        <Sparkles className="size-6 text-bits-golden-yellow" />
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold text-black dark:text-black text-center">
                                    {community.name}
                                </h2>
                                <p className="text-black dark:text-black text-center text-sm mb-2 flex-1">
                                    {community.description || 'No description available'}
                                </p>
                                <div className="flex gap-2 w-full mt-auto relative z-10">
                                    <Button
                                        type="button"
                                        className="flex-1 bg-gradient-to-r from-bits-golden-yellow to-bits-royal-blue text-black dark:text-black font-semibold shadow-md hover:from-bits-golden-yellow-600 hover:to-bits-royal-blue-600 rounded-lg flex items-center justify-center h-10 relative z-10 pointer-events-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Track community view activity
                                            trackActivity('community_viewed', 'communities', {
                                                feature: 'communities',
                                                communityId: community.id,
                                                communityName: community.name,
                                            });
                                            router.push(`/communities/${community.id}`);
                                        }}
                                    >
                                        View
                                    </Button>
                                    {!membershipStatus ? (
                                        <Button
                                            type="button"
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-bits-royal-blue dark:text-black font-semibold shadow-md hover:from-green-700 hover:to-green-800 rounded-lg flex items-center justify-center h-10 relative z-10 pointer-events-auto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoinCommunity(community.id);
                                            }}
                                        >
                                            Join
                                        </Button>
                                    ) : membershipStatus === 'approved' ? (
                                        <Button
                                            type="button"
                                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-bits-royal-blue dark:text-black font-semibold shadow-md rounded-lg flex items-center justify-center h-10 relative z-10"
                                            disabled
                                        >
                                            Member
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-bits-royal-blue dark:text-black font-semibold shadow-md rounded-lg flex items-center justify-center h-10 relative z-10"
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

            {/* Create Community Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Create New Community
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Fill in the details to create a new community for your network.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-900 dark:text-white font-semibold">
                                Community Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., BITS Dubai Alumni Network"
                                value={newCommunityName}
                                onChange={(e) => setNewCommunityName(e.target.value)}
                                className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-gray-900 dark:text-white font-semibold">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Describe what this community is about..."
                                value={newCommunityDescription}
                                onChange={(e) => setNewCommunityDescription(e.target.value)}
                                rows={4}
                                className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bannerImage" className="text-gray-900 dark:text-white font-semibold">
                                Banner Image (Optional)
                            </Label>
                            {!imagePreview ? (
                                <div className="flex items-center gap-4">
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="size-8 text-gray-400 mb-2" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                PNG, JPG, GIF, WEBP (MAX. 5MB)
                                            </p>
                                        </div>
                                        <input
                                            id="image-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            disabled={uploadingImage || createLoading}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            disabled={uploadingImage || createLoading}
                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors disabled:opacity-50"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                    {uploadingImage && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Uploading image...
                                        </p>
                                    )}
                                </div>
                            )}
                            {!imagePreview && (
                                <div className="mt-2">
                                    <Label htmlFor="bannerImageUrl" className="text-gray-900 dark:text-white font-semibold text-sm">
                                        Or enter image URL:
                                    </Label>
                                    <Input
                                        id="bannerImageUrl"
                                        placeholder="https://example.com/image.jpg"
                                        value={newCommunityBannerImage}
                                        onChange={(e) => setNewCommunityBannerImage(e.target.value)}
                                        className="bg-white dark:bg-slate-700 text-gray-900 dark:text-white mt-1"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCreateModal(false);
                                setNewCommunityName("");
                                setNewCommunityDescription("");
                                setNewCommunityBannerImage("");
                                setSelectedImage(null);
                                setImagePreview(null);
                            }}
                            disabled={createLoading || uploadingImage}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateCommunity}
                            disabled={createLoading || uploadingImage || !newCommunityName.trim()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                        >
                            {createLoading ? (uploadingImage ? 'Uploading...' : 'Creating...') : 'Create Community'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
} 