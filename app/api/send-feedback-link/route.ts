import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@networkqy.com';

export async function POST(request: Request) {
    try {
        const { to, subject, body } = await request.json();
        if (!to || !subject || !body) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f6fa; padding: 40px;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px;">
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 24px; background: linear-gradient(90deg,#6d28d9,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: 1px;">Networkqy</div>
            <h2 style="color: #6d28d9; margin-bottom: 8px;">We Value Your Feedback!</h2>
            <p style="color: #444; margin-bottom: 24px;">${body}</p>
            <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #aaa; font-size: 12px;">Need help? Contact <a href="mailto:support@networkqy.com" style="color: #6d28d9;">support@networkqy.com</a></p>
          </div>
        </div>
      </div>`
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Send feedback link error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
} 