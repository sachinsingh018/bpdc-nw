import { NextResponse } from 'next/server';
import { getUser, createUser } from '@/lib/db/queries';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { name, email } = await request.json();
        if (!email || !name) {
            return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
        }
        const users = await getUser(email);
        if (users.length === 0) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            await createUser({
                name,
                email,
                password: randomPassword,
            });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
} 