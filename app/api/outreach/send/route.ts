import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { message, recipient, method } = await request.json();
        // Mock: log sending
        console.log(`Sending outreach via ${method}:`, { recipient, message });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
} 