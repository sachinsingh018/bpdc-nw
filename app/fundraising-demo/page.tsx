'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Users,
    Mail,
    Building,
    MapPin,
    DollarSign,
    Heart,
    Send,
    RefreshCw,
    Sparkles,
    TrendingUp,
    Eye,
    MessageSquare,
    CheckCircle,
    Loader2,
    Star,
    Target,
    Award,
    Calendar,
    Clock,
    UserCheck,
    Filter,
    Search,
    Download,
    Share2,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface AlumniProfile {
    id: string;
    fullName: string;
    email: string;
    currentEmployment: string;
    estimatedIncome: string;
    location: string;
    interests: string[];
    selected: boolean;
}

interface CampaignStats {
    totalEmailsSent: number;
    repliesReceived: number;
    clickThroughRate: number;
    totalDonations: number;
    interestsSummary: { [key: string]: number };
}

// Dummy data
const dummyAlumniProfiles: AlumniProfile[] = [
    {
        id: '1',
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@alumni.edu',
        currentEmployment: 'Senior Product Manager at Google',
        estimatedIncome: '$150,000 - $200,000',
        location: 'San Francisco, CA',
        interests: ['Technology', 'Product Management', 'Mentoring'],
        selected: false
    },
    {
        id: '2',
        fullName: 'Michael Chen',
        email: 'michael.chen@alumni.edu',
        currentEmployment: 'Software Engineer at Microsoft',
        estimatedIncome: '$120,000 - $150,000',
        location: 'Seattle, WA',
        interests: ['Software Engineering', 'AI/ML', 'Open Source'],
        selected: false
    },
    {
        id: '3',
        fullName: 'Emily Rodriguez',
        email: 'emily.rodriguez@alumni.edu',
        currentEmployment: 'Data Scientist at Amazon',
        estimatedIncome: '$130,000 - $180,000',
        location: 'New York, NY',
        interests: ['Data Science', 'Machine Learning', 'Research'],
        selected: false
    },
    {
        id: '4',
        fullName: 'David Kim',
        email: 'david.kim@alumni.edu',
        currentEmployment: 'Investment Banker at Goldman Sachs',
        estimatedIncome: '$200,000 - $300,000',
        location: 'New York, NY',
        interests: ['Finance', 'Investment Banking', 'Networking'],
        selected: false
    },
    {
        id: '5',
        fullName: 'Lisa Thompson',
        email: 'lisa.thompson@alumni.edu',
        currentEmployment: 'Marketing Director at Apple',
        estimatedIncome: '$140,000 - $190,000',
        location: 'Cupertino, CA',
        interests: ['Marketing', 'Brand Strategy', 'Leadership'],
        selected: false
    },
    {
        id: '6',
        fullName: 'James Wilson',
        email: 'james.wilson@alumni.edu',
        currentEmployment: 'Consultant at McKinsey',
        estimatedIncome: '$160,000 - $220,000',
        location: 'Chicago, IL',
        interests: ['Consulting', 'Strategy', 'Business Development'],
        selected: false
    }
];

