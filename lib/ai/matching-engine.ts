import type { User } from '@/lib/db/schema';
import { getConnections, getConnectionRequests } from '@/lib/db/queries';

export interface MatchScore {
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
}

export interface MatchingPreferences {
    minScore?: number;
    maxResults?: number;
    includeMutualConnections?: boolean;
    prioritizeActiveUsers?: boolean;
    industryFocus?: string[];
    locationPreference?: string[];
    matchType?: 'industry' | 'location' | 'skills' | 'goals' | 'general';
    globalFocus?: boolean;
}

export interface MatchingOptions {
    industryWeight?: number;
    locationWeight?: number;
    skillsWeight?: number;
    interestsWeight?: number;
    experienceWeight?: number;
    globalFocus?: boolean;
}

// Exported constants
export const WEIGHTS = {
    interests: 0.15,
    goals: 0.15,
    strengths: 0.10,
    location: 0.15,
    industry: 0.20,
    experience: 0.10,
    mutualConnections: 0.05,
    activityLevel: 0.05,
    professionalAlignment: 0.15,
    networkingPotential: 0.10,
};

export const GLOBAL_LOCATIONS = [
    'new york', 'london', 'tokyo', 'singapore', 'sydney', 'toronto', 'berlin', 'paris',
    'san francisco', 'los angeles', 'chicago', 'boston', 'seattle', 'austin', 'miami',
    'vancouver', 'montreal', 'amsterdam', 'stockholm', 'copenhagen', 'oslo', 'helsinki',
    'zurich', 'geneva', 'milan', 'rome', 'madrid', 'barcelona', 'lisbon', 'dublin',
    'edinburgh', 'glasgow', 'manchester', 'birmingham', 'leeds', 'liverpool', 'bristol',
    'cardiff', 'belfast', 'aberdeen', 'dundee', 'inverness', 'perth', 'stirling',
    'dunfermline', 'paisley', 'east kilbride', 'livingston', 'hamilton', 'cumbernauld',
    'kirkcaldy', 'dunfermline', 'ayr', 'kilmarnock', 'perth', 'stirling', 'dunfermline',
    'paisley', 'east kilbride', 'livingston', 'hamilton', 'cumbernauld', 'kirkcaldy',
    'dunfermline', 'ayr', 'kilmarnock', 'perth', 'stirling', 'dunfermline', 'paisley',
    'east kilbride', 'livingston', 'hamilton', 'cumbernauld', 'kirkcaldy', 'dunfermline',
    'ayr', 'kilmarnock', 'perth', 'stirling', 'dunfermline', 'paisley', 'east kilbride',
    'livingston', 'hamilton', 'cumbernauld', 'kirkcaldy', 'dunfermline', 'ayr', 'kilmarnock'
];

export const GLOBAL_INDUSTRIES = [
    'technology', 'finance', 'healthcare', 'education', 'manufacturing', 'retail',
    'consulting', 'marketing', 'sales', 'engineering', 'design', 'media', 'entertainment',
    'real estate', 'legal', 'accounting', 'human resources', 'operations', 'logistics',
    'transportation', 'energy', 'environmental', 'non-profit', 'government', 'research',
    'startup', 'venture capital', 'private equity', 'investment banking', 'insurance',
    'telecommunications', 'automotive', 'aerospace', 'defense', 'pharmaceuticals',
    'biotechnology', 'food and beverage', 'hospitality', 'tourism', 'sports', 'fitness',
    'fashion', 'luxury', 'consumer goods', 'industrial', 'construction', 'architecture',
    'interior design', 'landscaping', 'agriculture', 'fishing', 'mining', 'oil and gas',
    'renewable energy', 'solar', 'wind', 'hydroelectric', 'nuclear', 'coal', 'natural gas',
    'petroleum', 'chemicals', 'plastics', 'rubber', 'textiles', 'apparel', 'footwear',
    'jewelry', 'watches', 'cosmetics', 'personal care', 'household', 'electronics',
    'computers', 'software', 'hardware', 'internet', 'e-commerce', 'mobile', 'gaming',
    'social media', 'artificial intelligence', 'machine learning', 'data science',
    'cybersecurity', 'blockchain', 'cryptocurrency', 'fintech', 'healthtech', 'edtech',
    'proptech', 'legaltech', 'regtech', 'insurtech', 'adtech', 'martech', 'hrtech',
    'logtech', 'agtech', 'cleantech', 'biotech', 'nanotech', 'robotics', 'automation',
    'iot', 'ar', 'vr', 'mr', 'quantum computing', 'cloud computing', 'saas', 'paas',
    'iaas', 'microservices', 'api', 'devops', 'agile', 'scrum', 'kanban', 'lean',
    'six sigma', 'tqm', 'bpm', 'erp', 'crm', 'hrms', 'scm', 'plm', 'mes', 'wms',
    'tms', 'lms', 'cms', 'dms', 'bms', 'ems', 'ims', 'pms', 'ams', 'oms', 'rms',
    'kms', 'ims', 'pms', 'ams', 'oms', 'rms', 'kms', 'ims', 'pms', 'ams', 'oms'
];

