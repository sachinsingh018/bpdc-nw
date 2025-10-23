import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getCookie } from 'cookies-next';
import { ApplyButton } from './ApplyButton';
import { Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

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

interface JobCardProps {
    job: Job;
    isApplied?: boolean;
    onApplicationSubmitted?: () => void;
    isHighlighted?: boolean;
    currentFilter?: string;
}

export default function JobCard({ job, isApplied = false, onApplicationSubmitted, isHighlighted = false, currentFilter = '' }: JobCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvName, setCvName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    // Add a random number of applicants per card render (placeholder)
    const [applicants] = useState(() => Math.floor(Math.random() * 23) + 2); // 2-24

    // Handle highlight animation with expand/contract effect
    useEffect(() => {
        if (isHighlighted) {
            setIsAnimating(true);
            // Create a sequence: expand -> contract -> expand -> contract -> stop
            const sequence = [
                { scale: 1.05, delay: 0 },
                { scale: 1, delay: 300 },
                { scale: 1.03, delay: 600 },
                { scale: 1, delay: 900 },
                { scale: 1.01, delay: 1200 },
                { scale: 1, delay: 1500 }
            ];

            sequence.forEach(({ scale, delay }) => {
                setTimeout(() => {
                    if (isHighlighted) { // Check if still highlighted
                        const element = document.querySelector(`[data-job-id="${job.id}"]`);
                        if (element) {
                            (element as HTMLElement).style.transform = `scale(${scale})`;
                        }
                    }
                }, delay);
            });

            // Stop animation after sequence completes
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [isHighlighted, job.id]);

    useEffect(() => {
        if (showModal) {
            const fetchUserData = async () => {
                try {
                    const userEmail = getCookie('userEmail');
                    if (!userEmail) return;
                    const response = await fetch('/profile/api', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail }),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setName(data.name || '');
                        setEmail(data.email || userEmail);
                    }
                } catch (err) {
                    // fallback: leave fields blank
                }
            };
            fetchUserData();
        }
    }, [showModal]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
            setCvName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitted(false);
        setError(null);
        setErrorDetails(null);

        try {
            const formData = new FormData();
            formData.append('jobId', job.id);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('coverLetter', coverLetter);

            // Add CV file if selected
            if (cvFile) {
                formData.append('cvFile', cvFile);
            }

            console.log('Submitting application with CV file:', cvFile ? cvFile.name : 'No CV file');

            const response = await fetch('/api/job-applications', {
                method: 'POST',
                body: formData,
            });

            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response text:', responseText);

            if (response.ok) {
                setSubmitted(true);
                // Call the callback to refresh applications list
                if (onApplicationSubmitted) {
                    onApplicationSubmitted();
                }
            } else {
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse response as JSON:', responseText);
                    data = { error: 'Server returned invalid response format' };
                }

                console.error('Application submission failed:', data);
                setError(data.error || 'Failed to submit application.');
                setErrorDetails(data.details || 'No additional details available');
            }
        } catch (err) {
            console.error('Network or other error:', err);
            setError('Network error or server unavailable');
            setErrorDetails(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    // Function to truncate description
    const truncateDescription = (text: string, maxLength: number = 300) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    // Get the description to display
    const displayDescription = showFullDescription ? job.description : truncateDescription(job.description || '');
    const shouldShowViewMore = (job.description || '').length > 300;

    // Handle sharing job
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        let jobUrl = `${window.location.origin}/job-board?highlight=${job.id}`;

        // Include current filter in the URL if it's set
        if (currentFilter) {
            jobUrl += `&filter=${currentFilter}`;
        }

        const shareText = `Check out this job opportunity: ${job.title} at ${job.company}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${job.title} at ${job.company}`,
                    text: shareText,
                    url: jobUrl,
                });
            } else {
                await navigator.clipboard.writeText(jobUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast.success('Job link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            toast.error('Failed to share job');
        }
    };

    return (
        <div
            data-job-id={job.id}
            className={`relative bg-white/95 dark:bg-slate-900/95 rounded-xl p-5 flex flex-col gap-3 border shadow-md hover:shadow-xl hover:scale-[1.025] transition-all duration-300 min-h-[15rem] h-full max-w-md w-full mx-auto font-sans ${isHighlighted
                ? 'border-yellow-400 dark:border-yellow-500 shadow-yellow-200 dark:shadow-yellow-800'
                : 'border-black dark:border-white'
                }`}
            style={{
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                boxShadow: isHighlighted
                    ? '0 0 20px rgba(251, 191, 36, 0.4), 0 10px 25px rgba(0, 0, 0, 0.15)'
                    : undefined
            }}>
            {/* Header: logo and company name only */}
            <div className="flex items-center gap-3 mb-1">
                <img
                    src={job.logo || '/imagetemplate.png'}
                    alt={job.company}
                    className="size-12 rounded-md border border-purple-100 bg-white object-cover shadow-sm"
                    onError={e => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== window.location.origin + '/imagetemplate.png') {
                            target.src = '/imagetemplate.png';
                        }
                    }}
                />
                <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-purple-700 dark:text-purple-300 truncate">{job.company}</span>
                    {job.job_country && <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">{job.job_country}</span>}
                </div>
            </div>
            {/* Job Title below company info */}
            <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight whitespace-normal break-words tracking-tight mb-1">
                {job.title}
            </div>
            {/* Location and posted date */}
            <div className="flex flex-wrap gap-2 mb-1 text-sm text-gray-500 dark:text-gray-400 font-normal">
                {(job.job_city || job.job_state) && (
                    <span>
                        {job.job_city ? job.job_city : ''}
                        {job.job_city && job.job_state ? ', ' : ''}
                        {job.job_state ? job.job_state : ''}
                    </span>
                )}
                {job.job_posted_at_datetime_utc && (
                    <span className="text-gray-500 dark:text-gray-400 font-normal">Posted: {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}</span>
                )}
            </div>
            {/* Professional tags: Employment Type, Remote, and Posted By */}
            <div className="flex gap-2 mb-1 flex-wrap">
                {job.job_employment_type && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 border border-purple-100 dark:border-purple-700 shadow-sm tracking-wide">
                        {job.job_employment_type}
                    </span>
                )}
                {job.job_is_remote && (String(job.job_is_remote) === 'true' || job.job_is_remote === true) && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-700 shadow-sm tracking-wide">
                        Remote
                    </span>
                )}
                {job.posted_by && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shadow-sm tracking-wide ${job.posted_by === 'alumni'
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-blue-100 dark:border-blue-700'
                        : job.posted_by === 'career_team'
                            ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 border-green-100 dark:border-green-700'
                            : 'bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700'
                        }`}>
                        {job.posted_by === 'alumni' ? 'Alumni' :
                            job.posted_by === 'career_team' ? 'Career Team' :
                                job.posted_by === 'external' ? 'External' : job.posted_by}
                    </span>
                )}
            </div>
            {/* Salary info */}
            {(job.job_min_salary || job.job_max_salary) && (
                <div className="mb-1 text-sm text-green-700 dark:text-green-200 font-semibold">
                    Salary: {job.job_min_salary && job.job_max_salary && job.job_min_salary !== job.job_max_salary
                        ? `$${job.job_min_salary} - $${job.job_max_salary}`
                        : job.job_min_salary
                            ? `$${job.job_min_salary}`
                            : job.job_max_salary
                                ? `$${job.job_max_salary}`
                                : ''}
                    {job.job_salary_period ? ` / ${job.job_salary_period}` : ''}
                </div>
            )}
            {/* Applicants info */}
            <div className="mb-1 text-xs text-gray-400 dark:text-gray-500 font-light italic">
                {applicants} people have also applied for this job
            </div>
            {/* Job apply link - Removed from card, now in modal */}
            {/* Action Buttons - Share and Apply */}
            <div className="flex flex-col gap-2 pt-2 border-t border-purple-100 dark:border-purple-800 w-full mt-auto">
                {/* Share Button */}
                <div className="flex justify-end w-full">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                            bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600
                            hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-150
                            focus:outline-none focus:ring-2 focus:ring-gray-400"
                        title="Share this job"
                    >
                        {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                        <span className="hidden sm:inline text-xs">{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                </div>
                {/* Apply Button */}
                <div className="flex gap-2 justify-end items-end w-full">
                    {isApplied ? (
                        <button
                            className="w-full py-2 px-4 rounded font-bold text-sm flex items-center justify-center
                            bg-green-600 text-white shadow-md border-none
                            transition-colors duration-150
                            cursor-default"
                            disabled
                        >
                            ✓ Applied
                        </button>
                    ) : (
                        <ApplyButton
                            job={job}
                            onApply={() => setShowModal(true)}
                            className="w-full py-2 px-4 rounded font-bold text-sm flex items-center justify-center
                            bg-purple-700 text-white shadow-md border-none
                            transition-colors duration-150
                            hover:bg-purple-800 active:bg-purple-900
                            focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    )}
                </div>
            </div>
            {/* Modal Popup */}
            {showModal && typeof window !== 'undefined' && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm min-h-screen">
                    <div
                        className="relative w-full max-w-xl sm:max-w-2xl mx-2 sm:mx-0 bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border-4 border-purple-300 dark:border-purple-800 p-6 sm:p-10 flex flex-col gap-6 animate-fade-in-up"
                        style={{
                            maxHeight: '92vh',
                            overflowY: 'auto',
                            boxSizing: 'border-box',
                        }}
                    >
                        <button
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 text-2xl sm:text-3xl font-bold focus:outline-none rounded-full bg-white/70 dark:bg-slate-800/70 size-12 flex items-center justify-center shadow-md"
                            onClick={() => {
                                setShowModal(false);
                                setSubmitted(false);
                                setCvFile(null);
                                setCvName('');
                                setShowFullDescription(false);
                                setError(null);
                                setErrorDetails(null);
                            }}
                            aria-label="Close"
                            tabIndex={0}
                        >
                            ×
                        </button>
                        <div className="flex items-center gap-4 mb-2">
                            <img
                                src={job.logo || '/imagetemplate.png'}
                                alt={job.company}
                                className="size-16 rounded-full border border-purple-300 bg-white object-cover shadow-sm"
                                onError={e => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src !== window.location.origin + '/imagetemplate.png') {
                                        target.src = '/imagetemplate.png';
                                    }
                                }}
                            />
                            <div className="flex-1">
                                <div className="font-mono font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-1">
                                    {job.title}
                                </div>
                                <div className="text-sm text-slate-700 dark:text-gray-300 font-mono font-bold">
                                    {job.company}
                                </div>
                                {/* View Job Posting Link - Optimally placed in modal */}
                                {job.job_apply_link && (
                                    <a
                                        href={job.job_apply_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-1 transition-colors duration-200"
                                    >
                                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        View Original Job Posting
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 text-base font-mono mb-2" style={{ whiteSpace: 'pre-line' }}>
                            {displayDescription}
                            {shouldShowViewMore && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-semibold underline focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                                >
                                    {showFullDescription ? 'View Less' : 'View More'}
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Name:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="block w-full rounded border border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Your full name"
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="block w-full rounded border border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="you@email.com"
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Cover Letter:</label>
                            <textarea
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                required
                                rows={4}
                                className="block w-full rounded border border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Write a short cover letter..."
                            />
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Attach your CV (PDF, DOCX):</label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/40 dark:file:text-purple-200 dark:hover:file:bg-purple-900/60"
                            />
                            {cvName && <span className="text-sm text-green-600 dark:text-green-400">Selected: {cvName}</span>}

                            {/* Error Display */}
                            {error && (
                                <div className="mt-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0">
                                            <svg className="size-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                                                {error}
                                            </h3>
                                            {errorDetails && (
                                                <div className="mt-1">
                                                    <p className="text-xs text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded border">
                                                        <strong>Details:</strong> {errorDetails}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setError(null);
                                                        setErrorDetails(null);
                                                    }}
                                                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="mt-2 py-3 px-6 rounded bg-purple-600 text-white font-bold font-mono shadow hover:bg-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 text-lg"
                                disabled={submitting || submitted}
                            >
                                {submitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Application'}
                            </button>
                            {submitted && <span className="text-sm text-green-600 dark:text-green-400">Application submitted successfully!</span>}
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
} 