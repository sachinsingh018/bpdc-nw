import { NextResponse } from 'next/server';
import { findPasswordResetToken, deletePasswordResetToken, updateUserPasswordById } from '@/lib/db/queries';
import { getUserById } from '@/lib/db/queries';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();
        if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 });

        // 1. Look up the token in the DB
        const resetToken = await findPasswordResetToken(token);
        if (!resetToken) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }
        // 2. Check expiry
        if (resetToken.expires_at < new Date()) {
            await deletePasswordResetToken(token);
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }
        // 3. Update the user's password
        const userId = resetToken.user_id;
        const users = await getUserById(userId);
        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 400 });
        }
        await updateUserPasswordById(userId, password);
        // 4. Invalidate the token
        await deletePasswordResetToken(token);
        // 5. Return success
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
} 