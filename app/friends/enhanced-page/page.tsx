'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { useRouter } from 'next/navigation';
import {
    FaUserFriends,
    FaHandshake,
    FaMapMarkerAlt,
    FaBriefcase,
    FaStar,
    FaFilter,
    FaIndustry,
    FaLightbulb,
    FaUsers
} from 'react-icons/fa';
import { toast } from 'sonner';

interface AIRecommendation {
    userId: string;
    score: number;
    factors: {
        interests: number;
        goals: number;
        strengths: number;
        location: number;
        industry: number;
        experience: number;
        mutualConnections: number;
        activityLevel: number;
        professionalAlignment: number;
        networkingPotential: number;
    };
    reasons: string[];
    matchType: 'industry' | 'location' | 'skills' | 'goals' | 'general';
    user: {
        id: string;
        name: string;
        email: string;
        linkedinInfo?: string;
        goals?: string;
        strengths?: string;
        interests?: string;
    };
}

interface FilterOptions {
    matchType: 'all' | 'industry' | 'location' | 'skills' | 'goals';
    minScore: number;
    location: string;
    industry: string;
}

export default function EnhancedFriendsPage() {
    // Dummy user object for sidebar (replace with real user fetching logic as needed)
    const user = { id: 'demo-id', name: 'Demo User', email: 'demo@example.com' };
    const router = useRouter();
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [filteredRecommendations, setFilteredRecommendations] = useState<AIRecommendation[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState('');
    const [filters, setFilters] = useState<FilterOptions>({
        matchType: 'all',
        minScore: 0.4,
        location: '',
        industry: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [recommendations, filters]);

    const fetchRecommendations = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    preferences: {
                        maxResults: 30,
                        minScore: 0.3,
                        dubaiFocus: true,
                        includeMutualConnections: true,
                        prioritizeActiveUsers: true,
                    },
                    includeAIInsights: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Enhanced recommendations:', data);
                setRecommendations(data.recommendations || []);
                setAiInsights(data.aiInsights || '');
            } else {
                console.error('Failed to fetch recommendations');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = recommendations;

        // Apply match type filter
        if (filters.matchType !== 'all') {
            filtered = filtered.filter(rec => rec.matchType === filters.matchType);
        }

        // Apply minimum score filter
        filtered = filtered.filter(rec => rec.score >= filters.minScore);

        // Apply location filter
        if (filters.location) {
            filtered = filtered.filter(rec =>
                rec.user.linkedinInfo?.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Apply industry filter
        if (filters.industry) {
            filtered = filtered.filter(rec =>
                rec.user.linkedinInfo?.toLowerCase().includes(filters.industry.toLowerCase())
            );
        }

        setFilteredRecommendations(filtered);
    };

    const handleConnectionRequest = async (userId: string) => {
        try {
            const senderEmail = getCookie('userEmail') as string;
            if (!senderEmail) {
                toast.error('Please log in to send connection requests');
                return;
            }

            const recommendation = recommendations.find(rec => rec.userId === userId);
            if (!recommendation) {
                toast.error('User not found');
                return;
            }

            const response = await fetch('/api/connections/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senderEmail,
                    receiverEmail: recommendation.user.email,
                    message: `Hi ${recommendation.user.name}! I noticed we have ${recommendation.reasons.slice(0, 2).join(' and ')}. Would love to connect and learn more about your work!`,
                }),
            });

            if (response.ok) {
                toast.success('Connection request sent!');
                setSentRequests(prev => new Set(prev).add(userId));
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to send connection request');
            }
        } catch (error) {
            console.error('Error sending connection request:', error);
            toast.error('Error sending connection request');
        }
    };

    const getMatchTypeColor = (matchType: string) => {
        switch (matchType) {
            case 'industry': return 'bg-blue-500';
            case 'location': return 'bg-green-500';
            case 'skills': return 'bg-purple-500';
            case 'goals': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    const getMatchTypeIcon = (matchType: string) => {
        switch (matchType) {
            case 'industry': return <FaIndustry className="w-4 h-4" />;
            case 'location': return <FaMapMarkerAlt className="w-4 h-4" />;
            case 'skills': return <FaLightbulb className="w-4 h-4" />;
            case 'goals': return <FaStar className="w-4 h-4" />;
            default: return <FaUsers className="w-4 h-4" />;
        }
    };

    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
                    {/* Header */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <SidebarToggle />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Find Connections
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        AI-powered recommendations for your professional network
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <FaFilter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* AI Insights */}
                        {aiInsights && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-6 mb-8 shadow-lg"
                            >
                                <div className="flex items-start gap-3">
                                    <FaLightbulb className="w-6 h-6 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                                        <p className="text-purple-100 leading-relaxed">{aiInsights}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Filters */}
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/20 shadow-lg"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Recommendations</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="matchType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Match Type
                                        </label>
                                        <select
                                            id="matchType"
                                            value={filters.matchType}
                                            onChange={(e) => setFilters(prev => ({ ...prev, matchType: e.target.value as any }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white/50 dark:bg-slate-700/80 text-gray-900 dark:text-white"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="industry">Industry</option>
                                            <option value="location">Location</option>
                                            <option value="skills">Skills</option>
                                            <option value="goals">Goals</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Min Score: {filters.minScore}
                                        </label>
                                        <input
                                            id="minScore"
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={filters.minScore}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minScore: Number.parseFloat(e.target.value) }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Location
                                        </label>
                                        <input
                                            id="location"
                                            type="text"
                                            placeholder="e.g., Dubai, UAE"
                                            value={filters.location}
                                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white/50 dark:bg-slate-700/80 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Industry
                                        </label>
                                        <input
                                            id="industry"
                                            type="text"
                                            placeholder="e.g., Technology, Finance"
                                            value={filters.industry}
                                            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white/50 dark:bg-slate-700/80 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Results */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {isLoading ? 'Finding connections...' : `${filteredRecommendations.length} recommended connections`}
                                </h2>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Dubai/UAE Focus Enabled
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg animate-pulse">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredRecommendations.length === 0 ? (
                            <div className="text-center py-12">
                                <FaUserFriends className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No matches found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Try adjusting your filters or updating your profile for better recommendations.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRecommendations.map((recommendation) => (
                                    <motion.div
                                        key={recommendation.userId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                    {recommendation.user.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getMatchTypeColor(recommendation.matchType)}`}>
                                                        {getMatchTypeIcon(recommendation.matchType)}
                                                        {recommendation.matchType}
                                                    </span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                                        {Math.round(recommendation.score * 100)}% match
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div className="space-y-3 mb-4">
                                            {recommendation.user.linkedinInfo && (
                                                <div className="flex items-start gap-2">
                                                    <FaBriefcase className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {recommendation.user.linkedinInfo}
                                                    </p>
                                                </div>
                                            )}
                                            {recommendation.user.goals && (
                                                <div className="flex items-start gap-2">
                                                    <FaStar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {recommendation.user.goals}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Match Reasons */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Why we matched:</h4>
                                            <div className="space-y-1">
                                                {recommendation.reasons.slice(0, 3).map((reason, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                        <span className="text-xs text-gray-600 dark:text-gray-300">{reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleConnectionRequest(recommendation.userId)}
                                            disabled={sentRequests.has(recommendation.userId)}
                                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${sentRequests.has(recommendation.userId)
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed'
                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                                }`}
                                        >
                                            {sentRequests.has(recommendation.userId) ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <FaHandshake className="w-4 h-4" />
                                                    Request Sent
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <FaHandshake className="w-4 h-4" />
                                                    Connect
                                                </span>
                                            )}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
} 