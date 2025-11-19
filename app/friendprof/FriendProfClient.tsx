'use client';
import React, { Suspense, useState } from 'react';
import { useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { FaWhatsapp, FaLinkedin, FaRegCopy } from 'react-icons/fa';
import { TwitterIcon } from 'lucide-react'; // this shows the "X" branding
import { FaInstagram } from 'react-icons/fa';
import { FaFacebook, FaPhone } from 'react-icons/fa';
import { toast } from 'sonner';

import { motion } from 'framer-motion';

import { useRouter } from 'next/navigation';

import { useSearchParams } from 'next/navigation';

// import { createUser, getUser } from '@/lib/db/queries';
// import React from 'react';
import { FaLinkedinIn, FaTwitter, FaEnvelope, FaEllipsisH } from 'react-icons/fa';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import Image from 'next/image';

import { SidebarToggle } from '@/components/sidebar-toggle'; // Import the SidebarToggle
import { getMaxListeners } from 'events';
import { getMaterializedViewConfig } from 'drizzle-orm/pg-core';
import { Sparkles, Users, MessageSquare, MessageCircle, BarChart3, Home, User, Menu, MapPin, Globe } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Calendar, Briefcase, Award, Heart, Star } from 'lucide-react';
import { CommonNavbar } from '@/components/common-navbar';

const ALL_ACTIVITIES = [
    { icon: Users, text: 'Connected with Sarah Chen', time: '2 hours ago' },
    { icon: MessageSquare, text: 'New message from Tech Startup', time: '4 hours ago' },
    { icon: BarChart3, text: 'Profile viewed by 5 people', time: '1 day ago' },
    { icon: Briefcase, text: 'Started a new job at FinTechX', time: '3 days ago' },
    { icon: Award, text: 'Received "Top Mentor" badge', time: '5 days ago' },
    { icon: Heart, text: 'Liked a post by John Doe', time: '6 days ago' },
    { icon: Users, text: 'Added 3 new connections', time: '1 week ago' },
    { icon: MessageSquare, text: 'Sent a message to Priya Singh', time: '1 week ago' },
    { icon: Calendar, text: 'Attended "AI Summit 2024"', time: '2 weeks ago' },
    { icon: Star, text: 'Upgraded to Premium', time: '2 weeks ago' },
    { icon: Briefcase, text: 'Promoted to Product Manager', time: '3 weeks ago' },
    { icon: Award, text: 'Completed "Leadership 101" course', time: '1 month ago' },
    { icon: Heart, text: 'Endorsed by Alex Kim', time: '1 month ago' },
    { icon: Users, text: 'Invited 5 friends to Networkqy', time: '1 month ago' },
    { icon: MessageSquare, text: 'Replied to a group chat', time: '1 month ago' },
    { icon: Calendar, text: 'Scheduled a meeting with CEO', time: '2 months ago' },
    { icon: Star, text: 'Received 10 recommendations', time: '2 months ago' },
    { icon: Briefcase, text: 'Started mentoring program', time: '2 months ago' },
    { icon: Award, text: 'Won "Best Pitch" at Demo Day', time: '3 months ago' },
    { icon: Heart, text: 'Followed FinTech News', time: '3 months ago' },
    { icon: Users, text: 'Joined "Women in Tech" group', time: '3 months ago' },
    { icon: MessageSquare, text: 'Shared a job opening', time: '4 months ago' },
    { icon: Calendar, text: 'Registered for "Web3 Bootcamp"', time: '4 months ago' },
    { icon: Star, text: 'Profile 100% complete', time: '4 months ago' },
    { icon: Award, text: 'Recognized as "Rising Star"', time: '5 months ago' },
];

