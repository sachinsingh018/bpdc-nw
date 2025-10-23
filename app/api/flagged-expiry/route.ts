import { getFlaggedChatExpiry } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return new NextResponse('Missing email', { status: 400 });
        }

        const flaggedChatExpiresAt = await getFlaggedChatExpiry(email);

        console.log('✅ Retrieved flaggedChatExpiresAt for', email, ':', flaggedChatExpiresAt);

        if (!flaggedChatExpiresAt) {
            return new NextResponse('null', {
                status: 200,
                headers: { 'Content-Type': 'text/plain' },
            });
        }

        return new NextResponse(flaggedChatExpiresAt.toISOString(), {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error) {
        console.error('❌ Failed to fetch flaggedChatExpiresAt:', error);
        return new NextResponse('Server error', { status: 500 });
    }
}
