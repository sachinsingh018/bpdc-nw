'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Users,
    Mail,
    MessageSquare,
    DollarSign,
    Eye,
    Calendar,
    Clock,
    MapPin,
    Building,
    Star,
    Target,
    BarChart3,
    PieChart,
    Activity,
    Download,
    Share2,
    Filter,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    UserCheck,
    Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types
interface DonationRecord {
    id: string;
    donorName: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    email: string;
}

interface EmailResponse {
    id: string;
    recipientName: string;
    email: string;
    sentDate: string;
    opened: boolean;
    clicked: boolean;
    replied: boolean;
    donationAmount?: number;
}

interface InterestAnalytics {
    interest: string;
    count: number;
    engagementRate: number;
    avgDonation: number;
}

export default function FundraisingReportPage() {
    const router = useRouter();
    const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

    // Mock data
    const campaignStats = {
        totalEmailsSent: 156,
        totalOpens: 89,
        totalClicks: 34,
        totalReplies: 23,
        totalDonations: 18,
        totalAmount: 15420,
        openRate: 57.1,
        clickRate: 21.8,
        replyRate: 14.7,
        conversionRate: 11.5
    };

    const donationRecords: DonationRecord[] = [
        { id: '1', donorName: 'Sarah Johnson', amount: 500, date: '2024-01-15', status: 'completed', email: 'sarah.johnson@alumni.edu' },
        { id: '2', donorName: 'Michael Chen', amount: 250, date: '2024-01-14', status: 'completed', email: 'michael.chen@alumni.edu' },
        { id: '3', donorName: 'Emily Rodriguez', amount: 1000, date: '2024-01-13', status: 'completed', email: 'emily.rodriguez@alumni.edu' },
        { id: '4', donorName: 'David Kim', amount: 750, date: '2024-01-12', status: 'completed', email: 'david.kim@alumni.edu' },
        { id: '5', donorName: 'Lisa Thompson', amount: 300, date: '2024-01-11', status: 'completed', email: 'lisa.thompson@alumni.edu' },
        { id: '6', donorName: 'James Wilson', amount: 1200, date: '2024-01-10', status: 'completed', email: 'james.wilson@alumni.edu' },
        { id: '7', donorName: 'Alex Davis', amount: 150, date: '2024-01-09', status: 'pending', email: 'alex.davis@alumni.edu' },
        { id: '8', donorName: 'Maria Garcia', amount: 400, date: '2024-01-08', status: 'completed', email: 'maria.garcia@alumni.edu' }
    ];

    const emailResponses: EmailResponse[] = [
        { id: '1', recipientName: 'Sarah Johnson', email: 'sarah.johnson@alumni.edu', sentDate: '2024-01-15', opened: true, clicked: true, replied: true, donationAmount: 500 },
        { id: '2', recipientName: 'Michael Chen', email: 'michael.chen@alumni.edu', sentDate: '2024-01-14', opened: true, clicked: true, replied: true, donationAmount: 250 },
        { id: '3', recipientName: 'Emily Rodriguez', email: 'emily.rodriguez@alumni.edu', sentDate: '2024-01-13', opened: true, clicked: true, replied: true, donationAmount: 1000 },
        { id: '4', recipientName: 'David Kim', email: 'david.kim@alumni.edu', sentDate: '2024-01-12', opened: true, clicked: false, replied: true, donationAmount: 750 },
        { id: '5', recipientName: 'Lisa Thompson', email: 'lisa.thompson@alumni.edu', sentDate: '2024-01-11', opened: true, clicked: true, replied: false, donationAmount: 300 },
        { id: '6', recipientName: 'James Wilson', email: 'james.wilson@alumni.edu', sentDate: '2024-01-10', opened: true, clicked: true, replied: true, donationAmount: 1200 },
        { id: '7', recipientName: 'Alex Davis', email: 'alex.davis@alumni.edu', sentDate: '2024-01-09', opened: false, clicked: false, replied: false },
        { id: '8', recipientName: 'Maria Garcia', email: 'maria.garcia@alumni.edu', sentDate: '2024-01-08', opened: true, clicked: false, replied: true, donationAmount: 400 }
    ];

    const interestAnalytics: InterestAnalytics[] = [
        { interest: 'Technology', count: 45, engagementRate: 78.2, avgDonation: 650 },
        { interest: 'Finance', count: 32, engagementRate: 65.4, avgDonation: 850 },
        { interest: 'Marketing', count: 28, engagementRate: 71.8, avgDonation: 420 },
        { interest: 'Consulting', count: 25, engagementRate: 68.9, avgDonation: 720 },
        { interest: 'Data Science', count: 22, engagementRate: 82.1, avgDonation: 580 },
        { interest: 'Product Management', count: 18, engagementRate: 75.6, avgDonation: 690 }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <ClockIcon className="w-4 h-4" />;
            case 'failed': return <XCircle className="w-4 h-4" />;
            default: return <ClockIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/fundraising-demo')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Campaign
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Campaign Analytics Report
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Detailed insights and performance metrics
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                    </div>
                </motion.div>

                {/* Key Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Emails Sent</p>
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
                                    <Eye className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Open Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.openRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Reply Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.replyRate}%
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
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Raised</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${campaignStats.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.conversionRate}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Detailed Analytics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Donation History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Recent Donations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {donationRecords.slice(0, 6).map((donation) => (
                                    <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {donation.donorName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {donation.donorName}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {donation.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                ${donation.amount.toLocaleString()}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Badge className={`text-xs ${getStatusColor(donation.status)}`}>
                                                    {getStatusIcon(donation.status)}
                                                    {donation.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interest Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Interest-Based Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {interestAnalytics.map((interest) => (
                                    <div key={interest.interest} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {interest.interest}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {interest.count} alumni
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                {interest.engagementRate}%
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Avg: ${interest.avgDonation}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Email Response Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Email Response Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Recipient</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Sent Date</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Opened</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Clicked</th>
                                            <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Replied</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">Donation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emailResponses.map((response) => (
                                            <tr key={response.id} className="border-b border-gray-100 dark:border-gray-800">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {response.recipientName}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {response.email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                    {response.sentDate}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {response.opened ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {response.clicked ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {response.replied ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {response.donationAmount ? (
                                                        <span className="font-bold text-green-600">
                                                            ${response.donationAmount.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Alumni Reached</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.totalEmailsSent}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <Heart className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Successful Donations</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {campaignStats.totalDonations}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Donation</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${Math.round(campaignStats.totalAmount / campaignStats.totalDonations).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 