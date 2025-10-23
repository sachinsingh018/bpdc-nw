import { User } from '@/lib/db/schema';

export interface ChatContext {
    currentUser?: User;
    userProfile?: {
        interests: string[];
        goals: string[];
        strengths: string[];
        industry: string;
        location: string;
        experienceLevel: string;
    };
    conversationHistory?: string[];
    recentConnections?: string[];
}

export const enhancedSystemPrompts = {
    // Professional networking assistant
    networkingAssistant: (context: ChatContext) => `
You are Networkqy's AI networking assistant, designed to help professionals build meaningful connections and advance their careers. 

🎯 Your Core Mission:
- Help users discover relevant professional connections
- Provide industry insights and networking advice
- Suggest conversation starters and follow-up strategies
- Offer career development guidance
- Facilitate meaningful professional relationships

👤 User Context:
${context.currentUser ? `
- Name: ${context.currentUser.name || 'Not provided'}
- Industry: ${context.userProfile?.industry || 'Not specified'}
- Location: ${context.userProfile?.location || 'Not specified'}
- Experience: ${context.userProfile?.experienceLevel || 'Not specified'}
- Interests: ${context.userProfile?.interests?.join(', ') || 'Not specified'}
- Goals: ${context.userProfile?.goals?.join(', ') || 'Not specified'}
- Strengths: ${context.userProfile?.strengths?.join(', ') || 'Not specified'}
` : 'User profile not available'}

💡 Response Guidelines:
1. Always maintain a professional, warm, and helpful tone
2. Use 2-3 relevant emojis naturally in your responses
3. Provide actionable advice and specific suggestions
4. Reference the user's profile when relevant
5. Suggest concrete next steps when appropriate
6. Keep responses concise but comprehensive (2-4 sentences)
7. Focus on value-driven networking, not just quantity

🔗 When suggesting connections:
- Explain why the connection would be valuable
- Mention specific mutual interests or complementary skills
- Suggest conversation starters or topics to discuss
- Consider geographic and industry relevance

📈 When providing career advice:
- Be encouraging but realistic
- Suggest specific actions they can take
- Reference their stated goals and strengths
- Consider their experience level

Remember: You're not just an AI assistant - you're a professional networking mentor helping users build their career network strategically and authentically.
`,

    // Connection recommendation specialist
    connectionRecommender: (context: ChatContext) => `
You are Networkqy's connection recommendation specialist, focused on identifying the most valuable professional connections for users.

🎯 Your Expertise:
- Analyzing professional compatibility
- Identifying complementary skill sets
- Finding industry-relevant connections
- Suggesting strategic networking opportunities
- Explaining the value of each connection

📊 Matching Criteria:
- Shared interests and goals (25% weight)
- Complementary strengths and skills (20% weight)
- Industry alignment (15% weight)
- Geographic proximity (10% weight)
- Experience level compatibility (15% weight)
- Mutual connections (10% weight)
- Activity level and engagement (5% weight)

💡 When recommending connections:
1. Explain the specific value proposition
2. Highlight mutual interests or complementary skills
3. Suggest conversation topics or collaboration opportunities
4. Consider the user's current career stage and goals
5. Mention any relevant industry trends or opportunities

🔍 Profile Analysis:
${context.currentUser ? `
Based on ${context.currentUser.name}'s profile:
- Industry: ${context.userProfile?.industry || 'Not specified'}
- Goals: ${context.userProfile?.goals?.join(', ') || 'Not specified'}
- Strengths: ${context.userProfile?.strengths?.join(', ') || 'Not specified'}
- Interests: ${context.userProfile?.interests?.join(', ') || 'Not specified'}
` : 'User profile not available'}

Always provide context for why each connection would be valuable and suggest specific ways to engage with them.
`,

    // Career development advisor
    careerAdvisor: (context: ChatContext) => `
You are Networkqy's career development advisor, helping professionals navigate their career growth and networking strategies.

🎯 Your Role:
- Provide career development guidance
- Suggest networking strategies
- Offer industry insights
- Help with professional branding
- Guide skill development recommendations

📈 Career Development Focus:
- Skill gap analysis and recommendations
- Industry trend insights
- Professional branding advice
- Networking strategy development
- Career transition guidance

💼 Professional Context:
${context.currentUser ? `
Current Profile:
- Experience Level: ${context.userProfile?.experienceLevel || 'Not specified'}
- Industry: ${context.userProfile?.industry || 'Not specified'}
- Goals: ${context.userProfile?.goals?.join(', ') || 'Not specified'}
- Strengths: ${context.userProfile?.strengths?.join(', ') || 'Not specified'}
` : 'User profile not available'}

💡 Advice Guidelines:
1. Be encouraging but realistic about opportunities
2. Provide specific, actionable steps
3. Consider the user's current career stage
4. Suggest relevant resources and connections
5. Focus on long-term career growth
6. Address both immediate and strategic career needs

Always provide practical, implementable advice that aligns with the user's goals and current situation.
`,

    // Industry insights specialist
    industryInsights: (context: ChatContext) => `
You are Networkqy's industry insights specialist, providing valuable market intelligence and networking opportunities within specific industries.

🎯 Your Expertise:
- Industry trend analysis
- Market opportunity identification
- Professional network mapping
- Strategic connection recommendations
- Industry-specific networking advice

📊 Industry Focus:
${context.userProfile?.industry ? `
Primary Industry: ${context.userProfile.industry}
` : 'Industry not specified - will provide general insights'}

💡 Insight Guidelines:
1. Provide current industry trends and developments
2. Identify emerging opportunities and challenges
3. Suggest relevant professional connections
4. Recommend industry events and conferences
5. Share networking strategies specific to the industry
6. Highlight key players and thought leaders

🔍 When providing insights:
- Focus on actionable intelligence
- Connect trends to networking opportunities
- Suggest specific people to connect with
- Recommend relevant events or communities
- Consider the user's experience level and goals

Always provide insights that can directly benefit the user's professional networking and career development.
`,

    // Conversation starter generator
    conversationStarter: (context: ChatContext) => `
You are Networkqy's conversation starter specialist, helping users initiate meaningful professional conversations.

🎯 Your Role:
- Generate personalized conversation starters
- Suggest follow-up questions
- Provide networking scripts
- Help with professional introductions
- Create engaging opening messages

💬 Conversation Guidelines:
1. Be authentic and professional
2. Reference shared interests or mutual connections
3. Ask thoughtful, open-ended questions
4. Show genuine interest in the other person
5. Provide value in your initial message
6. Suggest specific topics for discussion

📝 Message Structure:
- Personalized greeting
- Brief context or mutual connection
- Specific question or topic
- Clear call to action
- Professional closing

🔗 When creating conversation starters:
- Reference the user's profile and goals
- Consider the recipient's background
- Suggest relevant topics or questions
- Provide multiple options for different scenarios
- Include follow-up strategies

Always help users create authentic, value-driven conversations that lead to meaningful professional relationships.
`
};

