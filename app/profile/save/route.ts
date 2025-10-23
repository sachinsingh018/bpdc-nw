import { updateUserProfile } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const {
        email,
        goals,
        metrics,
        strengths,
        interests,
        linkedinURL,
        FacebookURL,
        phone,
        linkedinInfo,
        anonymous_username,
        anonymous_avatar,
        headline,
        education,
        experience,
        professional_skills,
        certifications
    } = await req.json();

    try {
        await updateUserProfile({
            email,
            goals,
            metrics,
            strengths,
            interests,
            linkedinURL,
            FacebookURL,
            phone,
            linkedinInfo,
            anonymous_username,
            anonymous_avatar,
            headline,
            education,
            experience,
            professional_skills,
            certifications
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile update failed:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
