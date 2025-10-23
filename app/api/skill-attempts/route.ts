import { NextRequest, NextResponse } from 'next/server';
import { submitSkillAttempt, getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get user email from cookie (your app's auth system)
        const cookieStore = await cookies();
        const userEmail = cookieStore.get('userEmail')?.value;

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
        }

        // Get user from database using email
        const users = await getUser(userEmail);
        if (!users.length) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userId = users[0].id;

        const body = await request.json();
        const { skillId, score, total, selectedAnswers } = body;

        if (!skillId || typeof score !== 'number' || typeof total !== 'number' || !Array.isArray(selectedAnswers)) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }

        await submitSkillAttempt({
            userId,
            skillId,
            score,
            total,
            selectedAnswers,
        });

        return NextResponse.json({
            success: true,
            message: 'Skill attempt submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting skill attempt:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 