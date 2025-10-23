import { NextResponse } from 'next/server';

// In-memory store for demo
const userContexts = new Map<string, any>();

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // For demo, use email or a random ID as key
        const key = data.email || `user-${Math.random().toString(36).slice(2)}`;
        userContexts.set(key, data);
        console.log('Saved onboarding context:', data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    const context = userContexts.get(email);
    if (!context) {
        return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }
    return NextResponse.json({ context });
} 