export const INDUSTRY_KEYWORDS = {
    'technology': ['software', 'tech', 'ai', 'machine learning', 'data science', 'cybersecurity', 'blockchain', 'cloud', 'saas', 'startup'],
    'finance': ['finance', 'banking', 'investment', 'fintech', 'accounting', 'audit', 'tax', 'wealth management', 'private equity'],
    'healthcare': ['healthcare', 'medical', 'pharmaceutical', 'biotech', 'hospital', 'clinic', 'research', 'public health'],
    'real estate': ['real estate', 'property', 'construction', 'development', 'architecture', 'interior design', 'facilities'],
    'education': ['education', 'teaching', 'academic', 'university', 'school', 'training', 'curriculum', 'research'],
    'consulting': ['consulting', 'strategy', 'management', 'advisory', 'business development', 'operations'],
    'marketing': ['marketing', 'advertising', 'branding', 'digital marketing', 'social media', 'content', 'pr'],
    'logistics': ['logistics', 'supply chain', 'transportation', 'warehousing', 'distribution', 'freight'],
    'tourism': ['tourism', 'hospitality', 'hotel', 'travel', 'leisure', 'events', 'restaurant'],
    'media': ['media', 'journalism', 'broadcasting', 'publishing', 'entertainment', 'content creation']
};

/**
 * Generate personalized connection recommendations
 */
export async function generateRecommendations(
    currentUser: User,
    allUsers: User[],
    preferences: MatchingPreferences = {}
): Promise<MatchScore[]> {
    const {
        minScore = 0.3,
        maxResults = 10,
        includeMutualConnections = true,
        prioritizeActiveUsers = true,
        globalFocus = false,
        matchType = 'general'
    } = preferences;

    // Get user's existing connections
    const existingConnections = await getConnections(currentUser.id);
    const existingUserIds = new Set(
        existingConnections.map(conn =>
            conn.sender_id === currentUser.id ? conn.receiver_id : conn.sender_id
        )
    );

    // Get pending connection requests
    const pendingRequests = await getConnectionRequests(currentUser.id);
    const pendingUserIds = new Set(pendingRequests.map(req => req.sender_id));

    // Filter out existing connections and pending requests
    let eligibleUsers = allUsers.filter(user =>
        user.id !== currentUser.id &&
        !existingUserIds.has(user.id) &&
        !pendingUserIds.has(user.id)
    );

    // Apply global focus if requested
    if (globalFocus) {
        eligibleUsers = eligibleUsers.filter(user =>
            isGlobalBased(user) || hasGlobalIndustry(user)
        );
    }

    // Calculate match scores for each eligible user
    const matchScores = await Promise.all(
        eligibleUsers.map(async (user) => {
            const score = await calculateMatchScore(currentUser, user, {
                includeMutualConnections,
                prioritizeActiveUsers,
                matchType,
                globalFocus
            });
            return score;
        })
    );

    // Sort by score and apply filters
    return matchScores
        .filter(match => match.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);
}

/**
 * Calculate comprehensive match score between two users
 */
export async function calculateMatchScore(
    user1: User,
    user2: User,
    options: {
        includeMutualConnections: boolean;
        prioritizeActiveUsers: boolean;
        matchType: string;
        globalFocus: boolean;
    }
): Promise<MatchScore> {
    const factors = {
        interests: calculateInterestsMatch(user1, user2),
        goals: calculateGoalsMatch(user1, user2),
        strengths: calculateStrengthsMatch(user1, user2),
        location: 0,
        industry: calculateIndustryMatch(user1, user2),
        experience: calculateExperienceMatch(user1, user2),
        mutualConnections: await calculateMutualConnections(user1, user2),
        activityLevel: calculateActivityLevel(user2),
        professionalAlignment: calculateProfessionalAlignment(user1, user2),
        networkingPotential: calculateNetworkingPotential(user1, user2),
    };

    // Apply match type weighting
    const adjustedWeights = adjustWeightsForMatchType(options.matchType, factors);

    // Calculate weighted score
    const score = Object.entries(factors).reduce((total, [key, value]) => {
        return total + (value * adjustedWeights[key as keyof typeof adjustedWeights]);
    }, 0);

    // Generate reasons for the match
    const reasons = generateMatchReasons(factors, user1, user2, options.globalFocus);
    const matchType = determineMatchType(factors, user1, user2);

    return {
        userId: user2.id,
        score,
        factors,
        reasons,
        matchType,
    };
}

