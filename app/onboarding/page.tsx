'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { toast } from '@/components/toast';
import { useSession } from 'next-auth/react';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    Lock,
    Linkedin,
    Target,
    Star,
    Heart,
    Upload,
    CheckCircle,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const isEmailDomainValid = async (email: string): Promise<boolean> => {
    try {
        const res = await fetch(`https://disify.com/api/email/${email}`);
        const data = await res.json();

        if (data.whitelist === true) return true;
        if (data.format !== true || data.dns !== true) return false;
        if (data.disposable === true) return false;
        return true;
    } catch (err) {
        console.error('Email verification failed:', err);
        return true;
    }
};

interface OnboardingData {
    // Step 1: Basic Info
    firstName: string;
    lastName: string;
    email: string;
    password: string;

    // Step 2: Profile
    bio: string;
    linkedin: string;
    profilePic: File | null;

    // Step 3: Goals & Interests
    goal: string;
    strengths: string[];
    interests: string[];

    // Step 4: Professional Details
    experience: string;
    location: string;
    company: string;
    title: string;

    // Step 5: Preferences
    referral: string;
    notifications: boolean;
    visibility: 'public' | 'private';
}

const goalOptions = [
    { value: 'hiring', label: 'Hiring', icon: '👥' },
    { value: 'cofounder', label: 'Find Co-founder', icon: '🤝' },
    { value: 'funding', label: 'Raise Funding', icon: '💰' },
    { value: 'mentorship', label: 'Seek Mentorship', icon: '🎓' },
    { value: 'network', label: 'Build Network', icon: '🌐' },
    { value: 'opportunities', label: 'Job Opportunities', icon: '💼' },
    { value: 'mentor', label: 'Mentor Others', icon: '📚' },
    { value: 'brand', label: 'Personal Brand', icon: '⭐' },
];

const strengthOptions = [
    'Leadership', 'Product Management', 'Technical Expertise', 'Sales',
    'Marketing', 'Finance', 'Design', 'Strategy', 'Operations', 'Research'
];

const interestOptions = [
    'AI & Machine Learning', 'Blockchain', 'Sustainability', 'Fintech',
    'Healthtech', 'Edtech', 'E-commerce', 'SaaS', 'Mobile Apps', 'Web3'
];

