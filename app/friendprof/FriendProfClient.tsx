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

    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');

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
    const randomActivities = getRandomActivities(3);
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
            {/* Enhanced Header */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 group">
                            <div className="size-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Sparkles className="size-5 text-white" />
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
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        >
                            <Home className="size-4" />
                            <span>Home</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/friends')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Users className="size-4" />
                            <span>Network</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/chat')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <MessageSquare className="size-4" />
                            <span>AI Chat</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/connections')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <User className="size-4" />
                            <span>Connections</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/anonymous-feed')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <MessageCircle className="size-4" />
                            <span>Anonymous Feed</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { router.push('/job-board'); setShowMobileMenu(false); }}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 justify-start"
                        >
                            <Briefcase className="size-4" />
                            <span>Job Board</span>
                        </Button>
                    </div>
                    {/* Right side - Notifications, Theme Toggle, and Mobile Menu */}
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/20 shadow-lg"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="relative">
                                    <Image
                                        src={userAvatar}
                                        alt={userName}
                                        width={120}
                                        height={120}
                                        className="rounded-full border-4 border-purple-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userName}</h1>
                                        <div className="flex items-center gap-2">
                                            {getCookie('userEmail') !== userEmail && (
                                                <>
                                                    {!isConnectionCheckComplete ? (
                                                        <Button
                                                            disabled
                                                            className="bg-gray-400 cursor-not-allowed"
                                                        >
                                                            Checking...
                                                        </Button>
                                                    ) : connectionStatus === 'none' ? (
                                                        <Button
                                                            onClick={handleConnect}
                                                            disabled={sendingRequest}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                                        >
                                                            {sendingRequest ? 'Sending...' : 'Connect'}
                                                        </Button>
                                                    ) : connectionStatus === 'pending' ? (
                                                        <Button
                                                            disabled
                                                            className="bg-gray-400 cursor-not-allowed"
                                                        >
                                                            Pending
                                                        </Button>
                                                    ) : connectionStatus === 'connected' ? (
                                                        <Button
                                                            disabled
                                                            className="bg-green-600 cursor-not-allowed"
                                                        >
                                                            Connected
                                                        </Button>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            <span>Dubai, UAE</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe size={16} />
                                            <span>Available for opportunities</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-gray-500 dark:text-gray-400">{userEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/20 shadow-lg"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {userBio || 'No bio available.'}
                            </p>
                        </motion.div>
                        {/* Skills, Interests, Goals, Metrics Sections */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/20 shadow-lg"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {userSkills.length > 0 ? userSkills.map((skill, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                                {skill}
                                            </span>
                                        )) : <span className="text-gray-500">No skills listed.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interests</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {interests.length > 0 ? interests.map((interest, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                                {interest}
                                            </span>
                                        )) : <span className="text-gray-500">No interests listed.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Goals</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {goals.length > 0 ? goals.map((goal, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                                                {goal}
                                            </span>
                                        )) : <span className="text-gray-500">No goals listed.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Metrics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {metrics.length > 0 ? metrics.map((metric, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                                                {metric}
                                            </span>
                                        )) : <span className="text-gray-500">No metrics listed.</span>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        {/* Social Links Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/20 shadow-lg"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Links</h3>
                            <div className="flex flex-wrap gap-4">
                                {socialData.linkedinURL && (
                                    <a href={socialData.linkedinURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline">
                                        <FaLinkedin /> LinkedIn
                                    </a>
                                )}
                                {socialData.FacebookURL && (
                                    <a href={socialData.FacebookURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:underline">
                                        <FaFacebook /> Facebook
                                    </a>
                                )}
                                {socialData.phone && (
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <FaPhone /> {socialData.phone}
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
                            transition={{ delay: 0.5 }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                {randomActivities.map((activity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                        <activity.icon size={16} className="text-purple-600 dark:text-purple-400" />
                                        <div className="flex-1">
                                            <p className="text-gray-900 dark:text-white text-sm">{activity.text}</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                            <div className="space-y-3">
                                {socialData.linkedinURL && (
                                    <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <FaLinkedin className="text-blue-600" />
                                        <a href={socialData.linkedinURL} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                            LinkedIn Profile
                                        </a>
                                    </div>
                                )}
                                {socialData.FacebookURL && (
                                    <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <FaFacebook className="text-blue-600" />
                                        <span className="text-sm">{socialData.FacebookURL}</span>
                                    </div>
                                )}
                                {socialData.phone && (
                                    <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <FaPhone className="text-green-600" />
                                        <span className="text-sm">{socialData.phone}</span>
                                    </div>
                                )}
                                {userEmail && (
                                    <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                                        <FaEnvelope className="text-red-600" />
                                        <a href={`mailto:${userEmail}`} className="text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                            {userEmail}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
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
                            <Home className="size-4" />
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
                            <Users className="size-4" />
                            <span>Network</span>
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
                            <User className="size-4" />
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
                            <MessageCircle className="size-4" />
                            <span>Anonymous Feed</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
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

};

export default ProfilePage;

