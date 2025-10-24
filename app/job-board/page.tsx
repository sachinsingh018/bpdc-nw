'use client';
// Job Board Page
import React, { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import JobCard from '@/components/JobCard';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import {
    Home,
    Users,
    MessageSquare,
    MessageCircle,
    User,
    Bell,
    Menu,
    Sparkles,
    Briefcase,
    Search as SearchIcon,
    ChevronDown,
    ChevronUp,
    Filter as FilterIcon,
    ListFilter,
    Plus,
    X,
    Loader2
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommonNavbar } from '@/components/common-navbar';
import { toast } from 'sonner';

// Remove the placeholder jobs array

const sortOptions = [
    { value: 'best', label: 'Best Match' },
    { value: 'ai-desc', label: 'AI Match (High → Low)' },
    { value: 'ai-asc', label: 'AI Match (Low → High)' },
    { value: 'rating-desc', label: 'Rating (High → Low)' },
    { value: 'company-az', label: 'Company (A → Z)' },
];

// Utility to generate a unique id for a job
function generateJobId(job: any, idx: number, isRemote: boolean = false): string {
    // Use a hash of title+company+apply_link for uniqueness, fallback to index
    const base = `${job.job_title || ''}|${job.employer_name || ''}|${job.job_apply_link || ''}`;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        hash = ((hash << 5) - hash) + base.charCodeAt(i);
        hash |= 0;
    }
    return `${isRemote ? 'remote_' : ''}job_${Math.abs(hash)}_${idx}`;
}

