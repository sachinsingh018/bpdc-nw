'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { toast } from 'sonner';
import { ArrowUpIcon, StopIcon } from './icons';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface CVMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface CVChatProps {
    resumeText: string;
    onPromptSent: () => void;
    isLimitReached: boolean;
    dailyPromptCount: number;
}

export function CVChat({ resumeText, onPromptSent, isLimitReached, dailyPromptCount }: CVChatProps) {
    const [messages, setMessages] = useState<CVMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight();
        }
    }, [input]);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const resetHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = '98px';
        }
    };

    const generateId = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading || isLimitReached) return;

        const userMessage: CVMessage = {
            id: generateId(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        resetHeight();
        setIsLoading(true);
        onPromptSent();

        try {
            // Simulate AI response
            const aiResponse = await generateAIResponse(input.trim(), resumeText);

            const assistantMessage: CVMessage = {
                id: generateId(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            toast.error('Error generating response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateAIResponse = async (userPrompt: string, resumeText: string): Promise<string> => {
        try {
            const response = await fetch('/api/cv-curator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeText,
                    userPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data.reply || 'Sorry, I could not generate a response. Please try again.';
        } catch (error) {
            console.error('Error calling CV Curator API:', error);
            throw new Error('Failed to get AI response. Please try again.');
        }
    };

    const stopGeneration = () => {
        setIsLoading(false);
    };

    return (
        <div className="relative flex flex-col min-w-0 h-screen overflow-hidden bg-background">
            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                className="flex flex-col items-center w-full flex-1 overflow-y-auto p-4"
            >
                <div className="w-full max-w-3xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-xl space-y-4">
                    {messages.length === 0 && (
                        <div className="w-full flex justify-center">
                            <div className="text-center max-w-md">
                                <div className="mx-auto size-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                    <svg className="size-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Your Resume is Ready!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Ask me anything about your resume. I can help you:
                                </p>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div>• Improve your summary section</div>
                                    <div>• Enhance experience descriptions</div>
                                    <div>• Optimize your skills section</div>
                                    <div>• Format for better ATS compatibility</div>
                                    <div>• Add quantifiable achievements</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                                'flex gap-4 w-full',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {message.role === 'assistant' && (
                                <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                                    <div className="translate-y-px">
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            <div
                                className={cn(
                                    'flex flex-col gap-2 max-w-2xl',
                                    message.role === 'user' ? 'items-end' : 'items-start'
                                )}
                            >
                                <div
                                    className={cn(
                                        'rounded-2xl px-4 py-2 text-sm',
                                        message.role === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    )}
                                >
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 w-full justify-start">
                            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                                <div className="translate-y-px">
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                                <div className="flex space-x-1">
                                    <div className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="size-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing your resume...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />

            {/* Input Form */}
            <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl sticky bottom-0">
                {isLimitReached ? (
                    <div className="w-full flex justify-center px-4">
                        <div className="w-full max-w-3xl bg-[#0E0B1E] text-white text-center p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <p className="text-sm sm:text-base font-medium tracking-wide leading-snug sm:max-w-none w-full">
                                    🚫 You&apos;ve reached your daily 5-prompt limit for CV curation. Come back tomorrow for more AI-powered resume optimization!
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full items-end gap-2">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                tabIndex={0}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your resume... (e.g., 'Rewrite my summary section for data science')"
                                spellCheck={false}
                                className="min-h-[60px] w-full resize-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || isLoading}
                            onClick={handleSubmit}
                            className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10"
                        >
                            {isLoading ? (
                                <StopIcon size={16} />
                            ) : (
                                <ArrowUpIcon size={16} />
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
} 