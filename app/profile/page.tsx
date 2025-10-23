'use client';
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { getCookie } from 'cookies-next';
import { FaWhatsapp, FaLinkedin, FaRegCopy, FaFacebook, FaPhone, FaEnvelope, FaEdit, FaSave, FaPlus, FaTrash, FaChevronDown } from 'react-icons/fa';
import { TwitterIcon, Users, MessageSquare, MessageCircle, BarChart3, Calendar, Briefcase, Award, MapPin, Globe, Star, Sparkles, Menu, Heart, Home, Bell, User, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileCompletionWizard } from '@/components/profile-completion-wizard';
import { CommonNavbar } from '@/components/common-navbar';
import { AvatarSelector } from '@/components/ui/avatar-selector';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import { checkUsernameNSFW, generateUsernameSuggestions } from '@/lib/utils/nsfw-filter';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CitySelector } from '@/components/CitySelector';

// Define the type for an uploaded resume
type Upload = {
  id: number;
  userEmail: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
};

// Custom Dropdown Component
const CustomDropdown = ({
  options,
  placeholder,
  onSelect,
  className = "",
  variant = "bits"
}: {
  options: string[];
  placeholder: string;//asasas
  onSelect: (value: string) => void;
  className?: string;
  variant?: "bits" | "blue" | "green";
}) => {//jkjnasasjgjg
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const variantStyles = {
    bits: {
      trigger: "bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 hover:from-bits-golden-yellow-600 hover:to-bits-golden-yellow-700",
      content: "border-bits-golden-yellow/50 dark:border-bits-golden-yellow/30",
      item: "hover:bg-bits-golden-yellow/10 dark:hover:bg-bits-golden-yellow/20"
    },
    blue: {
      trigger: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      content: "border-blue-200/50 dark:border-blue-500/30",
      item: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    },
    green: {
      trigger: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      content: "border-green-200/50 dark:border-green-500/30",
      item: "hover:bg-green-50 dark:hover:bg-green-900/20"
    }
  };

  const styles = variantStyles[variant];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (value) {
      onSelect(value);
      setSelectedValue("");
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`} style={{ zIndex: isOpen ? 9999 : 'auto' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.trigger} text-bits-royal-blue px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium`}
      >
        <FaPlus size={10} className="md:w-3 md:h-3" />
        {placeholder}
        <FaChevronDown
          size={10}
          className={`transition-transform duration-200 md:w-3 md:h-3 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full mt-2 left-0 right-0 z-[9999] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border ${styles.content} shadow-xl max-h-60 overflow-y-auto`}
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white transition-colors duration-200 ${styles.item} first:rounded-t-lg last:rounded-b-lg`}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Helper function to check if a field is empty
  const isFieldEmpty = (field: string | string[] | undefined): boolean => {
    if (!field) return true;
    if (Array.isArray(field)) return field.length === 0;
    return field.trim() === '';
  };



  useEffect(() => {
    const initialize = async () => {
      // Check for NextAuth session first
      if (session?.user?.email) {
        // Set up userEmail cookie for Google users
        try {
          const response = await fetch('/api/auth/google-setup');
          if (response.ok) {
            fetchUserData(session.user.email);
            fetchResumes();
            return;
          }
        } catch (error) {
          console.error('Error setting up Google session:', error);
        }
      }

      // Fallback to cookie-based authentication
      const userEmail = await getCookie('userEmail');
      if (!userEmail) {
        router.push('/login');
      } else {
        fetchUserData(userEmail.toString());
        fetchResumes();
      }
    };

    // Only initialize after session status is determined
    if (status !== 'loading') {
      initialize();
    }
  }, [router, session, status]);

  const [fileType, setFileType] = useState<'cv' | 'cover-letter'>('cv');
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResumes, setUploadedResumes] = useState<Upload[]>([]);
  const [uploadedCoverLetters, setUploadedCoverLetters] = useState<Upload[]>([]);

  // User data
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBio, setUserBio] = useState('');
  const [originalUserBio, setOriginalUserBio] = useState(''); // Keep original bio for reference
  const [userAvatar, setUserAvatar] = useState('/avatar.png');

  // Profile sections
  const [goals, setGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);

  // Social links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    facebook: '',
    phone: '',
    email: ''
  });

  // LinkedIn-style professional fields
  const [headline, setHeadline] = useState('');
  const [education, setEducation] = useState<Array<{
    school_name: string;
    degree: string;
    field_of_study: string;
    start_year: string;
    end_year: string;
  }>>([]);
  const [experience, setExperience] = useState<Array<{
    company_name: string;
    position_title: string;
    start_date: string;
    end_date: string;
    description: string;
  }>>([]);
  const [professionalSkills, setProfessionalSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<Array<{
    certification_name: string;
    issuing_org: string;
    issue_date: string;
    expiry_date: string;
  }>>([]);

  // Anonymous identity
  const [anonymousUsername, setAnonymousUsername] = useState('');
  const [anonymousAvatar, setAnonymousAvatar] = useState('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Location
  const [location, setLocation] = useState('');
  const [usernameValidation, setUsernameValidation] = useState<{
    isValid: boolean;
    reason?: string;
    suggestions?: string[];
  }>({ isValid: true });
  const [showUsernameSuggestions, setShowUsernameSuggestions] = useState(false);
  const [skillBadges, setSkillBadges] = useState<Array<{ skillName: string; score: number; total: number; percentage: number; createdAt: Date }>>([]);

  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick actions
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'connection', text: 'Connected with Sarah Chen', time: '2 hours ago', icon: Users },
    { id: 2, type: 'message', text: 'New message from Tech Startup', time: '4 hours ago', icon: MessageSquare },
    { id: 3, type: 'profile', text: 'Profile viewed by 5 people', time: '1 day ago', icon: BarChart3 },
  ]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      userName, userBio, goals.length, skills.length, interests.length,
      metrics.length, socialLinks.linkedin, socialLinks.phone
    ];
    const completedFields = fields.filter(field =>
      Array.isArray(field) ? field.length > 0 : field && field.toString().trim() !== ''
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isProfileIncomplete = profileCompletion < 70;

  // Options for dropdowns
  const goalOptions = [
    'Hiring', 'Looking for co-founders', 'Raising funding', 'Exploring job opportunities',
    'Networking with peers', 'Mentoring others', 'Seeking mentorship', 'Showcasing projects',
    'Learning and upskilling', 'Building personal brand'
  ];

  const skillOptions = [
    'Product Management', 'Software Development', 'Data Science', 'Marketing',
    'Sales', 'Design', 'Finance', 'Operations', 'Strategy', 'Leadership',
    'AI/ML', 'Blockchain', 'Cloud Computing', 'Cybersecurity'
  ];

  const interestOptions = [
    'AI & Machine Learning', 'Blockchain', 'Sustainability', 'Fintech',
    'Healthtech', 'Edtech', 'E-commerce', 'SaaS', 'Mobile Apps', 'Web3'
  ];

  const metricOptions = [
    '10+ years experience', 'Leadership Skills', 'Product Management', 'Tech Industry Expert',
    'Business Development', 'Certified Scrum Master', 'Analyst Experience', 'Founder'
  ];

  // Fetch user data
  // Fetch user data
  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch('/profile/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setUserName(data.name || 'Networkqy User');
      setUserEmail(data.email || email);
      console.log('Setting userBio from linkedinInfo:', data.linkedinInfo);
      const bioData = data.linkedinInfo || '';
      setUserBio(bioData);
      setOriginalUserBio(bioData); // Store original bio
      setGoals(data.goals ? data.goals.split(',').map((s: string) => s.trim()) : []);
      setSkills(data.strengths ? data.strengths.split(',').map((s: string) => s.trim()) : []);
      setInterests(data.interests ? data.interests.split(',').map((s: string) => s.trim()) : []);
      setMetrics(data.profilemetrics ? data.profilemetrics.split(',').map((s: string) => s.trim()) : []);

      setSocialLinks({
        linkedin: data.linkedinURL || '',
        facebook: data.FacebookURL || '',
        phone: data.phone || '',
        email: data.email || ''
      });

      // Set anonymous identity data
      console.log('Fetched user data:', data);
      console.log('Anonymous username:', data.anonymous_username);
      console.log('Anonymous avatar:', data.anonymous_avatar);
      setAnonymousUsername(data.anonymous_username || '');
      setAnonymousAvatar(data.anonymous_avatar || '');

      // Set LinkedIn-style professional fields
      setHeadline(data.headline || '');
      setEducation(data.education || []);
      setExperience(data.experience || []);
      setProfessionalSkills(data.professional_skills || []);
      setCertifications(data.certifications || []);

      // Debug logging
      console.log('LinkedIn-style fields loaded:', {
        headline: data.headline,
        education: data.education,
        experience: data.experience,
        professional_skills: data.professional_skills,
        certifications: data.certifications
      });

      // Fetch skill badges
      try {
        const badgesResponse = await fetch('/api/user-skill-badges');
        if (badgesResponse.ok) {
          const badgesData = await badgesResponse.json();
          setSkillBadges(badgesData.skillBadges || []);
        }
      } catch (error) {
        console.error('Error fetching skill badges:', error);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch uploaded resumes
  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes');
      if (response.ok) {
        const data = await response.json();
        setUploadedResumes(data.filter((file: Upload) => file.fileType === 'cv'));
        setUploadedCoverLetters(data.filter((file: Upload) => file.fileType === 'cover-letter'));
      } else {
        toast.error('Failed to load files.');
      }
    } catch (error) {
      toast.error('Failed to load files.');
    }
  };


  // Handle successful upload
  const onUploadSuccess = () => {
    fetchResumes();
    setShowUploadModal(false);
    setResumeFile(null);
  };

  // Save profile data
  const saveProfile = async () => {
    // Validate username before saving
    if (anonymousUsername && !validateUsername(anonymousUsername)) {
      toast.error('Please fix the username issues before saving');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = {
        email: userEmail,
        name: userName,
        goals,
        strengths: skills,
        interests,
        profilemetrics: metrics,
        linkedinInfo: userBio,
        linkedinURL: socialLinks.linkedin,
        FacebookURL: socialLinks.facebook,
        phone: socialLinks.phone,
        anonymous_username: anonymousUsername,
        anonymous_avatar: anonymousAvatar,
        headline,
        education,
        experience,
        professional_skills: professionalSkills,
        certifications,
        location,
      };

      console.log('Saving profile data:', saveData);

      const response = await fetch('/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (response.ok) {
        toast.success('Profile saved successfully!');
        setIsEditing(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Add item to array
  const addItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (value && !array.includes(value)) {
      setArray(prev => [...prev, value]);
    }
  };

  // Remove item from array
  const removeItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setArray(prev => prev.filter(i => i !== item));
  };

  // Helper functions for LinkedIn-style fields
  const addEducation = () => {
    setEducation(prev => [...prev, {
      school_name: '',
      degree: '',
      field_of_study: '',
      start_year: '',
      end_year: ''
    }]);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setEducation(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeEducation = (index: number) => {
    setEducation(prev => prev.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperience(prev => [...prev, {
      company_name: '',
      position_title: '',
      start_date: '',
      end_date: '',
      description: ''
    }]);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setExperience(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeExperience = (index: number) => {
    setExperience(prev => prev.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications(prev => [...prev, {
      certification_name: '',
      issuing_org: '',
      issue_date: '',
      expiry_date: ''
    }]);
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setCertifications(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index));
  };

  // Validate anonymous username
  const validateUsername = (username: string) => {
    const result = checkUsernameNSFW(username);
    setUsernameValidation(result);

    if (!result.isValid) {
      setShowUsernameSuggestions(true);
    } else {
      setShowUsernameSuggestions(false);
    }

    return result.isValid;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-bits-golden-yellow/10 to-gray-100 dark:from-slate-900 dark:via-bits-deep-purple/20 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bits-golden-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading your profile...</h2>
          <p className="text-gray-600 dark:text-gray-400">Setting up your professional hub</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-bits-golden-yellow/10 to-gray-100 dark:from-slate-900 dark:via-bits-deep-purple/20 dark:to-slate-900">
      {/* Common Navbar */}
      <CommonNavbar currentPage="/profile" showSignOut={true} />

      <div className="p-3 md:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Profile Completion Banner */}
        {isProfileIncomplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-bits-golden-yellow to-bits-royal-blue text-bits-white rounded-2xl p-4 md:p-6 mb-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-lg font-semibold mb-1">Complete Your Profile</h3>
                  <p className="text-bits-white/90 text-xs md:text-sm hidden sm:block">
                    Your profile is {profileCompletion}% complete. Add more details to get better matches and connections!
                  </p>
                  <p className="text-bits-white/90 text-xs sm:hidden">
                    {profileCompletion}% complete - add details for better connections!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileWizard(true)}
                className="bg-white text-bits-royal-blue p-2 md:px-6 md:py-2 rounded-lg font-medium hover:bg-bits-golden-yellow/20 transition-colors flex items-center gap-2"
              >
                <span className="hidden md:inline">Complete Profile</span>
                <FaEdit className="w-4 h-4 md:hidden" />
              </button>
            </div>
            <div className="mt-3 md:mt-4">
              <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                <span>Profile Completion</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1.5 md:h-2">
                <div
                  className="bg-white h-1.5 md:h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/90 via-bits-golden-yellow/10 to-white/90 dark:from-slate-800/90 dark:via-bits-deep-purple/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 mb-8 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="relative">
              <Image
                src={userAvatar}
                alt={userName}
                width={120}
                height={120}
                className="w-20 h-20 md:w-[120px] md:h-[120px] rounded-full border-4 border-bits-golden-yellow shadow-xl shadow-bits-golden-yellow/30 ring-4 ring-bits-golden-yellow/20 dark:ring-bits-golden-yellow/30"
              />
              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-purple-600 p-1.5 md:p-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  <FaEdit size={12} className="md:w-4 md:h-4" />
                </button>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 md:mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-lg md:text-xl lg:text-3xl font-bold bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-gray-900 dark:text-white w-full max-w-full"
                  />
                ) : (
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{userName}</h1>
                )}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg">
                  <Star size={16} className="md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-medium">Premium Member</span>
                </div>
              </div>

              {/* Edit Profile Buttons */}
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Button
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setUserBio(originalUserBio);
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <FaEdit size={12} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  <span className="sm:hidden">{isEditing ? 'Cancel' : 'Edit'}</span>
                </Button>

                <AlertDialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                      disabled={uploading}
                      onClick={() => setShowUploadModal(true)}
                    >
                      <FaPlus size={12} className="md:w-4 md:h-4" />
                      <span>Upload Document</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Upload Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Upload a resume or cover letter (PDF/DOCX, max 5MB).
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">File Type:</label>
                      <select
                        className="border border-gray-300 dark:border-white/20 rounded px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value as 'cv' | 'cover-letter')}
                      >
                        <option value="cv">Resume/CV</option>
                        <option value="cover-letter">Cover Letter</option>
                      </select>
                    </div>

                    <input
                      type="file"
                      accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={e => setResumeFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                      className="mb-4"
                    />

                    <AlertDialogFooter>
                      <Button
                        onClick={async () => {
                          if (!resumeFile) {
                            toast.error('Please select a file.');
                            return;
                          }
                          setUploading(true);
                          const formData = new FormData();
                          formData.append('file', resumeFile);
                          formData.append('fileType', fileType);
                          formData.append('context', 'profile');
                          try {
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await res.json();
                            if (res.ok) {
                              toast.success(`${fileType === 'cv' ? 'Resume' : 'Cover Letter'} uploaded successfully.`);
                              onUploadSuccess();
                            } else {
                              toast.error(data.error || 'Upload failed.');
                            }
                          } catch (err) {
                            toast.error('Upload failed.');
                          } finally {
                            setUploading(false);
                          }
                        }}
                        disabled={uploading || !resumeFile}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                        Cancel
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {isEditing && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-1 md:gap-2 bg-green-600 hover:bg-green-700 text-xs md:text-sm"
                  >
                    <FaSave size={12} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                    <span className="sm:hidden">{isSaving ? '...' : 'Save'}</span>
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-300 mb-3 md:mb-4 text-xs md:text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="md:w-4 md:h-4" />
                  {isEditing ? (
                    <CitySelector
                      value={location}
                      onChange={setLocation}
                      placeholder="Select your city"
                      className="w-48"
                    />
                  ) : (
                    <span>{location || 'Location not set'}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={12} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Available for opportunities</span>
                  <span className="sm:hidden">Available</span>
                </div>
              </div>

              <div className="relative">

                {isEditing ? (
                  <textarea
                    ref={bioTextareaRef}
                    key={`bio-${isEditing}`} // Force re-render when edit mode changes
                    defaultValue={userBio || ''} // Use defaultValue instead of value
                    onChange={(e) => setUserBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-xs md:text-sm max-w-full"
                    rows={2}
                    onFocus={() => console.log('Textarea focused, userBio value:', userBio)}
                    onBlur={() => console.log('Textarea blurred, userBio value:', userBio)}
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                    {userBio || "Passionate professional looking to connect and grow in the tech ecosystem. Always open to new opportunities and meaningful collaborations."}
                  </p>
                )}
              </div>

              {/* Anonymous Identity Section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle size={16} className="text-bits-golden-yellow dark:text-bits-golden-yellow" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Anonymous Identity</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">(for anonymous chat feed)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {/* Anonymous Username */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Anonymous Username
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={anonymousUsername}
                          onChange={(e) => {
                            setAnonymousUsername(e.target.value);
                            if (e.target.value) {
                              validateUsername(e.target.value);
                            } else {
                              setUsernameValidation({ isValid: true });
                              setShowUsernameSuggestions(false);
                            }
                          }}
                          placeholder="Enter anonymous username..."
                          maxLength={50}
                          className={`w-full bg-white/50 dark:bg-slate-700/80 border rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 max-w-full ${anonymousUsername && !usernameValidation.isValid
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-gray-300 dark:border-white/20'
                            }`}
                        />

                        {/* Validation Error */}
                        {anonymousUsername && !usernameValidation.isValid && (
                          <div className="text-xs text-red-600 dark:text-red-400">
                            {usernameValidation.reason}
                          </div>
                        )}

                        {/* Username Suggestions */}
                        {showUsernameSuggestions && usernameValidation.suggestions && (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Suggested usernames:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {usernameValidation.suggestions?.slice(0, 5).map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setAnonymousUsername(suggestion);
                                    setUsernameValidation({ isValid: true });
                                    setShowUsernameSuggestions(false);
                                  }}
                                  className="text-xs bg-bits-golden-yellow/10 dark:bg-bits-golden-yellow/30 text-bits-golden-yellow dark:text-bits-golden-yellow px-2 py-1 rounded hover:bg-bits-golden-yellow/20 dark:hover:bg-bits-golden-yellow/50 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {anonymousUsername || 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Anonymous Avatar */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Anonymous Avatar
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                          {anonymousAvatar ? (
                            <img
                              src={anonymousAvatar}
                              alt="Current anonymous avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <MessageCircle className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => setShowAvatarSelector(true)}
                          variant="outline"
                          size="sm"
                          className="bg-bits-golden-yellow hover:bg-bits-golden-yellow-600 text-white border-purple-600 text-xs"
                        >
                          Choose Avatar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-bits-golden-yellow/10 dark:bg-bits-golden-yellow/30 flex items-center justify-center">
                          {anonymousAvatar ? (
                            <img
                              src={anonymousAvatar}
                              alt="Anonymous avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <MessageCircle className="w-3 h-3 text-bits-golden-yellow dark:text-bits-golden-yellow" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {anonymousAvatar ? 'Custom avatar set' : 'Default avatar'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goals Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white/90 via-purple-50/30 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 relative"
              style={{ zIndex: 5 }}
            >

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} className="text-bits-golden-yellow dark:text-bits-golden-yellow" />
                  Career Goals
                </h2>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <CustomDropdown
                      options={goalOptions}
                      placeholder="Add goal"
                      onSelect={(value) => addItem(goals, setGoals, value)}
                      variant="bits"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {goals.filter(goal => goal && goal.trim() !== '' && goal !== '[]').map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <span className="text-sm font-medium">{goal}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeItem(goals, setGoals, goal)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/90 via-purple-50/30 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} className="text-bits-golden-yellow dark:text-bits-golden-yellow" />
                  Uploaded Documents
                </h2>
              </div>

              {(uploadedResumes.length > 0 || uploadedCoverLetters.length > 0) ? (
                <div className="space-y-3">
                  {[...uploadedResumes, ...uploadedCoverLetters].map((doc) => {
                    const isResume = doc.fileType === 'cv';
                    const label = isResume ? 'Resume' : 'Cover Letter';
                    const badgeColor = isResume
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-green-500/10 text-green-600 dark:text-green-400';

                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-purple-200/30 dark:border-white/10"
                      >
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                          <p
                            className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
                            title={doc.fileUrl.split('_').pop()}
                          >
                            {doc.fileUrl.split('_').pop()}
                          </p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 sm:mt-0 ${badgeColor}`}
                          >
                            {label}
                          </span>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-bits-golden-yellow dark:text-bits-golden-yellow hover:underline text-sm"
                          >
                            View
                          </a>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs"
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/resumes/delete', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ fileUrl: doc.fileUrl }),
                                });
                                if (res.ok) {
                                  toast.success(`${label} deleted successfully.`);
                                  fetchResumes();
                                } else {
                                  toast.error(`Failed to delete ${label.toLowerCase()}.`);
                                }
                              } catch (err) {
                                toast.error(`Failed to delete ${label.toLowerCase()}.`);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  No documents uploaded yet.
                </p>
              )}
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/90 via-blue-50/30 to-white/90 dark:from-slate-800/90 dark:via-blue-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-blue-200/50 dark:border-white/20 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20 relative"
              style={{ zIndex: 5 }}
            >

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award size={20} className="text-blue-600 dark:text-blue-400" />
                  Skills & Expertise
                </h2>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <CustomDropdown
                      options={skillOptions}
                      placeholder="Add skill"
                      onSelect={(value) => addItem(skills, setSkills, value)}
                      variant="blue"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.filter(skill => skill && skill.trim() !== '' && skill !== '[]').map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <span className="text-sm font-medium">{skill}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeItem(skills, setSkills, skill)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Interests Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/90 via-green-50/30 to-white/90 dark:from-slate-800/90 dark:via-green-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-green-200/50 dark:border-white/20 shadow-xl shadow-green-500/10 dark:shadow-green-500/20 relative"
              style={{ zIndex: 5 }}
            >

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart size={20} className="text-green-600 dark:text-green-400" />
                  Interests & Industries
                </h2>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <CustomDropdown
                      options={interestOptions}
                      placeholder="Add"
                      onSelect={(value) => addItem(interests, setInterests, value)}
                      variant="green"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.filter(interest => interest && interest.trim() !== '' && interest !== '[]').map((interest) => (
                  <div key={interest} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <span className="text-sm font-medium">{interest}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeItem(interests, setInterests, interest)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skill Assessment Badges Section */}
            {skillBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-white/90 via-yellow-50/30 to-white/90 dark:from-slate-800/90 dark:via-yellow-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-yellow-200/50 dark:border-white/20 shadow-xl shadow-yellow-500/10 dark:shadow-yellow-500/20 relative"
                style={{ zIndex: 1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-600 dark:text-yellow-400" />
                    Skill Assessment Badges
                  </h2>
                  <button
                    onClick={() => router.push('/skill-assessment')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-medium"
                  >
                    <Award size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Take Assessment</span>
                    <span className="sm:hidden">Assess</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skillBadges.map((badge, index) => (
                    <div
                      key={index}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${badge.percentage === 100
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-300 shadow-lg shadow-yellow-500/30'
                        : badge.percentage >= 80
                          ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-300 shadow-lg shadow-green-500/30'
                          : badge.percentage >= 60
                            ? 'bg-gradient-to-br from-blue-400 to-blue-500 border-blue-300 shadow-lg shadow-blue-500/30'
                            : 'bg-gradient-to-br from-gray-400 to-gray-500 border-gray-300 shadow-lg shadow-gray-500/30'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm md:text-base">
                          {badge.skillName}
                        </h3>
                        {badge.percentage === 100 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-200" fill="currentColor" />
                            <span className="text-xs text-yellow-200 font-bold">100%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-white/90 text-xs">
                        <span>Score: {badge.score}/{badge.total}</span>
                        <span className="font-semibold">{badge.percentage}%</span>
                      </div>
                      <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${badge.percentage === 100
                            ? 'bg-yellow-200'
                            : badge.percentage >= 80
                              ? 'bg-green-200'
                              : badge.percentage >= 60
                                ? 'bg-blue-200'
                                : 'bg-gray-200'
                            }`}
                          style={{ width: `${badge.percentage}%` }}
                        />
                      </div>
                      {badge.percentage === 100 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                          <Trophy className="w-3 h-3 text-yellow-800" fill="currentColor" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {skillBadges.filter(badge => badge.percentage === 100).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Complete skill assessments to earn badges!
                      <button
                        onClick={() => router.push('/skill-assessment')}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium ml-1 underline"
                      >
                        Start here
                      </button>
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty State for Skill Badges */}
            {skillBadges.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-white/90 via-yellow-50/30 to-white/90 dark:from-slate-800/90 dark:via-yellow-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-yellow-200/50 dark:border-white/20 shadow-xl shadow-yellow-500/10 dark:shadow-yellow-500/20 relative"
                style={{ zIndex: 1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-600 dark:text-yellow-400" />
                    Skill Assessment Badges
                  </h2>
                  <button
                    onClick={() => router.push('/skill-assessment')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 text-xs md:text-sm font-medium"
                  >
                    <Award size={14} className="md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Take Assessment</span>
                    <span className="sm:hidden">Assess</span>
                  </button>
                </div>
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Skill Badges Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Take skill assessments to earn badges and showcase your expertise!
                  </p>
                  <button
                    onClick={() => router.push('/skill-assessment')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    Start Your First Assessment
                  </button>
                </div>
              </motion.div>
            )}

            {/* LinkedIn-style Professional Sections */}

            {/* Headline Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-white/90 via-indigo-50/30 to-white/90 dark:from-slate-800/90 dark:via-indigo-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-indigo-200/50 dark:border-white/20 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/20 relative"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} className="text-indigo-600 dark:text-indigo-400" />
                  Professional Headline
                </h2>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g., Senior Software Engineer at Tech Corp"
                  className="w-full bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {headline || "Add your professional headline to make a strong first impression"}
                </p>
              )}
            </motion.div>

            {/* Education Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/90 via-emerald-50/30 to-white/90 dark:from-slate-800/90 dark:via-emerald-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-emerald-200/50 dark:border-white/20 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/20 relative"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award size={20} className="text-emerald-600 dark:text-emerald-400" />
                  Education
                </h2>
                {isEditing && (
                  <Button
                    onClick={addEducation}
                    variant="outline"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 text-xs"
                  >
                    <FaPlus size={12} className="mr-1" />
                    Add Education
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {education.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                    No education entries yet. Add your educational background.
                  </p>
                ) : (
                  education.map((edu, index) => (
                    <div key={index} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-emerald-200/30 dark:border-emerald-500/30">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.school_name}
                              onChange={(e) => updateEducation(index, 'school_name', e.target.value)}
                              placeholder="School/University"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              placeholder="Degree (e.g., Bachelor's)"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            value={edu.field_of_study}
                            onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                            placeholder="Field of Study"
                            className="w-full bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={edu.start_year}
                              onChange={(e) => updateEducation(index, 'start_year', e.target.value)}
                              placeholder="Start Year"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={edu.end_year}
                              onChange={(e) => updateEducation(index, 'end_year', e.target.value)}
                              placeholder="End Year"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removeEducation(index)}
                              variant="destructive"
                              size="sm"
                              className="text-xs"
                            >
                              <FaTrash size={12} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{edu.school_name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{edu.degree} in {edu.field_of_study}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">{edu.start_year} - {edu.end_year}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Experience Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/90 via-blue-50/30 to-white/90 dark:from-slate-800/90 dark:via-blue-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-blue-200/50 dark:border-white/20 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20 relative"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                  Experience
                </h2>
                {isEditing && (
                  <Button
                    onClick={addExperience}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 text-xs"
                  >
                    <FaPlus size={12} className="mr-1" />
                    Add Experience
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {experience.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                    No experience entries yet. Add your work experience.
                  </p>
                ) : (
                  experience.map((exp, index) => (
                    <div key={index} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-blue-200/30 dark:border-blue-500/30">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={exp.company_name}
                              onChange={(e) => updateExperience(index, 'company_name', e.target.value)}
                              placeholder="Company Name"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={exp.position_title}
                              onChange={(e) => updateExperience(index, 'position_title', e.target.value)}
                              placeholder="Position Title"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={exp.start_date}
                              onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                              placeholder="Start Date"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={exp.end_date}
                              onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                              placeholder="End Date (or Present)"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            placeholder="Job description and responsibilities"
                            rows={3}
                            className="w-full bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm resize-none"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removeExperience(index)}
                              variant="destructive"
                              size="sm"
                              className="text-xs"
                            >
                              <FaTrash size={12} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{exp.position_title}</h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm">{exp.company_name}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">{exp.start_date} - {exp.end_date}</p>
                          {exp.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Professional Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-white/90 via-purple-50/30 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20 relative"
              style={{ zIndex: 5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award size={20} className="text-bits-golden-yellow dark:text-bits-golden-yellow" />
                  Professional Skills
                </h2>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <CustomDropdown
                      options={skillOptions}
                      placeholder="Add skill"
                      onSelect={(value) => addItem(professionalSkills, setProfessionalSkills, value)}
                      variant="bits"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {professionalSkills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <span className="text-sm font-medium">{skill}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeItem(professionalSkills, setProfessionalSkills, skill)}
                        className="text-white/80 hover:text-white transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Certifications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-white/90 via-orange-50/30 to-white/90 dark:from-slate-800/90 dark:via-orange-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 lg:p-6 border border-orange-200/50 dark:border-white/20 shadow-xl shadow-orange-500/10 dark:shadow-orange-500/20 relative"
              style={{ zIndex: 1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy size={20} className="text-orange-600 dark:text-orange-400" />
                  Certifications
                </h2>
                {isEditing && (
                  <Button
                    onClick={addCertification}
                    variant="outline"
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 text-xs"
                  >
                    <FaPlus size={12} className="mr-1" />
                    Add Certification
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {certifications.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                    No certifications yet. Add your professional certifications.
                  </p>
                ) : (
                  certifications.map((cert, index) => (
                    <div key={index} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-4 border border-orange-200/30 dark:border-orange-500/30">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={cert.certification_name}
                              onChange={(e) => updateCertification(index, 'certification_name', e.target.value)}
                              placeholder="Certification Name"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={cert.issuing_org}
                              onChange={(e) => updateCertification(index, 'issuing_org', e.target.value)}
                              placeholder="Issuing Organization"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={cert.issue_date}
                              onChange={(e) => updateCertification(index, 'issue_date', e.target.value)}
                              placeholder="Issue Date"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={cert.expiry_date}
                              onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)}
                              placeholder="Expiry Date (if applicable)"
                              className="bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removeCertification(index)}
                              variant="destructive"
                              size="sm"
                              className="text-xs"
                            >
                              <FaTrash size={12} className="mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{cert.certification_name}</h3>
                          <p className="text-orange-600 dark:text-orange-400 text-sm">{cert.issuing_org}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">Issued: {cert.issue_date}</p>
                          {cert.expiry_date && (
                            <p className="text-gray-500 dark:text-gray-500 text-xs">Expires: {cert.expiry_date}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/90 via-purple-50/30 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/chat')}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <MessageSquare size={20} />
                  <span>Start Chat</span>
                </button>
                <button
                  onClick={() => router.push('/connections')}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Users size={20} />
                  <span>My Connections</span>
                </button>
                <button
                  onClick={() => router.push('/anonymous-feed')}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <BarChart3 size={20} />
                  <span>Go To Feed</span>
                </button>
                <button
                  onClick={() => router.push('/reels')}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Calendar size={20} />
                  <span>Elevator Reels</span>
                </button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/90 via-purple-50/30 to-white/90 dark:from-slate-800/90 dark:via-purple-900/20 dark:to-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-bits-golden-yellow/50 dark:border-white/20 shadow-xl shadow-bits-golden-yellow/10 dark:shadow-bits-golden-yellow/20"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200/50 dark:border-purple-500/30 hover:shadow-md transition-all duration-200">
                    <div className="p-2 bg-purple-500 text-white rounded-full">
                      <activity.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white text-sm font-medium">{activity.text}</p>
                      <p className="text-bits-golden-yellow dark:text-bits-golden-yellow text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/20 shadow-lg relative"
            >

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-3">
                      <FaLinkedin className="text-blue-600" />
                      <input
                        type="text"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="LinkedIn URL"
                        className="flex-1 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-900 dark:text-white max-w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <FaFacebook className="text-blue-600" />
                      <input
                        type="text"
                        value={socialLinks.facebook}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                        placeholder="Facebook URL"
                        className="flex-1 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-900 dark:text-white max-w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-green-600" />
                      <input
                        type="text"
                        value={socialLinks.phone}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone number"
                        className="flex-1 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-900 dark:text-white max-w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-red-600" />
                      <input
                        type="email"
                        value={socialLinks.email}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email address"
                        className="flex-1 bg-white/50 dark:bg-slate-700/80 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-gray-900 dark:text-white max-w-full"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {socialLinks.linkedin && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <FaLinkedin className="text-blue-600" />
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {socialLinks.facebook && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <FaFacebook className="text-blue-600" />
                        <span className="text-sm">{socialLinks.facebook}</span>
                      </div>
                    )}
                    {socialLinks.phone && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <FaPhone className="text-green-600" />
                        <span className="text-sm">{socialLinks.phone}</span>
                      </div>
                    )}
                    {socialLinks.email && (
                      <div className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <FaEnvelope className="text-red-600" />
                        <a href={`mailto:${socialLinks.email}`} className="text-sm hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                          {socialLinks.email}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AvatarSelector
              selectedAvatar={anonymousAvatar}
              onAvatarChange={(avatar) => {
                setAnonymousAvatar(avatar);
                setShowAvatarSelector(false);
              }}
            />
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAvatarSelector(false)}
                className="mr-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Wizard */}
      <ProfileCompletionWizard
        isOpen={showProfileWizard}
        onClose={() => setShowProfileWizard(false)}
        onComplete={() => {
          // Refresh the page to show updated profile data
          window.location.reload();
        }}
        initialData={{
          firstName: userName,
          lastName: "",
          email: userEmail,
          bio: userBio,
          linkedin: socialLinks.linkedin,
          profilePic: null,
          goal: goals[0] || "",
          strengths: skills,
          interests,
          experience: "",
          location: "",
          company: "",
          title: "",
          skills: [],
          education: "",
          certifications: [],
        }}
      />
    </div>
  );
};

export default ProfilePage;

