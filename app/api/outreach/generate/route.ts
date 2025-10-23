import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { profile, userContext } = await request.json();
        // Mock: generate a message using profile context
        const message = `Hi ${profile?.name || 'there'}, I came across your profile${profile?.industry ? ` in ${profile.industry}` : ''} and would love to connect to explore potential synergies!`;
        return NextResponse.json({ message });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
} 