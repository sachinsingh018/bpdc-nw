import { NextRequest, NextResponse } from 'next/server';
import { getAllPartTimeJobs } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
    try {
        const jobs = await getAllPartTimeJobs();
        return NextResponse.json({ jobs }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
