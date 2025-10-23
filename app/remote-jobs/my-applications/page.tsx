'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

interface JobApplication {
    id: string;
    jobId: string;
    jobTitle: string;
    employerName: string;
    applyLink: string;
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: string;
}

interface Job {
    job_id: string;
    job_title: string;
    employer_name: string;
    job_apply_link: string;
}

export default function RemoteJobApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
        fetchJobs();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/job-applications');
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/remote-jobs/list');
            if (res.ok) {
                const data = await res.json();
                setJobs(data.jobs || []);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'Accepted';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Pending';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            case 'rejected':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20';
            default:
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/remote-jobs')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Remote Jobs
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            My Remote Job Applications
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Track your remote job applications across MENA region
                        </p>
                    </div>
                </div>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No applications yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start applying to remote jobs to see your applications here.
                        </p>
                        <Button
                            onClick={() => router.push('/remote-jobs')}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Browse Remote Jobs
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => {
                            const job = jobs.find(j => j.job_id === application.jobId);
                            return (
                                <div
                                    key={application.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {job?.job_title || application.jobTitle}
                                                </h3>
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                                    {getStatusIcon(application.status)}
                                                    {getStatusText(application.status)}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                {job?.employer_name || application.employerName}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {job?.job_apply_link && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(job.job_apply_link, '_blank')}
                                                >
                                                    View Job
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
