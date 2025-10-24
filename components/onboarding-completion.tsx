'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    User,
    Target,
    Star,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Edit,
    Sparkles
} from 'lucide-react';

interface ProfileCompletionData {
    basicInfo: boolean;
    profile: boolean;
    goals: boolean;
    professional: boolean;
    additional: boolean;
}

interface OnboardingCompletionProps {
    profileData: ProfileCompletionData;
    onCompleteProfile: () => void;
    onSkip: () => void;
}

const completionSteps = [
    { key: 'basicInfo', label: 'Basic Information', icon: User, description: 'Name, email, and contact details' },
    { key: 'profile', label: 'Profile Details', icon: User, description: 'Bio, photo, and LinkedIn profile' },
    { key: 'goals', label: 'Goals & Interests', icon: Target, description: 'Your networking goals and strengths' },
    { key: 'professional', label: 'Professional Info', icon: Star, description: 'Work experience and skills' },
    { key: 'additional', label: 'Additional Details', icon: Sparkles, description: 'Education and certifications' },
];

export function OnboardingCompletion({
    profileData,
    onCompleteProfile,
    onSkip
}: OnboardingCompletionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const completedSteps = Object.values(profileData).filter(Boolean).length;
    const totalSteps = Object.keys(profileData).length;
    const completionPercentage = (completedSteps / totalSteps) * 100;

    const getStepStatus = (stepKey: keyof ProfileCompletionData) => {
        return profileData[stepKey] ? 'completed' : 'pending';
    };

    const getStepIcon = (stepKey: keyof ProfileCompletionData) => {
        const status = getStepStatus(stepKey);
        const step = completionSteps.find(s => s.key === stepKey);

        if (!step) return null;

        if (status === 'completed') {
            return <CheckCircle className="size-5 text-green-500" />;
        }
        return <step.icon className="size-5 text-gray-400" />;
    };

    const getStepColor = (stepKey: keyof ProfileCompletionData) => {
        const status = getStepStatus(stepKey);
        return status === 'completed'
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-600 dark:text-gray-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <Sparkles className="size-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Complete Your Profile
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {completedSteps} of {totalSteps} sections completed
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                            {isExpanded ? '−' : '+'}
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Profile Completion
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(completionPercentage)}%
                            </span>
                        </div>
                        <Progress value={completionPercentage} />
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {/* Completion Status */}
                    {completionPercentage === 100 ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
                                <div>
                                    <h4 className="font-medium text-green-800 dark:text-green-200">
                                        Profile Complete! 🎉
                                    </h4>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Your profile is fully set up and ready to help you make meaningful connections.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="size-6 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h4 className="font-medium text-amber-800 dark:text-amber-200">
                                        Profile Incomplete
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        Complete your profile to get better matches and recommendations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expandable Steps */}
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                        >
                            {completionSteps.map((step) => {
                                const status = getStepStatus(step.key as keyof ProfileCompletionData);
                                const isCompleted = status === 'completed';

                                return (
                                    <div
                                        key={step.key}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCompleted
                                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {getStepIcon(step.key as keyof ProfileCompletionData)}
                                        <div className="flex-1">
                                            <h5 className={`font-medium ${getStepColor(step.key as keyof ProfileCompletionData)}`}>
                                                {step.label}
                                            </h5>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {step.description}
                                            </p>
                                        </div>
                                        {isCompleted ? (
                                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                Complete
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        {completionPercentage < 100 ? (
                            <>
                                <Button
                                    onClick={onCompleteProfile}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                                >
                                    <Edit className="size-4 mr-2" />
                                    Complete Profile
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={onSkip}
                                    className="flex-1"
                                >
                                    Skip for Now
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={onCompleteProfile}
                                variant="outline"
                                className="flex-1"
                            >
                                <Edit className="size-4 mr-2" />
                                Update Profile
                            </Button>
                        )}
                    </div>

                    {/* Benefits */}
                    {completionPercentage < 100 && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                Why complete your profile?
                            </h5>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• Get better AI-powered connection recommendations</li>
                                <li>• Increase your visibility to potential collaborators</li>
                                <li>• Receive more relevant opportunities and matches</li>
                                <li>• Build trust with other professionals</li>
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
} 