import { NextResponse } from 'next/server';

export async function POST() {
    const res = NextResponse.json({ success: true });
    res.cookies.set('session', '', { maxAge: 0, path: '/' });
    return res;
} 