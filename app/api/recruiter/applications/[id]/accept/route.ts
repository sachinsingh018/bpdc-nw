import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { jobApplication, job } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@networkqy.com';

// Email template for acceptance
function getAcceptanceEmailTemplate(
    name: string,
    jobTitle: string,
    companyName: string,
    feedback?: string
) {
    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f6fa; padding: 40px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px;">
        <div style="text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; margin-bottom: 24px; background: linear-gradient(90deg,#6d28d9,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: 1px;">Networkqy</div>
          <div style="font-size: 3rem; margin-bottom: 16px;">🎉</div>
          <h2 style="color: #059669; margin-bottom: 8px;">Congratulations! You're Hired!</h2>
          <p style="color: #444; margin-bottom: 16px;">Hi ${name},</p>
          <p style="color: #444; margin-bottom: 16px;">Fantastic news! We are delighted to offer you the position.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #444; margin: 0; font-weight: 500;">Position: <strong>${jobTitle}</strong></p>
            <p style="color: #444; margin: 8px 0 0 0; font-weight: 500;">Company: <strong>${companyName}</strong></p>
          </div>
          <p style="color: #444; margin-bottom: 16px;">Our team will contact you shortly with the next steps and onboarding details.</p>
          ${feedback ? `<div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #0c4a6e; margin: 0; font-weight: 500;">Additional Feedback:</p>
            <p style="color: #0c4a6e; margin: 8px 0 0 0;">${feedback}</p>
          </div>` : ''}
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #aaa; font-size: 12px;">Need help? Contact <a href="mailto:support@networkqy.com" style="color: #6d28d9;">support@networkqy.com</a></p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const { feedback } = await request.json();

        // Extract applicationId from the URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const applicationIndex = pathParts.indexOf('applications');
        const applicationId = pathParts[applicationIndex + 1];

        // Get application details before updating
        const applicationDetails = await db
            .select({
                id: jobApplication.id,
                name: jobApplication.name,
                email: jobApplication.email,
                job: {
                    job_title: job.job_title,
                    employer_name: job.employer_name,
                }
            })
            .from(jobApplication)
            .leftJoin(job, eq(jobApplication.jobId, job.job_id))
            .where(eq(jobApplication.id, applicationId))
            .limit(1);

        if (applicationDetails.length === 0) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        const application = applicationDetails[0];

        // Update application status to accepted
        await db
            .update(jobApplication)
            .set({
                status: 'accepted',
                feedback: feedback || null,
            })
            .where(eq(jobApplication.id, applicationId));

        // Send acceptance email
        try {
            await resend.emails.send({
                from: FROM_EMAIL,
                to: application.email,
                subject: 'Congratulations! You\'re Hired - Networkqy',
                html: getAcceptanceEmailTemplate(
                    application.name,
                    application.job?.job_title || 'Position',
                    application.job?.employer_name || 'Company',
                    feedback
                ),
            });

            console.log(`Acceptance email sent to ${application.email}`);
        } catch (emailError) {
            console.error('Failed to send acceptance email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            message: 'Application accepted successfully',
            applicationId
        });
    } catch (error) {
        console.error('Error accepting application:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 