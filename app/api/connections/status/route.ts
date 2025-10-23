import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { checkConnectionStatus } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('targetUserId');

        if (!targetUserId) {
            return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
        }

        const status = await checkConnectionStatus({
            senderId: session.user.id,
            receiverId: targetUserId,
        });

        return NextResponse.json({ status });

    } catch (error) {
        console.error('Error checking connection status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 