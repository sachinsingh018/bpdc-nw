import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUser, getAllUsers, getUserById } from '@/lib/db/queries';
import type { MatchingPreferences } from '@/lib/ai/matching-engine';
import { generateRecommendations } from '@/lib/ai/matching-engine';
import { enhancedSystemPrompts, aiResponseEnhancers } from '@/lib/ai/enhanced-prompts';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { preferences, includeAIInsights = true } = await request.json();

        // Get current user details
        const userArr = await getUser(session.user.email);
        const currentUser = userArr?.[0];
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get all users for matching
        const allUsers = await getAllUsers();

        // Generate recommendations using the matching engine
        const recommendations = await generateRecommendations(
            currentUser,
            allUsers,
            preferences as MatchingPreferences
        );

        // Get detailed user information for recommended connections
        const recommendedUsers = await Promise.all(
            recommendations.map(async (rec) => {
                const [user] = await getUserById(rec.userId);
                return {
                    ...rec,
                    user: user,
                };
            })
        );

        let aiInsights = null;
        if (includeAIInsights) {
            // Generate AI insights about the recommendations
            aiInsights = await generateAIInsights(currentUser, recommendations);
        }

        return NextResponse.json({
            success: true,
            recommendations: recommendedUsers,
            aiInsights,
            totalFound: recommendations.length,
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to generate recommendations' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = Number.parseInt(searchParams.get('limit') || '10');
        const minScore = Number.parseFloat(searchParams.get('minScore') || '0.3');
        const industry = searchParams.get('industry');
        const location = searchParams.get('location');

        // Get current user details
        const userArr = await getUser(session.user.email);
        const currentUser = userArr?.[0];
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Build preferences from query parameters
        const preferences: MatchingPreferences = {
            maxResults: limit,
            minScore,
            includeMutualConnections: true,
            prioritizeActiveUsers: true,
        };

        if (industry) {
            preferences.industryFocus = [industry];
        }

        if (location) {
            preferences.locationPreference = [location];
        }

        // Get all users for matching
        const allUsers = await getAllUsers();

        // Generate recommendations
        const recommendations = await generateRecommendations(
            currentUser,
            allUsers,
            preferences
        );

        // Get detailed user information
        const recommendedUsers = await Promise.all(
            recommendations.map(async (rec) => {
                const [user] = await getUserById(rec.userId);
                return {
                    ...rec,
                    user: user,
                };
            })
        );

        return NextResponse.json({
            success: true,
            recommendations: recommendedUsers,
            totalFound: recommendations.length,
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        return NextResponse.json(
            { error: 'Failed to get recommendations' },
            { status: 500 }
        );
    }
}

/**
 * Generate AI insights about the recommendations
 */
async function generateAIInsights(currentUser: any, recommendations: any[]) {
    try {
        // Extract user profile information
        const userProfile = {
            interests: currentUser.interests ? currentUser.interests.split(',').map((i: string) => i.trim()) : [],
            goals: currentUser.goals ? currentUser.goals.split(',').map((g: string) => g.trim()) : [],
            strengths: currentUser.strengths ? currentUser.strengths.split(',').map((s: string) => s.trim()) : [],
            industry: extractIndustryFromText(currentUser.linkedinInfo || ''),
            location: extractLocationFromText(currentUser.linkedinInfo || ''),
            experienceLevel: extractExperienceLevel(currentUser.linkedinInfo || ''),
        };

        // Create chat context
        const context = {
            currentUser,
            userProfile,
            conversationHistory: [],
            recentConnections: [],
        };

        // Generate insights based on recommendations
        const topRecommendations = recommendations.slice(0, 3);
        const averageScore = recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length;

        let insights = '';

        if (recommendations.length === 0) {
            insights = "I couldn't find any strong matches based on your current profile. Consider updating your interests, goals, and strengths to get better recommendations! 🎯";
        } else if (averageScore > 0.7) {
            insights = `Excellent! You have ${recommendations.length} high-quality connection opportunities. Your profile is well-aligned with the Networkqy community. 🚀`;
        } else if (averageScore > 0.5) {
            insights = `Good news! You have ${recommendations.length} solid connection opportunities. Consider reaching out to the top matches first. 💪`;
        } else {
            insights = `You have ${recommendations.length} potential connections. Focus on the highest-scoring matches and consider updating your profile for better alignment. 📈`;
        }

        // Add specific insights about top recommendations
        if (topRecommendations.length > 0) {
            insights += '\n\n**Top Recommendations:**\n';
            topRecommendations.forEach((rec, index) => {
                const reasons = rec.reasons.slice(0, 2).join(', ');
                insights += `${index + 1}. **${rec.user?.name || 'User'}** (${Math.round(rec.score * 100)}% match) - ${reasons}\n`;
            });
        }

        // Add networking advice
        insights += '\n\n**Networking Tips:**\n';
        insights += '• Send personalized connection requests mentioning shared interests\n';
        insights += '• Follow up within 24 hours after connecting\n';
        insights += '• Suggest specific topics for discussion\n';
        insights += '• Offer value before asking for anything\n';

        // Enhance with personality and next steps
        insights = aiResponseEnhancers.addPersonality(insights, context);
        insights = aiResponseEnhancers.addNextSteps(insights, 'connection');
        insights = aiResponseEnhancers.addEncouragement(insights, userProfile.goals);

        return insights;

    } catch (error) {
        console.error('Error generating AI insights:', error);
        return "I've found some great connection opportunities for you! Take a look at the recommendations above and start building your network. 🚀";
    }
}

/**
 * Helper functions for extracting profile information
 */
function extractIndustryFromText(text: string): string {
    const industries = [
        'technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing',
        'consulting', 'marketing', 'sales', 'engineering', 'design', 'media',
        'real estate', 'legal', 'non-profit', 'government', 'startup', 'venture capital'
    ];

    const lowerText = text.toLowerCase();
    for (const industry of industries) {
        if (lowerText.includes(industry)) return industry;
    }

    return 'Not specified';
}

function extractLocationFromText(text: string): string {
    const locationPatterns = [
        /(?:in|at|from|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/i,
    ];

    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) return match[1];
    }

    return 'Not specified';
}

function extractExperienceLevel(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('founder') || lowerText.includes('ceo') || lowerText.includes('cto')) return 'Senior Executive';
    if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('manager')) return 'Senior';
    if (lowerText.includes('mid') || lowerText.includes('intermediate')) return 'Mid-level';
    if (lowerText.includes('junior') || lowerText.includes('entry')) return 'Junior';
    if (lowerText.includes('student') || lowerText.includes('intern')) return 'Student/Intern';

    return 'Mid-level';
} 