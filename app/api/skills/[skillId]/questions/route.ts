import { NextRequest, NextResponse } from 'next/server';
import { getSkillQuestions } from '@/lib/db/queries';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ skillId: string }> }
) {
    try {
        const { skillId } = await params;
        const questions = await getSkillQuestions(parseInt(skillId));
        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error fetching skill questions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 