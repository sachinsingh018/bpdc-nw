// app/api/get-archived-cards.ts
import { NextRequest, NextResponse } from 'next/server';
import { getArchiveCardsByEmail } from '@/lib/db/queries'; // Make sure this import path is correct

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const cards = await getArchiveCardsByEmail(email);

        return NextResponse.json(cards);
    } catch (error) {
        console.error('Error fetching archive cards:', error);
        return NextResponse.json({ error: 'Failed to fetch archive cards' }, { status: 500 });
    }
}
