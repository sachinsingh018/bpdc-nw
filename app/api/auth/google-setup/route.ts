import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { setCookie } from 'cookies-next';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No authenticated user found' },
                { status: 401 }
            );
        }

        // Set user email cookie for the app
        const response = NextResponse.json({
            success: true,
            user: session.user
        });

        // Set the userEmail cookie
        response.cookies.set('userEmail', session.user.email, {
            path: '/',
            maxAge: 60 * 60 * 24 * 15, // 15 days
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
        });

        return response;
    } catch (error) {
        console.error('Error setting up Google user session:', error);
        return NextResponse.json(
            { error: 'Failed to set up user session' },
            { status: 500 }
        );
    }
} 