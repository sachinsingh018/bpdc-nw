import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { updateUserPasswordById } from '@/lib/db/queries';
import { compare } from 'bcrypt-ts';
import { getCookie } from 'cookies-next';

export async function POST(req: NextRequest) {
    try {
        const { oldPassword, newPassword } = await req.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Old password and new password are required' },
                { status: 400 }
            );
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Get user email from cookie
        const userEmail = req.cookies.get('userEmail')?.value;
        if (!userEmail) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Get user from database
        const users = await getUser(userEmail);
        if (users.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = users[0];

        // Check if user has a password (not OAuth-only user)
        if (!user.password) {
            return NextResponse.json(
                { error: 'Password change not available for OAuth accounts' },
                { status: 400 }
            );
        }

        // Verify old password
        const passwordsMatch = await compare(oldPassword, user.password);
        if (!passwordsMatch) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Update password
        await updateUserPasswordById(user.id, newPassword);

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

