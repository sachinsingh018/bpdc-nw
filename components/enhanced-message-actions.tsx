'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    UserPlus,
    Mail,
    MessageSquare,
    ExternalLink,
    CheckCircle,
    XCircle,
    Loader2,
    Users,
    Phone,
    Star,
    Sparkles,
    Zap,
    TrendingUp,
    Globe,
    Building2,
    Linkedin,
    Instagram,
    Twitter,
    MessageCircle,
    Copy,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface PersonData {
    name: string;
    email?: string;
    phone?: string;
    contact_details?: string;
    desc: string;
    match_percentage: number;
}

interface SocialLink {
    type: 'linkedin' | 'instagram' | 'twitter' | 'github' | 'website';
    url: string;
    label: string;
}

interface EnhancedMessageActionsProps {
    personData: PersonData;
    onActionComplete?: () => void;
}

export function EnhancedMessageActions({ personData, onActionComplete }: EnhancedMessageActionsProps) {
    const { data: session } = useSession();
    const [isCheckingUser, setIsCheckingUser] = useState(false);
    const [userExists, setUserExists] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isOnNetworkqy, setIsOnNetworkqy] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Check if user exists in database
    useEffect(() => {
        const checkUserExists = async () => {
            if (!personData.name) return;

            setIsCheckingUser(true);
            try {
                const response = await fetch('/api/users/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: personData.name })
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserExists(data.exists);

                    if (data.exists && data.userId) {
                        await checkConnectionStatus(data.userId);
                    }
                }
            } catch (error) {
                console.error('Error checking user existence:', error);
            } finally {
                setIsCheckingUser(false);
            }
        };

        checkUserExists();
    }, [personData.name]);

    const checkConnectionStatus = async (targetUserId: string) => {
        try {
            const response = await fetch('/api/connections/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId })
            });

            if (response.ok) {
                const data = await response.json();
                setConnectionStatus(data.status);
            }
        } catch (error) {
            console.error('Error checking connection status:', error);
        }
    };

    const handleSendConnectionRequest = async () => {
        if (!session?.user?.id) {
            toast.error('Please log in to send connection requests');
            return;
        }

        setIsSendingRequest(true);
        try {
            const response = await fetch('/api/connections/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetName: personData.name,
                    message: `Hi ${personData.name}! I found you through Networkqy and would love to connect.`
                })
            });

            if (response.ok) {
                setConnectionStatus('pending');
                toast.success('Connection request sent!');
                onActionComplete?.();
            } else {
                toast.error('Failed to send connection request');
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
            toast.error('Failed to send connection request');
        } finally {
            setIsSendingRequest(false);
        }
    };

    const handleSendEmail = async () => {
        if (!personData.email) {
            toast.error('No email address available');
            return;
        }

        setIsSendingEmail(true);
        try {
            const subject = encodeURIComponent('Connection Request from Networkqy');
            const body = encodeURIComponent(
                `Hi ${personData.name},\n\nI found you through Networkqy and would love to connect!\n\nBest regards,\n${session?.user?.name || 'A Networkqy user'}`
            );

            window.open(`mailto:${personData.email}?subject=${subject}&body=${body}`);
            toast.success('Email client opened!');
        } catch (error) {
            console.error('Error opening email client:', error);
            toast.error('Failed to open email client');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleSendMessage = async () => {
        if (!personData.phone) {
            toast.error('No phone number available');
            return;
        }

        try {
            const message = encodeURIComponent(
                `Hi ${personData.name}! I found you through Networkqy and would love to connect.`
            );

            window.open(`sms:${personData.phone}?body=${message}`);
            toast.success('Messaging app opened!');
        } catch (error) {
            console.error('Error opening messaging app:', error);
            toast.error('Failed to open messaging app');
        }
    };

    // Parse contact details to extract social media links
    const parseContactDetails = (details?: string): SocialLink[] => {
        if (!details) return [];

        const links: SocialLink[] = [];
        const urlRegex = /(https?:\/\/[^\s,]+)/g;
        const matches = details.match(urlRegex) || [];

        matches.forEach(url => {
            if (url.includes('linkedin.com')) {
                links.push({ type: 'linkedin', url, label: 'LinkedIn' });
            } else if (url.includes('instagram.com')) {
                links.push({ type: 'instagram', url, label: 'Instagram' });
            } else if (url.includes('twitter.com') || url.includes('x.com')) {
                links.push({ type: 'twitter', url, label: 'Twitter' });
            } else if (url.includes('github.com')) {
                links.push({ type: 'github', url, label: 'GitHub' });
            } else {
                links.push({ type: 'website', url, label: 'Website' });
            }
        });

        return links;
    };

    const socialLinks = parseContactDetails(personData.contact_details);

    // Check if person is on Networkqy
    const checkNetworkqyStatus = async () => {
        if (isOnNetworkqy !== null) return; // Already checked

        setIsChecking(true);
        try {
            // This would be your actual API call to check if user exists
            const response = await fetch('/api/users/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: personData.name,
                    email: personData.email
                })
            });

            setIsOnNetworkqy(response.ok);
        } catch (error) {
            console.log('Could not verify Networkqy status, assuming not on platform');
            setIsOnNetworkqy(false);
        } finally {
            setIsChecking(false);
        }
    };

    // Check Networkqy status on component mount
    useEffect(() => {
        checkNetworkqyStatus();
    }, []);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success(`${label} copied to clipboard!`);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const handleMessageOnNetworkqy = () => {
        // Navigate to chat with this user
        toast.success(`Opening chat with ${personData.name} on Networkqy`);
        // You would implement the actual navigation here
        onActionComplete?.();
    };

    const handleInviteToNetworkqy = () => {
        // Send invitation to join Networkqy
        toast.success(`Invitation sent to ${personData.name}`);
        onActionComplete?.();
    };

    const getConnectionButton = () => {
        if (connectionStatus === 'pending') {
            return (
                <Button disabled variant="outline" className="w-full bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Request Pending
                </Button>
            );
        }

        if (connectionStatus === 'accepted') {
            return (
                <Button disabled variant="outline" className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-50">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Connected
                </Button>
            );
        }

        if (connectionStatus === 'rejected') {
            return (
                <Button disabled variant="outline" className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-2" />
                    Request Declined
                </Button>
            );
        }

        return (
            <Button
                onClick={handleSendConnectionRequest}
                disabled={isSendingRequest}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
                {isSendingRequest ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                )}
                Send Connection Request
            </Button>
        );
    };

    const getGradientClass = (percentage: number) => {
        if (percentage >= 90) return 'from-emerald-500 to-teal-600';
        if (percentage >= 80) return 'from-blue-500 to-indigo-600';
        if (percentage >= 70) return 'from-purple-500 to-pink-600';
        return 'from-gray-500 to-gray-600';
    };

    const getMatchColor = (percentage: number) => {
        if (percentage >= 90) return 'text-emerald-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-purple-600';
        return 'text-gray-600';
    };

    const getMatchIcon = (percentage: number) => {
        if (percentage >= 90) return <Star className="w-4 h-4" />;
        if (percentage >= 80) return <Sparkles className="w-4 h-4" />;
        if (percentage >= 70) return <TrendingUp className="w-4 h-4" />;
        return <Zap className="w-4 h-4" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-0">
                    {/* Header with gradient background */}
                    <div className={`bg-gradient-to-r ${getGradientClass(personData.match_percentage)} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold">
                                        {personData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{personData.name}</h3>
                                    <p className="text-white/80 text-sm">Professional Match</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-black">
                                    {personData.match_percentage}%
                                </div>
                                <div className="text-white/80 text-xs">Match</div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* Description */}
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {personData.desc}
                        </p>

                        {/* Contact Information */}
                        <div className="space-y-3">
                            {/* Email */}
                            {personData.email && personData.email !== 'Email not available' && (
                                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-700">{personData.email}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => personData.email && copyToClipboard(personData.email, 'Email')}
                                        className="h-8 px-2"
                                    >
                                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            )}

                            {/* Phone */}
                            {personData.phone && personData.phone !== 'Phone number not available' && (
                                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-gray-700">{personData.phone}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => personData.phone && copyToClipboard(personData.phone, 'Phone')}
                                        className="h-8 px-2"
                                    >
                                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            )}

                            {/* Social Media Links */}
                            {socialLinks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Social Profiles</h4>
                                    {socialLinks.map((link, index) => (
                                        <div key={link.url || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                {link.type === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600" />}
                                                {link.type === 'instagram' && <Instagram className="w-4 h-4 text-pink-600" />}
                                                {link.type === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                                                {link.type === 'github' && <Globe className="w-4 h-4 text-gray-600" />}
                                                {link.type === 'website' && <Globe className="w-4 h-4 text-gray-600" />}
                                                <span className="text-sm text-gray-700">{link.label}</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => window.open(link.url, '_blank')}
                                                className="h-8 px-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Networkqy Actions */}
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex flex-col space-y-2">
                                {isChecking ? (
                                    <Button disabled className="w-full">
                                        Checking Networkqy status...
                                    </Button>
                                ) : isOnNetworkqy ? (
                                    <Button
                                        onClick={handleMessageOnNetworkqy}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Message on Networkqy
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleInviteToNetworkqy}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Invite to Networkqy
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
} 