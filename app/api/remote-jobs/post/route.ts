import { NextRequest, NextResponse } from 'next/server';
import { getUser, createRemoteJob } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      jobTitle,
      employerName,
      jobCity,
      jobState,
      jobCountry,
      jobApplyLink,
      jobDescription,
      jobEmploymentType,
      jobIsRemote = true,
      jobMinSalary,
      jobMaxSalary,
      jobSalaryPeriod,
    } = body;

    // Validate required fields
    if (!jobTitle || !employerName || !jobDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user info
    const users = await getUser(session.user.email);
    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    const jobId = `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await createRemoteJob({
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
      postedBy: 'alumni',
      postedByUserId: user.id,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error posting remote job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
