'use client';
// Remote Jobs Page
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import JobCard from '@/components/JobCard';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
    ChevronDown,//asa
    ChevronUp,
    Filter as FilterIcon,
    ListFilter,
    Plus,
    X,
    Loader2
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { toast } from 'sonner';

const sortOptions = [
    { value: 'best', label: 'Best Match' },
    { value: 'ai-desc', label: 'AI Match (High → Low)' },
    { value: 'ai-asc', label: 'AI Match (Low → High)' },
    { value: 'rating-desc', label: 'Rating (High → Low)' },
    { value: 'company-az', label: 'Company (A → Z)' },
];

// Utility to generate a unique id for a job
function generateJobId(job: any, idx: number): string {
    // Use a hash of title+company+apply_link for uniqueness, fallback to index
    const base = `${job.job_title || ''}|${job.employer_name || ''}|${job.job_apply_link || ''}`;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        hash = ((hash << 5) - hash) + base.charCodeAt(i);
        hash |= 0;
    }
    return `remote_job_${Math.abs(hash)}_${idx}`;
}

export default function RemoteJobsPage() {
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
    const [countryFilter, setCountryFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    const [postingJob, setPostingJob] = useState(false);
    const [auraBotApplying, setAuraBotApplying] = useState(false);

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

    // On mount or when jobs are updated, load all remote jobs
    useEffect(() => {
        setLoading(true);
        fetch('/api/remote-jobs/list')
            .then(res => res.json())
            .then(data => {
                setJobs(data.jobs || []);
            })
            .finally(() => setLoading(false));
    }, []);

    // When search is performed, filter jobs client-side
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearch(searchInput);
        setPage(1); // Reset to first page on new search
    };

    const handlePostJob = async (jobData: any) => {
        setPostingJob(true);
        try {
            const response = await fetch('/api/remote-jobs/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Remote job posted successfully!');
                setShowPostJobModal(false);
                // Refresh jobs
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to post remote job');
            }
        } catch (error) {
            console.error('Error posting remote job:', error);
            toast.error('Failed to post remote job');
        } finally {
            setPostingJob(false);
        }
    };

    // Get all unique tags and badges for filter options
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        jobs.forEach(job => {
            if (job.job_title) {
                const words = job.job_title.toLowerCase().split(' ');
                words.forEach((word: string) => {
                    if (word.length > 2) tags.add(word);
                });
            }
            if (job.employer_name) {
                const words = job.employer_name.toLowerCase().split(' ');
                words.forEach((word: string) => {
                    if (word.length > 2) tags.add(word);
                });
            }
        });
        return Array.from(tags).sort();
    }, [jobs]);

    const allBadges = useMemo(() => {
        const badges = new Set<string>();
        jobs.forEach(job => {
            if (job.job_employment_type) badges.add(job.job_employment_type);
            if (job.job_country) badges.add(job.job_country);
        });
        return Array.from(badges).sort();
    }, [jobs]);

    // Transform remote jobs to match JobCard interface
    const transformedJobs = useMemo(() => {
        return jobs.map(job => ({
            id: job.job_id,
            title: job.job_title || 'Untitled Job',
            company: job.employer_name || 'Unknown Company',
            logo: job.employer_logo || '/imagetemplate.png',
            description: job.job_description || 'No description provided.',
            job_city: job.job_city,
            job_state: job.job_state,
            job_country: job.job_country,
            job_posted_at_datetime_utc: job.job_posted_at_datetime_utc,
            job_apply_link: job.job_apply_link,
            job_employment_type: job.job_employment_type,
            job_is_remote: job.job_is_remote,
            job_min_salary: job.job_min_salary,
            job_max_salary: job.job_max_salary,
            job_salary_period: job.job_salary_period,
            posted_by: job.posted_by,
            match_percentage: 85, // Default value for remote jobs
            rating: 4.5, // Default rating
        }));
    }, [jobs]);

    // Filter jobs based on search, tags, and badges
    const filteredJobs = useMemo(() => {
        return transformedJobs.filter(job => {
            const searchMatch = !search ||
                job.title?.toLowerCase().includes(search.toLowerCase()) ||
                job.company?.toLowerCase().includes(search.toLowerCase()) ||
                job.description?.toLowerCase().includes(search.toLowerCase());

            const tagMatch = tagFilters.length === 0 ||
                tagFilters.some(tag =>
                    job.title?.toLowerCase().includes(tag.toLowerCase()) ||
                    job.company?.toLowerCase().includes(tag.toLowerCase())
                );

            const badgeMatch = badgeFilters.length === 0 ||
                badgeFilters.some(badge =>
                    job.job_employment_type === badge ||
                    job.job_country === badge
                );

            const countryMatch = !countryFilter || job.job_country === countryFilter;
            const categoryMatch = !categoryFilter || job.title?.toLowerCase().includes(categoryFilter.toLowerCase());

            return searchMatch && tagMatch && badgeMatch && countryMatch && categoryMatch;
        });
    }, [transformedJobs, search, tagFilters, badgeFilters, countryFilter, categoryFilter]);

    // Sort jobs
    const sortedJobs = useMemo(() => {
        const sorted = [...filteredJobs];
        switch (sort) {
            case 'ai-desc':
                return sorted.sort((a, b) => (b.match_percentage || 0) - (a.match_percentage || 0));
            case 'ai-asc':
                return sorted.sort((a, b) => (a.match_percentage || 0) - (b.match_percentage || 0));
            case 'rating-desc':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'company-az':
                return sorted.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
            default:
                return sorted;
        }
    }, [filteredJobs, sort]);

    // Paginate jobs
    const paginatedJobs = useMemo(() => {
        const start = (page - 1) * JOBS_PER_PAGE;
        return sortedJobs.slice(start, start + JOBS_PER_PAGE);
    }, [sortedJobs, page]);

    const totalPages = Math.ceil(sortedJobs.length / JOBS_PER_PAGE);

    // Handle job application
    const handleApply = async (jobId: string) => {
        setAuraBotApplying(true);
        try {
            const res = await fetch('/api/job-applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobId,
                    jobTitle: jobs.find(j => j.job_id === jobId)?.job_title,
                    employerName: jobs.find(j => j.job_id === jobId)?.employer_name,
                    applyLink: jobs.find(j => j.job_id === jobId)?.job_apply_link,
                }),
            });

            if (res.ok) {
                toast.success('Application submitted successfully!');
            } else {
                toast.error('Failed to submit application');
            }
        } catch (error) {
            console.error('Error applying:', error);
            toast.error('Failed to submit application');
        } finally {
            setAuraBotApplying(false);
        }
    };

    return (
        <div
            className="relative min-h-screen w-full overflow-x-hidden font-sans"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%237C3AED' fill-opacity='0.3'/%3E%3C/svg%3E")`
            }}
        >
            <div ref={topRef} />
            {/* Header */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                        >
                            <div className="size-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Sparkles className="size-5 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Networkqy
                            </span>
                        </button>
                    </div>
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Home className="size-4" />
                            <span>Home</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/friends')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Users className="size-4" />
                            <span>Friends</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/job-board')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <Briefcase className="size-4" />
                            <span>Job Board</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/remote-jobs')}
                            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold"
                        >
                            <Briefcase className="size-4" />
                            <span>Remote Jobs</span>
                        </Button>
                    </div>
                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                            <User className="size-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex-1 space-y-4">
                    <h1
                        className="text-5xl font-extrabold tracking-normal text-black dark:text-white mb-2 z-[60] pointer-events-auto relative"
                        style={{ fontFamily: "'Press Start 2P', 'Lucida Console', 'Courier New', Courier, monospace", letterSpacing: '-0.02em' }}
                    >
                        Remote Jobs
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-200 font-light max-w-2xl mb-4 ml-1">
                        Discover and apply to remote jobs using AI.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-white/10 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <form onSubmit={handleSearch} className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                                <input
                                    type="text"
                                    placeholder="Search remote jobs..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                                    Search
                                </Button>
                            </form>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setSortOpen(!sortOpen)}
                                className="flex items-center gap-2 min-w-[150px]"
                            >
                                <ListFilter className="size-4" />
                                {sortOptions.find(opt => opt.value === sort)?.label || 'Sort'}
                                {sortOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                            </Button>
                            {sortOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-10">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSort(option.value);
                                                setSortOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        <Button
                            variant="outline"
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="flex items-center gap-2"
                        >
                            <FilterIcon className="size-4" />
                            Filters
                            {filtersOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </Button>

                        {/* Post Job */}
                        <Button
                            onClick={() => setShowPostJobModal(true)}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Plus className="size-4" />
                            Post Remote Job
                        </Button>
                    </div>

                    {/* Filters Panel */}
                    {filtersOpen && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Country Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Country
                                    </label>
                                    <select
                                        value={countryFilter}
                                        onChange={(e) => setCountryFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Countries</option>
                                        {allBadges.filter(badge =>
                                            ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt', 'Morocco', 'Tunisia', 'Algeria'].includes(badge)
                                        ).map(badge => (
                                            <option key={badge} value={badge}>{badge}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="developer">Developer</option>
                                        <option value="designer">Designer</option>
                                        <option value="manager">Manager</option>
                                        <option value="analyst">Analyst</option>
                                        <option value="marketing">Marketing</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Jobs Grid */}
                <div className="mb-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="size-8 animate-spin text-purple-600" />
                            <p className="text-lg text-gray-500 dark:text-gray-400 ml-3">Loading remote jobs...</p>
                        </div>
                    ) : paginatedJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" ref={gridRef}>
                            {paginatedJobs.map((job, idx) => (
                                <JobCard
                                    key={generateJobId(job, idx)}
                                    job={job}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Briefcase className="size-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No remote jobs found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Try adjusting your search criteria or check back later for new opportunities.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-gray-600 dark:text-gray-400">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
