'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Target, TrendingUp, MessageCircle } from 'lucide-react';
import { enhancedSystemPrompts, conversationTemplates, aiResponseEnhancers } from '@/lib/ai/enhanced-prompts';
import { ChatContext } from '@/lib/ai/enhanced-prompts';

interface EnhancedChatInputProps {
    onResponse?: (response: string) => void;
    currentUser?: any;
    userProfile?: {
        interests: string[];
        goals: string[];
        strengths: string[];
        industry: string;
        location: string;
        experienceLevel: string;
    };
}

export const EnhancedChatInput = ({
    onResponse,
    currentUser,
    userProfile
}: EnhancedChatInputProps) => {
    const [input, setInput] = useState("");
    const [placeholder, setPlaceholder] = useState("Ask me about networking, connections, or career advice...");
    const [index, setIndex] = useState(0);
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'general' | 'connection' | 'career' | 'networking'>('general');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const suggestions = [
        "Help me find connections in the tech industry...",
        "Suggest conversation starters for networking events...",
        "How can I improve my professional networking?",
        "What are the latest trends in my industry?",
        "Help me write a connection request message...",
    ];

    const quickActions = [
        {
            icon: <Users className="size-4" />,
            label: "Find Connections",
            action: "Find me 5 relevant professional connections in my industry",
            mode: 'connection' as const
        },
        {
            icon: <MessageCircle className="size-4" />,
            label: "Conversation Starters",
            action: "Generate 3 conversation starters for networking events",
            mode: 'networking' as const
        },
        {
            icon: <Target className="size-4" />,
            label: "Career Advice",
            action: "Give me career development advice based on my profile",
            mode: 'career' as const
        },
        {
            icon: <TrendingUp className="size-4" />,
            label: "Industry Insights",
            action: "What are the latest trends and opportunities in my industry?",
            mode: 'general' as const
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prevIndex => {
                const nextIndex = (prevIndex + 1) % suggestions.length;
                setPlaceholder(suggestions[nextIndex]);
                return nextIndex;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSend = async (customInput?: string) => {
        const message = customInput || input.trim();
        if (!message || loading) return;

        setLoading(true);
        setResponse("Thinking... 🔍");

        try {
            // Create chat context
            const context: ChatContext = {
                currentUser,
                userProfile,
                conversationHistory: [],
                recentConnections: [],
            };

            // Generate AI response based on selected mode
            let aiResponse = await generateAIResponse(message, context, selectedMode);

            // Enhance the response
            aiResponse = aiResponseEnhancers.addPersonality(aiResponse, context);
            aiResponse = aiResponseEnhancers.addNextSteps(aiResponse, selectedMode);
            aiResponse = aiResponseEnhancers.addEncouragement(aiResponse, userProfile?.goals);

            setResponse(aiResponse);
            onResponse?.(aiResponse);

        } catch (err) {
            console.error(err);
            setResponse("There was an error reaching the AI. Please try again.");
        }

        setLoading(false);
        if (!customInput) setInput("");
    };

    const generateAIResponse = async (message: string, context: ChatContext, mode: string): Promise<string> => {
        // Simulate AI response generation based on mode and context
        const lowerMessage = message.toLowerCase();

        if (mode === 'connection' || lowerMessage.includes('connection')) {
            return generateConnectionResponse(message, context);
        } else if (mode === 'networking' || lowerMessage.includes('networking')) {
            return generateNetworkingResponse(message, context);
        } else if (mode === 'career' || lowerMessage.includes('career')) {
            return generateCareerResponse(message, context);
        } else {
            return generateGeneralResponse(message, context);
        }
    };

    const generateConnectionResponse = (message: string, context: ChatContext): string => {
        const industry = context.userProfile?.industry || 'your industry';
        const interests = context.userProfile?.interests?.slice(0, 2).join(' and ') || 'professional networking';

        return `I'd love to help you find meaningful connections! 🚀

Based on your profile in ${industry} and interest in ${interests}, here are some strategies:

**Connection Finding Tips:**
• Focus on professionals with complementary skills to yours
• Look for people in similar career stages or industries
• Prioritize those with shared interests or goals
• Consider geographic proximity for in-person networking

**Next Steps:**
1. Use our AI matching engine to find relevant connections
2. Send personalized connection requests
3. Follow up within 24 hours
4. Suggest specific topics for discussion

Would you like me to help you craft a personalized connection request message? 💬`;
    };

    const generateNetworkingResponse = (message: string, context: ChatContext): string => {
        return `Great question about networking! 💪

**Effective Conversation Starters:**
• "What trends are you seeing in [industry]?"
• "What's the most exciting project you're working on?"
• "How did you get started in your field?"
• "What's the biggest challenge you're facing right now?"

**Networking Best Practices:**
• Be genuinely curious about others
• Share your own experiences and insights
• Follow up within 24 hours
• Offer value before asking for anything
• Keep conversations professional but warm

**Event Preparation:**
• Research attendees beforehand
• Prepare your 30-second pitch
• Set specific networking goals
• Bring business cards or digital contact info

Would you like me to help you prepare for a specific networking event? 🎯`;
    };

    const generateCareerResponse = (message: string, context: ChatContext): string => {
        const experience = context.userProfile?.experienceLevel || 'your current level';
        const goals = context.userProfile?.goals?.join(', ') || 'career growth';

        return `I'm excited to help with your career development! 📈

Based on your ${experience} experience and goals of ${goals}, here's my advice:

**Career Development Strategies:**
• Continuously develop new skills relevant to your industry
• Build a strong professional network
• Seek mentorship from experienced professionals
• Stay updated on industry trends and technologies
• Take on challenging projects to grow your expertise

**Skill Development:**
• Identify gaps in your current skill set
• Pursue relevant certifications or courses
• Practice new skills through side projects
• Seek feedback from colleagues and mentors

**Professional Branding:**
• Maintain an active and professional online presence
• Share your expertise through content creation
• Participate in industry discussions and events
• Build a reputation as a thought leader in your field

What specific aspect of your career would you like to focus on? 🎯`;
    };

    const generateGeneralResponse = (message: string, context: ChatContext): string => {
        return `I'm here to help you with all things professional networking! 🤝

**How I can assist you:**
• Find relevant professional connections
• Generate conversation starters and networking scripts
• Provide career development advice
• Share industry insights and trends
• Help with professional branding strategies

**Quick Actions:**
• Ask me to find connections in your industry
• Request conversation starters for networking events
• Get career advice based on your profile
• Learn about industry trends and opportunities

What would you like to focus on today? I'm here to help you build meaningful professional relationships! 💫`;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (action: string, mode: typeof selectedMode) => {
        setSelectedMode(mode);
        handleSend(action);
    };

    return (
        <motion.div
            className="relative max-w-5xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
        >
            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="flex flex-wrap gap-3 justify-center"
            >
                {quickActions.map((action, index) => (
                    <motion.button
                        key={action.label}
                        onClick={() => handleQuickAction(action.action, action.mode)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                    >
                        {action.icon}
                        {action.label}
                    </motion.button>
                ))}
            </motion.div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/40 to-purple-700/40 rounded-3xl blur-2xl opacity-60 animate-pulse z-0"></div>

            {/* Input area */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 p-4 sm:p-6 w-full border border-violet-500/50 rounded-3xl shadow-2xl bg-white/80 dark:bg-black/70 text-black dark:text-white backdrop-blur-2xl hover:border-violet-400/70 transition-all duration-300">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        className="w-full resize-none overflow-hidden p-3 min-w-0 bg-white/70 dark:bg-zinc-900/60 text-black dark:text-white placeholder-zinc-400 border border-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-400/60 rounded-2xl backdrop-blur-xl transition-all duration-200 text-sm sm:text-base md:text-lg font-medium pr-12"
                        aria-label="Enhanced chat input"
                    />
                    <div className="absolute right-3 top-3">
                        <Sparkles className="size-5 text-violet-500" />
                    </div>
                </div>

                <motion.button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    aria-disabled={!input.trim() || loading}
                    className={`px-6 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 shadow-lg flex items-center gap-2 ${!input.trim() || loading
                        ? "bg-zinc-900/50 text-zinc-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white hover:shadow-violet-500/30 hover:scale-105"
                        }`}
                    whileHover={!input.trim() || loading ? {} : { scale: 1.05 }}
                    whileTap={!input.trim() || loading ? {} : { scale: 0.98 }}
                >
                    <span>{loading ? "Thinking..." : "Send"}</span>
                    {!loading && <ArrowRight size={16} />}
                </motion.button>
            </div>

            {response && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative z-10 px-6 py-5 rounded-2xl bg-white/80 dark:bg-black/30 text-black dark:text-white backdrop-blur-xl border border-zinc-300/40 dark:border-zinc-700/40 shadow-lg text-sm sm:text-base font-medium leading-relaxed overflow-hidden"
                >
                    {/* Blurred background with response text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur-sm opacity-50 pointer-events-none" />

                    {/* Response content */}
                    <div className="relative z-10 whitespace-pre-wrap">
                        {response}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}; 