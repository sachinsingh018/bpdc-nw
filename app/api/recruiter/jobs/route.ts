import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/queries';
import { job } from '@/lib/db/schema';
import { eq, or, desc } from 'drizzle-orm';

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

        const user = users[0];
        const userId = user.id;
        const userRole = user.role; // ✅ Role field is now available

        console.log('User role:', userRole); // Debug log to see the role

        // Role-based access control
        if (!userRole || !['recruiter', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Access denied - Recruiter role required' }, { status: 403 });
        }

        // Get jobs posted by this recruiter or career team
        const recruiterJobs = await db
            .select()
            .from(job)
            .where(
                or(
                    eq(job.posted_by_user_id, userId), // Jobs posted by this user
                    eq(job.posted_by, 'career_team')   // All career team jobs
                )
            )
            .orderBy(desc(job.job_posted_at_datetime_utc)); // Use the field that's actually set

        console.log('Recruiter jobs query result:', {
            userId,
            postedBy: 'career_team',
            totalJobs: recruiterJobs.length,
            jobs: recruiterJobs.map(j => ({ id: j.job_id, title: j.job_title, postedBy: j.posted_by }))
        });

        return NextResponse.json({ jobs: recruiterJobs });
    } catch (error) {
        console.error('Error fetching recruiter jobs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