/**
 * Check if user is globally based
 */
export function isGlobalBased(user: User): boolean {
    const location = extractLocation(user.linkedinInfo || '') || '';
    return GLOBAL_LOCATIONS.some(globalLocation =>
        location.toLowerCase().includes(globalLocation.toLowerCase())
    );
}

/**
 * Check if user has globally relevant industry
 */
export function hasGlobalIndustry(user: User): boolean {
    const industry = extractIndustry(user.linkedinInfo || '') || '';
    return GLOBAL_INDUSTRIES.some(globalIndustry =>
        industry.toLowerCase().includes(globalIndustry.toLowerCase())
    );
}

/**
 * Calculate professional alignment (0-1)
 */
export function calculateProfessionalAlignment(user1: User, user2: User): number {
    const industry1 = extractIndustry(user1.linkedinInfo || '');
    const industry2 = extractIndustry(user2.linkedinInfo || '');

    if (!industry1 || !industry2) return 0.5;

    // Check for exact industry match
    if (industry1.toLowerCase() === industry2.toLowerCase()) return 1.0;

    // Check for related industries
    const relatedIndustries = getRelatedIndustries(industry1);
    if (relatedIndustries.includes(industry2.toLowerCase())) return 0.8;

    // Check for complementary industries
    const complementaryIndustries = getComplementaryIndustries(industry1);
    if (complementaryIndustries.includes(industry2.toLowerCase())) return 0.6;

    return 0.3;
}

/**
 * Calculate networking potential (0-1)
 */
export function calculateNetworkingPotential(user1: User, user2: User): number {
    let potential = 0.5;

    // Check for complementary skills
    const skills1 = extractKeywords(user1.strengths || '');
    const skills2 = extractKeywords(user2.strengths || '');

    const complementarySkills = skills1.filter(s1 =>
        skills2.some(s2 => similarityScore(s1, s2) > 0.3 && similarityScore(s1, s2) < 0.8)
    );

    if (complementarySkills.length > 0) {
        potential += 0.2;
    }

    // Check for different experience levels (mentorship potential)
    const exp1 = extractExperienceLevel(user1.linkedinInfo || '');
    const exp2 = extractExperienceLevel(user2.linkedinInfo || '');

    if (Math.abs(exp1 - exp2) >= 2) {
        potential += 0.2;
    }

    return Math.min(potential, 1.0);
}

/**
 * Adjust weights based on match type
 */
export function adjustWeightsForMatchType(matchType: string, factors: any): typeof WEIGHTS {
    const weights = { ...WEIGHTS };

    switch (matchType) {
        case 'industry':
            weights.industry = 0.35;
            weights.professionalAlignment = 0.25;
            weights.location = 0.10;
            weights.interests = 0.10;
            weights.goals = 0.10;
            weights.strengths = 0.05;
            weights.experience = 0.05;
            break;
        case 'location':
            weights.location = 0.35;
            weights.industry = 0.20;
            weights.interests = 0.15;
            weights.goals = 0.15;
            weights.networkingPotential = 0.15;
            break;
        case 'skills':
            weights.strengths = 0.30;
            weights.networkingPotential = 0.25;
            weights.industry = 0.20;
            weights.interests = 0.15;
            weights.goals = 0.10;
            break;
        case 'goals':
            weights.goals = 0.35;
            weights.interests = 0.25;
            weights.industry = 0.20;
            weights.professionalAlignment = 0.20;
            break;
    }

    return weights;
}

/**
 * Determine the primary match type
 */
export function determineMatchType(factors: any, user1: User, user2: User): MatchScore['matchType'] {
    const scores = {
        industry: factors.industry + factors.professionalAlignment,
        location: factors.location,
        skills: factors.strengths + factors.networkingPotential,
        goals: factors.goals + factors.interests,
        general: (factors.interests + factors.goals + factors.strengths + factors.location + factors.industry) / 5
    };

    const maxScore = Math.max(...Object.values(scores));

    if (maxScore === scores.industry) return 'industry';
    if (maxScore === scores.location) return 'location';
    if (maxScore === scores.skills) return 'skills';
    if (maxScore === scores.goals) return 'goals';
    return 'general';
}

