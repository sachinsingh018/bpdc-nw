import { NextRequest, NextResponse } from 'next/server';
import { createApiUser } from '@/lib/db/queries'; // Adjust the path if needed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createApiUser({
      fullName: body.fullName,
      email_address: body.email_address,
      phone_number: body.phone_number || undefined,
      orgName: body.orgName || undefined,
      work: body.work || undefined,
      benefits: body.benefits || undefined,
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