export default function OnboardingPage() {
    const router = useRouter();
    const { setTheme, theme } = useTheme();
    const { data: session, status } = useSession();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    const [formData, setFormData] = useState<OnboardingData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        bio: '',
        linkedin: '',
        profilePic: null,
        goal: '',
        strengths: [],
        interests: [],
        experience: '',
        location: '',
        company: '',
        title: '',
        referral: '',
        notifications: true,
        visibility: 'public',
    });

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Handle Google user data
    useEffect(() => {
        if (session?.user && session.user.email) {
            setIsGoogleUser(true);
            // Pre-fill email for Google users
            const user = session.user;
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
            }));
        }
    }, [session]);

    const updateFormData = (field: keyof OnboardingData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData('profilePic', file);
        }
    };

    const toggleArrayField = (field: 'strengths' | 'interests', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                const basicInfoValid = !!(formData.firstName && formData.email);
                if (isGoogleUser) {
                    return basicInfoValid; // Skip password validation for Google users
                }
                return basicInfoValid && !!formData.password;
            case 2:
                return !!(formData.bio && formData.bio.length >= 30);
            case 3:
                return !!(formData.goal && formData.strengths.length > 0);
            case 4:
                return true;
            case 5:
                return true; // Optional step
            default:
                return false;
        }
    };

    const nextStep = async () => {
        if (!validateStep(currentStep)) {
            toast({
                type: 'error',
                description: 'Please complete all required fields before continuing.',
            });
            return;
        }

        if (currentStep === 1) {
            const isEmailOk = await isEmailDomainValid(formData.email);
            if (!isEmailOk) {
                toast({
                    type: 'error',
                    description: 'Please enter a valid email address.',
                });
                return;
            }
        }

        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        } else {
            await handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            if (isGoogleUser) {
                // Handle Google user - update existing user
                const response = await fetch('/api/update-google-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        name: `${formData.firstName} ${formData.lastName}`,
                        linkedinInfo: formData.bio || '',
                        goals: formData.goal,
                        profilemetrics: formData.experience || '',
                        strengths: formData.strengths.join(', '),
                        interests: formData.interests.join(', '),
                        linkedinURL: formData.linkedin || '',
                        phone: '',
                        referral_code: formData.referral || '',
                    }),
                });

                if (response.ok) {
                    toast({
                        type: 'success',
                        description: 'Profile updated successfully! Welcome to Networkqy!',
                    });

                    // Redirect to profile page
                    setTimeout(() => {
                        router.push('/profile');
                    }, 1500);
                } else {
                    throw new Error('Failed to update profile');
                }
            } else {
                // Handle regular user registration
                const registrationFormData = new FormData();
                registrationFormData.append('name', `${formData.firstName} ${formData.lastName}`);
                registrationFormData.append('email', formData.email);
                registrationFormData.append('password', formData.password);
                registrationFormData.append('linkedin-info', formData.bio || '');
                registrationFormData.append('goals', formData.goal);
                registrationFormData.append('profilemetrics', formData.experience || '');
                registrationFormData.append('strengths', formData.strengths.join(', '));
                registrationFormData.append('interests', formData.interests.join(', '));
                registrationFormData.append('linkedinURL', formData.linkedin || '');
                registrationFormData.append('phone', '');
                registrationFormData.append('referral_code', formData.referral || '');

                // Import the register function
                const { register } = await import('../(auth)/actions');

                const result = await register({ status: 'idle' }, registrationFormData);

                if (result.status === 'success') {
                    // Store onboarding data for dashboard
                    sessionStorage.setItem('onboardingForm', JSON.stringify(formData));

                    // Set user email cookie
                    const { setCookie } = await import('cookies-next');
                    setCookie('userEmail', formData.email, {
                        path: '/',
                        maxAge: 60 * 60 * 24 * 15, // 15 days
                    });

                    toast({
                        type: 'success',
                        description: 'Account created successfully! Welcome to Networkqy!',
                    });

                    // Redirect to matches page
                    setTimeout(() => {
                        router.push('/matches');
                    }, 1500);
                } else if (result.status === 'user_exists') {
                    toast({
                        type: 'error',
                        description: 'An account with this email already exists!',
                    });
                } else if (result.status === 'invalid_data') {
                    toast({
                        type: 'error',
                        description: 'Please fill all required fields correctly.',
                    });
                } else {
                    toast({
                        type: 'error',
                        description: 'Registration failed. Please try again.',
                    });
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                type: 'error',
                description: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const progressPercentage = (currentStep / 5) * 100;

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Let&apos;s get started</h2>
                            <p className="text-gray-600 dark:text-gray-400">Tell us about yourself</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => updateFormData('firstName', e.target.value)}
                                    placeholder="John"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => updateFormData('lastName', e.target.value)}
                                    placeholder="Doe"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                    placeholder="john@example.com"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {!isGoogleUser && (
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => updateFormData('password', e.target.value)}
                                        placeholder="Create a secure password"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

            case 2:
                setCurrentStep(3);
                return null;

            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Your Goals & Strengths</h2>
                            <p className="text-gray-600 dark:text-gray-400">What brings you to Networkqy?</p>
                        </div>

                        <div>
                            <Label>What&apos;s your main goal? *</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                {goalOptions.map((goal) => (
                                    <button
                                        key={goal.value}
                                        type="button"
                                        onClick={() => updateFormData('goal', goal.value)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${formData.goal === goal.value
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{goal.icon}</div>
                                        <div className="font-medium">{goal.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Your Top Strengths *</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {strengthOptions.map((strength) => (
                                    <button
                                        key={strength}
                                        type="button"
                                        onClick={() => toggleArrayField('strengths', strength)}
                                        className={`p-3 rounded-lg border text-sm transition-all ${formData.strengths.includes(strength)
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        {strength}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>Areas of Interest</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {interestOptions.map((interest) => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleArrayField('interests', interest)}
                                        className={`p-3 rounded-lg border text-sm transition-all ${formData.interests.includes(interest)
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Education or Work Details (Optional)</h2>
                            <p className="text-gray-600 dark:text-gray-400">Add your university or work experience (optional)</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Job Title (Optional)</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => updateFormData('title', e.target.value)}
                                    placeholder="Software Engineer or Student"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="company">Company or University (Optional)</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => updateFormData('company', e.target.value)}
                                    placeholder="Tech Corp or University Name"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="experience">Years of Experience (Optional)</Label>
                            <select
                                id="experience"
                                value={formData.experience}
                                onChange={(e) => updateFormData('experience', e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="">Select experience level</option>
                                <option value="0-1">0-1 years</option>
                                <option value="2-3">2-3 years</option>
                                <option value="4-6">4-6 years</option>
                                <option value="7-10">7-10 years</option>
                                <option value="10+">10+ years</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => updateFormData('location', e.target.value)}
                                placeholder="San Francisco, CA"
                                className="mt-1"
                            />
                        </div>
                    </motion.div>
                );

            case 5:
                return (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Almost Done!</h2>
                            <p className="text-gray-600 dark:text-gray-400">Final preferences</p>
                        </div>

                        <div>
                            <Label htmlFor="referral">Referral Code (Optional)</Label>
                            <Input
                                id="referral"
                                value={formData.referral}
                                onChange={(e) => updateFormData('referral', e.target.value)}
                                placeholder="Enter 5-digit code"
                                maxLength={5}
                                className="mt-1"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div>
                                    <Label className="text-base font-medium">Email Notifications</Label>
                                    <p className="text-sm text-gray-500">Receive updates about new connections</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateFormData('notifications', !formData.notifications)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.notifications ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.notifications ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div>
                                    <Label className="text-base font-medium">Profile Visibility</Label>
                                    <p className="text-sm text-gray-500">Make your profile visible to others</p>
                                </div>
                                <select
                                    value={formData.visibility}
                                    onChange={(e) => updateFormData('visibility', e.target.value as 'public' | 'private')}
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Step {currentStep} of 5
                            </span>
                            <span className="text-sm text-gray-500">
                                {Math.round(progressPercentage)}% Complete
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Form Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl p-8"
                    >
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    'Processing...'
                                ) : currentStep === 5 ? (
                                    <>
                                        Complete Setup
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Theme Toggle */}
                    {hasMounted && (
                        <div className="flex justify-center mt-6">
                            <button
                                type="button"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg hover:shadow-xl transition-all"
                            >
                                {theme === 'dark' ? (
                                    <>
                                        <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                                        Light Mode
                                    </>
                                ) : (
                                    <>
                                        <div className="w-4 h-4 bg-gray-600 rounded-full" />
                                        Dark Mode
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <span className="text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline"
                            >
                                Sign in
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}