/**
 * Get related industries
 */
export function getRelatedIndustries(industry: string): string[] {
    const industryLower = industry.toLowerCase();

    // Define industry relationships
    const relationships: { [key: string]: string[] } = {
        'technology': ['software', 'fintech', 'e-commerce', 'media', 'consulting'],
        'finance': ['banking', 'insurance', 'real estate', 'consulting', 'technology'],
        'healthcare': ['pharmaceutical', 'biotech', 'medical devices', 'consulting'],
        'real estate': ['construction', 'architecture', 'finance', 'consulting'],
        'education': ['consulting', 'technology', 'media', 'government'],
        'consulting': ['technology', 'finance', 'healthcare', 'real estate', 'education'],
        'marketing': ['media', 'technology', 'e-commerce', 'consulting'],
        'logistics': ['e-commerce', 'technology', 'consulting', 'real estate'],
        'tourism': ['hospitality', 'real estate', 'marketing', 'consulting'],
        'media': ['technology', 'marketing', 'entertainment', 'consulting']
    };

    return relationships[industryLower] || [];
}

/**
 * Get complementary industries
 */
export function getComplementaryIndustries(industry: string): string[] {
    const industryLower = industry.toLowerCase();

    // Define complementary industry pairs
    const complements: { [key: string]: string[] } = {
        'technology': ['finance', 'healthcare', 'education', 'real estate'],
        'finance': ['technology', 'real estate', 'consulting'],
        'healthcare': ['technology', 'pharmaceutical', 'consulting'],
        'real estate': ['finance', 'construction', 'technology'],
        'education': ['technology', 'consulting', 'government'],
        'consulting': ['technology', 'finance', 'healthcare', 'real estate'],
        'marketing': ['technology', 'media', 'e-commerce'],
        'logistics': ['e-commerce', 'technology', 'real estate'],
        'tourism': ['real estate', 'marketing', 'technology'],
        'media': ['technology', 'marketing', 'entertainment']
    };

    return complements[industryLower] || [];
}

/**
 * Calculate interests compatibility (0-1)
 */
export function calculateInterestsMatch(user1: User, user2: User): number {
    if (!user1.interests || !user2.interests) return 0.5;

    const interests1 = extractKeywords(user1.interests);
    const interests2 = extractKeywords(user2.interests);

    if (interests1.length === 0 || interests2.length === 0) return 0.5;

    const commonInterests = interests1.filter(interest =>
        interests2.some(i2 => similarityScore(interest, i2) > 0.7)
    );

    return Math.min(commonInterests.length / Math.max(interests1.length, interests2.length), 1);
}

/**
 * Calculate goals compatibility (0-1)
 */
export function calculateGoalsMatch(user1: User, user2: User): number {
    if (!user1.goals || !user2.goals) return 0.5;

    const goals1 = extractKeywords(user1.goals);
    const goals2 = extractKeywords(user2.goals);

    if (goals1.length === 0 || goals2.length === 0) return 0.5;

    const commonGoals = goals1.filter(goal =>
        goals2.some(g2 => similarityScore(goal, g2) > 0.6)
    );

    return Math.min(commonGoals.length / Math.max(goals1.length, goals2.length), 1);
}

/**
 * Calculate strengths complementarity (0-1)
 */
export function calculateStrengthsMatch(user1: User, user2: User): number {
    if (!user1.strengths || !user2.strengths) return 0.5;

    const strengths1 = extractKeywords(user1.strengths);
    const strengths2 = extractKeywords(user2.strengths);

    if (strengths1.length === 0 || strengths2.length === 0) return 0.5;

    // Check for complementary strengths (different but related)
    const complementaryCount = strengths1.filter(s1 =>
        strengths2.some(s2 =>
            similarityScore(s1, s2) > 0.3 && similarityScore(s1, s2) < 0.8
        )
    ).length;

    return Math.min(complementaryCount / Math.max(strengths1.length, strengths2.length), 1);
}

/**
 * Calculate experience level compatibility (0-1)
 */
export function calculateExperienceMatch(user1: User, user2: User): number {
    const exp1 = extractExperienceLevel(user1.linkedinInfo || '');
    const exp2 = extractExperienceLevel(user2.linkedinInfo || '');

    if (!exp1 || !exp2) return 0.5;

    // Prefer connections with similar or complementary experience levels
    const levelDiff = Math.abs(exp1 - exp2);
    return levelDiff <= 1 ? 1 : levelDiff <= 2 ? 0.7 : 0.3;
}

