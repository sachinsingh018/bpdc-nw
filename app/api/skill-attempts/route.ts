import { NextRequest, NextResponse } from 'next/server';
import { submitSkillAttempt, getUser, getAllSkills } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import { activityTracker } from '@/lib/services/activity-tracker';

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

        // Get skill name for activity tracking
        const skills = await getAllSkills();
        const skill = skills.find(s => s.id === skillId);
        const skillName = skill?.name || 'Unknown Skill';

        await submitSkillAttempt({
            userId,
            skillId,
            score,
            total,
            selectedAnswers,
        });

        // Log activity for skill assessment completion
        const percentage = Math.round((score / total) * 100);
        try {
            await activityTracker.logActivity(
                userId,
                'skill_assessment_completed',
                'profile',
                undefined, // context
                {
                    skillId,
                    skillName,
                    score,
                    total,
                    percentage,
                },
                'skill',
                skillId.toString()
            );

            // If score is 100%, also log badge earned
            if (percentage === 100) {
                await activityTracker.logActivity(
                    userId,
                    'skill_badge_earned',
                    'profile',
                    undefined,
                    {
                        skillId,
                        skillName,
                        score,
                        total,
                        percentage: 100,
                    },
                    'skill',
                    skillId.toString()
                );
            }
        } catch (activityError) {
            // Don't fail the request if activity tracking fails
            console.error('Error logging activity:', activityError);
        }

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