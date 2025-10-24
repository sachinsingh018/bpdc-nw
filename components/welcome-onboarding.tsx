'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    MessageSquare,
    Target,
    Star,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    X,
    CheckCircle,
    MapPin,
    Briefcase,
    Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WelcomeOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Networkqy! 🎉',
        description: 'Your global professional networking platform for meaningful connections worldwide.',
        icon: Sparkles,
        content: (
            <div className="text-center space-y-4">
                <div className="size-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="size-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Let&apos;s get you started!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Networkqy helps you connect with professionals worldwide, find opportunities, and grow your global network in the vibrant international business ecosystem.
                </p>
            </div>
        )
    },
    {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'A complete profile helps you get better matches and connections.',
        icon: Star,
        content: (
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="size-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Star className="size-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Why complete your profile?</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Better matches, more connections, increased visibility</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h5 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ What to include:</h5>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <li>• Professional summary</li>
                            <li>• Skills & expertise</li>
                            <li>• Career goals</li>
                            <li>• Industry interests</li>
                            <li>• Contact information</li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🎯 Benefits:</h5>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• 3x more profile views</li>
                            <li>• Better AI matching</li>
                            <li>• More connection requests</li>
                            <li>• Global recommendations</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'matching',
        title: 'Smart Matching',
        description: 'Our AI finds the best connections based on your profile and preferences.',
        icon: Target,
        content: (
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="size-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Target className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">How matching works</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered recommendations based on multiple factors</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="size-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <MapPin className="size-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">Location</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Global & local focus</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="size-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <Briefcase className="size-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">Industry</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Professional alignment</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="size-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <Heart className="size-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">Interests</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Shared passions & goals</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Match Types:</h5>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="size-3 bg-blue-500 rounded-full" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Industry matches</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="size-3 bg-green-500 rounded-full" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Location-based</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="size-3 bg-purple-500 rounded-full" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Skill alignment</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="size-3 bg-orange-500 rounded-full" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Goal-oriented</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'connections',
        title: 'Building Connections',
        description: 'Connect with professionals and grow your network.',
        icon: Users,
        content: (
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="size-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Users className="size-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">How to connect</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Simple steps to build your professional network</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                        <div className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
                            1
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Browse Recommendations</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Visit the Friends page to see AI-curated matches</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
                            2
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Send Connection Request</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Click &quot;Connect&quot; with a personalized message</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="size-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-1">
                            3
                        </div>
                        <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Manage Connections</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">View pending requests and existing connections</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Pro Tips:</h5>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Personalize your connection messages</li>
                        <li>• Respond to connection requests promptly</li>
                        <li>• Keep your profile updated</li>
                        <li>• Engage with your network regularly</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 'chat',
        title: 'AI-Powered Chat',
        description: 'Get help, insights, and recommendations through our intelligent chat.',
        icon: MessageSquare,
        content: (
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="size-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <MessageSquare className="size-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Chat with AI Assistant</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Get personalized help and insights</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h5 className="font-medium text-gray-900 dark:text-white">What you can do:</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="size-4 text-green-500" />
                                <span>Get networking advice</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="size-4 text-green-500" />
                                <span>Profile optimization tips</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="size-4 text-green-500" />
                                <span>Industry insights</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <CheckCircle className="size-4 text-green-500" />
                                <span>Connection suggestions</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-2">🚀 Getting Started:</h5>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            Visit the Chat page and start a conversation with our AI assistant. Ask about networking strategies, profile tips, or any questions about the platform.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
];

export function WelcomeOnboarding({ isOpen, onClose, onComplete }: WelcomeOnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const router = useRouter();

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        onComplete();
        onClose();
    };

    const skipOnboarding = () => {
        onComplete();
        onClose();
    };

    if (!isOpen) return null;

    const currentStepData = ONBOARDING_STEPS[currentStep];
    const progressPercentage = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Sparkles className="size-6" />
                            <h2 className="text-xl font-bold">Welcome to Networkqy</h2>
                        </div>
                        <button
                            type="button"
                            onClick={skipOnboarding}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="size-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                            <motion.div
                                className="bg-white h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {currentStepData.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {currentStepData.description}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentStepData.content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            <span>Previous</span>
                        </button>

                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={skipOnboarding}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                Skip
                            </button>

                            {currentStep < ONBOARDING_STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    <span>Next</span>
                                    <ArrowRight className="size-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleComplete}
                                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <CheckCircle className="size-4" />
                                    <span>Get Started</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
} 