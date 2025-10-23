import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists by email
        const existingUser = await db
            .select({ id: user.id, email: user.email, name: user.name })
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        const exists = existingUser.length > 0;
        const userId = exists ? existingUser[0].id : null;

        return NextResponse.json({
            exists,
            userId,
            user: exists ? existingUser[0] : null
        });

    } catch (error) {
        console.error('Error checking user existence:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 