function getRandomActivities(count = 5) {
    const shuffled = ALL_ACTIVITIES.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Format activity based on action_type and action_category
function formatActivity(activity: {
    action_type: string;
    action_category: string;
    resource_type: string | null;
    resource_id: string | null;
    metadata: any;
    created_at: Date | string;
}): { icon: any; text: string; time: string } | null {
    const timeAgo = getTimeAgo(new Date(activity.created_at));

    // Map action categories to icons
    const categoryIconMap: { [key: string]: any } = {
        'social': Users,
        'content': MessageSquare,
        'jobs': Briefcase,
        'authentication': User,
        'communities': Users,
        'profile': User,
        'connections': Users,
        'messages': MessageSquare,
    };

    // Map action types to readable text
    const actionTextMap: { [key: string]: string } = {
        'connection_request_sent': 'Sent a connection request',
        'connection_request_accepted': 'Accepted a connection request',
        'connection_request_rejected': 'Rejected a connection request',
        'profile_viewed': 'Viewed a profile',
        'profile_updated': 'Updated profile',
        'message_sent': 'Sent a message',
        'message_received': 'Received a message',
        'post_created': 'Created a post',
        'post_liked': 'Liked a post',
        'post_commented': 'Commented on a post',
        'job_applied': 'Applied for a job',
        'job_saved': 'Saved a job',
        'job_viewed': 'Viewed a job',
        'community_joined': 'Joined a community',
        'community_post_created': 'Created a community post',
        'login': 'Logged in',
        'logout': 'Logged out',
        'skill_assessment_completed': 'Completed a skill assessment',
        'skill_badge_earned': 'Earned a skill badge',
    };

    const icon = categoryIconMap[activity.action_category] || BarChart3;
    let text = actionTextMap[activity.action_type] || activity.action_type;

    // Enhance text with metadata if available
    if (activity.metadata) {
        let metadata: any = {};
        try {
            metadata = typeof activity.metadata === 'string'
                ? JSON.parse(activity.metadata)
                : activity.metadata;
        } catch (e) {
            // If parsing fails, use empty object
            metadata = {};
        }

        if (metadata.targetUserName) {
            text = text.replace('a', ` ${metadata.targetUserName}`);
        }
        if (metadata.jobTitle) {
            text += ` for ${metadata.jobTitle}`;
        }
        if (metadata.communityName) {
            text += ` in ${metadata.communityName}`;
        }
        if (metadata.skillName) {
            text += `: ${metadata.skillName}`;
        }
        if (metadata.postTitle) {
            text += `: ${metadata.postTitle}`;
        }
    }

    return {
        icon,
        text,
        time: timeAgo,
    };
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
}

const ProfilePage = () => {
    const [goals, setGoals] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<string[]>([]);
    const [userSkills, setUserSkills] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [userName, setUserName] = useState<string>(''); // ✅ added for name
    const [userEmail, setUserEmail] = useState<string>('');
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isRedirectingFolder, setIsRedirectingFolder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnectionCheckComplete, setIsConnectionCheckComplete] = useState(false);
    const streak = getCookie('userStreak');


    const [userBio, setUserBio] = useState<string>('');
    const shareMessage = `🚀 Check out Networkqy — a smarter way to connect with professionals, discover opportunities, and grow your network. Join now: https://networkqy.com`;

    const [showShareModal, setShowShareModal] = useState(false);
    const shareText = `🚀 Check out Networkqy — a smarter way to connect with professionals, discover opportunities, and grow your network. Join now: https://networkqy.com`;
    const XIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1200 1227" fill="currentColor">
            <path d="M1032 0L684 488 1200 1227H817L540 831 208 1227H0L368 714 0 0H394L681 420 992 0h40z" />
        </svg>
    );

    const [socialData, setSocialData] = useState({
        linkedinURL: '',
        FacebookURL: '',
        phone: '',
    });
    const [editingField, setEditingField] = useState<null | 'linkedinURL' | 'FacebookURL' | 'phone'>(null);
    const [inputValue, setInputValue] = useState('');

    const handleInviteClick = async () => {
        const shareText = `🚀 Check out Networkqy — a smarter way to connect with professionals, discover opportunities, and grow your network. Join now: https://networkqy.com`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on Networkqy',
                    text: shareText,
                    url: 'https://networkqy.com',
                });
            } catch (error) {
                console.error('Sharing failed:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                toast.success('Link copied! Share it with your friends.');
            } catch {
                toast.error('Copy failed! Please try manually.');
            }
        }
    };

    const handleConnect = async () => {
        if (!userEmail) {
            toast.error('Unable to send connection request');
            return;
        }

        setSendingRequest(true);
        try {
            const senderEmail = getCookie('userEmail');
            if (!senderEmail) {
                toast.error('Please log in to send connection requests');
                setSendingRequest(false);
                return;
            }

            // Don't allow connecting to yourself
            if (senderEmail === userEmail) {
                toast.error('You cannot connect with yourself');
                setSendingRequest(false);
                return;
            }

            const response = await fetch('/api/connections/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail,
                    receiverEmail: userEmail,
                    message: `Hi ${userName || 'there'}! I would like to connect with you on Networkqy.`
                })
            });

            if (response.ok) {
                toast.success('Connection request sent!');
                setConnectionStatus('pending');
                setIsConnectionCheckComplete(true);
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send connection request');
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
            toast.error('Error sending connection request');
        } finally {
            setSendingRequest(false);
        }
    };

    // const emailid = getCookie('userEmail') || 'sachintest@gmail.com';
    const emailid = (getCookie('userEmail') as string) || 'sachintest@gmail.com';


    const searchParams = useSearchParams();

    const [profileUserId, setProfileUserId] = useState<string>('');

    const [userAvatar, setUserAvatar] = useState('/avatar.png');

    const [sendingRequest, setSendingRequest] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
    const [recentActivities, setRecentActivities] = useState<Array<{
        icon: any;
        text: string;
        time: string;
    }>>(getRandomActivities(3)); // Initialize with random activities as fallback

    useEffect(() => {
        // const emaili = getCookie('userEmail') || 'sachintest@gmail.com';
        // const searchParams = useSearchParams();
        const emaili = (searchParams?.get('email')) || getCookie('userEmail') || 'sachintest@gmail.com';


        const fetchData = async () => {
            try {
                const res = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emaili }),
                });
                // const [isRedirecting, setIsRedirecting] = useState(false);

                const data = await res.json();
                console.log('Fetched user data:', data);
                const {
                    goals,
                    profilemetrics,
                    strengths,
                    interests,
                    name,
                    email,
                    linkedinInfo,
                    linkedinURL,
                    FacebookURL,
                    phone,
                    avatar,
                } = data;
                setSocialData({
                    linkedinURL: linkedinURL || '',
                    FacebookURL: FacebookURL || '',
                    phone: phone || '',
                });



                setGoals(typeof goals === 'string' ? goals.split(',').map(s => s.trim()) : []);
                setMetrics(typeof profilemetrics === 'string' ? profilemetrics.split(',').map(s => s.trim()) : []);
                setUserSkills(typeof strengths === 'string' ? strengths.split(',').map(s => s.trim()) : []);
                setInterests(typeof interests === 'string' ? interests.split(',').map(s => s.trim()) : []);
                if (name) setUserName(name);
                if (email) setUserEmail(email);
                if (linkedinInfo) setUserBio(linkedinInfo); // ✅ THIS LINE links About Me to linkedinInfo

                setGoals(typeof goals === 'string' ? goals.split(',').map(s => s.trim()) : []);
                setMetrics(typeof profilemetrics === 'string' ? profilemetrics.split(',').map(s => s.trim()) : []);
                setUserSkills(typeof strengths === 'string' ? strengths.split(',').map(s => s.trim()) : []);
                setInterests(typeof interests === 'string' ? interests.split(',').map(s => s.trim()) : []);
                if (name) setUserName(name);
                if (email) setUserEmail(email);

                if (data?.id) setProfileUserId(data.id);

                if (avatar) setUserAvatar(avatar);

                // Check connection status after fetching user data
                await checkConnectionStatus(email);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
            finally {
                setIsLoading(false);
            }
        };

        const checkConnectionStatus = async (targetEmail: string) => {
            if (!targetEmail) return;

            try {
                const senderEmail = getCookie('userEmail') as string;
                if (!senderEmail || senderEmail === targetEmail) return;

                // Get current user's ID first
                const currentUserRes = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: senderEmail }),
                });
                const currentUserData = await currentUserRes.json();

                if (!currentUserData?.id) return;

                // Get target user's ID
                const targetUserRes = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: targetEmail }),
                });
                const targetUserData = await targetUserRes.json();

                if (!targetUserData?.id) return;

                // Check for accepted connections first (highest priority)
                const acceptedConnectionsRes = await fetch(`/api/connections?type=accepted&userEmail=${encodeURIComponent(senderEmail)}`);
                if (acceptedConnectionsRes.ok) {
                    const acceptedData = await acceptedConnectionsRes.json();
                    const acceptedConnection = acceptedData.connections?.find(
                        (conn: any) =>
                            (conn.sender_id === currentUserData.id && conn.receiver_id === targetUserData.id) ||
                            (conn.sender_id === targetUserData.id && conn.receiver_id === currentUserData.id)
                    );

                    if (acceptedConnection) {
                        setConnectionStatus('connected');
                        return;
                    }
                }

                // Check for pending connections
                const connectionRes = await fetch(`/api/connections?type=requests&userEmail=${encodeURIComponent(senderEmail)}`);
                if (connectionRes.ok) {
                    const connectionData = await connectionRes.json();
                    const existingConnection = connectionData.requests?.find(
                        (conn: any) =>
                            (conn.sender_id === currentUserData.id && conn.receiver_id === targetUserData.id) ||
                            (conn.sender_id === targetUserData.id && conn.receiver_id === currentUserData.id)
                    );

                    if (existingConnection) {
                        setConnectionStatus('pending');
                        return;
                    }
                }

                // If no connection found, set status to none
                setConnectionStatus('none');
            } catch (error) {
                console.error('Error checking connection status:', error);
                setConnectionStatus('none');
            }
        };

        fetchData();
    }, []);

    // Add a new useEffect to check connection status when profileUserId is available
    useEffect(() => {
        const checkConnectionStatus = async () => {
            if (!profileUserId) return;

            try {
                const senderEmail = getCookie('userEmail') as string;
                if (!senderEmail) return;

                // Get current user's ID first
                const currentUserRes = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: senderEmail }),
                });
                const currentUserData = await currentUserRes.json();

                if (!currentUserData?.id) return;

                // Check for accepted connections first (highest priority)
                const acceptedConnectionsRes = await fetch(`/api/connections?type=accepted&userEmail=${encodeURIComponent(senderEmail)}`);
                if (acceptedConnectionsRes.ok) {
                    const acceptedData = await acceptedConnectionsRes.json();
                    const acceptedConnection = acceptedData.connections?.find(
                        (conn: any) =>
                            (conn.sender_id === currentUserData.id && conn.receiver_id === profileUserId) ||
                            (conn.sender_id === profileUserId && conn.receiver_id === currentUserData.id)
                    );

                    if (acceptedConnection) {
                        setConnectionStatus('connected');
                        setIsConnectionCheckComplete(true);
                        return;
                    }
                }

                // Check for pending connections
                const connectionRes = await fetch(`/api/connections?type=requests&userEmail=${encodeURIComponent(senderEmail)}`);
                if (connectionRes.ok) {
                    const connectionData = await connectionRes.json();
                    const existingConnection = connectionData.requests?.find(
                        (conn: any) =>
                            (conn.sender_id === currentUserData.id && conn.receiver_id === profileUserId) ||
                            (conn.sender_id === profileUserId && conn.receiver_id === currentUserData.id)
                    );

                    if (existingConnection) {
                        setConnectionStatus('pending');
                        setIsConnectionCheckComplete(true);
                        return;
                    }
                }

                // If no connection found, set status to none
                setConnectionStatus('none');
            } catch (error) {
                console.error('Error checking connection status:', error);
                setConnectionStatus('none');
            } finally {
                setIsConnectionCheckComplete(true);
            }
        };

        checkConnectionStatus();
    }, [profileUserId]);

    // Fetch user activities when profileUserId is available
    useEffect(() => {
        const fetchActivities = async () => {
            if (!profileUserId) {
                // Fallback to random activities if no user ID
                setRecentActivities(getRandomActivities(3));
                return;
            }

            try {
                const response = await fetch(`/api/user-activities?userId=${encodeURIComponent(profileUserId)}&limit=3`);
                if (response.ok) {
                    const activities = await response.json();
                    const formattedActivities = activities
                        .map(formatActivity)
                        .filter((activity: any) => activity !== null);

                    // If we have fewer than 3 activities, fill with random ones
                    if (formattedActivities.length < 3) {
                        const randomActivities = getRandomActivities(3 - formattedActivities.length);
                        setRecentActivities([...formattedActivities, ...randomActivities].slice(0, 3));
                    } else {
                        setRecentActivities(formattedActivities);
                    }
                } else {
                    // Fallback to random activities on error
                    setRecentActivities(getRandomActivities(3));
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
                // Fallback to random activities on error
                setRecentActivities(getRandomActivities(3));
            }
        };

        fetchActivities();
    }, [profileUserId]);

    // Add a delay to show loading for 4 seconds
    useEffect(() => {
        if (isConnectionCheckComplete && !isLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isConnectionCheckComplete, isLoading]);

    // const [goals, setGoals] = useState(['Hiring']);
    const [newGoal, setNewGoal] = useState('');

    const goalOptions = [
        'Hiring',
        'Looking for co-founders',
        'Raising funding',
        'Exploring new job opportunities',
        'Networking with peers',
        'Mentoring others',
        'Seeking mentorship',
        'Showcasing projects',
        'Learning and upskilling',
        'Building a personal brand',
    ];
    const router = useRouter();

    const user2 = {
        name: 'Zayd McKenzie',
        email: emailid,
        phone: '+1 555 123 4567',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
    };

    const user = {
        name: 'Zayd McKenzie',
        email: userEmail,
        phone: '+1 555 123 4567',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
    };
    const [newInterest, setNewInterest] = useState('');
    const interestOptions = [
        'AI & Machine Learning',
        'Blockchain',
        'Sustainability',
        'Marketing',
        'Data Science',
        'Finance',
        'Design Thinking',
        'Entrepreneurship',
        'Digital Transformation',
    ];

    const [newMetric, setNewMetric] = useState('');
    const metricOptions = [
        '10+ years experience',
        'Leadership Skills',
        'Product Management',
        'Tech Industry Expert',
        'Business Development',
        'Certified Scrum Master',
        'Analyst Experience',
        'Founder',
        'Consultant',
        'Innovation Expert',
    ];
    // const [userSkills, setUserSkills] = useState(user.skills); // To manage skills
    const [newSkill, setNewSkill] = useState(''); // To handle new skill input
    const skillOptions = [
        'JavaScript',
        'Python',
        'React',
        'Node.js',
        'Data Analysis',
        'Project Management',
        'UI/UX Design',
        'Machine Learning',
        'Cloud Computing',
        'Agile Methodologies',
    ];
    const LinkedInIcon = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempUrl, setTempUrl] = useState(socialData.linkedinURL);

        const saveLinkedInURL = () => {
            if (!tempUrl || !tempUrl.startsWith('http')) {
                toast.error('Please enter a valid URL starting with http');
                return;
            }

            setSocialData(prev => ({ ...prev, linkedinURL: tempUrl }));
            setIsEditing(false);
            toast.success('LinkedIn URL saved');
        };

        return (
            <div className="relative">
                <button
                    title="LinkedIn"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-[#2F1266] p-2 rounded-full size-10 flex items-center justify-center hover:bg-[#44227a] transition"
                >
                    <FaLinkedinIn />
                </button>

                {isEditing && (
                    <div className="absolute top-12 left-0 z-10 w-64 bg-white text-black dark:bg-gray-800 dark:text-white p-3 rounded-xl shadow-lg space-y-2">
                        <input
                            type="text"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="Enter LinkedIn URL"
                            className="w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveLinkedInURL}
                                className="text-sm px-2 py-1 rounded bg-purple-800 text-white hover:bg-purple-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    const FacebookIcon = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempUrl, setTempUrl] = useState(socialData.FacebookURL);

        const saveFacebookURL = () => {
            if (!tempUrl || !tempUrl.startsWith('http')) {
                toast.error('Please enter a valid URL starting with http');
                return;
            }

            setSocialData(prev => ({ ...prev, FacebookURL: tempUrl }));
            setIsEditing(false);
            toast.success('Facebook URL saved');
        };

        return (
            <div className="relative">
                <button
                    title="Facebook"
                    onClick={() => {
                        setIsEditing(!isEditing); // ✅ Just toggle edit mode
                    }}
                    className="bg-[#2F1266] p-2 rounded-full size-10 flex items-center justify-center hover:bg-[#44227a] transition"
                >
                    <FaFacebook />
                </button>

                {isEditing && (
                    <div className="absolute top-12 left-0 z-10 w-64 bg-white text-black dark:bg-gray-800 dark:text-white p-3 rounded-xl shadow-lg space-y-2">
                        <input
                            type="text"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="Enter Facebook URL"
                            className="w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveFacebookURL}
                                className="text-sm px-2 py-1 rounded bg-purple-800 text-white hover:bg-purple-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const PhoneIcon = () => {
        const [isEditing, setIsEditing] = useState(false);
        const [tempPhone, setTempPhone] = useState(socialData.phone);

        const savePhone = () => {
            if (!tempPhone || !/^[+0-9][0-9\s\-()]{5,}$/.test(tempPhone)) {
                toast.error('Please enter a valid phone number');
                return;
            }

            setSocialData(prev => ({ ...prev, phone: tempPhone }));
            setIsEditing(false);
            toast.success('Phone number saved');
        };

        return (
            <div className="relative">
                <button
                    title="Phone"
                    onClick={() => {
                        setIsEditing(!isEditing); // ✅ Only toggles edit mode
                    }}
                    className="bg-[#2F1266] p-2 rounded-full size-10 flex items-center justify-center hover:bg-[#44227a] transition"
                >
                    <FaPhone />
                </button>

                {isEditing && (
                    <div className="absolute top-12 left-0 z-10 w-64 bg-white text-black dark:bg-gray-800 dark:text-white p-3 rounded-xl shadow-lg space-y-2">
                        <input
                            type="text"
                            value={tempPhone}
                            onChange={(e) => setTempPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-sm px-2 py-1 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePhone}
                                className="text-sm px-2 py-1 rounded bg-purple-800 text-white hover:bg-purple-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    const [isConnecting, setIsConnecting] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    if (isLoading || !isConnectionCheckComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="size-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading profile...</h2>
                    <p className="text-gray-600 dark:text-gray-400">Setting up the professional hub</p>
                </div>
            </div>
        );
    }


    // if (userEmail === 'sachintest@gmail.com') {
    //     return (
    //         <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col px-4">
    //             <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4 text-center">
    //                 Sign in to Unlock This Powerful Feature
    //             </h1>
    //             <button
    //                 onClick={() => window.location.href = '/register'}
    //                 className="bg-[#0E0B1E] text-white text-center px-6 py-3 rounded-lg shadow-lg shadow-purple-500/50 font-semibold hover:shadow-purple-600/60 transition duration-200"
    //             >
    //                 Sign in / Register
    //             </button>

    //         </div>
    //     );
    // }
    // if (emailid === 'sachintest@gmail.com') {
    //     return (
    //         <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col px-4">
    //             <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4 text-center">
    //                 Sign in to Unlock This Powerful Feature
    //             </h1>
    //             <button
    //                 onClick={() => window.location.href = '/register'}
    //                 className="bg-[#0E0B1E] text-white text-center px-6 py-3 rounded-lg shadow-lg shadow-purple-500/50 font-semibold hover:shadow-purple-600/60 transition duration-200"
    //             >
    //                 Sign in / Register
    //             </button>

    //         </div>
    //     );
    // }
    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: `
                radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
                radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
                radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
                radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
                radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
                radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
                radial-gradient(circle at 15% 50%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
                radial-gradient(circle at 85% 30%, rgba(255, 255, 255, 0.5) 0%, transparent 50%),
                radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
                linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
            `
        }}>
            {/* Dynamic Vibrant Background Elements */}
            <div className="fixed inset-0 z-0">
                {/* Deep Royal Blue */}
                <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                {/* Bright Golden Yellow */}
                <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                {/* Crimson Red */}
                <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                {/* Charcoal Black */}
                <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                {/* Light Gray */}
                <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                {/* Mid-tone Blue */}
                <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                {/* Warm Golden Glow */}
                <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                {/* Vibrant Red */}
                <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                {/* Neon Purple */}
                <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>

                {/* White Bubbles */}
                <div className="absolute top-1/5 right-1/3 size-80 rounded-full blur-3xl opacity-50 animate-pulse delay-600" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute bottom-1/5 left-1/3 size-70 rounded-full blur-3xl opacity-45 animate-pulse delay-1700" style={{ background: 'rgba(255, 255, 255, 0.4)' }}></div>
                <div className="absolute top-2/3 left-1/4 size-65 rounded-full blur-3xl opacity-55 animate-pulse delay-3200" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute bottom-1/3 right-1/5 size-75 rounded-full blur-3xl opacity-50 animate-pulse delay-2100" style={{ background: 'rgba(255, 255, 255, 0.45)' }}></div>
                <div className="absolute top-10 right-1/4 size-72 rounded-full blur-3xl opacity-40 animate-pulse delay-800" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute bottom-1/6 right-1/2 size-68 rounded-full blur-3xl opacity-50 animate-pulse delay-1400" style={{ background: 'rgba(255, 255, 255, 0.4)' }}></div>
                <div className="absolute top-1/3 left-10 size-90 rounded-full blur-3xl opacity-45 animate-pulse delay-2300" style={{ background: 'rgba(255, 255, 255, 0.45)' }}></div>
                <div className="absolute bottom-1/4 right-10 size-76 rounded-full blur-3xl opacity-55 animate-pulse delay-2600" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute top-1/2 right-1/6 size-64 rounded-full blur-3xl opacity-45 animate-pulse delay-1100" style={{ background: 'rgba(255, 255, 255, 0.4)' }}></div>
                <div className="absolute bottom-20 left-1/5 size-82 rounded-full blur-3xl opacity-50 animate-pulse delay-1900" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute top-1/4 right-2/3 size-74 rounded-full blur-3xl opacity-40 animate-pulse delay-2900" style={{ background: 'rgba(255, 255, 255, 0.45)' }}></div>
                <div className="absolute bottom-1/2 left-2/5 size-66 rounded-full blur-3xl opacity-55 animate-pulse delay-1300" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute top-3/4 right-1/2 size-70 rounded-full blur-3xl opacity-45 animate-pulse delay-3400" style={{ background: 'rgba(255, 255, 255, 0.4)' }}></div>
                <div className="absolute bottom-1/3 left-1/6 size-78 rounded-full blur-3xl opacity-50 animate-pulse delay-2000" style={{ background: 'rgba(255, 255, 255, 0.45)' }}></div>
                <div className="absolute top-1/6 left-1/2 size-68 rounded-full blur-3xl opacity-40 animate-pulse delay-3700" style={{ background: 'rgba(255, 255, 255, 0.4)' }}></div>
                <div className="absolute bottom-1/5 right-2/5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-1500" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                <div className="absolute top-2/5 left-1/3 size-76 rounded-full blur-3xl opacity-45 animate-pulse delay-2400" style={{ background: 'rgba(255, 255, 255, 0.45)' }}></div>
                <div className="absolute bottom-2/3 right-1/4 size-64 rounded-full blur-3xl opacity-55 animate-pulse delay-3100" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
            </div>

            {/* Common Navbar */}
            <CommonNavbar currentPage="/friendprof" />

            <div className="p-3 md:p-4 lg:p-6 max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 30%, rgba(138, 43, 226, 0.1) 70%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                                boxShadow: '0 25px 50px rgba(25, 25, 112, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)'
                            }}
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                                <div className="relative">
                                    <Image
                                        src={userAvatar}
                                        alt={userName}
                                        width={120}
                                        height={120}
                                        className="size-20 md:size-[120px] rounded-full border-4 shadow-xl ring-4"
                                        style={{
                                            borderColor: 'rgba(255, 215, 0, 0.8)',
                                            boxShadow: '0 10px 30px rgba(25, 25, 112, 0.3), 0 0 20px rgba(255, 215, 0, 0.4)'
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 md:mb-4">
                                        <h1 className="text-xl md:text-3xl font-bold text-black">{userName}</h1>
                                        <div className="flex items-center gap-2">
                                            {getCookie('userEmail') !== userEmail && (
                                                <>
                                                    {!isConnectionCheckComplete ? (
                                                        <Button
                                                            disabled
                                                            className="bg-gray-400 cursor-not-allowed text-black"
                                                        >
                                                            Checking...
                                                        </Button>
                                                    ) : connectionStatus === 'none' ? (
                                                        <Button
                                                            onClick={handleConnect}
                                                            disabled={sendingRequest}
                                                            className="text-black font-bold"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(220, 20, 60, 0.8) 100%)',
                                                                boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)'
                                                            }}
                                                        >
                                                            {sendingRequest ? 'Sending...' : 'Connect'}
                                                        </Button>
                                                    ) : connectionStatus === 'pending' ? (
                                                        <Button
                                                            disabled
                                                            className="bg-gray-400 cursor-not-allowed text-black"
                                                        >
                                                            Pending
                                                        </Button>
                                                    ) : connectionStatus === 'connected' ? (
                                                        <Button
                                                            disabled
                                                            className="bg-green-600 cursor-not-allowed text-black"
                                                        >
                                                            Connected
                                                        </Button>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-black mb-3 md:mb-4 text-xs md:text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={12} className="md:size-4" />
                                            <span>Dubai, UAE</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} className="md:size-4" />
                                            <span className="hidden sm:inline">Available for opportunities</span>
                                            <span className="sm:hidden">Available</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-black text-xs md:text-sm font-medium">{userEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(25, 25, 112, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(25, 25, 112, 0.6)',
                                boxShadow: '0 25px 50px rgba(25, 25, 112, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <Briefcase className="size-5 text-blue-800" />
                                About
                            </h2>
                            <p className="text-black leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
                                {userBio || 'No bio available.'}
                            </p>
                        </motion.div>
                        {/* Skills Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(70, 130, 180, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(70, 130, 180, 0.6)',
                                boxShadow: '0 25px 50px rgba(70, 130, 180, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <Star className="size-5 text-blue-600" />
                                Skills & Expertise
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {userSkills.length > 0 ? userSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" style={{
                                        background: 'linear-gradient(135deg, rgba(70, 130, 180, 0.9) 0%, rgba(25, 25, 112, 0.8) 100%)',
                                        boxShadow: '0 5px 15px rgba(70, 130, 180, 0.3)'
                                    }}>
                                        <span className="text-sm font-bold text-black">{skill}</span>
                                    </div>
                                )) : <span className="text-black font-medium">No skills listed.</span>}
                            </div>
                        </motion.div>

                        {/* Interests Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(220, 20, 60, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(220, 20, 60, 0.6)',
                                boxShadow: '0 25px 50px rgba(220, 20, 60, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)',
                                zIndex: 5
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <Heart className="size-5 text-red-600" />
                                Interests & Industries
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {interests.length > 0 ? interests.map((interest, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" style={{
                                        background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.9) 0%, rgba(255, 0, 0, 0.8) 100%)',
                                        boxShadow: '0 5px 15px rgba(220, 20, 60, 0.3)'
                                    }}>
                                        <span className="text-sm font-bold text-black">{interest}</span>
                                    </div>
                                )) : <span className="text-black font-medium">No interests listed.</span>}
                            </div>
                        </motion.div>

                        {/* Goals Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                                boxShadow: '0 25px 50px rgba(255, 215, 0, 0.2), 0 0 30px rgba(138, 43, 226, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <Award className="size-5 text-yellow-600" />
                                Goals
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {goals.length > 0 ? goals.map((goal, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" style={{
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(220, 20, 60, 0.8) 100%)',
                                        boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)'
                                    }}>
                                        <span className="text-sm font-bold text-black">{goal}</span>
                                    </div>
                                )) : <span className="text-black font-medium">No goals listed.</span>}
                            </div>
                        </motion.div>

                        {/* Metrics Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                                boxShadow: '0 25px 50px rgba(255, 215, 0, 0.2), 0 0 30px rgba(138, 43, 226, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <BarChart3 className="size-5 text-yellow-600" />
                                Metrics
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {metrics.length > 0 ? metrics.map((metric, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105" style={{
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(220, 20, 60, 0.8) 100%)',
                                        boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)'
                                    }}>
                                        <span className="text-sm font-bold text-black">{metric}</span>
                                    </div>
                                )) : <span className="text-black font-medium">No metrics listed.</span>}
                            </div>
                        </motion.div>
                        {/* Social Links Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(138, 43, 226, 0.6)',
                                boxShadow: '0 25px 50px rgba(138, 43, 226, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                                <Globe className="size-5 text-purple-600" />
                                Social Links
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {socialData.linkedinURL && (
                                    <a href={socialData.linkedinURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black font-medium hover:opacity-80 transition-opacity">
                                        <FaLinkedin className="text-blue-600" /> LinkedIn
                                    </a>
                                )}
                                {socialData.FacebookURL && (
                                    <a href={socialData.FacebookURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-black font-medium hover:opacity-80 transition-opacity">
                                        <FaFacebook className="text-blue-600" /> Facebook
                                    </a>
                                )}
                                {socialData.phone && (
                                    <span className="flex items-center gap-2 text-black font-medium">
                                        <FaPhone className="text-green-600" /> {socialData.phone}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </div>
                    {/* Right Column - Recent Activity & Contact Info */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(138, 43, 226, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(138, 43, 226, 0.6)',
                                boxShadow: '0 25px 50px rgba(138, 43, 226, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <BarChart3 className="size-5 text-purple-600" />
                                Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {recentActivities.length > 0 ? recentActivities.map((activity, idx) => {
                                    const IconComponent = activity.icon;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-lg border border-purple-200/30 dark:border-purple-500/30">
                                            <IconComponent size={16} className="text-purple-600" />
                                            <div className="flex-1">
                                                <p className="text-black text-sm font-medium">{activity.text}</p>
                                                <p className="text-black/70 text-xs">{activity.time}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-4">
                                        <p className="text-black/70 text-sm">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border-2 shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(25, 25, 112, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(25, 25, 112, 0.6)',
                                boxShadow: '0 25px 50px rgba(25, 25, 112, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)',
                                zIndex: 1
                            }}
                        >
                            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                <User className="size-5 text-blue-800" />
                                Contact Information
                            </h2>
                            <div className="space-y-3">
                                {socialData.linkedinURL && (
                                    <div className="flex items-center gap-3 text-black">
                                        <FaLinkedin className="text-blue-600" />
                                        <a href={socialData.linkedinURL} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:opacity-80 transition-opacity">
                                            LinkedIn Profile
                                        </a>
                                    </div>
                                )}
                                {socialData.FacebookURL && (
                                    <div className="flex items-center gap-3 text-black">
                                        <FaFacebook className="text-blue-600" />
                                        <span className="text-sm font-medium">{socialData.FacebookURL}</span>
                                    </div>
                                )}
                                {socialData.phone && (
                                    <div className="flex items-center gap-3 text-black">
                                        <FaPhone className="text-green-600" />
                                        <span className="text-sm font-medium">{socialData.phone}</span>
                                    </div>
                                )}
                                {userEmail && (
                                    <div className="flex items-center gap-3 text-black">
                                        <FaEnvelope className="text-red-600" />
                                        <a href={`mailto:${userEmail}`} className="text-sm font-medium hover:opacity-80 transition-opacity">
                                            {userEmail}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes float {
                  0% {
                    transform: translateY(0) translateX(0);
                  }
                  50% {
                    transform: translateY(-20px) translateX(10px);
                  }
                  100% {
                    transform: translateY(0) translateX(0);
                  }
                }
              
                .animate-float-slow {
                  animation: float 12s ease-in-out infinite;
                }
              
                .animate-float-medium {
                  animation: float 8s ease-in-out infinite;
                }
              
                .animate-float-fast {
                  animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default ProfilePage;

