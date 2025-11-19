import { NextRequest, NextResponse } from 'next/server';
import { getSkillQuestions } from '@/lib/db/queries';
import { db } from '@/lib/db/queries';
import { skillQuestions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

// POST endpoint to add questions to a skill
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ skillId: string }> }
) {
    try {
        const { skillId } = await params;
        const body = await request.json();
        const { questions } = body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: 'Questions array is required' },
                { status: 400 }
            );
        }

        // Validate and insert questions
        const questionsToInsert = questions.map((q: any) => ({
            skillId: parseInt(skillId),
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
        }));

        // Validate each question
        for (const q of questionsToInsert) {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 ||
                typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
                return NextResponse.json(
                    { error: 'Invalid question format. Each question must have: question (string), options (array of 4 strings), correctIndex (0-3)' },
                    { status: 400 }
                );
            }
        }

        await db.insert(skillQuestions).values(questionsToInsert);

        return NextResponse.json({
            success: true,
            message: `Successfully added ${questionsToInsert.length} questions`,
            count: questionsToInsert.length
        });
    } catch (error) {
        console.error('Error adding skill questions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
