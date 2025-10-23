import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, db } from '@/lib/db/queries';
import { jobApplication, job } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Get user email from cookie
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get user from database to check role
        const users = await getUser(userEmail);
        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = users[0];
        const userRole = user.role; // ✅ Role field is now available

        console.log('User role for applications access:', userRole); // Debug log

        // Role-based access control
        if (!userRole || !['recruiter', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Access denied - Recruiter role required' }, { status: 403 });
        }
        // Get all applications with job details
        const applications = await db
            .select({
                id: jobApplication.id,
                jobId: jobApplication.jobId,
                name: jobApplication.name,
                email: jobApplication.email,
                coverLetter: jobApplication.coverLetter,
                cvFileUrl: jobApplication.cvFileUrl,
                status: jobApplication.status,
                feedback: jobApplication.feedback,
                withdrawn: jobApplication.withdrawn,
                createdAt: jobApplication.createdAt,
                job: {
                    job_title: job.job_title,
                    employer_name: job.employer_name,
                    job_city: job.job_city,
                    job_state: job.job_state,
                    job_country: job.job_country,
                    job_employment_type: job.job_employment_type,
                    job_min_salary: job.job_min_salary,
                    job_max_salary: job.job_max_salary,
                    job_salary_period: job.job_salary_period,
                    job_is_remote: job.job_is_remote,
                }
            })
            .from(jobApplication)
            .leftJoin(job, eq(jobApplication.jobId, job.job_id))
            .orderBy(desc(jobApplication.createdAt));

        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 