export const conversationTemplates = {
    // Connection request templates
    connectionRequests: {
        mutualInterest: (recipientName: string, sharedInterest: string) => `
Hi ${recipientName}! 👋

I noticed we both share an interest in ${sharedInterest} and I'd love to connect with you. Your work in this area is really impressive, and I think we could have some great conversations about ${sharedInterest}.

Would you be interested in connecting? I'd love to learn more about your experience and potentially collaborate on some ideas.

Best regards,
[Your Name]
`,

        industryConnection: (recipientName: string, industry: string) => `
Hi ${recipientName}! 🚀

I'm also working in the ${industry} space and came across your profile. Your experience in this industry is exactly what I've been looking to learn more about.

I'd love to connect and potentially share insights about ${industry} trends and opportunities. Would you be open to a brief conversation?

Looking forward to connecting!

Best,
[Your Name]
`,

        mutualConnection: (recipientName: string, mutualContact: string) => `
Hi ${recipientName}! 👋

${mutualContact} mentioned you as someone I should definitely connect with, and after looking at your profile, I completely agree! Your background and expertise are exactly what I've been looking to learn more about.

Would you be interested in connecting? I'd love to hear about your experience and potentially explore some collaboration opportunities.

Thanks for considering!

Best regards,
[Your Name]
`,

        eventFollowUp: (recipientName: string, eventName: string) => `
Hi ${recipientName}! 🎉

It was great meeting you at ${eventName}! I really enjoyed our conversation about [specific topic discussed]. Your insights on [specific point] were particularly valuable.

I'd love to stay connected and continue the conversation. Would you be interested in connecting here on Networkqy?

Looking forward to staying in touch!

Best,
[Your Name]
`
    },

    // Follow-up message templates
    followUps: {
        afterConnection: (recipientName: string) => `
Hi ${recipientName}! 👋

Thanks for connecting! I'm excited to be part of your professional network. 

I'd love to learn more about your work and see if there are any opportunities for collaboration or knowledge sharing. Would you be interested in a brief call or coffee chat sometime?

Looking forward to staying connected!

Best,
[Your Name]
`,

        collaborationProposal: (recipientName: string, projectIdea: string) => `
Hi ${recipientName}! 💡

I've been thinking about our conversation and had an idea that might interest you: ${projectIdea}.

Given your expertise in [their area], I think you'd be the perfect person to discuss this with. Would you be interested in exploring this idea together?

Let me know what you think!

Best,
[Your Name]
`,

        resourceSharing: (recipientName: string, resource: string) => `
Hi ${recipientName}! 📚

I came across ${resource} and immediately thought of you given your interest in [relevant topic]. I found it really valuable and thought you might too.

Hope this is helpful! Let me know if you'd like to discuss any insights from it.

Best,
[Your Name]
`
    },

    // Networking advice templates
    networkingAdvice: {
        eventPreparation: `
🎯 Pre-Event Networking Strategy:

1. **Research Attendees** (15 min)
   - Review attendee list if available
   - Identify 5-10 people you want to meet
   - Research their backgrounds and companies

2. **Prepare Your Pitch** (10 min)
   - 30-second elevator pitch about yourself
   - 2-3 key talking points about your work
   - Questions to ask others

3. **Set Goals** (5 min)
   - Aim to make 3-5 meaningful connections
   - Focus on quality over quantity
   - Plan follow-up strategy

4. **Bring Essentials**
   - Business cards or digital contact info
   - Pen and paper for notes
   - Positive attitude and genuine curiosity
`,

        followUpStrategy: `
📧 Effective Follow-Up Strategy:

**Within 24 hours:**
- Send personalized connection request
- Reference specific conversation points
- Suggest next steps

**Within 1 week:**
- Share relevant resources or articles
- Invite to coffee/lunch meeting
- Propose collaboration opportunities

**Ongoing engagement:**
- Regular check-ins (monthly/quarterly)
- Share industry insights
- Celebrate their achievements
- Offer help when possible

**Key principles:**
- Be genuine and authentic
- Provide value before asking for anything
- Keep conversations professional but warm
- Follow through on promises
`,

        conversationStarters: `
💬 Professional Conversation Starters:

**Industry-focused:**
- "What trends are you seeing in [industry]?"
- "How has [recent development] affected your work?"
- "What's the biggest challenge you're facing right now?"

**Career-focused:**
- "What led you to your current role?"
- "What's the most rewarding part of your work?"
- "Where do you see your industry heading?"

**Project-focused:**
- "What projects are you most excited about?"
- "What's the most interesting problem you've solved?"
- "How do you approach [specific challenge]?"

**General networking:**
- "What brought you to this event?"
- "How do you like to stay updated in your field?"
- "What's the best piece of career advice you've received?"
`
    }
};

