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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Loading CV Curator...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Preparing your AI assistant
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
            {/* Floating Bubbles Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute w-64 h-64 bg-purple-700 dark:bg-purple-600 rounded-full opacity-30 dark:opacity-20 blur-2xl animate-float-slow top-[10%] left-[10%]" />
                <div className="absolute w-56 h-56 bg-purple-600 dark:bg-purple-500 rounded-full opacity-25 dark:opacity-15 blur-2xl animate-float-medium top-[40%] left-[60%]" />
                <div className="absolute w-72 h-72 bg-purple-400 dark:bg-purple-400 rounded-full opacity-25 dark:opacity-15 blur-2xl animate-float-fast bottom-[5%] left-[30%]" />
                <div className="absolute w-48 h-48 bg-purple-200 dark:bg-purple-300 rounded-full opacity-25 dark:opacity-15 blur-2xl animate-float-slow top-[70%] left-[80%]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                                    <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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
                                                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="bg-white/80 dark:bg-gray-900/80 text-black dark:text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white dark:hover:bg-gray-800 transition cursor-pointer">
                    Powered by{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
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