import { NextResponse } from 'next/server';

const outreachLogs: any[] = [];

export async function POST(request: Request) {
    try {
        const data = await request.json();
        outreachLogs.push({ ...data, timestamp: Date.now() });
        console.log('Outreach log:', data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
} 