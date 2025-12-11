import { appendFile, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { upsertJobs, type Job } from '@/lib/db/queries';

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
const NUM_QUERIES = 10; // number of random queries per update (reduced for API plan)

const COUNTRIES: { name: string; code: string }[] = [

  { name: 'India', code: 'in' },
  { name: 'United Arab Emirates', code: 'ae' },
  { name: 'Global', code: '' }, // No country filter
];
const JOB_TERMS = [
  // Broad tech domains
  'Software Development',
  'Information Technology',
  'Artificial Intelligence',
  'Machine Learning',
  'Cybersecurity',
  'Cloud Computing',
  'Data Science',
  'DevOps',
  'Blockchain',
  'Web Development',
  'Mobile Development',
  'Computer Engineering',
  'Product Management',
  'User Experience',
  'Quality Assurance',
  'Technical Writing',

  // Business & operations
  'Business Development',
  'Operations Management',
  'Project Management',
  'Customer Success',
  'Human Resources',
  'Consulting',

  // Marketing & creative
  'Marketing',
  'Digital Marketing',
  'Social Media',
  'Content Creation',
  'Graphic Design',
  'SEO',

  // Finance & analytics
  'Finance',
  'Accounting',
  'Investment',
  'Financial Analysis',
  'Data Analytics',
  'Risk Management',

  // Education & writing
  'Education',
  'Instructional Design',
  'E-learning',
  'Content Writing',
];


function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchJobsForQuery(query: string, countryCode: string) {
  const fields = [
    'job_id', 'job_title', 'employer_name', 'employer_logo', 'job_city', 'job_state', 'job_country',
    'job_posted_at_datetime_utc', 'job_apply_link', 'job_employment_type', 'job_description',
    'job_is_remote', 'job_min_salary', 'job_max_salary', 'job_salary_period'
  ].join(',');
  // Build URL, omitting country param if code is ''
  let url = `${JSEARCH_URL}?query=${encodeURIComponent(query)}&num_pages=1&limit=${API_LIMIT}&language=en&fields=${fields}`;
  if (countryCode) {
    url += `&country=${countryCode}`;
  }
  const apiRes = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': JSEARCH_API_KEY!,
      'X-RapidAPI-Host': JSEARCH_API_HOST,
    },
    cache: 'no-store',
  });
  if (!apiRes.ok) {
    const errorText = await apiRes.text();
    console.error(`API Error for query "${query}": ${apiRes.status} ${apiRes.statusText}`);
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
    job_country: job.job_country,
    job_posted_at_datetime_utc: job.job_posted_at_datetime_utc,
    job_apply_link: job.job_apply_link,
    job_employment_type: job.job_employment_type,
    job_description: job.job_description,
    job_is_remote: job.job_is_remote,
    job_min_salary: job.job_min_salary,
    job_max_salary: job.job_max_salary,
    job_salary_period: job.job_salary_period,
    searchedAt: now,
  }));
}

export default async function fetchTechJobsToCSV() {
  let allNewJobs: Record<string, any>[] = [];
  const usedCombos = new Set<string>();
  for (let i = 0; i < NUM_QUERIES; i++) {
    let combo: string;
    let countryObj: { name: string; code: string };
    let jobTerm: string;
    do {
      countryObj = getRandom(COUNTRIES);
      jobTerm = getRandom(JOB_TERMS);
      combo = countryObj.code ? `${jobTerm} jobs in ${countryObj.name}` : `${jobTerm} jobs`;
    } while (usedCombos.has(combo));
    usedCombos.add(combo);
    try {
      const jobs = await fetchJobsForQuery(combo, countryObj.code);
      console.log(`[JOBS] Query: '${combo}' | Country: ${countryObj.code || 'Global'} | Returned: ${jobs.length}`);
      allNewJobs = allNewJobs.concat(jobs);
    } catch (err) {
      console.error(`Failed to fetch jobs for query: ${combo}`, err);
    }
  }
  // Map jobs to correct Job type
  const jobsToUpsert: Job[] = allNewJobs.map(j => ({
    job_id: j.job_id,
    job_title: j.job_title ?? null,
    employer_name: j.employer_name ?? null,
    employer_logo: j.employer_logo ?? null,
    job_city: j.job_city ?? null,
    job_state: j.job_state ?? null,
    job_country: j.job_country ?? null,
    job_posted_at_datetime_utc: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc) : null,
    job_apply_link: j.job_apply_link ?? null,
    job_employment_type: j.job_employment_type ?? null,
    job_description: j.job_description ?? null,
    job_is_remote: typeof j.job_is_remote === 'boolean' ? j.job_is_remote : null,
    job_min_salary: j.job_min_salary ? String(j.job_min_salary) : null,
    job_max_salary: j.job_max_salary ? String(j.job_max_salary) : null,
    job_salary_period: j.job_salary_period ?? null,
    searchedat: j.searchedAt ? new Date(j.searchedAt) : null,
    posted_by: 'external',
    posted_by_user_id: null,
    created_at: new Date(),
  }));
  await upsertJobs(jobsToUpsert);
  console.log(`Fetched and upserted ${allNewJobs.length} new jobs (from ${NUM_QUERIES} queries) to the database.`);
}

if (require.main === module) {
  fetchTechJobsToCSV().catch(err => {
    console.error('Error fetching tech jobs:', err);
    process.exit(1);
  });
} 