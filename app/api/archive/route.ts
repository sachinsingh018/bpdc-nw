// /app/api/archive/route.ts
import { createArchiveCard } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { name, phone, matchPercentage, desc, email } = await req.json();

        if (!name || !phone || !matchPercentage || !desc || !email) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }//new try

        await createArchiveCard(name, phone, matchPercentage, desc, email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error archiving card:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
