import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { newsletterSubscriber } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already subscribed
        const existing = await db
            .select()
            .from(newsletterSubscriber)
            .where(eq(newsletterSubscriber.email, normalizedEmail))
            .limit(1);

        if (existing.length > 0) {
            if (existing[0].isActive) {
                return NextResponse.json(
                    { success: true, message: 'Already subscribed', email: normalizedEmail },
                    { status: 200 }
                );
            }
            // Reactivate if previously unsubscribed
            await db
                .update(newsletterSubscriber)
                .set({ isActive: true, unsubscribedAt: null })
                .where(eq(newsletterSubscriber.email, normalizedEmail));
        } else {
            await db.insert(newsletterSubscriber).values({
                email: normalizedEmail,
                source: 'landing-page',
            });
        }

        return NextResponse.json(
            { success: true, message: 'Successfully subscribed', email: normalizedEmail },
            { status: 200 }
        );
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: 'Failed to process subscription' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json(
            { error: 'Email parameter is required' },
            { status: 400 }
        );
    }

    try {
        const result = await db
            .select()
            .from(newsletterSubscriber)
            .where(eq(newsletterSubscriber.email, email.toLowerCase().trim()))
            .limit(1);

        return NextResponse.json({
            email,
            subscribed: result.length > 0 && result[0].isActive,
        });
    } catch (error) {
        console.error('Subscription check error:', error);
        return NextResponse.json(
            { error: 'Failed to check subscription status' },
            { status: 500 }
        );
    }
}
