import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { jobApplication, job } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM || 'noreply@networkqy.com';

// Email template generator for status updates
function getStatusUpdateEmailTemplate(
    name: string,
    jobTitle: string,
    companyName: string,
    status: string,
    feedback?: string
) {
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'phone_screening':
                return {
                    title: 'Phone Screening Scheduled',
                    message: 'Great news! We would like to schedule a phone screening with you for the position.',
                    nextSteps: 'Our team will contact you shortly to schedule a convenient time for the phone screening.'
                };
            case 'job_assessment':
                return {
                    title: 'Job Assessment Invitation',
                    message: 'Congratulations! You have been selected to proceed to the job assessment stage.',
                    nextSteps: 'We will send you the assessment details and instructions via email shortly.'
                };
            case 'hr_interview':
                return {
                    title: 'HR Interview Invitation',
                    message: 'Excellent! You have been selected for an HR interview.',
                    nextSteps: 'Our HR team will contact you to schedule the interview at a convenient time.'
                };
            case 'final_interview':
                return {
                    title: 'Final Interview Invitation',
                    message: 'Outstanding! You have been selected for the final interview round.',
                    nextSteps: 'Our team will contact you to schedule the final interview session.'
                };
            case 'accepted':
                return {
                    title: 'Congratulations! You\'re Hired!',
                    message: 'Fantastic news! We are delighted to offer you the position.',
                    nextSteps: 'Our team will contact you shortly with the next steps and onboarding details.'
                };
            case 'rejected':
                return {
                    title: 'Application Update',
                    message: 'Thank you for your interest in the position. After careful consideration, we have decided to move forward with other candidates.',
                    nextSteps: 'We encourage you to apply for other opportunities that match your skills and interests.'
                };
            default:
                return {
                    title: 'Application Status Update',
                    message: 'Your application status has been updated.',
                    nextSteps: 'Please check your application status for more details.'
                };
        }
    };

    const statusInfo = getStatusInfo(status);
    const isPositive = ['phone_screening', 'job_assessment', 'hr_interview', 'final_interview', 'accepted'].includes(status);
    const statusColor = isPositive ? '#6d28d9' : '#dc2626';
    const icon = isPositive ? '🎉' : '📋';

    return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f6fa; padding: 40px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #0001; padding: 32px;">
        <div style="text-align: center;">
          <div style="font-size: 2rem; font-weight: bold; margin-bottom: 24px; background: linear-gradient(90deg,#6d28d9,#2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; letter-spacing: 1px;">Networkqy</div>
          <div style="font-size: 3rem; margin-bottom: 16px;">${icon}</div>
          <h2 style="color: ${statusColor}; margin-bottom: 8px;">${statusInfo.title}</h2>
          <p style="color: #444; margin-bottom: 16px;">Hi ${name},</p>
          <p style="color: #444; margin-bottom: 16px;">${statusInfo.message}</p>
          <div style="background: #f8fafc; border-left: 4px solid ${statusColor}; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #444; margin: 0; font-weight: 500;">Position: <strong>${jobTitle}</strong></p>
            <p style="color: #444; margin: 8px 0 0 0; font-weight: 500;">Company: <strong>${companyName}</strong></p>
          </div>
          <p style="color: #444; margin-bottom: 16px;">${statusInfo.nextSteps}</p>
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, notes } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Valid status values
        const validStatuses = [
            'pending',
            'phone_screening',
            'job_assessment',
            'hr_interview',
            'final_interview',
            'accepted',
            'rejected',
            'withdrawn'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Get the current application to fetch job details
        const currentApplication = await db
            .select()
            .from(jobApplication)
            .where(eq(jobApplication.id, id))
            .limit(1);

        if (currentApplication.length === 0) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        const application = currentApplication[0];

        // Update the application status
        const updatedApplication = await db
            .update(jobApplication)
            .set({
                status,
                feedback: notes || null,
            })
            .where(eq(jobApplication.id, id))
            .returning();

        // Send email notification to the applicant
        try {
            // Get job details for email
            const jobDetails = await db
                .select({
                    id: jobApplication.id,
                    jobId: jobApplication.jobId,
                    name: jobApplication.name,
                    email: jobApplication.email,
                    status: jobApplication.status,
                    job: {
                        job_title: job.job_title,
                        employer_name: job.employer_name,
                    }
                })
                .from(jobApplication)
                .leftJoin(job, eq(jobApplication.jobId, job.job_id))
                .where(eq(jobApplication.id, id))
                .limit(1);

            if (jobDetails.length > 0) {
                const jobInfo = jobDetails[0];

                // Generate email subject based on status
                const getEmailSubject = (status: string) => {
                    switch (status) {
                        case 'phone_screening': return 'Phone Screening Invitation - Networkqy';
                        case 'job_assessment': return 'Job Assessment Invitation - Networkqy';
                        case 'hr_interview': return 'HR Interview Invitation - Networkqy';
                        case 'final_interview': return 'Final Interview Invitation - Networkqy';
                        case 'accepted': return 'Congratulations! You\'re Hired - Networkqy';
                        case 'rejected': return 'Application Update - Networkqy';
                        default: return 'Application Status Update - Networkqy';
                    }
                };

                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: application.email,
                    subject: getEmailSubject(status),
                    html: getStatusUpdateEmailTemplate(
                        application.name,
                        jobInfo.job?.job_title || 'Position',
                        jobInfo.job?.employer_name || 'Company',
                        status,
                        notes
                    ),
                });

                console.log(`Status update email sent to ${application.email} for status: ${status}`);
            }
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
            // Don't fail the request if email fails, just log the error
        }

        return NextResponse.json({
            success: true,
            application: updatedApplication[0],
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
