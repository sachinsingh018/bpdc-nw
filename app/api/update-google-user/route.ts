import { NextRequest, NextResponse } from 'next/server';
import { updateGoogleUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            name,
            linkedinInfo,
            goals,
            profilemetrics,
            strengths,
            interests,
            linkedinURL,
            phone,
            referral_code,
        } = body;

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email and name are required' },
                { status: 400 }
            );
        }

        await updateGoogleUser({
            email,
            name,
            linkedinInfo,
            goals,
            profilemetrics,
            strengths,
            interests,
            linkedinURL,
            phone,
            referral_code,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating Google user:', error);
        return NextResponse.json(
            { error: 'Failed to update user profile' },
            { status: 500 }
        );
    }
} 