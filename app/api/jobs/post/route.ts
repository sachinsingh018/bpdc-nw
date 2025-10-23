import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, createJob } from '@/lib/db/queries';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        // Get user email from cookie (your app's auth system)
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get user from database using email
        const users = await getUser(userEmail);
        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = users[0].id;
        const body = await request.json();
        const {
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
        } = body;

        // Validate required fields
        if (!jobTitle || !employerName || !jobDescription || !jobEmploymentType || !postedBy) {
            return NextResponse.json({
                error: 'Missing required fields: jobTitle, employerName, jobDescription, jobEmploymentType, postedBy'
            }, { status: 400 });
        }

        // Validate postedBy value
        if (!['alumni', 'career_team', 'external'].includes(postedBy)) {
            return NextResponse.json({
                error: 'postedBy must be one of: alumni, career_team, external'
            }, { status: 400 });
        }

        // Generate unique job ID
        const jobId = `job_${uuidv4().replace(/-/g, '')}`;

        // Create the job
        await createJob({
            jobId,
            jobTitle,
            employerName,
            jobCity,
            jobState,
            jobCountry,
            jobApplyLink,
            jobDescription,
            jobEmploymentType,
            jobIsRemote: jobIsRemote || false,
            jobMinSalary,
            jobMaxSalary,
            jobSalaryPeriod,
            postedBy: postedBy as 'alumni' | 'career_team' | 'external',
            postedByUserId: postedBy === 'alumni' ? userId : undefined,
        });

        return NextResponse.json({
            message: 'Job posted successfully',
            jobId
        });
    } catch (error) {
        console.error('Error posting job:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 