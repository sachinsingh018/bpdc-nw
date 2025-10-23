import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM!,
            to: email,
            subject: 'Your OTP Code',
            html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
        });

        return NextResponse.json({ otp }); // You can hash/store this securely if needed
    } catch (error) {
        console.error('Resend failed:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
