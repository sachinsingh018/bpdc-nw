import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for demo
    const auraScore = 72; // out of 100
    const missions = [
        {
            id: 'referrals',
            title: 'Give 2 referrals',
            description: 'Help two people in your network by making introductions.',
            completed: false,
        },
        {
            id: 'message-new',
            title: 'Message someone new',
            description: 'Start a conversation with a new connection.',
            completed: true,
        },
        {
            id: 'post-update',
            title: 'Post an update',
            description: 'Share a professional update or insight with your network.',
            completed: false,
        },
    ];
    return NextResponse.json({ auraScore, missions });
} 