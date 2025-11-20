'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Briefcase,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Plus,
    ArrowLeft,
    Eye,
    MessageSquare,
    Calendar,
    MapPin,
    Building,
    DollarSign,
    ExternalLink,
    RefreshCw,
    Star,
    Mail,
    Phone,
    X,
    Download,
    Shield,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface JobApplication {
    id: string;
    jobId: string;
    name: string;
    email: string;
    coverLetter: string;
    cvFileUrl?: string;
    // profileLink?: string; // Not in database schema
    status: 'pending' | 'phone_screening' | 'job_assessment' | 'hr_interview' | 'final_interview' | 'accepted' | 'rejected' | 'withdrawn';
    feedback?: string;
    withdrawn: boolean;
    createdAt: string;
    job?: {
        job_title: string;
        employer_name: string;
        job_city: string;
        job_state: string;
        job_country: string;
        job_employment_type: string;
        job_min_salary: string;
        job_max_salary: string;
        job_salary_period: string;
        job_is_remote: boolean;
    };
}

interface Job {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo?: string;
    job_city: string;
    job_state: string;
    job_country: string;
    job_posted_at_datetime_utc: string;
    job_apply_link: string;
    job_employment_type: string;
    job_description: string;
    job_is_remote: boolean;
    job_min_salary: string;
    job_max_salary: string;
    job_salary_period: string;
    posted_by: string;
    posted_by_user_id: string;
    created_at: string;
}

// Utility functions
const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'phone_screening': return 'bg-blue-100 text-blue-800';
        case 'job_assessment': return 'bg-purple-100 text-purple-800';
        case 'hr_interview': return 'bg-indigo-100 text-indigo-800';
        case 'final_interview': return 'bg-orange-100 text-orange-800';
        case 'accepted': return 'bg-green-100 text-green-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'withdrawn': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pending': return 'Pending';
        case 'phone_screening': return 'Phone Screening';
        case 'job_assessment': return 'Job Assessment';
        case 'hr_interview': return 'HR Interview';
        case 'final_interview': return 'Final Interview';
        case 'accepted': return 'Accepted';
        case 'rejected': return 'Rejected';
        case 'withdrawn': return 'Withdrawn';
        default: return status;
    }
};

