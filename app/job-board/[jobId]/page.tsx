'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CommonNavbar } from '@/components/common-navbar';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink, Share2, Copy, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Job {
    id: string;
    title: string;
    company: string;
    logo: string;
    description: string;
    job_city?: string | null;
    job_state?: string | null;
    job_country?: string | null;
    job_posted_at_datetime_utc?: string | null;
    job_apply_link?: string | null;
    job_employment_type?: string | null;
    job_is_remote?: boolean | string | null;
    job_min_salary?: string | number | null;
    job_max_salary?: string | number | null;
    job_salary_period?: string | null;
    posted_by?: string | null;
}

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const jobId = params?.jobId as string;

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`/api/jobs/${jobId}`);

                if (response.ok) {
                    const data = await response.json();
                    setJob(data.job);
                } else if (response.status === 404) {
                    toast.error('Job not found');
                    router.push('/job-board');
                } else {
                    toast.error('Failed to load job details');
                    router.push('/job-board');
                }
            } catch (error) {
                console.error('Error fetching job:', error);
                toast.error('Failed to load job details');
                router.push('/job-board');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        } else {
            // If no jobId, redirect to job board
            toast.error('Invalid job ID');
            router.push('/job-board');
            setLoading(false);
        }
    }, [jobId, router]);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${job?.title} at ${job?.company}`,
                    text: `Check out this job opportunity: ${job?.title} at ${job?.company}`,
                    url: url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            toast.error('Failed to share job');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <CommonNavbar currentPage="/job-board" hideForPublic={true} />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full size-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600 dark:text-gray-300">Loading job details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                <CommonNavbar currentPage="/job-board" hideForPublic={true} />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-lg text-gray-600 dark:text-gray-300">Job not found</p>
                        <Button
                            onClick={() => router.push('/job-board')}
                            className="mt-4 bg-purple-600 hover:bg-purple-700"
                        >
                            Back to Job Board
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <CommonNavbar currentPage="/job-board" hideForPublic={true} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6 flex items-center gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>

                {/* Job Header */}
                <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-8 shadow-xl border border-purple-200 dark:border-purple-800 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="shrink-0">
                            <img
                                src={job.logo || '/imagetemplate.png'}
                                alt={job.company}
                                className="size-20 rounded-xl border border-purple-200 dark:border-purple-700 bg-white object-cover shadow-md"
                                onError={e => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== window.location.origin + '/imagetemplate.png') {
                                        target.src = '/imagetemplate.png';
                                    }
                                }}
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                        {job.title}
                                    </h1>
                                    <h2 className="text-xl text-purple-700 dark:text-purple-300 font-semibold mb-2">
                                        {job.company}
                                    </h2>

                                    {/* Location and Date */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {(job.job_city || job.job_state) && (
                                            <span>
                                                📍 {job.job_city ? job.job_city : ''}
                                                {job.job_city && job.job_state ? ', ' : ''}
                                                {job.job_state ? job.job_state : ''}
                                                {job.job_country ? `, ${job.job_country}` : ''}
                                            </span>
                                        )}
                                        {job.job_posted_at_datetime_utc && (
                                            <span>
                                                📅 Posted: {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.job_employment_type && (
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                                                {job.job_employment_type}
                                            </span>
                                        )}
                                        {job.job_is_remote && (String(job.job_is_remote) === 'true' || job.job_is_remote === true) && (
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                                                Remote
                                            </span>
                                        )}
                                        {job.posted_by && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${job.posted_by === 'alumni'
                                                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700'
                                                : job.posted_by === 'career_team'
                                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700'
                                                    : 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                                                }`}>
                                                {job.posted_by === 'alumni' ? 'Alumni' :
                                                    job.posted_by === 'career_team' ? 'Career Team' :
                                                        job.posted_by === 'external' ? 'External' : job.posted_by}
                                            </span>
                                        )}
                                    </div>

                                    {/* Salary */}
                                    {(job.job_min_salary || job.job_max_salary) && (
                                        <div className="text-lg font-semibold text-green-700 dark:text-green-200 mb-4">
                                            💰 Salary: {job.job_min_salary && job.job_max_salary && job.job_min_salary !== job.job_max_salary
                                                ? `$${job.job_min_salary} - $${job.job_max_salary}`
                                                : job.job_min_salary
                                                    ? `$${job.job_min_salary}`
                                                    : job.job_max_salary
                                                        ? `$${job.job_max_salary}`
                                                        : ''}
                                            {job.job_salary_period ? ` / ${job.job_salary_period}` : ''}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
                                        {copied ? 'Copied!' : 'Share Job'}
                                    </Button>

                                    {job.job_apply_link && (
                                        <Button
                                            onClick={() => job.job_apply_link && window.open(job.job_apply_link, '_blank')}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            <ExternalLink className="size-4" />
                                            Apply Now
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl p-8 shadow-xl border border-purple-200 dark:border-purple-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Job Description</h3>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                            {job.description}
                        </div>
                    </div>
                </div>

                {/* Apply Section */}
                {session?.user && (
                    <div className="mt-8 text-center">
                        <Button
                            onClick={() => router.push('/job-board')}
                            className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg"
                        >
                            View All Jobs
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
