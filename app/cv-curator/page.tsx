'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { CVChat } from '../../components/cv-chat';
import { toast } from 'sonner';

export default function CVCuratorPage() {
    const [resumeText, setResumeText] = useState<string>('');
    const [isResumeUploaded, setIsResumeUploaded] = useState(false);
    const [dailyPromptCount, setDailyPromptCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check daily prompt limit on component mount
    useEffect(() => {
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem('cvCuratorLastDate');
        const storedCount = localStorage.getItem('cvCuratorPromptCount');

        if (storedDate !== today) {
            // Reset daily count if it's a new day
            localStorage.setItem('cvCuratorLastDate', today);
            localStorage.setItem('cvCuratorPromptCount', '0');
            setDailyPromptCount(0);
        } else {
            // Load existing count for today
            setDailyPromptCount(parseInt(storedCount || '0'));
        }
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is PDF
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file only.');
            return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB.');
            return;
        }

        try {
            // Simulate PDF to text conversion
            const text = await convertPdfToText(file);
            setResumeText(text);
            setIsResumeUploaded(true);
            toast.success('Resume uploaded successfully! You can now ask questions about your CV.');
        } catch (error) {
            toast.error('Error processing PDF. Please try again.');
            console.error('PDF processing error:', error);
        }
    };

    const convertPdfToText = async (file: File): Promise<string> => {
        // TODO: Implement actual PDF to text conversion
        // For now, return dummy text
        return `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and Python. Passionate about clean code, user experience, and continuous learning.

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Mentored 3 junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer | StartupXYZ | 2019 - 2021
• Built full-stack web applications using React and Node.js
• Collaborated with cross-functional teams to deliver features on time
• Optimized database queries improving performance by 40%

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2019

SKILLS
Programming: JavaScript, TypeScript, Python, Java, SQL
Frameworks: React, Node.js, Express, Django, Spring Boot
Tools: Git, Docker, AWS, Jenkins, Jira
Cloud: AWS, Google Cloud Platform, Azure`;
    };

    const handlePromptCount = () => {
        const newCount = dailyPromptCount + 1;
        setDailyPromptCount(newCount);
        localStorage.setItem('cvCuratorPromptCount', newCount.toString());
    };

    const isLimitReached = dailyPromptCount >= 5;

    if (!mounted) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: `
                  radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
                  radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
                `
            }}>
                <div className="text-center">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">
                        Loading CV Curator...
                    </h2>
                    <p className="text-black font-medium">
                        Preparing your AI assistant
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
              radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
              linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
            `
        }}>
            {/* Dynamic Vibrant Background Elements */}
            <div className="fixed inset-0 z-0">
                {/* Deep Royal Blue */}
                <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                {/* Bright Golden Yellow */}
                <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                {/* Crimson Red */}
                <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                {/* Charcoal Black */}
                <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                {/* Light Gray */}
                <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                {/* Mid-tone Blue */}
                <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                {/* Warm Golden Glow */}
                <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                {/* Vibrant Red */}
                <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                {/* Neon Purple */}
                <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-black">
                                    📄 CV Curator
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Prompts today: {dailyPromptCount}/5
                                    </span>
                                    {isLimitReached && (
                                        <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full">
                                            Limit reached
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
                    {!isResumeUploaded ? (
                        <div className="flex-1 flex items-center justify-center px-4">
                            <div className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
                                <div className="text-center">
                                    <div className="mx-auto size-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                        <svg className="size-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-black mb-2">
                                        Upload Your Resume
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Upload your PDF resume to get started with AI-powered CV optimization
                                    </p>

                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full flex flex-col items-center justify-center space-y-2"
                                            >
                                                <svg className="size-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Click to upload PDF resume
                                                </span>
                                            </button>
                                        </div>

                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                            Only PDF files accepted • Max 10MB
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CVChat
                            resumeText={resumeText}
                            onPromptSent={handlePromptCount}
                            isLimitReached={isLimitReached}
                            dailyPromptCount={dailyPromptCount}
                        />
                    )}
                </div>
            </div>

            {/* Floating "Powered by Networkqy" Bubble */}
            <a
                href="https://www.networkqy.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50"
            >
                <div className="bg-white/80 dark:bg-gray-900/80 text-black dark:text-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white dark:hover:bg-gray-800 transition cursor-pointer">
                    Powered by{' '}
                    <span className="font-semibold text-gray-900 dark:text-black">
                        Networkqy
                    </span>
                </div>
            </a>

            {/* Animation styles */}
            <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }

        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
} 