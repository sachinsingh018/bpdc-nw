'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getCookie } from 'cookies-next';
import { FaWhatsapp, FaLinkedin, FaRegCopy, FaFacebook, FaPhone, FaEnvelope, FaEdit, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { TwitterIcon, Users, MessageSquare, MessageCircle, BarChart3, Calendar, Briefcase, Award, MapPin, Globe, Star, Sparkles, Menu, Heart, Home, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { OptimizedNavbar } from '@/components/optimized-navbar';
import { PageLoading, SkeletonCard, NavigationLoading } from '@/components/loading-states';
import { useUserData } from '@/hooks/useOptimizedData';
import { ProfileCompletionWizard } from '@/components/profile-completion-wizard';
import { AvatarSelector } from '@/components/ui/avatar-selector';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { checkUsernameNSFW, generateUsernameSuggestions } from '@/lib/utils/nsfw-filter';

const OptimizedProfilePage = () => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    // Use optimized data hook
    const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useUserData();

    // State management
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showProfileWizard, setShowProfileWizard] = useState(false);

    // User data from hook
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userBio, setUserBio] = useState('');
    const [originalUserBio, setOriginalUserBio] = useState('');
    const [userAvatar, setUserAvatar] = useState('/avatar.png');

    // Profile sections
    const [goals, setGoals] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<string[]>([]);

    // Social links
    const [socialLinks, setSocialLinks] = useState({
        linkedin: '',
        facebook: '',
        phone: '',
        email: ''
    });

    // Anonymous identity
    const [anonymousUsername, setAnonymousUsername] = useState('');
    const [anonymousAvatar, setAnonymousAvatar] = useState('');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [usernameValidation, setUsernameValidation] = useState<{
        isValid: boolean;
        reason?: string;
        suggestions?: string[];
    }>({ isValid: true });
    const [showUsernameSuggestions, setShowUsernameSuggestions] = useState(false);

    const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Quick actions
    const [recentActivity, setRecentActivity] = useState([
        { id: 1, type: 'connection', text: 'Connected with Sarah Chen', time: '2 hours ago', icon: Users },
        { id: 2, type: 'message', text: 'New message from Tech Startup', time: '4 hours ago', icon: MessageSquare },
        { id: 3, type: 'profile', text: 'Profile viewed by 5 people', time: '1 day ago', icon: BarChart3 },
    ]);

    // Update state when user data is loaded
    useEffect(() => {
        if (userData) {
            setUserName(userData.name || 'Networkqy User');
            setUserEmail(userData.email || '');
            const bioData = userData.linkedinInfo || '';
            setUserBio(bioData);
            setOriginalUserBio(bioData);
            setGoals(userData.goals ? userData.goals.split(',').map((s: string) => s.trim()) : []);
            setSkills(userData.strengths ? userData.strengths.split(',').map((s: string) => s.trim()) : []);
            setInterests(userData.interests ? userData.interests.split(',').map((s: string) => s.trim()) : []);
            setMetrics(userData.profilemetrics ? userData.profilemetrics.split(',').map((s: string) => s.trim()) : []);

            setSocialLinks({
                linkedin: userData.linkedinURL || '',
                facebook: userData.FacebookURL || '',
                phone: userData.phone || '',
                email: userData.email || ''
            });

            setAnonymousUsername(userData.anonymous_username || '');
            setAnonymousAvatar(userData.anonymous_avatar || '');
        }
    }, [userData]);

    // Check authentication
    useEffect(() => {
        const userEmail = getCookie('userEmail');
        if (!userEmail && !userLoading) {
            router.push('/login');
        }
    }, [router, userLoading]);

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        const fields = [
            userName, userBio, goals.length, skills.length, interests.length,
            metrics.length, socialLinks.linkedin, socialLinks.phone
        ];
        const completedFields = fields.filter(field =>
            Array.isArray(field) ? field.length > 0 : field && field.toString().trim() !== ''
        ).length;
        return Math.round((completedFields / fields.length) * 100);
    };

    const profileCompletion = calculateProfileCompletion();
    const isProfileIncomplete = profileCompletion < 70;

    // Options for dropdowns
    const goalOptions = [
        'Hiring', 'Looking for co-founders', 'Raising funding', 'Exploring job opportunities',
        'Networking with peers', 'Mentoring others', 'Seeking mentorship', 'Showcasing projects',
        'Learning and upskilling', 'Building personal brand'
    ];

    const skillOptions = [
        'Product Management', 'Software Development', 'Data Science', 'Marketing',
        'Sales', 'Design', 'Finance', 'Operations', 'Strategy', 'Leadership',
        'AI/ML', 'Blockchain', 'Cloud Computing', 'Cybersecurity'
    ];

    const interestOptions = [
        'AI & Machine Learning', 'Blockchain', 'Sustainability', 'Fintech',
        'Healthtech', 'Edtech', 'E-commerce', 'SaaS', 'Mobile Apps', 'Web3'
    ];

    const metricOptions = [
        '10+ years experience', 'Leadership Skills', 'Product Management', 'Tech Industry Expert',
        'Business Development', 'Certified Scrum Master', 'Analyst Experience', 'Founder'
    ];

    // Set textarea value when edit mode is enabled
    useEffect(() => {
        if (isEditing && bioTextareaRef.current) {
            bioTextareaRef.current.value = userBio;
        }
    }, [isEditing, userBio]);

    // Save profile data
    const saveProfile = async () => {
        if (anonymousUsername && !validateUsername(anonymousUsername)) {
            toast.error('Please fix the username issues before saving');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/profile/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    name: userName,
                    goals,
                    strengths: skills,
                    interests,
                    profilemetrics: metrics,
                    linkedinInfo: userBio,
                    linkedinURL: socialLinks.linkedin,
                    FacebookURL: socialLinks.facebook,
                    phone: socialLinks.phone,
                    anonymous_username: anonymousUsername,
                    anonymous_avatar: anonymousAvatar,
                }),
            });

            if (response.ok) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                setOriginalUserBio(userBio);
                await refetchUser(); // Refresh cached data
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper functions
    const addItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
        if (value.trim() && !array.includes(value.trim())) {
            setArray([...array, value.trim()]);
        }
    };

    const removeItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        setArray(array.filter(i => i !== item));
    };

    const validateUsername = (username: string) => {
        if (!username) return true;

        const nsfwCheck = checkUsernameNSFW(username);
        if (!nsfwCheck.isValid) {
            setUsernameValidation({
                isValid: false,
                reason: nsfwCheck.reason,
                suggestions: generateUsernameSuggestions(username)
            });
            return false;
        }

        setUsernameValidation({ isValid: true });
        return true;
    };

    // Show loading state
    if (userLoading) {
        return <PageLoading title="Loading Profile..." subtitle="Fetching your profile data" />;
    }

    // Show error state
    if (userError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="size-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-2">
                        Error Loading Profile
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {userError}
                    </p>
                    <Button onClick={refetchUser} className="bg-purple-600 hover:bg-purple-700">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavigationLoading isVisible={isNavigating} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
                <OptimizedNavbar currentPage="profile" />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg mb-8"
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Avatar Section */}
                            <div className="shrink-0">
                                <div className="relative">
                                    <Image
                                        src={userAvatar}
                                        alt="Profile"
                                        width={120}
                                        height={120}
                                        className="rounded-full border-4 border-purple-200 dark:border-purple-800 shadow-lg"
                                    />
                                    <button
                                        onClick={() => setShowAvatarSelector(true)}
                                        className="absolute bottom-0 right-0 bg-purple-600 text-black p-2 rounded-full hover:bg-purple-700 transition-colors"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-black mb-2">
                                            {userName}
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            {userEmail}
                                        </p>

                                        {/* Profile Completion */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Profile Completion
                                                </span>
                                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                    {profileCompletion}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${profileCompletion}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {isProfileIncomplete && (
                                            <Button
                                                onClick={() => setShowProfileWizard(true)}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-black"
                                            >
                                                Complete Profile
                                            </Button>
                                        )}

                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={saveProfile}
                                                    disabled={isSaving}
                                                    className="bg-green-600 hover:bg-green-700 text-black"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setUserBio(originalUserBio);
                                                    }}
                                                    variant="outline"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="outline"
                                                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                            >
                                                <FaEdit className="mr-2" />
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Profile Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* About Me Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 flex items-center gap-2">
                                    <Briefcase className="size-5 text-purple-600" />
                                    About Me
                                </h2>

                                {isEditing ? (
                                    <textarea
                                        ref={bioTextareaRef}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-black resize-none"
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {userBio || 'No bio added yet. Click "Edit Profile" to add your bio.'}
                                    </p>
                                )}
                            </motion.div>

                            {/* Goals Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 flex items-center gap-2">
                                    <Award className="size-5 text-purple-600" />
                                    Goals
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {goals.filter(goal => goal && goal.trim() !== '' && goal !== '[]').map((goal, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                                        >
                                            {goal}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Skills Section */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4 flex items-center gap-2">
                                    <Star className="size-5 text-purple-600" />
                                    Skills & Expertise
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.filter(skill => skill && skill.trim() !== '' && skill !== '[]').map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4">Quick Actions</h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setIsNavigating(true);
                                            router.push('/chat');
                                        }}
                                        className="w-full flex items-center gap-3 p-3 bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/30 border border-purple-300 dark:border-purple-500/30 rounded-lg text-purple-800 dark:text-black transition-colors"
                                    >
                                        <MessageSquare size={20} />
                                        <span>Start Chat</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsNavigating(true);
                                            router.push('/connections');
                                        }}
                                        className="w-full flex items-center gap-3 p-3 bg-blue-100 dark:bg-blue-600/20 hover:bg-blue-200 dark:hover:bg-blue-600/30 border border-blue-300 dark:border-blue-500/30 rounded-lg text-blue-800 dark:text-black transition-colors"
                                    >
                                        <Users size={20} />
                                        <span>My Connections</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsNavigating(true);
                                            router.push('/matches');
                                        }}
                                        className="w-full flex items-center gap-3 p-3 bg-green-100 dark:bg-green-600/20 hover:bg-green-200 dark:hover:bg-green-600/30 border border-green-300 dark:border-green-500/30 rounded-lg text-green-800 dark:text-black transition-colors"
                                    >
                                        <BarChart3 size={20} />
                                        <span>View Matches</span>
                                    </button>
                                </div>
                            </motion.div>

                            {/* Recent Activity */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-black mb-4">Recent Activity</h2>
                                <div className="space-y-3">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                            <activity.icon size={16} className="text-purple-600 dark:text-purple-400" />
                                            <div className="flex-1">
                                                <p className="text-gray-900 dark:text-black text-sm">{activity.text}</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showProfileWizard && (
                    <ProfileCompletionWizard
                        isOpen={showProfileWizard}
                        onClose={() => setShowProfileWizard(false)}
                        onComplete={() => {
                            setShowProfileWizard(false);
                            refetchUser();
                        }}
                    />
                )}

                {showAvatarSelector && (
                    <AvatarSelector
                        selectedAvatar={userAvatar || ''}
                        onAvatarChange={(avatar) => {
                            setUserAvatar(avatar);
                            setShowAvatarSelector(false);
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default OptimizedProfilePage; 