/**
 * Calculate mutual connections score (0-1)
 */
export async function calculateMutualConnections(user1: User, user2: User): Promise<number> {
    try {
        const connections1 = await getConnections(user1.id);
        const connections2 = await getConnections(user2.id);

        const user1Connections = new Set(
            connections1.map(conn =>
                conn.sender_id === user1.id ? conn.receiver_id : conn.sender_id
            )
        );

        const user2Connections = new Set(
            connections2.map(conn =>
                conn.sender_id === user2.id ? conn.receiver_id : conn.sender_id
            )
        );

        const mutualCount = [...user1Connections].filter(id => user2Connections.has(id)).length;
        return Math.min(mutualCount / 10, 1); // Cap at 10 mutual connections
    } catch (error) {
        console.error('Error calculating mutual connections:', error);
        return 0;
    }
}

/**
 * Calculate user activity level (0-1)
 */
export function calculateActivityLevel(user: User): number {
    // This could be enhanced with actual activity data
    // For now, use profile completeness as a proxy
    const profileFields = [user.name, user.linkedinInfo, user.goals, user.strengths, user.interests];
    const completedFields = profileFields.filter(field => field && field.trim().length > 0).length;
    return completedFields / profileFields.length;
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
    return text
        .toLowerCase()
        .split(/[,\s]+/)
        .filter(word => word.length > 2)
        .map(word => word.replace(/[^\w]/g, ''))
        .filter(word => word.length > 0);
}

/**
 * Calculate similarity between two strings (0-1)
 */
export function similarityScore(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return totalWords > 0 ? commonWords.length / totalWords : 0;
}

/**
 * Extract location from text
 */
export function extractLocation(text: string): string | null {
    const locationPatterns = [
        /(?:in|at|from|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/i,
    ];

    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match) return match[1];
    }

    return null;
}

/**
 * Extract industry from text
 */
export function extractIndustry(text: string): string | null {
    const industries = [
        'technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing',
        'consulting', 'marketing', 'sales', 'engineering', 'design', 'media',
        'real estate', 'legal', 'non-profit', 'government', 'startup', 'venture capital'
    ];

    const lowerText = text.toLowerCase();
    for (const industry of industries) {
        if (lowerText.includes(industry)) return industry;
    }

    return null;
}

/**
 * Extract experience level from text (1-5 scale)
 */
export function extractExperienceLevel(text: string): number {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('founder') || lowerText.includes('ceo') || lowerText.includes('cto')) return 5;
    if (lowerText.includes('senior') || lowerText.includes('lead') || lowerText.includes('manager')) return 4;
    if (lowerText.includes('mid') || lowerText.includes('intermediate')) return 3;
    if (lowerText.includes('junior') || lowerText.includes('entry')) return 2;
    if (lowerText.includes('student') || lowerText.includes('intern')) return 1;

    return 3; // Default to mid-level
}

/**
 * Generate human-readable reasons for the match
 */
export function generateMatchReasons(factors: any, user1: User, user2: User, globalFocus: boolean): string[] {
    const reasons: string[] = [];

    if (factors.industry > 0.7) {
        reasons.push('Strong industry alignment');
    } else if (factors.industry > 0.5) {
        reasons.push('Similar industry background');
    }

    if (factors.skills > 0.7) {
        reasons.push('Complementary skills');
    } else if (factors.skills > 0.5) {
        reasons.push('Shared technical expertise');
    }

    if (factors.interests > 0.7) {
        reasons.push('Shared professional interests');
    } else if (factors.interests > 0.5) {
        reasons.push('Similar career goals');
    }

    if (factors.experience > 0.7) {
        reasons.push('Similar experience level');
    } else if (factors.experience > 0.5) {
        reasons.push('Complementary experience');
    }

    return reasons.slice(0, 3); // Return top 3 reasons
}

// Add calculateIndustryMatch function
export function calculateIndustryMatch(user1: User, user2: User): number {
    // Try to extract industry from linkedinInfo or fallback to empty string
    const industry1 = extractIndustry(user1.linkedinInfo || '');
    const industry2 = extractIndustry(user2.linkedinInfo || '');
    if (!industry1 || !industry2) return 0.5;
    if (industry1.toLowerCase() === industry2.toLowerCase()) return 1.0;
    const relatedIndustries = getRelatedIndustries(industry1);
    if (relatedIndustries.includes(industry2.toLowerCase())) return 0.8;
    const complementaryIndustries = getComplementaryIndustries(industry1);
    if (complementaryIndustries.includes(industry2.toLowerCase())) return 0.6;
    return 0.3;
} 