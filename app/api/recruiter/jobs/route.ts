import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/queries';
import { job, jobApplication, user } from '@/lib/db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        // Get user email from cookie
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get user from database
        const users = await getUser(userEmail);
        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const currentUser = users[0];
        const userId = currentUser.id;
        const userRole = currentUser.role;

        console.log('User role:', userRole);

        // Role-based access control
        if (!userRole || !['recruiter', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Access denied - Recruiter role required' }, { status: 403 });
        }

        // Get all internally posted jobs (by any recruiter)
        const jobRows = await db
            .select({ job, posterName: user.name, posterEmail: user.email })
            .from(job)
            .leftJoin(user, eq(job.posted_by_user_id, user.id))
            .where(eq(job.posted_by, 'career_team'))
            .orderBy(desc(job.job_posted_at_datetime_utc));

        const jobIds = jobRows.map(j => j.job.job_id);
        const appCounts = jobIds.length > 0
            ? await db
                .select({ jobId: jobApplication.jobId, count: sql<number>`count(*)::int` })
                .from(jobApplication)
                .where(inArray(jobApplication.jobId, jobIds))
                .groupBy(jobApplication.jobId)
            : [];

        const countMap: Record<string, number> = {};
        appCounts.forEach(r => { countMap[r.jobId] = r.count; });

        const recruiterJobs = jobRows.map(r => ({
            ...r.job,
            posted_by_user_name: r.posterName ?? null,
            posted_by_user_email: r.posterEmail ?? null,
            application_count: countMap[r.job.job_id] ?? 0,
        }));

        console.log('Recruiter jobs query result:', recruiterJobs.length, 'jobs');

        return NextResponse.json({ jobs: recruiterJobs });
    } catch (error) {
        console.error('Error fetching recruiter jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