function JobBoardContent() {
    const bgRef = useRef<HTMLDivElement>(null);
    const [scrollY, setScrollY] = useState(0);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sort, setSort] = useState('best');
    const [tagFilters, setTagFilters] = useState<string[]>([]);
    const [badgeFilters, setBadgeFilters] = useState<string[]>([]);
    const router = useRouter();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const JOBS_PER_PAGE = 32;
    const [page, setPage] = useState(1);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const hasMounted = useRef(false);
    const topRef = useRef<HTMLDivElement>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // Remove updating and updateMsg state
    const [countryFilter, setCountryFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    const [postingJob, setPostingJob] = useState(false);
    const [auraBotApplying, setAuraBotApplying] = useState(false);
    const [userApplications, setUserApplications] = useState<any[]>([]);
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [highlightedJobId, setHighlightedJobId] = useState<string | null>(null);

    // Toggle state for switching between All Jobs, Remote Jobs, and Part-time Jobs
    const [jobType, setJobType] = useState<'all' | 'remote' | 'parttime'>('all');

    // Function to handle toggle change
    const handleToggleChange = (type: 'all' | 'remote' | 'parttime') => {
        setJobType(type);
        // Reset search and filters when switching job types
        setSearch('');
        setSearchInput('');
        setCountryFilter('');
        setCategoryFilter('');
        setPage(1);
    };

    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [page]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkScreen = () => setIsLargeScreen(window.innerWidth >= 1024);
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Handle highlighted job from URL parameters
    useEffect(() => {
        const jobId = searchParams?.get('highlight');
        const filterParam = searchParams?.get('filter');

        // Set filter from URL parameter if present
        if (filterParam && filterParam !== categoryFilter) {
            setCategoryFilter(filterParam);
        }

        if (jobId) {
            setHighlightedJobId(jobId);

            // Find which page the job is on
            const jobIndex = jobs.findIndex(job => job.id === jobId);
            if (jobIndex !== -1) {
                const targetPage = Math.floor(jobIndex / JOBS_PER_PAGE) + 1;

                // If job is not on current page, navigate to the correct page
                if (targetPage !== page) {
                    setPage(targetPage);
                }
            } else {
                // If job not found in current filtered results, clear filters to show all jobs
                if (search || countryFilter || (categoryFilter && !filterParam)) {
                    setSearch('');
                    setSearchInput('');
                    setCountryFilter('');
                    if (!filterParam) {
                        setCategoryFilter('');
                    }
                    setPage(1);
                }
            }

            // Function to scroll to the job card
            const scrollToJobCard = () => {
                const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
                if (jobCard) {
                    jobCard.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                    return true;
                }
                return false;
            };

            // Try to scroll immediately, then retry if not found (in case of pagination/filtering)
            setTimeout(() => {
                if (!scrollToJobCard()) {
                    // If job card not found, try again after a longer delay
                    setTimeout(() => {
                        scrollToJobCard();
                    }, 500);
                }
            }, 100);

            // Remove highlight after animation sequence completes
            setTimeout(() => {
                setHighlightedJobId(null);
                // Clean up URL - only remove highlight, keep filter parameter
                const url = new URL(window.location.href);
                url.searchParams.delete('highlight');
                window.history.replaceState({}, '', url.toString());
            }, 2000); // Match the animation duration
        }
    }, [searchParams, jobs, page]);

    // Get all unique tags and badges for filter options
    const allTags: string[] = useMemo(() => Array.from(new Set(jobs.flatMap(j => j.tags))), []);
    const allBadges = useMemo(() => Array.from(new Set(jobs.flatMap(j => j.badges))), []);

    // Calculate most common tags and badges
    const tagCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        jobs.flatMap(j => j.tags).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1; });
        return counts;
    }, []);
    const badgeCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        jobs.flatMap(j => j.badges).forEach(badge => { counts[badge] = (counts[badge] || 0) + 1; });
        return counts;
    }, []);
    const sortedTags: string[] = useMemo(() => allTags.slice().sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0)), [allTags, tagCounts]);
    const sortedBadges = useMemo(() => allBadges.slice().sort((a, b) => (badgeCounts[b] || 0) - (badgeCounts[a] || 0)), [allBadges, badgeCounts]);

    // Normalization function for jobs
    function normalizeJob(job: any, idx: number) {
        return {
            id: job.job_id || job.id || generateJobId(job, idx, jobType !== 'all') || idx,
            title: job.job_title && job.job_title.trim() ? job.job_title : 'Untitled Job',
            company: job.employer_name && job.employer_name.trim() ? job.employer_name : 'Unknown Company',
            description: job.job_description && job.job_description.trim() ? job.job_description : 'No description provided.',
            logo: job.employer_logo && job.employer_logo.trim() ? job.employer_logo : (job.logo && job.logo.trim() ? job.logo : '/images/default-logo.png'),
            job_city: job.job_city && job.job_city.trim() ? job.job_city : '',
            job_state: job.job_state && job.job_state.trim() ? job.job_state : '',
            job_country: job.job_country && job.job_country.trim() ? job.job_country : '',
            job_posted_at_datetime_utc: job.job_posted_at_datetime_utc && job.job_posted_at_datetime_utc.trim() ? job.job_posted_at_datetime_utc : '',
            job_apply_link: job.job_apply_link && job.job_apply_link.trim() ? job.job_apply_link : '',
            job_employment_type: job.job_employment_type || '',
            job_is_remote: job.job_is_remote,
            job_min_salary: job.job_min_salary,
            job_max_salary: job.job_max_salary,
            job_salary_period: job.job_salary_period,
            posted_by: job.posted_by || 'external',
            searchedAt: job.searchedat || job.searchedAt || '',
        };
    }
    // Always work with normalized jobs, sorted by most recent searchedAt
    const normalizedJobs = useMemo(() => {
        return jobs
            .map(normalizeJob)
            .sort((a, b) => {
                const aTime = a.searchedAt ? new Date(a.searchedAt).getTime() : 0;
                const bTime = b.searchedAt ? new Date(b.searchedAt).getTime() : 0;
                return bTime - aTime; // Most recent first
            });
    }, [jobs, jobType]);
    // Get all unique countries for the filter dropdown
    const allCountries = useMemo(() => {
        const countries = new Set<string>();
        normalizedJobs.forEach(job => {
            if (job.job_country && job.job_country.trim()) {
                countries.add(job.job_country.trim());
            }
        });
        return Array.from(countries).sort();
    }, [normalizedJobs]);

    // Get category counts for stats
    const categoryCounts = useMemo(() => {
        const counts = { alumni: 0, career_team: 0, external: 0 };
        normalizedJobs.forEach(job => {
            const category = job.posted_by || 'external';
            if (counts.hasOwnProperty(category)) {
                counts[category as keyof typeof counts]++;
            }
        });
        return counts;
    }, [normalizedJobs]);

    // Filter and sort jobs
    const filteredJobs = useMemo(() => {
        if (!search.trim() && !countryFilter && !categoryFilter) return normalizedJobs;
        const term = search.trim().toLowerCase();
        const wordRegex = term ? new RegExp(`\\b${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i') : null;
        return normalizedJobs.filter(job => {
            const matchesSearch = !wordRegex ||
                wordRegex.test(job.title || '') ||
                wordRegex.test(job.company || '') ||
                wordRegex.test(job.job_city || '') ||
                wordRegex.test(job.job_state || '') ||
                wordRegex.test(job.job_country || '');
            const matchesCountry = !countryFilter || (job.job_country && job.job_country.trim() === countryFilter);
            const matchesCategory = !categoryFilter || job.posted_by === categoryFilter;
            return matchesSearch && matchesCountry && matchesCategory;
        });
    }, [search, countryFilter, categoryFilter, normalizedJobs]);

    // Pagination logic
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
    const paginatedJobs = filteredJobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

    // Add overlay close on Escape
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setFiltersOpen(false);
                setSortOpen(false);
            }
        }
        if (filtersOpen || sortOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filtersOpen, sortOpen]);

    // Fetch user applications
    const fetchUserApplications = async () => {
        if (!session?.user?.email) return;

        try {
            const response = await fetch(`/api/job-applications?email=${encodeURIComponent(session.user.email)}`);
            const data = await response.json();
            if (response.ok) {
                setUserApplications(data.applications || []);
            }
        } catch (error) {
            console.error('Error fetching user applications:', error);
        }
    };

    // Check if a job has been applied to by the current user
    const isJobApplied = (jobId: string) => {
        if (!session?.user?.email) return false;
        return userApplications.some(app =>
            String(app.jobId) === String(jobId) && !app.withdrawn
        );
    };

    // On mount or when jobs are updated, load jobs based on toggle state
    useEffect(() => {
        setLoading(true);
        const fetchJobs = async () => {
            try {
                let apiEndpoint = '/api/jobs/list';
                if (jobType === 'remote') {
                    apiEndpoint = '/api/remote-jobs/list';
                } else if (jobType === 'parttime') {
                    apiEndpoint = '/api/part-time-jobs/list';
                }
                const response = await fetch(apiEndpoint);
                const data = await response.json();
                setJobs(data.jobs || []);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                toast.error('Failed to fetch jobs.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [jobType]); // Add jobType to dependency array

    // Fetch user applications when session changes
    useEffect(() => {
        if (session?.user?.email) {
            fetchUserApplications();
        } else {
            setUserApplications([]);
        }
    }, [session]);

    // When search is performed, filter jobs client-side
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearch(searchInput);
        // No need to fetch from backend; filtering is handled by filteredJobs useMemo
        setPage(1); // Reset to first page on new search
    };

    const handlePostJob = async (jobData: any) => {
        setPostingJob(true);
        try {
            let apiEndpoint = '/api/jobs/post';
            if (jobType === 'remote') {
                apiEndpoint = '/api/remote-jobs/post';
            } else if (jobType === 'parttime') {
                apiEndpoint = '/api/part-time-jobs/post';
            }
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Job posted successfully!');
                setShowPostJobModal(false);
                // Refresh jobs
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to post job');
            }
        } catch (error) {
            console.error('Error posting job:', error);
            toast.error('Failed to post job');
        } finally {
            setPostingJob(false);
        }
    };

    return (
        <div
            className="relative min-h-screen w-full overflow-x-hidden font-sans"
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
            {/* Navbar */}
            <CommonNavbar currentPage="job-board" />
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
            {/* 1. Wrap all main content (including heading, search, job grid, etc.) in the blur wrapper: */}
            <div className="transition-all duration-200">
                <div className="flex flex-col gap-6 max-w-7xl mx-auto py-12 px-4">
                    <div className="flex-1 space-y-4">
                        <h1
                            className="text-5xl font-extrabold tracking-normal text-black dark:text-white mb-2 z-[60] pointer-events-auto relative"
                            style={{ fontFamily: "'Press Start 2P', 'Lucida Console', 'Courier New', Courier, monospace", letterSpacing: '-0.02em' }}
                        >
                            {jobType === 'remote' ? 'Remote Jobs' : jobType === 'parttime' ? 'Part-time Jobs' : 'Job Board'}
                        </h1>
                        <p className="text-lg text-gray-700 dark:text-gray-200 font-light max-w-2xl mb-4 ml-1">
                            Discover and apply to {jobType === 'remote' ? 'remote' : jobType === 'parttime' ? 'part-time' : ''} jobs using AI.
                        </p>

                        {/* Jobs Toggle */}
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4 w-fit">
                            <button
                                onClick={() => handleToggleChange('all')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${jobType === 'all'
                                    ? 'bg-white dark:bg-gray-600 text-bits-golden-yellow dark:text-bits-golden-yellow shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                All Jobs
                            </button>
                            <button
                                onClick={() => handleToggleChange('remote')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${jobType === 'remote'
                                    ? 'bg-white dark:bg-gray-600 text-bits-golden-yellow dark:text-bits-golden-yellow shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Remote Jobs
                            </button>
                            <button
                                onClick={() => handleToggleChange('parttime')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${jobType === 'parttime'
                                    ? 'bg-white dark:bg-gray-600 text-bits-golden-yellow dark:text-bits-golden-yellow shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Part-time Jobs
                            </button>
                        </div>
                        {/* Category Stats */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            {/* Alumni button commented out */}
                            {/* <button
                                onClick={() => setCategoryFilter(categoryFilter === 'alumni' ? '' : 'alumni')}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${categoryFilter === 'alumni'
                                    ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600 shadow-lg'
                                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                                    }`}
                            >
                                <div className="size-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Alumni: {categoryCounts.alumni}</span>
                            </button> */}
                            <button
                                onClick={() => setCategoryFilter(categoryFilter === 'career_team' ? '' : 'career_team')}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${categoryFilter === 'career_team'
                                    ? 'bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 shadow-lg'
                                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40'
                                    }`}
                            >
                                <div className="size-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">Partner Recruiters: {categoryCounts.career_team}</span>
                            </button>
                            <button
                                onClick={() => setCategoryFilter(categoryFilter === 'external' ? '' : 'external')}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${categoryFilter === 'external'
                                    ? 'bg-gray-100 dark:bg-gray-900/40 border-gray-400 dark:border-gray-600 shadow-lg'
                                    : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900/40'
                                    }`}
                            >
                                <div className="size-3 bg-gray-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">External: {categoryCounts.external}</span>
                            </button>
                        </div>
                        {/* Always-visible Search Bar with Filter/Sort Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-2 border-black dark:border-white rounded-lg px-3 py-2 text-sm shadow-md relative">
                            <form onSubmit={handleSearch} className="flex items-center gap-1 w-full">
                                <div className="flex items-center gap-2 flex-grow">
                                    <SearchIcon className="size-4 text-gray-500 dark:text-gray-300" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${jobType === 'remote' ? 'remote ' : jobType === 'parttime' ? 'part-time ' : ''}jobs...`}
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder-gray-300 text-sm py-1 w-full"
                                    />
                                    <button
                                        type="submit"
                                        className="ml-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold flex items-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                        aria-label="Search"
                                    >
                                        <SearchIcon className="size-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* Controls Row: View My Applications, Post Job, Filters */}
                        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 mb-4 w-full">
                            {/* View My Applications */}
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0"
                                onClick={() => router.push('/job-board/my-applications')}
                            >
                                View My Applications
                            </Button>
                            {/* Auto Applier Aura Bot Button - Commented out */}
                            {/* <Button
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0 flex items-center gap-2"
                                onClick={async () => {
                                    if (loading || paginatedJobs.length < 1) return;
                                    let userEmail = '';
                                    try {
                                        userEmail = (typeof window !== 'undefined') ? require('js-cookie').get('userEmail') : '';
                                    } catch { }
                                    if (!userEmail) {
                                        toast.error('Could not detect your email. Please log in.');
                                        return;
                                    }
                                    setAuraBotApplying(true);
                                    // Filter out already applied jobs and pick 3 random jobs
                                    const availableJobs = paginatedJobs.filter(job => !isJobApplied(job.id));

                                    if (availableJobs.length === 0) {
                                        setAuraBotApplying(false);
                                        toast.info('No new jobs available to apply to. You have already applied to all visible jobs!');
                                        return;
                                    }

                                    const jobsToApply = [...availableJobs]
                                        .sort(() => 0.5 - Math.random())
                                        .slice(0, Math.min(3, availableJobs.length));
                                    let successCount = 0;
                                    let failCount = 0;
                                    for (const job of jobsToApply) {
                                        try {
                                            const res = await fetch('/api/job-applications', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    jobId: job.id,
                                                    name: 'Aura Bot',
                                                    email: userEmail,
                                                    coverLetter: 'Hey this is your applicant'
                                                })
                                            });
                                            if (res.ok) {
                                                successCount++;
                                            } else {
                                                failCount++;
                                            }
                                            // Add a small delay for animation effect
                                            await new Promise(res => setTimeout(res, 600));
                                        } catch (err) {
                                            failCount++;
                                        }
                                    }
                                    setAuraBotApplying(false);

                                    // Refresh applications list to update UI
                                    if (successCount > 0) {
                                        await fetchUserApplications();
                                    }

                                    if (successCount > 0) {
                                        toast.success(`Aura Bot applied to ${successCount} job${successCount > 1 ? 's' : ''} successfully! (${availableJobs.length} available jobs found)`);
                                    }
                                    if (failCount > 0) {
                                        toast.error(`Aura Bot failed to apply to ${failCount} job${failCount > 1 ? 's' : ''}.`);
                                    }
                                }}
                            >
                                <Sparkles className="size-4" />
                                Auto Applier Aura Bot
                            </Button> */}
                            {/* Post Job Button - Hidden */}
                            {/* <Button
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0 flex items-center gap-2"
                                onClick={() => setShowPostJobModal(true)}
                            >
                                <Plus className="size-4" />
                                Post {jobType === 'remote' ? 'Remote ' : jobType === 'parttime' ? 'Part-time ' : ''}Job
                            </Button> */}
                            {/* Category Filter Dropdown */}
                            <label htmlFor="category-filter" className="font-semibold text-sm text-gray-700 dark:text-gray-200 ml-2">Category:</label>
                            <select
                                id="category-filter"
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                style={{ minWidth: 140 }}
                            >
                                <option value="">All Categories</option>
                                {/* <option value="alumni">Alumni</option> */}
                                <option value="career_team">Partner Recruiters</option>
                                <option value="external">External</option>
                            </select>
                            {/* Country Filter Dropdown */}
                            <label htmlFor="country-filter" className="font-semibold text-sm text-gray-700 dark:text-gray-200 ml-2">Country:</label>
                            <select
                                id="country-filter"
                                value={countryFilter}
                                onChange={e => setCountryFilter(e.target.value)}
                                className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                style={{ minWidth: 140 }}
                            >
                                <option value="">All Countries</option>
                                {allCountries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                            {/* Clear Filters Button */}
                            {(categoryFilter || countryFilter || search) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCategoryFilter('');
                                        setCountryFilter('');
                                        setSearch('');
                                        setSearchInput('');
                                        setPage(1);
                                    }}
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>

                        {/* Partner Recruiters Message */}
                        {categoryFilter === 'career_team' && (
                            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-700 shadow-lg">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">✓</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                                        Partner Recruiter Opportunities
                                    </h3>
                                </div>
                                <p className="text-green-700 dark:text-green-300 leading-relaxed">
                                    These positions are posted by our trusted partner recruiters and offer the highest probability of receiving a callback.
                                    Our partners have direct relationships with hiring managers and can provide personalized support throughout your application process.
                                </p>
                            </div>
                        )}

                        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 min-h-[400px] items-stretch">
                            {loading ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-lg text-gray-500 dark:text-gray-400">Loading jobs...</p>
                                </div>
                            ) : paginatedJobs.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-lg text-gray-500 dark:text-gray-400">No jobs found matching your criteria.</p>
                                </div>
                            ) : (
                                paginatedJobs.map((job, idx) => (
                                    <JobCard
                                        key={job.id || idx}
                                        job={job}
                                        isApplied={isJobApplied(job.id)}
                                        onApplicationSubmitted={fetchUserApplications}
                                        isHighlighted={highlightedJobId === job.id}
                                        currentFilter={categoryFilter}
                                    />
                                ))
                            )}
                        </div>
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8 z-[60] pointer-events-auto relative">
                                <button
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-lg"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <div className="px-6 py-3 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Page {page} of {totalPages}</span>
                                </div>
                                <button
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-lg"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Post Job Modal */}
            {showPostJobModal && (
                <PostJobModal
                    onClose={() => setShowPostJobModal(false)}
                    onSubmit={handlePostJob}
                    loading={postingJob}
                />
            )}
            {/* Aura Bot Animation Modal - Commented out */}
            {/* {auraBotApplying && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-fade-in-up border-4 border-yellow-300 dark:border-yellow-700">
                        <Loader2 className="size-12 text-yellow-500 animate-spin mb-2" />
                        <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">Aura Bot is applying to jobs for you...</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">Sit back and relax while Aura Bot fills your applications!</div>
                    </div>
                </div>
            )} */}
        </div>
    );
}

