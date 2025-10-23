import { NextRequest, NextResponse } from 'next/server';
import { createPremUser } from '@/lib/db/queries'; // Adjust the path if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createPremUser({
      fullName: body.name,
      emailAddress: body.email,
      phoneNumber: body.phone || undefined,
      paragraphInterest: body.reason || undefined,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('🔥 API Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
