// app/profile/get/route.ts
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries'; // Adjust the import path as needed

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        const [user] = await getUser(email); // getUser returns an array
        return NextResponse.json(user || {});
    } catch (error) {
        console.error('❌ Error in /profile/get route:', error);
        return new NextResponse('Failed to fetch user', { status: 500 });
    }
}