// Main component with Suspense wrapper
export default function JobBoardPage() {
    return (
        <Suspense fallback={
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
                    <h2 className="text-xl font-bold text-black mb-2">Loading job board...</h2>
                    <p className="text-black font-medium">Fetching opportunities</p>
                </div>
            </div>
        }>
            <JobBoardContent />
        </Suspense>
    );
}

// Post Job Modal Component
function PostJobModal({ onClose, onSubmit, loading }: {
    onClose: () => void;
    onSubmit: (jobData: any) => void;
    loading: boolean;
}) {
    const [formData, setFormData] = useState({
        jobTitle: '',
        employerName: '',
        jobCity: '',
        jobState: '',
        jobCountry: '',
        jobApplyLink: '',
        jobDescription: '',
        jobEmploymentType: 'Full-time',
        jobIsRemote: false,
        jobMinSalary: '',
        jobMaxSalary: '',
        jobSalaryPeriod: 'Annual',
        postedBy: 'alumni'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-purple-200/50 dark:border-purple-700/50 shadow-2xl shadow-purple-500/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                            <Plus className="size-5 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Post a Job</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                        <X className="size-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.jobTitle}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="e.g., Senior Software Engineer"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.employerName}
                                onChange={(e) => setFormData(prev => ({ ...prev, employerName: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="e.g., Tech Corp Inc."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                value={formData.jobCity}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobCity: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="e.g., San Francisco"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                State/Province
                            </label>
                            <input
                                type="text"
                                value={formData.jobState}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobState: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="e.g., California"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                value={formData.jobCountry}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobCountry: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="e.g., United States"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Employment Type
                            </label>
                            <select
                                value={formData.jobEmploymentType}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobEmploymentType: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Posted By
                            </label>
                            <select
                                value={formData.postedBy}
                                onChange={(e) => setFormData(prev => ({ ...prev, postedBy: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            >
                                {/* <option value="alumni">Alumni</option> */}
                                <option value="career_team">Partner Recruiters</option>
                                <option value="external">External</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                            <input
                                type="checkbox"
                                id="remote"
                                checked={formData.jobIsRemote}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobIsRemote: e.target.checked }))}
                                className="size-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500/20"
                            />
                            <label htmlFor="remote" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Remote Position
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Application Link *
                        </label>
                        <input
                            type="url"
                            required
                            value={formData.jobApplyLink}
                            onChange={(e) => setFormData(prev => ({ ...prev, jobApplyLink: e.target.value }))}
                            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            placeholder="https://company.com/careers/job-123"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Min Salary
                            </label>
                            <input
                                type="text"
                                value={formData.jobMinSalary}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobMinSalary: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="50000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Max Salary
                            </label>
                            <input
                                type="text"
                                value={formData.jobMaxSalary}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobMaxSalary: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="80000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Salary Period
                            </label>
                            <select
                                value={formData.jobSalaryPeriod}
                                onChange={(e) => setFormData(prev => ({ ...prev, jobSalaryPeriod: e.target.value }))}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            >
                                <option value="Annual">Annual</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Hourly">Hourly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Job Description *
                        </label>
                        <textarea
                            required
                            rows={6}
                            value={formData.jobDescription}
                            onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            placeholder="Describe the role, responsibilities, requirements, and qualifications..."
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                            {loading ? 'Posting...' : 'Post Job'}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 