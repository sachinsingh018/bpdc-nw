import { NextRequest, NextResponse } from 'next/server';
import { createPartTimeJob } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
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
        const userRole = user.role;

        // Role-based access control
        if (!userRole || !['recruiter', 'admin'].includes(userRole)) {
            return NextResponse.json({ error: 'Access denied - Recruiter role required' }, { status: 403 });
        }

        const body = await request.json();
        const {
            jobTitle,
            employerName,
            jobCity,
            jobState,
            jobCountry,
            jobApplyLink,
            jobDescription,
            jobEmploymentType = 'Part-time',
            jobIsRemote = false,
            jobMinSalary,
            jobMaxSalary,
            jobSalaryPeriod,
            postedBy = 'career_team'
        } = body;

        // Validate required fields
        if (!jobTitle || !employerName || !jobDescription) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate a unique job ID
        const jobId = `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await createPartTimeJob({
            jobId,
            jobTitle,
            employerName,
            jobCity,
            jobState,
            jobCountry,
            jobApplyLink,
            jobDescription,
            jobEmploymentType,
            jobIsRemote,
            jobMinSalary,
            jobMaxSalary,
            jobSalaryPeriod,
            postedBy,
            postedByUserId: userId,
        });

        return NextResponse.json({
            message: 'Part-time job posted successfully',
            jobId
        }, { status: 201 });

    } catch (error) {
        console.error('Error posting part-time job:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
