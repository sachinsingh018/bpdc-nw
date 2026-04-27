import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { job, user, jobApplication } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const [rows, appCounts] = await Promise.all([
      db.select({ job, posterName: user.name, posterEmail: user.email })
        .from(job)
        .leftJoin(user, eq(job.posted_by_user_id, user.id)),
      db.select({ jobId: jobApplication.jobId, count: sql<number>`count(*)::int` })
        .from(jobApplication)
        .groupBy(jobApplication.jobId),
    ]);

    const countMap: Record<string, number> = {};
    appCounts.forEach(r => { countMap[r.jobId] = r.count; });

    const jobs = rows.map((r) => ({
      ...r.job,
      posted_by_user_name: r.posterName,
      posted_by_user_email: r.posterEmail,
      application_count: countMap[r.job.job_id] ?? 0,
    }));

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}