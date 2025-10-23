'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    Linkedin,
    Target,
    Star,
    Upload,
    CheckCircle,
    ArrowRight,
    Sparkles,
    MapPin,
    Building,
    Briefcase,
    Award
} from 'lucide-react';

interface ProfileData {
    // Basic Info
    firstName: string;
    lastName: string;
    email: string;

    // Profile
    bio: string;
    linkedin: string;
    profilePic: File | null;

    // Goals & Interests
    goal: string;
    strengths: string[];
    interests: string[];

    // Professional Details
    experience: string;
    location: string;
    company: string;
    title: string;

    // Additional Info
    skills: string[];
    education: string;
    certifications: string[];
}

interface ProfileCompletionWizardProps {
    initialData?: Partial<ProfileData>;
    onComplete: (data: ProfileData) => void;
    onCancel?: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const goalOptions = [
    { value: 'hiring', label: 'Hiring', icon: '👥', description: 'Looking to build my team' },
    { value: 'cofounder', label: 'Find Co-founder', icon: '🤝', description: 'Seeking a business partner' },
    { value: 'funding', label: 'Raise Funding', icon: '💰', description: 'Looking for investors' },
    { value: 'mentorship', label: 'Seek Mentorship', icon: '🎓', description: 'Want to learn from experts' },
    { value: 'network', label: 'Build Network', icon: '🌐', description: 'Expand my professional network' },
    { value: 'opportunities', label: 'Job Opportunities', icon: '💼', description: 'Exploring new roles' },
    { value: 'mentor', label: 'Mentor Others', icon: '📚', description: 'Share my expertise' },
    { value: 'brand', label: 'Personal Brand', icon: '⭐', description: 'Build my personal brand' },
];

const strengthOptions = [
    'Leadership', 'Product Management', 'Technical Expertise', 'Sales',
    'Marketing', 'Finance', 'Design', 'Strategy', 'Operations', 'Research',
    'Customer Success', 'Data Analysis', 'Project Management', 'Innovation'
];

const interestOptions = [
    'AI & Machine Learning', 'Blockchain', 'Sustainability', 'Fintech',
    'Healthtech', 'Edtech', 'E-commerce', 'SaaS', 'Mobile Apps', 'Web3',
    'Cybersecurity', 'Cloud Computing', 'IoT', 'AR/VR', 'Clean Energy'
];

const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
    'SQL', 'MongoDB', 'GraphQL', 'TypeScript', 'Vue.js', 'Angular',
    'Kubernetes', 'Terraform', 'Jenkins', 'Git', 'REST APIs'
];

export function ProfileCompletionWizard({
    initialData = {},
    onComplete,
    onCancel,
    isOpen,
    onClose
}: ProfileCompletionWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        email: '',
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
        skills: [],
        education: '',
        certifications: [],
        ...initialData
    });

    const updateFormData = (field: keyof ProfileData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData('profilePic', file);
        }
    };

    const toggleArrayField = (field: 'strengths' | 'interests' | 'skills' | 'certifications', value: string) => {
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
                return !!(formData.firstName && formData.email);
            case 2:
                return !!(formData.bio && formData.bio.length >= 30);
            case 3:
                return !!(formData.goal && formData.strengths.length > 0);
            case 4:
                return !!(formData.experience && formData.location);
            case 5:
                return true; // Optional step
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) {
            return false;
        }
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
        return true;
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await onComplete(formData);
            onClose();
        } catch (error) {
            console.error('Error completing profile:', error);
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
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Basic Information</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Let&apos;s start with your details</p>
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
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Your Profile</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Help others get to know you</p>
                        </div>

                        <div className="text-center">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                                    {formData.profilePic ? (
                                        <img
                                            src={URL.createObjectURL(formData.profilePic)}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <Upload className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute inset-0 cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">Click to upload profile picture</p>
                        </div>

                        <div>
                            <Label htmlFor="bio">About You *</Label>
                            <textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => updateFormData('bio', e.target.value)}
                                placeholder="Tell us about yourself, your experience, and what you&apos;re passionate about..."
                                rows={3}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none text-sm"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500">
                                    {formData.bio.length}/500 characters
                                </span>
                                {formData.bio.length >= 30 && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="linkedin">LinkedIn Profile</Label>
                            <div className="relative mt-1">
                                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="linkedin"
                                    value={formData.linkedin}
                                    onChange={(e) => updateFormData('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Goals & Strengths</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">What brings you to Networkqy?</p>
                        </div>

                        <div>
                            <Label>What&apos;s your main goal? *</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                {goalOptions.map((goal) => (
                                    <button
                                        key={goal.value}
                                        type="button"
                                        onClick={() => updateFormData('goal', goal.value)}
                                        className={`p-3 rounded-lg border-2 text-left transition-all text-sm ${formData.goal === goal.value
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="text-lg mb-1">{goal.icon}</div>
                                        <div className="font-medium">{goal.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{goal.description}</div>
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
                                        className={`p-2 rounded-lg border text-xs transition-all ${formData.strengths.includes(strength)
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
                                        className={`p-2 rounded-lg border text-xs transition-all ${formData.interests.includes(interest)
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
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Professional Details</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Your work experience</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="title">Job Title *</Label>
                                <div className="relative mt-1">
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => updateFormData('title', e.target.value)}
                                        placeholder="Software Engineer"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="company">Company</Label>
                                <div className="relative mt-1">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => updateFormData('company', e.target.value)}
                                        placeholder="Tech Corp"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="experience">Years of Experience *</Label>
                            <select
                                id="experience"
                                value={formData.experience}
                                onChange={(e) => updateFormData('experience', e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
                            <Label htmlFor="location">Location *</Label>
                            <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => updateFormData('location', e.target.value)}
                                    placeholder="San Francisco, CA"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Technical Skills</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {skillOptions.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => toggleArrayField('skills', skill)}
                                        className={`p-2 rounded-lg border text-xs transition-all ${formData.skills.includes(skill)
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
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
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Additional Information</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Optional details to enhance your profile</p>
                        </div>

                        <div>
                            <Label htmlFor="education">Education</Label>
                            <Input
                                id="education"
                                value={formData.education}
                                onChange={(e) => updateFormData('education', e.target.value)}
                                placeholder="e.g., BS Computer Science, Stanford University"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Certifications</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                {[
                                    'AWS Certified', 'Google Cloud', 'Microsoft Azure', 'PMP',
                                    'Scrum Master', 'Six Sigma', 'CISSP', 'CompTIA A+'
                                ].map((cert) => (
                                    <button
                                        key={cert}
                                        type="button"
                                        onClick={() => toggleArrayField('certifications', cert)}
                                        className={`p-2 rounded-lg border text-xs transition-all ${formData.certifications.includes(cert)
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        {cert}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h4 className="font-medium text-green-800 dark:text-green-200">Profile Complete!</h4>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Your profile is now ready. You can always update these details later from your profile settings.
                            </p>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Complete Your Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
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
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>

                        <Button
                            onClick={nextStep}
                            disabled={loading}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {loading ? (
                                'Processing...'
                            ) : currentStep === 5 ? (
                                <>
                                    Complete Profile
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
} 