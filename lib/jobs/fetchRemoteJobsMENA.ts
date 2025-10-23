import { appendFile, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import { upsertRemoteJobs, type RemoteJob } from '@/lib/db/queries';

// Load environment variables from .env.local
config({ path: '.env.local' });

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';
const JSEARCH_URL = 'https://jsearch.p.rapidapi.com/search';

if (!JSEARCH_API_KEY) {
  console.error('❌ JSEARCH_API_KEY is not set in environment variables');
  process.exit(1);
}
const API_LIMIT = 10; // jobs per query
const NUM_QUERIES = 5; // reduced for API plan

const MENA_COUNTRIES: { name: string; code: string }[] = [
  { name: 'United Arab Emirates', code: 'ae' },
  { name: 'Saudi Arabia', code: 'sa' },
  { name: 'Qatar', code: 'qa' },
  { name: 'Kuwait', code: 'kw' },
  { name: 'Bahrain', code: 'bh' },
  { name: 'Oman', code: 'om' },
  { name: 'Jordan', code: 'jo' },
  { name: 'Lebanon', code: 'lb' },
  { name: 'Egypt', code: 'eg' },
  { name: 'Morocco', code: 'ma' },
  { name: 'Tunisia', code: 'tn' },
  { name: 'Algeria', code: 'dz' },
];

const REMOTE_JOB_TERMS = [
  // Tech roles
  'Remote Software Developer',
  'Remote Full Stack Developer',
  'Remote Frontend Developer',
  'Remote Backend Developer',
  'Remote DevOps Engineer',
  'Remote Data Scientist',
  'Remote AI Engineer',
  'Remote Machine Learning Engineer',
  'Remote Cloud Engineer',
  'Remote Cybersecurity Engineer',
  'Remote QA Engineer',
  'Remote Product Manager',
  'Remote UX Designer',
  'Remote UI Designer',
  'Remote Technical Writer',
  'Remote Project Manager',
  'Remote Business Analyst',
  'Remote Data Analyst',
  'Remote Marketing Manager',
  'Remote Content Creator',
  'Remote Digital Marketing',
  'Remote SEO Specialist',
  'Remote Customer Success',
  'Remote Sales Representative',
  'Remote Account Manager',
  'Remote HR Manager',
  'Remote Recruiter',
  'Remote Operations Manager',
  'Remote Finance Manager',
  'Remote Consultant',
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchRemoteJobsForQuery(query: string, countryCode: string) {
  const fields = [
    'job_id', 'job_title', 'employer_name', 'employer_logo', 'job_city', 'job_state', 'job_country',
    'job_posted_at_datetime_utc', 'job_apply_link', 'job_employment_type', 'job_description',
    'job_is_remote', 'job_min_salary', 'job_max_salary', 'job_salary_period'
  ].join(',');

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
    job_is_remote: job.job_is_remote || true, // Default to true for remote jobs
    job_min_salary: job.job_min_salary,
    job_max_salary: job.job_max_salary,
    job_salary_period: job.job_salary_period,
    searchedat: now,
  }));
}

export default async function fetchRemoteJobsMENA() {
  let allNewJobs: Record<string, any>[] = [];
  const usedCombos = new Set<string>();

  for (let i = 0; i < NUM_QUERIES; i++) {
    let combo: string;
    let countryObj: { name: string; code: string };
    let jobTerm: string;

    do {
      countryObj = getRandom(MENA_COUNTRIES);
      jobTerm = getRandom(REMOTE_JOB_TERMS);
      combo = `${jobTerm} in ${countryObj.name}`;
    } while (usedCombos.has(combo));

    usedCombos.add(combo);

    try {
      const jobs = await fetchRemoteJobsForQuery(combo, countryObj.code);
      console.log(`[REMOTE JOBS] Query: '${combo}' | Country: ${countryObj.code} | Returned: ${jobs.length}`);
      allNewJobs = allNewJobs.concat(jobs);
    } catch (err) {
      console.error(`Failed to fetch remote jobs for query: ${combo}`, err);
    }
  }

  // Map jobs to correct RemoteJob type
  const jobsToUpsert: RemoteJob[] = allNewJobs.map(j => ({
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
    job_is_remote: typeof j.job_is_remote === 'boolean' ? j.job_is_remote : true,
    job_min_salary: j.job_min_salary ? String(j.job_min_salary) : null,
    job_max_salary: j.job_max_salary ? String(j.job_max_salary) : null,
    job_salary_period: j.job_salary_period ?? null,
    searchedat: j.searchedat ? new Date(j.searchedat) : null,
    posted_by: 'external',
    posted_by_user_id: null,
    created_at: new Date(),
  }));

  await upsertRemoteJobs(jobsToUpsert);
  console.log(`Fetched and upserted ${allNewJobs.length} new remote jobs (from ${NUM_QUERIES} queries) to the database.`);
}

if (require.main === module) {
  fetchRemoteJobsMENA().catch(err => {
    console.error('Error fetching remote jobs:', err);
    process.exit(1);
  });
}
