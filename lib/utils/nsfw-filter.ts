// NSFW Filter for Anonymous Usernames and Content
// This filter checks for inappropriate content that shouldn't be allowed

const profanityList = [
    // Common profanity
    'fuck', 'shit', 'bitch', 'cunt', 'pussy', 'dick', 'cock', 'asshole', 'bastard', 'whore', 'slut',
    // Variations and common misspellings
    'fuk', 'fuq', 'sh1t', 'sh!t', 'b!tch', 'b1tch', 'p*ssy', 'd!ck', 'c0ck', 'assh0le', 'b@stard',
    // Abbreviated forms
    'wtf', 'omfg', 'stfu', 'gtfo', 'fml', 'smh',
    // Common replacements
    'f*ck', 'f**k', 'f***', 's**t', 's***', 'b***h', 'b****', 'p***y', 'd***', 'c***', 'a*****e',
];

const slursList = [
    // Racial slurs and offensive terms
    'nigger', 'nigga', 'faggot', 'fag', 'dyke', 'kike', 'spic', 'chink', 'gook', 'wop', 'kraut',
    // Variations
    'n1gger', 'n!gger', 'f@ggot', 'f@g', 'd!ke', 'k!ke', 'sp!c', 'ch!nk', 'g00k', 'w0p', 'kr@ut',
    // Abbreviated forms
    'n*gger', 'n****r', 'f*ggot', 'f**', 'd*ke', 'k*ke', 'sp*c', 'ch*nk', 'g**k', 'w*p', 'kr**t',
];

const inappropriateTerms = [
    // Sexual content
    'sex', 'porn', 'nude', 'naked', 'penis', 'vagina', 'boobs', 'tits', 'ass', 'butt', 'dick', 'cock',
    // Violence
    'kill', 'murder', 'death', 'blood', 'gore', 'suicide', 'bomb', 'terrorist', 'hitler', 'nazi',
    // Drugs and alcohol
    'cocaine', 'heroin', 'meth', 'weed', 'marijuana', 'alcohol', 'drunk', 'high', 'stoned',
    // Other inappropriate
    'pedo', 'pedophile', 'rapist', 'murderer', 'terrorist', 'extremist',
];

const blockedPatterns = [
    // Common patterns that might be used to bypass filters
    /[0-9]+/, // Too many numbers
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/, // Too many special characters
    /(.)\1{3,}/, // Repeated characters (more than 3)
];

export interface NSFWFilterResult {
    isValid: boolean;
    reason?: string;
    suggestions?: string[];
}

export function checkUsernameNSFW(username: string): NSFWFilterResult {
    const lowerUsername = username.toLowerCase().trim();

    // Check for empty or too short username
    if (!lowerUsername || lowerUsername.length < 3) {
        return {
            isValid: false,
            reason: 'Username must be at least 3 characters long',
            suggestions: ['Try a longer username']
        };
    }

    // Check for too long username
    if (lowerUsername.length > 50) {
        return {
            isValid: false,
            reason: 'Username must be 50 characters or less',
            suggestions: ['Try a shorter username']
        };
    }

    // Check for profanity
    for (const word of profanityList) {
        if (lowerUsername.includes(word)) {
            return {
                isValid: false,
                reason: 'Username contains inappropriate language',
                suggestions: ['Choose a different username without inappropriate words']
            };
        }
    }

    // Check for slurs
    for (const word of slursList) {
        if (lowerUsername.includes(word)) {
            return {
                isValid: false,
                reason: 'Username contains offensive terms',
                suggestions: ['Choose a respectful username']
            };
        }
    }

    // Check for inappropriate terms
    for (const word of inappropriateTerms) {
        if (lowerUsername.includes(word)) {
            return {
                isValid: false,
                reason: 'Username contains inappropriate content',
                suggestions: ['Choose a more appropriate username']
            };
        }
    }

    // Check for blocked patterns
    for (const pattern of blockedPatterns) {
        if (pattern.test(lowerUsername)) {
            return {
                isValid: false,
                reason: 'Username contains too many special characters or numbers',
                suggestions: ['Use mostly letters and limit special characters']
            };
        }
    }

    // Check for excessive numbers (more than 50% of characters)
    const numberCount = (lowerUsername.match(/[0-9]/g) || []).length;
    if (numberCount > lowerUsername.length * 0.5) {
        return {
            isValid: false,
            reason: 'Username contains too many numbers',
            suggestions: ['Use more letters and fewer numbers']
        };
    }

    // Check for excessive special characters (more than 30% of characters)
    const specialCharCount = (lowerUsername.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount > lowerUsername.length * 0.3) {
        return {
            isValid: false,
            reason: 'Username contains too many special characters',
            suggestions: ['Use mostly letters and limit special characters']
        };
    }

    // Check for repeated characters (more than 3 in a row)
    if (/(.)\1{3,}/.test(lowerUsername)) {
        return {
            isValid: false,
            reason: 'Username contains too many repeated characters',
            suggestions: ['Avoid repeating the same character too many times']
        };
    }

    // All checks passed
    return {
        isValid: true
    };
}

export function checkContentNSFW(content: string): NSFWFilterResult {
    const lowerContent = content.toLowerCase();

    // Check for profanity
    for (const word of profanityList) {
        if (lowerContent.includes(word)) {
            return {
                isValid: false,
                reason: 'Content contains inappropriate language',
                suggestions: ['Please rephrase your message without inappropriate words']
            };
        }
    }

    // Check for slurs
    for (const word of slursList) {
        if (lowerContent.includes(word)) {
            return {
                isValid: false,
                reason: 'Content contains offensive terms',
                suggestions: ['Please use respectful language']
            };
        }
    }

    // Check for inappropriate terms (but be more lenient for content)
    const severeInappropriateTerms = [
        'pedo', 'pedophile', 'rapist', 'murderer', 'terrorist', 'extremist',
        'kill yourself', 'suicide', 'bomb', 'terrorist'
    ];

    for (const word of severeInappropriateTerms) {
        if (lowerContent.includes(word)) {
            return {
                isValid: false,
                reason: 'Content contains inappropriate content',
                suggestions: ['Please rephrase your message']
            };
        }
    }

    // All checks passed
    return {
        isValid: true
    };
}

export function generateUsernameSuggestions(baseUsername: string): string[] {
    const suggestions: string[] = [];
    const base = baseUsername.replace(/[^a-zA-Z]/g, '').toLowerCase();

    if (base.length >= 3) {
        suggestions.push(
            `${base}User`,
            `${base}Person`,
            `${base}Guy`,
            `${base}Gal`,
            `${base}Pro`,
            `${base}Dev`,
            `${base}Creator`,
            `${base}Builder`,
            `${base}Thinker`,
            `${base}Explorer`
        );
    }

    // Add some generic suggestions
    suggestions.push(
        'AnonymousUser',
        'MysteryPerson',
        'SecretAgent',
        'HiddenHero',
        'SilentObserver',
        'QuietThinker',
        'StealthUser',
        'ShadowWalker',
        'GhostWriter',
        'PhantomUser'
    );

    return suggestions.slice(0, 10); // Return max 10 suggestions
} 