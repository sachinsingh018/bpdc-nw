import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getUser, db } from '@/lib/db/queries';
import { jobApplication } from '@/lib/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

function getUrlExtension(url: string): string {
  const clean = url.split('?')[0] || url;
  const parts = clean.split('.');
  return (parts[parts.length - 1] || '').toLowerCase();
}

async function addSkippedPage(mergedPdf: PDFDocument, title: string, details: string) {
  const page = mergedPdf.addPage([612, 792]); // US Letter
  const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 50, y: 740, size: 18, font, color: rgb(0, 0, 0) });
  const lines = details.split('\n');
  let y = 710;
  for (const line of lines) {
    page.drawText(line.slice(0, 120), { x: 50, y, size: 11, font, color: rgb(0, 0, 0) });
    y -= 16;
    if (y < 60) break;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    const users = await getUser(userEmail);
    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];
    const userRole = user.role;
    if (!userRole || !['recruiter', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied - Recruiter role required' }, { status: 403 });
    }

    const { jobId } = await params;

    const apps = await db
      .select({
        id: jobApplication.id,
        name: jobApplication.name,
        email: jobApplication.email,
        cvFileUrl: jobApplication.cvFileUrl,
      })
      .from(jobApplication)
      .where(and(eq(jobApplication.jobId, jobId), isNotNull(jobApplication.cvFileUrl)));

    const mergedPdf = await PDFDocument.create();

    if (!apps.length) {
      await addSkippedPage(
        mergedPdf,
        'No resumes found',
        `No applications with resumes were found for job: ${jobId}`
      );
    } else {
      for (const app of apps) {
        const url = app.cvFileUrl as string;
        const ext = getUrlExtension(url);

        if (ext !== 'pdf') {
          await addSkippedPage(
            mergedPdf,
            'Skipped non-PDF resume',
            `Candidate: ${app.name} (${app.email})\nFile: ${url}\nReason: only PDF resumes can be merged into a single PDF.`
          );
          continue;
        }

        try {
          const res = await fetch(url);
          if (!res.ok) {
            await addSkippedPage(
              mergedPdf,
              'Failed to fetch resume',
              `Candidate: ${app.name} (${app.email})\nFile: ${url}\nHTTP: ${res.status}`
            );
            continue;
          }

          const bytes = new Uint8Array(await res.arrayBuffer());
          const srcPdf = await PDFDocument.load(bytes);
          const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
          for (const p of copiedPages) mergedPdf.addPage(p);
        } catch (e: any) {
          await addSkippedPage(
            mergedPdf,
            'Failed to merge resume',
            `Candidate: ${app.name} (${app.email})\nFile: ${url}\nError: ${e?.message || String(e)}`
          );
        }
      }
    }

    const out = await mergedPdf.save();
    const filename = `resumes_${jobId}.pdf`;

    return new NextResponse(out, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating resumes PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

