import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { getUser } from '@/lib/db/queries';
import { createPasswordResetToken } from '@/lib/db/queries';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@networkqy.com';
const APP_URL = process.env.APP_URL || 'https://www.networkqy.com';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Find user by email
    const users = await getUser(email);
    if (users.length > 0) {
      const user = users[0];
      // Generate a secure token
      const token = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry
      await createPasswordResetToken({ userId: user.id, token, expiresAt: expires });

      // Send real email with Resend
      const resetLink = `${APP_URL}/reset-password?token=${token}`;
      const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f6fa; padding: 40px;">
    <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 24px; background: linear-gradient(90deg,#6d28d9,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: 1px;">Networkqy</div>
        <h2 style="color: #6d28d9; margin-bottom: 8px;">Reset Your Password</h2>
        <p style="color: #444; margin-bottom: 24px;">
          We received a request to reset your Networkqy password.<br>
          Click the button below to set a new password.
        </p>
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(90deg,#6d28d9,#2563eb); color: #fff; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 16px; margin-bottom: 24px;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          If you did not request this, you can safely ignore this email.<br>
          This link will expire in 1 hour.
        </p>
        <p style="color: #888; font-size: 13px; margin-top: 16px;">
          Trouble with the button? Copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #2563eb;">${resetLink}</a>
        </p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #aaa; font-size: 12px;">
          Need help? Contact <a href="mailto:support@networkqy.com" style="color: #6d28d9;">support@networkqy.com</a>
        </p>
      </div>
    </div>
  </div>
`;
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset your Networkqy password',
        html
      });
    }
    // Always respond with success for security
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 