// app/profile/api/route.ts
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Invalid email provided' }, { status: 400 });
    }

    const [user] = await getUser(body.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