// Helper function to extract filename from S3 URL
const getFileNameFromUrl = (url: string): string => {
    try {
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        // Remove UUID prefix if present (format: uuid_filename.pdf)
        const nameParts = fileName.split('_');
        if (nameParts.length > 1) {
            return nameParts.slice(1).join('_');
        }
        return fileName;
    } catch {
        return 'resume.pdf';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

export default function RecruiterDashboard() {
    const router = useRouter();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState('');
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    const [postingJob, setPostingJob] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [userRole, setUserRole] = useState<string>('');
    const [roleLoading, setRoleLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    // Job filtering states
    const [jobSearchTerm, setJobSearchTerm] = useState('');
    const [jobStatusFilter, setJobStatusFilter] = useState('all');
    const [jobTypeFilter, setJobTypeFilter] = useState('all');

    // Summary stats
    const [summaryStats, setSummaryStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        phoneScreeningApplications: 0,
        jobAssessmentApplications: 0,
        hrInterviewApplications: 0,
        finalInterviewApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        totalJobs: 0,
    });

    // Filtered jobs based on search and filters
    const filteredJobs = useMemo(() => {
        if (!Array.isArray(jobs)) return [];

        return jobs.filter(job => {
            // Search filter
            const matchesSearch = !jobSearchTerm ||
                job.job_title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                job.employer_name.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                job.job_description.toLowerCase().includes(jobSearchTerm.toLowerCase());

            // Status filter (based on applications)
            const matchesStatus = jobStatusFilter === 'all' ||
                (jobStatusFilter === 'active' && job.job_posted_at_datetime_utc) ||
                (jobStatusFilter === 'inactive' && !job.job_posted_at_datetime_utc);

            // Type filter
            const matchesType = jobTypeFilter === 'all' ||
                job.job_employment_type === jobTypeFilter ||
                (jobTypeFilter === 'remote' && job.job_is_remote) ||
                (jobTypeFilter === 'on-site' && !job.job_is_remote);

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [jobs, jobSearchTerm, jobStatusFilter, jobTypeFilter]);

    // Check user role and permissions
    const checkUserRole = async () => {
        setRoleLoading(true);
        try {
            console.log('=== FRONTEND ROLE CHECK DEBUG ===');
            console.log('Fetching user profile...');

            const response = await fetch('/api/user/profile');
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const userData = await response.json();
                console.log('User data received:', userData);

                const role = userData.role;
                console.log('Extracted role:', role);
                console.log('Role type:', typeof role);
                console.log('Role in allowed list?', ['recruiter', 'admin'].includes(role));

                setUserRole(role);

                // Check if user has recruiter or admin role
                if (!role || !['recruiter', 'admin'].includes(role)) {
                    console.log('Access denied - role not in allowed list. Role:', role);
                    setAccessDenied(true);
                    toast.error('Access denied. Recruiter or Admin role required.');
                    // Redirect to home page after 2 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                    return false;
                }
                console.log('Access granted - role is valid:', role);
                return true;
            } else {
                const errorData = await response.json();
                console.log('API Error:', errorData);
                setAccessDenied(true);
                toast.error('Unable to verify user permissions.');
                return false;
            }
        } catch (error) {
            console.error('Error checking user role:', error);
            setAccessDenied(true);
            toast.error('Error verifying user permissions.');
            return false;
        } finally {
            setRoleLoading(false);
        }
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            const hasAccess = await checkUserRole();
            if (hasAccess) {
                loadDashboardData();
            }
        };
        initializeDashboard();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load applications
            const applicationsResponse = await fetch('/api/recruiter/applications');
            const applicationsData = await applicationsResponse.json();
            console.log('Applications data loaded:', applicationsData.length, 'applications'); // Debug log
            console.log('Sample application statuses:', applicationsData.map((app: JobApplication) => ({ id: app.id, status: app.status }))); // Debug log
            setApplications(applicationsData);

            // Load jobs
            const jobsResponse = await fetch('/api/recruiter/jobs');
            const jobsData = await jobsResponse.json();
            console.log('Recruiter jobs response:', jobsData); // Debug log
            setJobs(jobsData.jobs || []);

            // Calculate summary stats
            const stats = {
                totalApplications: applicationsData.length,
                pendingApplications: applicationsData.filter((app: JobApplication) => app.status === 'pending').length,
                phoneScreeningApplications: applicationsData.filter((app: JobApplication) => app.status === 'phone_screening').length,
                jobAssessmentApplications: applicationsData.filter((app: JobApplication) => app.status === 'job_assessment').length,
                hrInterviewApplications: applicationsData.filter((app: JobApplication) => app.status === 'hr_interview').length,
                finalInterviewApplications: applicationsData.filter((app: JobApplication) => app.status === 'final_interview').length,
                acceptedApplications: applicationsData.filter((app: JobApplication) => app.status === 'accepted').length,
                rejectedApplications: applicationsData.filter((app: JobApplication) => app.status === 'rejected').length,
                totalJobs: jobsData.length,
            };
            setSummaryStats(stats);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (jobData: any) => {
        setPostingJob(true);
        try {
            // Transform field names to match API expectations and handle numeric fields
            const transformedData = {
                jobTitle: jobData.job_title,
                employerName: jobData.employer_name,
                jobDescription: jobData.job_description,
                jobCity: jobData.job_city,
                jobState: jobData.job_state,
                jobCountry: jobData.job_country,
                jobEmploymentType: jobData.job_employment_type,
                jobIsRemote: jobData.job_is_remote,
                jobMinSalary: jobData.job_min_salary && jobData.job_min_salary.trim() !== '' ? Number(jobData.job_min_salary) : null,
                jobMaxSalary: jobData.job_max_salary && jobData.job_max_salary.trim() !== '' ? Number(jobData.job_max_salary) : null,
                jobSalaryPeriod: jobData.job_salary_period,
                jobApplyLink: jobData.job_apply_link,
                postedBy: 'career_team',
            };

            const response = await fetch('/api/jobs/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transformedData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Job posted successfully:', result); // Debug log
                toast.success(`Job posted successfully! Job ID: ${result.jobId}`);
                setShowPostJobModal(false);
                loadDashboardData();
            } else {
                const errorData = await response.json();
                console.error('Job posting failed:', errorData); // Debug log
                toast.error(errorData.error || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            toast.error('Failed to post job');
        } finally {
            setPostingJob(false);
        }
    };

    const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject' | 'phone_screening' | 'job_assessment' | 'hr_interview' | 'final_interview', feedback?: string) => {
        try {
            let endpoint = '';
            let status = '';

            if (action === 'accept' || action === 'reject') {
                endpoint = `/api/recruiter/applications/${applicationId}/${action}`;
                status = action;
            } else {
                // Handle interview rounds
                endpoint = `/api/recruiter/applications/${applicationId}/status`;
                status = action;
            }

            console.log(`Updating application ${applicationId} to status: ${status}`);

            const response = await fetch(endpoint, {
                method: action === 'accept' || action === 'reject' ? 'POST' : 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback,
                    ...(action !== 'accept' && action !== 'reject' && { status })
                }),
            });

            if (response.ok) {
                const actionText = action === 'accept' ? 'accepted' :
                    action === 'reject' ? 'rejected' :
                        `moved to ${getStatusLabel(action)}`;
                toast.success(`Application ${actionText} successfully!`);
                setShowApplicationModal(false);
                setSelectedApplication(null);
                setFeedback('');

                // Refresh the applications list
                console.log('Refreshing applications list...');
                loadDashboardData();
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                toast.error(`Failed to ${action} application: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(`Error ${action}ing application:`, error);
            toast.error(`Failed to ${action} application`);
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
        const matchesSearch = !searchTerm ||
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job?.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesJob = selectedJob === 'all' || !selectedJob || app.jobId === selectedJob;

        return matchesStatus && matchesSearch && matchesJob;
    });



    // Show loading state while checking role
    if (roleLoading) {
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
                    <h2 className="text-xl font-bold text-black mb-2">Verifying permissions...</h2>
                    <p className="text-black font-medium">Checking user access</p>
                </div>
            </div>
        );
    }

    // Show access denied if user doesn't have required role
    if (accessDenied) {
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
                <Card className="w-full max-w-md backdrop-blur-sm border-2 shadow-xl" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 30%, rgba(138, 43, 226, 0.1) 70%, rgba(255, 255, 255, 0.95) 100%)',
                    borderColor: 'rgba(255, 215, 0, 0.6)',
                    boxShadow: '0 25px 50px rgba(25, 25, 112, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)'
                }}>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <Shield className="size-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription>
                            You need recruiter or admin privileges to access this dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-sm text-black">
                                <AlertTriangle className="size-4" />
                                <span>Current role: {userRole || 'Unknown'}</span>
                            </div>
                            <Button
                                onClick={() => router.push('/')}
                                className="w-full"
                            >
                                Go to Homepage
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
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
                    <h2 className="text-xl font-bold text-black mb-2">Loading recruiter dashboard...</h2>
                    <p className="text-black font-medium">Fetching dashboard data</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
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
            }}
        >
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

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => window.history.back()}
                            variant="ghost"
                            size="sm"
                            className="text-black hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 border border-white/20 backdrop-blur-md bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <Briefcase className="size-6 text-black" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-black">Recruiter Dashboard</h1>
                                    <Badge
                                        variant="secondary"
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-black border-0"
                                    >
                                        {userRole?.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-black">Manage job applications and post new opportunities</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowPostJobModal(true)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-black border-0"
                    >
                        <Plus className="size-4 mr-2" />
                        Post New Job
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Total Applications</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <Users className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.totalApplications}</div>
                            <p className="text-xs text-black">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Pending</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                <Clock className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.pendingApplications}</div>
                            <p className="text-xs text-black">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Accepted</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                <CheckCircle className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.acceptedApplications}</div>
                            <p className="text-xs text-black">Successful candidates</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Rejected</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                                <XCircle className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.rejectedApplications}</div>
                            <p className="text-xs text-black">Not selected</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Phone Screening</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <Phone className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.phoneScreeningApplications}</div>
                            <p className="text-xs text-black">Initial screening</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Job Assessment</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <MessageSquare className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.jobAssessmentApplications}</div>
                            <p className="text-xs text-black">Skills & fit assessment</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">HR Interview</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                                <Users className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.hrInterviewApplications}</div>
                            <p className="text-xs text-black">HR evaluation</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Final Interview</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                                <Star className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.finalInterviewApplications}</div>
                            <p className="text-xs text-black">Final round</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Active Jobs</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Briefcase className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.totalJobs}</div>
                            <p className="text-xs text-black">Currently posted</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="applications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md border-white/20">
                        <TabsTrigger value="applications" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">
                            <Users className="size-4 mr-2" />
                            Applications
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">
                            <Briefcase className="size-4 mr-2" />
                            My Jobs
                        </TabsTrigger>
                    </TabsList>

                    {/* Applications Tab */}
                    <TabsContent value="applications" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center gap-2">
                                    <Users className="size-5" />
                                    Job Applications
                                </CardTitle>
                                <CardDescription className="text-black">Review and manage candidate applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by name, email, or job title..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-white/10 border-white/20 text-black placeholder:text-black"
                                        />
                                    </div>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-black">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="phone_screening">Phone Screening</SelectItem>
                                            <SelectItem value="job_assessment">Job Assessment</SelectItem>
                                            <SelectItem value="hr_interview">HR Interview</SelectItem>
                                            <SelectItem value="final_interview">Final Interview</SelectItem>
                                            <SelectItem value="accepted">Accepted</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedJob || 'all'} onValueChange={setSelectedJob}>
                                        <SelectTrigger className="w-48 bg-white/10 border-white/20 text-black">
                                            <SelectValue placeholder="All Jobs" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Jobs</SelectItem>
                                            {Array.isArray(jobs) ? jobs.map(job => (
                                                <SelectItem key={job.job_id} value={job.job_id}>
                                                    {job.job_title}
                                                </SelectItem>
                                            )) : null}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Applications List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {filteredApplications.map((application) => (
                                        <div key={application.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-black">
                                                        {application.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-black">{application.name}</span>
                                                        <Badge className={`${getStatusColor(application.status)} bg-white/20 backdrop-blur-md border-white/20`}>
                                                            {getStatusLabel(application.status)}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-black">{application.email}</div>
                                                    <div className="text-sm text-black">
                                                        {application.job?.job_title} • {application.job?.employer_name}
                                                    </div>
                                                    <div className="text-xs text-black">
                                                        Applied {formatDate(application.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedApplication(application);
                                                        setShowApplicationModal(true);
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white text-black border-white/20 hover:bg-white hover:text-black"
                                                >
                                                    <Eye className="size-4 mr-1" />
                                                    Review
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredApplications.length === 0 && (
                                        <div className="text-center py-8 text-black">
                                            No applications found matching your criteria.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Jobs Tab */}
                    <TabsContent value="jobs" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center gap-2">
                                    <Briefcase className="size-5" />
                                    Posted Jobs
                                </CardTitle>
                                <CardDescription className="text-black">Manage your posted job opportunities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Job Filters */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    {/* Search */}
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search jobs by title, employer, or description..."
                                            value={jobSearchTerm}
                                            onChange={(e) => setJobSearchTerm(e.target.value)}
                                            className="bg-white/10 border-white/20 text-black placeholder:text-black"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-black w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Type Filter */}
                                    <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                                        <SelectTrigger className="bg-white/10 border-white/20 text-black w-32">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="full-time">Full-time</SelectItem>
                                            <SelectItem value="part-time">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                            <SelectItem value="internship">Internship</SelectItem>
                                            <SelectItem value="remote">Remote</SelectItem>
                                            <SelectItem value="on-site">On-site</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters */}
                                    {(jobSearchTerm || jobStatusFilter !== 'all' || jobTypeFilter !== 'all') && (
                                        <Button
                                            onClick={() => {
                                                setJobSearchTerm('');
                                                setJobStatusFilter('all');
                                                setJobTypeFilter('all');
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="text-black border-white/20 hover:bg-white/10"
                                        >
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>

                                {/* Jobs Count */}
                                <div className="text-sm text-black mb-4">
                                    Showing {filteredJobs.length} of {jobs.length} jobs
                                </div>

                                <div className="space-y-3">
                                    {filteredJobs.length > 0 ? filteredJobs.map((job) => (
                                        <div key={job.job_id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                    <Briefcase className="size-6 text-black" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-black">{job.job_title}</div>
                                                    <div className="text-sm text-black">{job.employer_name}</div>
                                                    <div className="text-sm text-black flex items-center gap-2">
                                                        <MapPin className="size-3" />
                                                        {job.job_city}, {job.job_state}, {job.job_country}
                                                        {job.job_is_remote && <Badge className="bg-green-100 text-green-800 text-xs">Remote</Badge>}
                                                    </div>
                                                    <div className="text-sm text-black">
                                                        <Badge variant="outline" className="text-xs border-black text-black">
                                                            {job.job_employment_type}
                                                        </Badge>
                                                        {job.job_min_salary && job.job_max_salary && (
                                                            <span className="ml-2 text-xs text-black">
                                                                ${job.job_min_salary} - ${job.job_max_salary} {job.job_salary_period}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-black">
                                                        Posted {formatDate(job.job_posted_at_datetime_utc || job.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => window.open(job.job_apply_link, '_blank')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-black border-white/20 hover:bg-white/10"
                                                >
                                                    <ExternalLink className="size-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 text-black">
                                            {jobs.length === 0
                                                ? "No jobs posted yet. Create your first job posting!"
                                                : "No jobs match your current filters. Try adjusting your search or filters."
                                            }
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Post Job Modal */}
            {showPostJobModal && (
                <PostJobModal
                    onClose={() => setShowPostJobModal(false)}
                    onSubmit={handlePostJob}
                    loading={postingJob}
                />
            )}

            {/* Application Review Modal */}
            {showApplicationModal && selectedApplication && (
                <ApplicationReviewModal
                    application={selectedApplication}
                    onClose={() => {
                        setShowApplicationModal(false);
                        setSelectedApplication(null);
                        setFeedback('');
                    }}
                    onAccept={(feedback) => handleApplicationAction(selectedApplication.id, 'accept', feedback)}
                    onReject={(feedback) => handleApplicationAction(selectedApplication.id, 'reject', feedback)}
                    onAction={(action, feedback) => handleApplicationAction(selectedApplication.id, action, feedback)}
                />
            )}
        </div>
    );
}

// Post Job Modal Component
function PostJobModal({ onClose, onSubmit, loading }: {
    onClose: () => void;
    onSubmit: (jobData: any) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        job_title: '',
        employer_name: '',
        job_description: '',
        job_city: '',
        job_state: '',
        job_country: '',
        job_employment_type: 'full-time',
        job_min_salary: '',
        job_max_salary: '',
        job_salary_period: 'yearly',
        job_is_remote: false,
        job_apply_link: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.job_title || !formData.employer_name || !formData.job_description) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate salary fields if provided
        if (formData.job_min_salary && isNaN(Number(formData.job_min_salary))) {
            toast.error('Minimum salary must be a valid number');
            return;
        }

        if (formData.job_max_salary && isNaN(Number(formData.job_max_salary))) {
            toast.error('Maximum salary must be a valid number');
            return;
        }

        // Validate salary range
        if (formData.job_min_salary && formData.job_max_salary) {
            if (Number(formData.job_min_salary) > Number(formData.job_max_salary)) {
                toast.error('Minimum salary cannot be greater than maximum salary');
                return;
            }
        }

        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Post New Job</h2>
                    <Button onClick={onClose} variant="ghost" size="sm">
                        <X className="size-4" />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Job Title *</label>
                            <Input
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Company Name *</label>
                            <Input
                                value={formData.employer_name}
                                onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Job Description *</label>
                        <Textarea
                            value={formData.job_description}
                            onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <Input
                                value={formData.job_city}
                                onChange={(e) => setFormData({ ...formData, job_city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <Input
                                value={formData.job_state}
                                onChange={(e) => setFormData({ ...formData, job_state: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Country</label>
                            <Input
                                value={formData.job_country}
                                onChange={(e) => setFormData({ ...formData, job_country: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Employment Type</label>
                            <Select value={formData.job_employment_type} onValueChange={(value) => setFormData({ ...formData, job_employment_type: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="part-time">Part-time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Salary Period</label>
                            <Select value={formData.job_salary_period} onValueChange={(value) => setFormData({ ...formData, job_salary_period: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Min Salary</label>
                            <Input
                                type="number"
                                value={formData.job_min_salary}
                                onChange={(e) => setFormData({ ...formData, job_min_salary: e.target.value })}
                                placeholder="50000"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max Salary</label>
                            <Input
                                type="number"
                                value={formData.job_max_salary}
                                onChange={(e) => setFormData({ ...formData, job_max_salary: e.target.value })}
                                placeholder="80000"
                                min="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Application Link (Optional)</label>
                        <Input
                            type="url"
                            value={formData.job_apply_link}
                            onChange={(e) => setFormData({ ...formData, job_apply_link: e.target.value })}
                            placeholder="https://... (optional)"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="remote"
                            checked={formData.job_is_remote}
                            onChange={(e) => setFormData({ ...formData, job_is_remote: e.target.checked })}
                            className="rounded"
                        />
                        <label htmlFor="remote" className="text-sm font-medium">Remote position</label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" onClick={onClose} variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Job'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Application Review Modal Component
function ApplicationReviewModal({ application, onClose, onAccept, onReject, onAction }: {
    application: JobApplication;
    onClose: () => void;
    onAccept: (feedback: string) => void;
    onReject: (feedback: string) => void;
    onAction: (action: 'phone_screening' | 'job_assessment' | 'hr_interview' | 'final_interview', feedback: string) => void;
}) {
    const [feedback, setFeedback] = useState('');
    const [action, setAction] = useState<'accept' | 'reject' | 'phone_screening' | 'job_assessment' | 'hr_interview' | 'final_interview' | null>(null);

    const handleAction = () => {
        if (action === 'accept') {
            onAccept(feedback);
        } else if (action === 'reject') {
            onReject(feedback);
        } else if (action && ['phone_screening', 'job_assessment', 'hr_interview', 'final_interview'].includes(action)) {
            // Handle interview round progression - call the proper action handler
            console.log(`Handling interview action: ${action} with feedback: ${feedback}`);
            onAction(action as 'phone_screening' | 'job_assessment' | 'hr_interview' | 'final_interview', feedback);
        }
    };

    // Function to determine which buttons should be shown based on current status
    const getAvailableActions = (currentStatus: string) => {
        const actions = [];

        // Always show reject button
        actions.push('reject');

        // Show buttons based on current status
        switch (currentStatus) {
            case 'pending':
                actions.push('phone_screening');
                break;
            case 'phone_screening':
                actions.push('job_assessment');
                break;
            case 'job_assessment':
                actions.push('hr_interview');
                break;
            case 'hr_interview':
                actions.push('final_interview');
                break;
            case 'final_interview':
                actions.push('accept');
                break;
            case 'accepted':
            case 'rejected':
            case 'withdrawn':
                // No progression buttons for final states
                break;
            default:
                // For any other status, show phone screening
                actions.push('phone_screening');
        }

        console.log(`Available actions for status "${currentStatus}":`, actions);
        return actions;
    };

    const availableActions = getAvailableActions(application.status);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Review Application</h2>
                    <Button onClick={onClose} variant="ghost" size="sm">
                        <X className="size-4" />
                    </Button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Candidate Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Name:</span> {application.name}
                                </div>
                                <div>
                                    <span className="font-medium">Email:</span> {application.email}
                                </div>
                                <div>
                                    <span className="font-medium">Applied:</span> {formatDate(application.createdAt)}
                                </div>
                                <div>
                                    <span className="font-medium">Status:</span>
                                    <Badge className={`ml-2 ${getStatusColor(application.status)}`}>
                                        {getStatusLabel(application.status)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Profile Link */}
                            {/* Profile link section removed - not in database schema */}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Job Details</h3>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="font-medium">{application.job?.job_title}</div>
                                <div className="text-sm text-black">{application.job?.employer_name}</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Cover Letter</h3>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-40 overflow-y-auto">
                                <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Resume/CV</h3>
                            {application.cvFileUrl ? (
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="size-4 text-blue-600" />
                                            <span className="text-sm font-medium text-black">
                                                Resume uploaded
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                onClick={() => window.open(application.cvFileUrl, '_blank')}
                                            >
                                                <ExternalLink className="size-3 mr-1" />
                                                View Resume
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = application.cvFileUrl!;
                                                    link.download = getFileNameFromUrl(application.cvFileUrl!);
                                                    link.click();
                                                }}
                                            >
                                                <Download className="size-3 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="size-4 text-gray-400" />
                                        <span className="text-sm text-black">
                                            No resume uploaded by candidate
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Feedback (Optional)</h3>
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Provide feedback to the candidate..."
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                    {action ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                                Are you sure you want to {action === 'accept' ? 'accept' : action === 'reject' ? 'reject' : `move to ${getStatusLabel(action)}`} this application?
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button onClick={() => setAction(null)} variant="outline" size="sm">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAction}
                                    size="sm"
                                    className={
                                        action === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                                            action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                                'bg-blue-600 hover:bg-blue-700'
                                    }
                                >
                                    Yes, {action === 'accept' ? 'accept' : action === 'reject' ? 'reject' : getStatusLabel(action)}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button onClick={onClose} variant="outline">
                                Cancel
                            </Button>

                            {availableActions.map((actionType) => {
                                switch (actionType) {
                                    case 'reject':
                                        return (
                                            <Button
                                                key="reject"
                                                onClick={() => setAction('reject')}
                                                variant="outline"
                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                            >
                                                <XCircle className="size-4 mr-2" />
                                                Reject
                                            </Button>
                                        );
                                    case 'phone_screening':
                                        return (
                                            <Button
                                                key="phone_screening"
                                                onClick={() => setAction('phone_screening')}
                                                variant="outline"
                                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                            >
                                                <Phone className="size-4 mr-2" />
                                                Phone Screening
                                            </Button>
                                        );
                                    case 'job_assessment':
                                        return (
                                            <Button
                                                key="job_assessment"
                                                onClick={() => setAction('job_assessment')}
                                                variant="outline"
                                                className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                            >
                                                <MessageSquare className="size-4 mr-2" />
                                                Job Assessment
                                            </Button>
                                        );
                                    case 'hr_interview':
                                        return (
                                            <Button
                                                key="hr_interview"
                                                onClick={() => setAction('hr_interview')}
                                                variant="outline"
                                                className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                            >
                                                <Users className="size-4 mr-2" />
                                                HR Interview
                                            </Button>
                                        );
                                    case 'final_interview':
                                        return (
                                            <Button
                                                key="final_interview"
                                                onClick={() => setAction('final_interview')}
                                                variant="outline"
                                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                            >
                                                <Star className="size-4 mr-2" />
                                                Final Interview
                                            </Button>
                                        );
                                    case 'accept':
                                        return (
                                            <Button
                                                key="accept"
                                                onClick={() => setAction('accept')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="size-4 mr-2" />
                                                Accept
                                            </Button>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 