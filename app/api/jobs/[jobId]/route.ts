import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { job } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        // Simple database lookup by job_id
        const jobs = await db
            .select()
            .from(job)
            .where(eq(job.job_id, jobId));

        if (jobs.length > 0) {
            const foundJob = jobs[0];
            return NextResponse.json({
                job: {
                    id: foundJob.job_id,
                    title: foundJob.job_title,
                    company: foundJob.employer_name,
                    description: foundJob.job_description,
                    logo: foundJob.employer_logo,
                    job_city: foundJob.job_city,
                    job_state: foundJob.job_state,
                    job_country: foundJob.job_country,
                    job_posted_at_datetime_utc: foundJob.job_posted_at_datetime_utc,
                    job_apply_link: foundJob.job_apply_link,
                    job_employment_type: foundJob.job_employment_type,
                    job_is_remote: foundJob.job_is_remote,
                    job_min_salary: foundJob.job_min_salary,
                    job_max_salary: foundJob.job_max_salary,
                    job_salary_period: foundJob.job_salary_period,
                    posted_by: foundJob.posted_by,
                }
            });
        }

        return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    } catch (error) {
        console.error('Error fetching job:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