export default function FundraisingDemoPage() {
    const router = useRouter();
    const [alumniProfiles, setAlumniProfiles] = useState<AlumniProfile[]>([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
    const [emailContent, setEmailContent] = useState('');
    const [isRefiningEmail, setIsRefiningEmail] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [campaignStats, setCampaignStats] = useState<CampaignStats>({
        totalEmailsSent: 0,
        repliesReceived: 0,
        clickThroughRate: 0,
        totalDonations: 0,
        interestsSummary: {}
    });

    // Extract alumni profiles
    const extractAlumniProfiles = async () => {
        setIsLoadingProfiles(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setAlumniProfiles(dummyAlumniProfiles);
        setIsLoadingProfiles(false);

        toast.success('Successfully extracted 6 alumni profiles!');
    };

    // Toggle profile selection
    const toggleProfileSelection = (id: string) => {
        setAlumniProfiles(prev =>
            prev.map(profile =>
                profile.id === id
                    ? { ...profile, selected: !profile.selected }
                    : profile
            )
        );
    };

    // Select all profiles
    const selectAllProfiles = () => {
        setAlumniProfiles(prev =>
            prev.map(profile => ({ ...profile, selected: true }))
        );
    };

    // Deselect all profiles
    const deselectAllProfiles = () => {
        setAlumniProfiles(prev =>
            prev.map(profile => ({ ...profile, selected: false }))
        );
    };

    // Refine email with AI
    const refineEmailWithAI = async () => {
        if (!emailContent.trim()) {
            toast.error('Please enter some content to refine');
            return;
        }

        setIsRefiningEmail(true);

        // Simulate AI refinement
        await new Promise(resolve => setTimeout(resolve, 1500));

        const refinedContent = `Dear Alumni Community,

I hope this message finds you well. I'm reaching out to share an exciting opportunity to support our alma mater's latest initiatives.

As proud graduates of our university, we understand the transformative power of education and the importance of giving back to the community that shaped our futures.

Your generous contribution will directly impact:
• Student scholarships and financial aid
• Cutting-edge research programs
• Campus infrastructure improvements
• Student life and extracurricular activities

Every donation, no matter the size, makes a meaningful difference in the lives of current and future students.

Thank you for considering this opportunity to invest in the next generation of leaders.

Best regards,
[Your Name]
Alumni Relations Team`;

        setEmailContent(refinedContent);
        setIsRefiningEmail(false);
        toast.success('Email refined with AI assistance!');
    };

    // Send email to selected alumni
    const sendEmailToAlumni = async () => {
        const selectedProfiles = alumniProfiles.filter(profile => profile.selected);

        if (selectedProfiles.length === 0) {
            toast.error('Please select at least one alumni profile');
            return;
        }

        if (!emailContent.trim()) {
            toast.error('Please enter email content');
            return;
        }

        setIsSendingEmail(true);

        // Simulate sending emails
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newStats = {
            ...campaignStats,
            totalEmailsSent: campaignStats.totalEmailsSent + selectedProfiles.length,
            repliesReceived: campaignStats.repliesReceived + Math.floor(selectedProfiles.length * 0.3),
            clickThroughRate: Math.min(100, campaignStats.clickThroughRate + 15)
        };

        setCampaignStats(newStats);
        setIsSendingEmail(false);

        toast.success(`Successfully sent emails to ${selectedProfiles.length} alumni!`);
    };

    // Process payment
    const processPayment = async () => {
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            toast.error('Please enter a valid donation amount');
            return;
        }

        setIsProcessingPayment(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2500));

        setCampaignStats(prev => ({
            ...prev,
            totalDonations: prev.totalDonations + parseFloat(donationAmount)
        }));

        setIsProcessingPayment(false);
        setShowPaymentSuccess(true);
        setDonationAmount('');

        setTimeout(() => setShowPaymentSuccess(false), 5000);

        toast.success('Payment successful! Thank you for your support.');
    };

    // Calculate selected profiles count
    const selectedProfilesCount = alumniProfiles.filter(profile => profile.selected).length;

    // Calculate interests summary
    useEffect(() => {
        const interestsCount: { [key: string]: number } = {};
        alumniProfiles.forEach(profile => {
            profile.interests.forEach(interest => {
                interestsCount[interest] = (interestsCount[interest] || 0) + 1;
            });
        });

        setCampaignStats(prev => ({
            ...prev,
            interestsSummary: interestsCount
        }));
    }, [alumniProfiles]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        AI-Powered Fundraising Campaign
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Demonstrate automated alumni outreach and donation management
                    </p>
                </motion.div>

                {/* Top Controls Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Button
                        onClick={extractAlumniProfiles}
                        disabled={isLoadingProfiles}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                        {isLoadingProfiles ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isLoadingProfiles ? 'Extracting Alumni...' : 'Extract / Refresh Alumni'}
                    </Button>

                    {alumniProfiles.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={selectAllProfiles}
                                className="flex-1"
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Select All
                            </Button>
                            <Button
                                variant="outline"
                                onClick={deselectAllProfiles}
                                className="flex-1"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Deselect All
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Alumni Profiles Grid */}
                {alumniProfiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Alumni Profiles ({selectedProfilesCount} selected)
                            </h2>
                            <Badge variant="secondary">
                                {alumniProfiles.length} profiles found
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alumniProfiles.map((profile) => (
                                <Card
                                    key={profile.id}
                                    className={`transition-all duration-200 hover:shadow-lg ${profile.selected ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={profile.selected}
                                                onCheckedChange={() => toggleProfileSelection(profile.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {profile.fullName}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        AI Detected
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        <span className="truncate">{profile.email}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4" />
                                                        <span className="truncate">{profile.currentEmployment}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{profile.location}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>{profile.estimatedIncome}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                        AI-Detected Interests:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {profile.interests.map((interest, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {interest}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Email Composer */}
                {alumniProfiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Email Composer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Draft your fundraising email here..."
                                    value={emailContent}
                                    onChange={(e) => setEmailContent(e.target.value)}
                                    className="min-h-[200px]"
                                />

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={refineEmailWithAI}
                                        disabled={isRefiningEmail || !emailContent.trim()}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {isRefiningEmail ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 mr-2" />
                                        )}
                                        {isRefiningEmail ? 'Refining...' : 'Refine with AI'}
                                    </Button>

                                    <Button
                                        onClick={sendEmailToAlumni}
                                        disabled={isSendingEmail || selectedProfilesCount === 0 || !emailContent.trim()}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                    >
                                        {isSendingEmail ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4 mr-2" />
                                        )}
                                        {isSendingEmail ? 'Sending...' : `Send Email (${selectedProfilesCount})`}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Campaign KPIs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Send className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Emails Sent</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.totalEmailsSent}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Replies Received</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.repliesReceived}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Click-Through Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.clickThroughRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Donations</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${campaignStats.totalDonations.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* AI-Detected Interests Summary */}
                {Object.keys(campaignStats.interestsSummary).length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    AI-Detected Interests Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(campaignStats.interestsSummary).map(([interest, count]) => (
                                        <Badge key={interest} variant="outline" className="text-sm">
                                            {interest}: {count}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Dummy Stripe Payment Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                                <Heart className="w-5 h-5" />
                                Make a Donation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Donation Amount ($)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={processPayment}
                                        disabled={isProcessingPayment || !donationAmount || parseFloat(donationAmount) <= 0}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                    >
                                        {isProcessingPayment ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <DollarSign className="w-4 h-4 mr-2" />
                                        )}
                                        {isProcessingPayment ? 'Processing...' : 'Pay with Card'}
                                    </Button>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>💳 This is a demo - no real payment will be processed</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Campaign Report Link */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-center"
                >
                    <Button
                        onClick={() => router.push('/fundraising-report')}
                        variant="outline"
                        className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800 dark:hover:to-blue-800"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Campaign Report
                    </Button>
                </motion.div>

                {/* Payment Success Message */}
                <AnimatePresence>
                    {showPaymentSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Payment successful! Thank you for your support.</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
} 