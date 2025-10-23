// app/api/users/friends/route.ts
import { NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import { getTop50UsersExcluding } from '@/lib/db/queries';

export async function POST(req: Request) {
    const { query, email } = await req.json();

    if (!query || !email) {
        return NextResponse.json({ error: 'Missing query or email' }, { status: 400 });
    }

    const users = await getTop50UsersExcluding(email);

    const fuse = new Fuse(users, {
        keys: ['name', 'linkedinInfo', 'goals', 'strengths', 'interests'],
        threshold: 0.3, // fuzzy matching sensitivity
    });

    const results = fuse.search(query).slice(0, 10).map(r => r.item);
    return NextResponse.json(results);
}
