'use client';

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { motion, AnimatePresence } from "framer-motion";
import { getCookie } from "cookies-next";
import {
    User,
    MapPin,
    Building,
    Briefcase,
    Calendar,
    Clock, //aa
    CheckCircle,
    X,
    MessageSquare,
    Heart,
    Eye,
    Plus,
    Edit,
    Star,
    Users,
    Award,
    TrendingUp,
    Trash2,
    Check
} from "lucide-react";

export default function AlumniPage() {
    const [jobForm, setJobForm] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        applicationLink: ''
    });

    const [postedJobs, setPostedJobs] = useState([
        {
            id: 1,
            title: 'Senior Software Engineer',
            company: 'TechCorp',
            location: 'San Francisco, CA',
            description: 'We are looking for a talented Senior Software Engineer to join our growing team. You will be responsible for developing and maintaining our core platform.',
            applicationLink: 'https://techcorp.com/careers/senior-engineer',
            postedAt: '2024-01-10'
        },
        {
            id: 2,
            title: 'Product Manager',
            company: 'InnovateCo',
            location: 'New York, NY',
            description: 'Join our product team to help shape the future of our platform. Experience with agile methodologies and user-centered design required.',
            applicationLink: 'https://innovateco.com/jobs/pm',
            postedAt: '2024-01-08'
        }
    ]);

    const [formErrors, setFormErrors] = useState({
        title: '',
        applicationLink: ''
    });

    const [mentorshipSlot, setMentorshipSlot] = useState({
        date: '',
        startTime: '',
        duration: 30,
        recurring: false,
        topic: ''
    });

    const [mentorshipSlots, setMentorshipSlots] = useState([
        { id: 1, date: '2024-01-15', startTime: '14:00', duration: 60, recurring: true, topic: 'Career Guidance' },
        { id: 2, date: '2024-01-20', startTime: '10:00', duration: 30, recurring: false, topic: 'Technical Interview Prep' },
        { id: 3, date: '2024-01-25', startTime: '16:00', duration: 45, recurring: true, topic: 'Product Management' }
    ]);

    const [mentorshipRequests, setMentorshipRequests] = useState([
        { id: 1, studentName: 'Alex Johnson', topic: 'Software Engineering Career Path', preferredTime: 'Weekdays 6-8 PM', status: 'pending' },
        { id: 2, studentName: 'Sarah Chen', topic: 'Data Science Interview Prep', preferredTime: 'Weekends', status: 'pending' },
        { id: 3, studentName: 'Mike Rodriguez', topic: 'Product Management Insights', preferredTime: 'Any time', status: 'accepted' },
        { id: 4, studentName: 'Emily Davis', topic: 'UX/UI Design Career Transition', preferredTime: 'Evenings', status: 'pending' }
    ]);

    const [activityFeed, setActivityFeed] = useState([
        { id: 1, type: 'job_posted', text: 'You posted a job at TechCorp', time: '2 hours ago', icon: Briefcase },
        { id: 2, type: 'mentorship_accepted', text: 'You accepted a mentorship session with Sarah Chen', time: '1 day ago', icon: CheckCircle },
        { id: 3, type: 'profile_viewed', text: '5 students viewed your profile', time: '3 days ago', icon: Eye },
        { id: 4, type: 'job_applied', text: '12 students applied to your job posting', time: '1 week ago', icon: Users },
        { id: 5, type: 'endorsement', text: 'You received an endorsement for leadership', time: '1 week ago', icon: Star }
    ]);

    const [showSuccessMessage, setShowSuccessMessage] = useState('');
    const [stats, setStats] = useState({
        jobsPosted: 8,
        mentorshipSessions: 24,
        studentsHelped: 15,
        profileViews: 127
    });

    const user = {
        name: "Sarah Wilson",
        email: "sarah.wilson@alumni.example.com",
        headline: "Senior Product Manager at TechCorp",
        location: "San Francisco, CA",
        company: "TechCorp",
        title: "Senior Product Manager"
    };

    const statsData = [
        { label: "Jobs Posted", value: stats.jobsPosted.toString(), icon: Briefcase, color: "text-blue-600" },
        { label: "Mentorship Sessions", value: stats.mentorshipSessions.toString(), icon: MessageSquare, color: "text-green-600" },
        { label: "Students Helped", value: stats.studentsHelped.toString(), icon: Users, color: "text-purple-600" },
        { label: "Profile Views", value: stats.profileViews.toString(), icon: Eye, color: "text-orange-600" },
    ];

    const handleJobSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setFormErrors({ title: '', applicationLink: '' });

        // Validation
        let hasErrors = false;
        const errors = { title: '', applicationLink: '' };

        if (!jobForm.title.trim()) {
            errors.title = 'Job title is required';
            hasErrors = true;
        }

        if (!jobForm.applicationLink.trim()) {
            errors.applicationLink = 'Application link is required';
            hasErrors = true;
        }

        if (hasErrors) {
            setFormErrors(errors);
            return;
        }

        // Create new job
        const newJob = {
            id: Date.now(),
            title: jobForm.title.trim(),
            company: jobForm.company.trim() || 'Your Company',
            location: jobForm.location.trim() || 'Remote',
            description: jobForm.description.trim() || 'No description provided',
            applicationLink: jobForm.applicationLink.trim(),
            postedAt: new Date().toISOString().split('T')[0]
        };

        // Add to posted jobs
        setPostedJobs(prev => [newJob, ...prev]);

        // Clear form
        setJobForm({ title: '', company: '', location: '', description: '', applicationLink: '' });

        // Update stats
        setStats(prev => ({ ...prev, jobsPosted: prev.jobsPosted + 1 }));

        // Add to activity feed
        const newActivity = {
            id: Date.now(),
            type: 'job_posted',
            text: `You posted a job at ${newJob.company}`,
            time: 'Just now',
            icon: Briefcase
        };
        setActivityFeed(prev => [newActivity, ...prev]);

        // Show success message
        setShowSuccessMessage('Job posted successfully!');
        setTimeout(() => setShowSuccessMessage(''), 3000);
    };

    const handleMentorshipSlotSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!mentorshipSlot.date || !mentorshipSlot.startTime || !mentorshipSlot.topic) {
            setShowSuccessMessage('Please fill in all required fields');
            setTimeout(() => setShowSuccessMessage(''), 3000);
            return;
        }

        const newSlot = {
            id: Date.now(),
            ...mentorshipSlot
        };
        setMentorshipSlots([...mentorshipSlots, newSlot]);
        setMentorshipSlot({ date: '', startTime: '', duration: 30, recurring: false, topic: '' });

        setShowSuccessMessage('Time slot added successfully!');
        setTimeout(() => setShowSuccessMessage(''), 3000);
    };

    const handleDeleteMentorshipSlot = (slotId: number) => {
        setMentorshipSlots(prev => prev.filter(slot => slot.id !== slotId));
        setShowSuccessMessage('Time slot removed');
        setTimeout(() => setShowSuccessMessage(''), 2000);
    };

    const handleMentorshipRequest = (requestId: number, action: 'accept' | 'ignore') => {
        const request = mentorshipRequests.find(req => req.id === requestId);

        if (action === 'accept') {
            // Update stats
            setStats(prev => ({
                ...prev,
                mentorshipSessions: prev.mentorshipSessions + 1,
                studentsHelped: prev.studentsHelped + 1
            }));

            // Add to activity feed
            const newActivity = {
                id: Date.now(),
                type: 'mentorship_accepted',
                text: `You accepted a mentorship session with ${request?.studentName}`,
                time: 'Just now',
                icon: CheckCircle
            };
            setActivityFeed(prev => [newActivity, ...prev]);

            setShowSuccessMessage(`You accepted ${request?.studentName}'s request`);
        } else {
            setShowSuccessMessage(`Request from ${request?.studentName} ignored`);
        }

        // Remove from requests
        setMentorshipRequests(prev => prev.filter(req => req.id !== requestId));

        setTimeout(() => setShowSuccessMessage(''), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
            {/* Success Message */}
            <AnimatePresence>
                {showSuccessMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Check className="size-5" />
                        <span className="font-medium">{showSuccessMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row gap-6"
                >
                    {/* Alumni Welcome Card */}
                    <Card className="flex-1 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="relative">
                                    <div className="size-20 sm:size-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 size-6 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                        Welcome back, {user.name.split(' ')[0]}!
                                    </h1>
                                    <p className="text-lg text-purple-600 dark:text-purple-400 font-medium mb-2">
                                        Thanks for supporting the next generation
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="size-4" />
                                            {user.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Building className="size-4" />
                                            {user.company}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {statsData.map((stat, index) => (
                        <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 text-center">
                                <div className={`size-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                                    <stat.icon className={`size-6 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* Main Content Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Post a Job Card */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="size-5 text-blue-600" />
                                Post a Job
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJobSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle">Job Title *</Label>
                                    <Input
                                        id="jobTitle"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={jobForm.title}
                                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                                        className={formErrors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                                    />
                                    {formErrors.title && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.title}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input
                                        id="company"
                                        placeholder="e.g., TechCorp"
                                        value={jobForm.company}
                                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g., San Francisco, CA"
                                        value={jobForm.location}
                                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Job Description</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Describe the role, responsibilities, requirements..."
                                        value={jobForm.description}
                                        onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="applicationLink">Application Link *</Label>
                                    <Input
                                        id="applicationLink"
                                        placeholder="https://company.com/careers/..."
                                        value={jobForm.applicationLink}
                                        onChange={(e) => setJobForm({ ...jobForm, applicationLink: e.target.value })}
                                        className={formErrors.applicationLink ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                                    />
                                    {formErrors.applicationLink && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{formErrors.applicationLink}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                                    <Plus className="size-4 mr-2" />
                                    Post Job
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Posted Jobs List */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="size-5 text-blue-600" />
                                Posted Jobs ({postedJobs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {postedJobs.map((job) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                                        >
                                            <div className="mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                        {job.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {job.company} • {job.location}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                        Posted: {job.postedAt}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                                                {job.description}
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {postedJobs.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Briefcase className="size-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                        <p>No jobs posted yet. Post your first job above!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mentorship Availability */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="size-5 text-green-600" />
                                Mentorship Availability
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleMentorshipSlotSubmit} className="space-y-4 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={mentorshipSlot.date}
                                            onChange={(e) => setMentorshipSlot({ ...mentorshipSlot, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime">Start Time</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={mentorshipSlot.startTime}
                                            onChange={(e) => setMentorshipSlot({ ...mentorshipSlot, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <select
                                            id="duration"
                                            value={mentorshipSlot.duration}
                                            onChange={(e) => setMentorshipSlot({ ...mentorshipSlot, duration: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>1 hour</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="topic">Topic</Label>
                                        <Input
                                            id="topic"
                                            placeholder="e.g., Career Guidance"
                                            value={mentorshipSlot.topic}
                                            onChange={(e) => setMentorshipSlot({ ...mentorshipSlot, topic: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="recurring"
                                        type="checkbox"
                                        checked={mentorshipSlot.recurring}
                                        onChange={(e) => setMentorshipSlot({ ...mentorshipSlot, recurring: e.target.checked })}
                                        className="size-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <Label htmlFor="recurring">Recurring weekly</Label>
                                </div>
                                <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                                    <Plus className="size-4 mr-2" />
                                    Add Time Slot
                                </Button>
                            </form>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white">Upcoming Time Slots</h4>
                                <AnimatePresence>
                                    {mentorshipSlots.map((slot) => (
                                        <motion.div
                                            key={slot.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="size-4 text-gray-500" />
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {slot.date} at {slot.startTime}
                                                    </span>
                                                    {slot.recurring && (
                                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                                            Recurring
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {slot.duration} min • {slot.topic}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteMentorshipSlot(slot.id)}
                                                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Mentorship Requests and Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* Mentorship Requests */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="size-5 text-purple-600" />
                                Student Mentorship Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {mentorshipRequests.map((request) => (
                                        <motion.div
                                            key={request.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {request.studentName}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {request.topic}
                                                    </p>
                                                    {request.preferredTime && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                            Preferred: {request.preferredTime}
                                                        </p>
                                                    )}
                                                </div>
                                                {request.status === 'accepted' && (
                                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                                                        Accepted
                                                    </span>
                                                )}
                                            </div>
                                            {request.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleMentorshipRequest(request.id, 'accept')}
                                                        className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
                                                    >
                                                        <CheckCircle className="size-4 mr-1" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleMentorshipRequest(request.id, 'ignore')}
                                                        className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                                    >
                                                        <X className="size-4 mr-1" />
                                                        Ignore
                                                    </Button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="size-5 text-orange-600" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {activityFeed.map((activity) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02]"
                                        >
                                            <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <activity.icon className="size-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.text}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 