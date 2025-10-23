import { appendFile, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { upsertPartTimeJobs, type PartTimeJob } from '@/lib/db/queries';

// Load environment variables from .env.local
config({ path: '.env.local' });

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search';

if (!JSEARCH_API_KEY) {
    console.error('❌ JSEARCH_API_KEY is not set in environment variables');
    process.exit(1);
}

const API_LIMIT = 10; // jobs per query (set to match actual API response)
const NUM_QUERIES = 8; // number of random queries per update (reduced for API plan)

// Indian cities for part-time jobs
const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
    'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

// Part-time job terms specific to India
const PART_TIME_JOB_TERMS = [
    // Tech & IT
    'Part-time Software Developer',
    'Part-time Web Developer',
    'Part-time Data Entry',
    'Part-time Content Writer',
    'Part-time Graphic Designer',
    'Part-time Digital Marketing',
    'Part-time SEO Specialist',
    'Part-time Social Media Manager',
    'Part-time Virtual Assistant',
    'Part-time Customer Support',
    'Part-time Technical Support',
    'Part-time QA Tester',
    'Part-time UI/UX Designer',
    'Part-time Mobile App Developer',
    'Part-time WordPress Developer',

    // Business & Finance
    'Part-time Accountant',
    'Part-time Bookkeeper',
    'Part-time Financial Analyst',
    'Part-time Business Analyst',
    'Part-time Sales Executive',
    'Part-time Business Development',
    'Part-time Market Research',
    'Part-time HR Assistant',
    'Part-time Recruiter',
    'Part-time Operations Assistant',

    // Education & Training
    'Part-time Teacher',
    'Part-time Tutor',
    'Part-time Online Instructor',
    'Part-time Content Creator',
    'Part-time Course Developer',
    'Part-time Educational Consultant',
    'Part-time Language Trainer',
    'Part-time Soft Skills Trainer',

    // Creative & Media
    'Part-time Video Editor',
    'Part-time Photographer',
    'Part-time Copywriter',
    'Part-time Blogger',
    'Part-time YouTuber',
    'Part-time Podcast Producer',
    'Part-time Voice Over Artist',
    'Part-time Translator',

    // Healthcare & Wellness
    'Part-time Medical Transcription',
    'Part-time Health Coach',
    'Part-time Nutritionist',
    'Part-time Fitness Trainer',
    'Part-time Yoga Instructor',

    // Retail & Customer Service
    'Part-time Sales Associate',
    'Part-time Customer Service Representative',
    'Part-time Telemarketer',
    'Part-time Call Center Agent',
    'Part-time Retail Assistant',

    // Freelance & Gig Work
    'Part-time Freelancer',
    'Part-time Consultant',
    'Part-time Project Manager',
    'Part-time Event Coordinator',
    'Part-time Travel Agent',
    'Part-time Real Estate Agent',
];

function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchPartTimeJobsForQuery(query: string, city: string) {
    const fields = [
        'job_id', 'job_title', 'employer_name', 'employer_logo', 'job_city', 'job_state', 'job_country',
        'job_posted_at_datetime_utc', 'job_apply_link', 'job_employment_type', 'job_description',
        'job_is_remote', 'job_min_salary', 'job_max_salary', 'job_salary_period'
    ].join(',');

    // Build URL with India country code and city
    const url = `${JSEARCH_URL}?query=${encodeURIComponent(query)}&num_pages=1&limit=${API_LIMIT}&language=en&fields=${fields}&country=in&location=${encodeURIComponent(city)}`;

    const apiRes = await fetch(url, {
        headers: {
            'X-RapidAPI-Key': JSEARCH_API_KEY!,
            'X-RapidAPI-Host': JSEARCH_API_HOST,
        },
        cache: 'no-store',
    });

    if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error(`API Error for query "${query}" in ${city}: ${apiRes.status} ${apiRes.statusText}`);
        console.error(`Response: ${errorText.substring(0, 200)}...`);
        throw new Error(`JSearch API error: ${apiRes.status} ${apiRes.statusText}`);
    }

    const data = await apiRes.json();
    const now = new Date().toISOString();

    return (data.data || []).map((job: any) => ({
        job_id: job.job_id,
        job_title: job.job_title,
        employer_name: job.employer_name,
        employer_logo: job.employer_logo,
        job_city: job.job_city,
        job_state: job.job_state,
        job_country: job.job_country || 'India',
        job_posted_at_datetime_utc: job.job_posted_at_datetime_utc,
        job_apply_link: job.job_apply_link,
        job_employment_type: job.job_employment_type || 'Part-time',
        job_description: job.job_description,
        job_is_remote: job.job_is_remote,
        job_min_salary: job.job_min_salary,
        job_max_salary: job.job_max_salary,
        job_salary_period: job.job_salary_period,
        searchedat: now,
    }));
}

export default async function fetchPartTimeJobsIndia() {
    let allNewJobs: Record<string, any>[] = [];
    const usedCombos = new Set<string>();

    for (let i = 0; i < NUM_QUERIES; i++) {
        let combo: string;
        let city: string;
        let jobTerm: string;

        do {
            city = getRandom(INDIAN_CITIES);
            jobTerm = getRandom(PART_TIME_JOB_TERMS);
            combo = `${jobTerm} in ${city}`;
        } while (usedCombos.has(combo));

        usedCombos.add(combo);

        try {
            const jobs = await fetchPartTimeJobsForQuery(combo, city);
            console.log(`[PART-TIME JOBS] Query: '${combo}' | City: ${city} | Returned: ${jobs.length}`);
            allNewJobs = allNewJobs.concat(jobs);
        } catch (err) {
            console.error(`Failed to fetch part-time jobs for query: ${combo}`, err);
        }
    }

    // Map jobs to correct PartTimeJob type
    const jobsToUpsert: PartTimeJob[] = allNewJobs.map(j => ({
        job_id: j.job_id,
        job_title: j.job_title ?? null,
        employer_name: j.employer_name ?? null,
        employer_logo: j.employer_logo ?? null,
        job_city: j.job_city ?? null,
        job_state: j.job_state ?? null,
        job_country: j.job_country ?? 'India',
        job_posted_at_datetime_utc: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc) : null,
        job_apply_link: j.job_apply_link ?? null,
        job_employment_type: j.job_employment_type ?? 'Part-time',
        job_description: j.job_description ?? null,
        job_is_remote: typeof j.job_is_remote === 'boolean' ? j.job_is_remote : null,
        job_min_salary: j.job_min_salary ? String(j.job_min_salary) : null,
        job_max_salary: j.job_max_salary ? String(j.job_max_salary) : null,
        job_salary_period: j.job_salary_period ?? null,
        searchedat: j.searchedat ? new Date(j.searchedat) : null,
        posted_by: 'external',
        posted_by_user_id: null,
        created_at: new Date(),
    }));

    await upsertPartTimeJobs(jobsToUpsert);
    console.log(`Fetched and upserted ${allNewJobs.length} new part-time jobs (from ${NUM_QUERIES} queries) to the database.`);
}

if (require.main === module) {
    fetchPartTimeJobsIndia().catch(err => {
        console.error('Error fetching part-time jobs:', err);
        process.exit(1);
    });
}
