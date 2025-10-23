import { NextRequest, NextResponse } from 'next/server';
import { createJobApplication, getJobApplicationsByEmail, getJobById } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { jobApplication } from '@/lib/db/schema';
import { db } from '@/lib/db/queries';
import { Resend } from 'resend';
import { readFile } from 'fs/promises';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@networkqy.com';

// Replace getJobInfo with a DB loader
async function getJobInfo(jobId: string) {
  return await getJobById(jobId);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobId = formData.get('jobId')?.toString();
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const coverLetter = formData.get('coverLetter')?.toString();
    // const profileLink = formData.get('profileLink')?.toString(); // Not in schema
    const cvFile = formData.get('cvFile') as File | null;

    if (!jobId || !name || !email || !coverLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let cvFileUrl: string | undefined;

    // Handle CV file upload if provided
    if (cvFile && cvFile.size > 0) {
      try {
        // Upload CV file to S3
        const cvFormData = new FormData();
        cvFormData.append('file', cvFile);
        cvFormData.append('fileType', 'cv');
        cvFormData.append('context', 'job-application');

        const uploadResponse = await fetch(`${request.nextUrl.origin}/api/upload`, {
          method: 'POST',
          body: cvFormData,
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.error('Upload API error:', uploadError);
          return NextResponse.json({
            error: `CV upload failed: ${uploadError.error}`,
            details: uploadError.details || 'No additional details available'
          }, { status: 400 });
        }

        const uploadResult = await uploadResponse.json();
        cvFileUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('CV upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload CV file' }, { status: 500 });
      }
    }
    const jobInfo = await getJobInfo(jobId);
    // Use both CSV and hardcoded job fields safely
    const jobTitle = jobInfo?.job_title || `Job ID ${jobId}`;
    const jobCompany = jobInfo?.employer_name || '';
    // Limit: Only 1 application per user per job
    const existing = await db.select().from(jobApplication)
      .where(and(eq(jobApplication.jobId, jobId), eq(jobApplication.email, email)));
    const active = existing.find(app => app.withdrawn === false);
    const withdrawnApp = existing.find(app => app.withdrawn === true);
    if (active) {
      return NextResponse.json({ error: 'You have already applied to this job.' }, { status: 409 });
    }
    if (withdrawnApp) {
      // Update the withdrawn application with new info and revive it
      await db.update(jobApplication)
        .set({
          name,
          email,
          coverLetter,
          withdrawn: false,
          status: 'pending',
          createdAt: new Date(),
        })
        .where(eq(jobApplication.id, withdrawnApp.id));
      // Send confirmation email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: 'Your Networkqy Job Application was received',
          html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f6fa; padding: 40px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px;">
              <div style="text-align: center;">
                <div style="font-size: 2rem; font-weight: bold; margin-bottom: 24px; background: linear-gradient(90deg,#6d28d9,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: 1px;">Networkqy</div>
                <h2 style="color: #6d28d9; margin-bottom: 8px;">Application Received</h2>
                <p style="color: #444; margin-bottom: 24px;">Hi ${name},<br>Your application for <b>${jobTitle}</b> at <b>${jobCompany}</b> has been received.<br>Please await a decision from the employer. We will contact you if you are shortlisted.</p>
                <p style="color: #888; font-size: 13px; margin-top: 24px;">If you did not apply for this job, you can ignore this email.</p>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #aaa; font-size: 12px;">Need help? Contact <a href="mailto:support@networkqy.com" style="color: #6d28d9;">support@networkqy.com</a></p>
              </div>
            </div>
          </div>`
        });
      } catch (err) {
        console.error('Resend error:', err);
      }
      return NextResponse.json({ success: true, revived: true }, { status: 200 });
    }
    await createJobApplication({ jobId, name, email, coverLetter, cvFileUrl });
    // Send confirmation email
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your Networkqy Job Application was received',
        html: `<div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f6fa; padding: 40px;">
          <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px;">
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: bold; margin-bottom: 24px; background: linear-gradient(90deg,#6d28d9,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: 1px;">Networkqy</div>
              <h2 style="color: #6d28d9; margin-bottom: 8px;">Application Received</h2>
              <p style="color: #444; margin-bottom: 24px;">Hi ${name},<br>Your application for <b>${jobTitle}</b> at <b>${jobCompany}</b> has been received.<br>Please await a decision from the employer. We will contact you if you are shortlisted.</p>
              <p style="color: #888; font-size: 13px; margin-top: 24px;">If you did not apply for this job, you can ignore this email.</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #aaa; font-size: 12px;">Need help? Contact <a href="mailto:support@networkqy.com" style="color: #6d28d9;">support@networkqy.com</a></p>
            </div>
          </div>
        </div>`
      });
    } catch (err) {
      console.error('Resend error:', err);
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Job application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get email from query param, then from cookies
    const { searchParams } = new URL(request.url);
    let email = searchParams.get('email');
    if (!email) {
      const cookieStore = await cookies();
      email = cookieStore.get('userEmail')?.value ?? null;
    }
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }
    const applications = await getJobApplicationsByEmail(email);
    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('Fetch job applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action, coverLetter, name, email } = await request.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }
    if (action === 'withdraw') {
      const result = await db.update(jobApplication)
        .set({ withdrawn: true, status: 'withdrawn' })
        .where(eq(jobApplication.id, id))
        .returning();
      if (result.length === 0) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } else if (action === 'edit') {
      // Only update if not withdrawn
      const updateData: any = {};
      if (coverLetter && coverLetter.trim()) updateData.coverLetter = coverLetter;
      if (name && name.trim()) updateData.name = name;
      if (email && email.trim()) updateData.email = email;
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }
      const result = await db.update(jobApplication)
        .set(updateData)
        .where(and(eq(jobApplication.id, id), eq(jobApplication.withdrawn, false)))
        .returning();
      if (result.length === 0) {
        // Check if withdrawn
        const withdrawnCheck = await db.select().from(jobApplication).where(eq(jobApplication.id, id));
        if (withdrawnCheck.length > 0 && withdrawnCheck[0].withdrawn) {
          return NextResponse.json({ error: 'Cannot edit a withdrawn application' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Job application PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 