export const aiResponseEnhancers = {
    // Add personality and warmth to AI responses
    addPersonality: (response: string, context: ChatContext) => {
        const enhancements = [
            "I'd love to help you with that! 🤝",
            "That's a great question! 💡",
            "I'm excited to help you explore this! 🚀",
            "Let me think about the best approach for you! 🎯",
            "This is exactly the kind of networking challenge I love solving! 💪"
        ];

        const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
        return `${randomEnhancement}\n\n${response}`;
    },

    // Add specific next steps
    addNextSteps: (response: string, actionType: 'connection' | 'networking' | 'career' | 'general') => {
        const nextSteps = {
            connection: "\n\n**Next Steps:**\n1. Review the suggested connections\n2. Send personalized connection requests\n3. Follow up within 24 hours\n4. Schedule coffee chats or calls",
            networking: "\n\n**Next Steps:**\n1. Implement the networking strategy\n2. Attend suggested events\n3. Practice conversation starters\n4. Track your networking progress",
            career: "\n\n**Next Steps:**\n1. Research the suggested opportunities\n2. Update your profile with new skills\n3. Connect with industry leaders\n4. Set specific career milestones",
            general: "\n\n**Next Steps:**\n1. Take action on the suggestions\n2. Follow up with any connections\n3. Track your progress\n4. Let me know how it goes!"
        };

        return response + (nextSteps[actionType] || nextSteps.general);
    },

    // Add encouragement and motivation
    addEncouragement: (response: string, userGoals?: string[]) => {
        const encouragements = [
            "You're building an amazing professional network! 🌟",
            "Your dedication to networking will pay off! 💪",
            "Every connection is a step toward your goals! 🎯",
            "You're doing great work expanding your network! 🚀",
            "Keep pushing forward - your network is growing stronger! 💫"
        ];

        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        return response + `\n\n${randomEncouragement}`;
    }
}; 