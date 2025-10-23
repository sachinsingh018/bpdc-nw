import { updateFlaggedChatExpiry } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, flaggedChatExpiresAt } = await req.json();

        if (!email || !flaggedChatExpiresAt) {
            return NextResponse.json(
                { error: 'Missing required fields: email or flaggedChatExpiresAt' },
                { status: 400 }
            );
        }

        const expiresAtDate = new Date(flaggedChatExpiresAt);

        if (isNaN(expiresAtDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format for flaggedChatExpiresAt' },
                { status: 400 }
            );
        }

        // ✅ Output the value being updated
        console.log('📝 ww flaggedChatExpiresAt:', {
            email,
            flaggedChatExpiresAt: expiresAtDate.toISOString(),
        });

        await updateFlaggedChatExpiry(email, expiresAtDate);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('❌ Failed to update flaggedChatExpiresAt:');

        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        } else {
            console.error('Raw error:', error);
        }

        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
