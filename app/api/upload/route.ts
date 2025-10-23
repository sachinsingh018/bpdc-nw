// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from 'uuid';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { uploads } from '@/lib/db/schema';
import { cookies } from 'next/headers';
import { eq, and } from 'drizzle-orm';

// Create S3 client with proper configuration for eu-north-1
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Let AWS SDK handle the endpoint automatically
});

console.log('=== S3 CLIENT INITIALIZATION DEBUG ===');
console.log('Environment Variables:');
console.log('  AWS_REGION:', process.env.AWS_REGION);
console.log('  AWS_DEFAULT_REGION:', process.env.AWS_DEFAULT_REGION);
console.log('  S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
console.log('  AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('  AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
console.log('=====================================');



const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_FILE_TYPES = ['cv', 'cover-letter'];

// GET endpoint for debugging environment variables (remove in production)
export async function GET() {
  try {
    const envCheck = {
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
    };

    const missingVars = Object.entries(envCheck)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return NextResponse.json({
      message: 'Upload API Environment Check',
      environment: envCheck,
      missingVariables: missingVars,
      status: missingVars.length > 0 ? 'ERROR' : 'OK',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GET endpoint error:', error);
    return NextResponse.json({
      message: 'Upload API Environment Check - Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const email = cookieStore.get('userEmail')?.value;

  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check environment variables
  const requiredEnvVars = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    POSTGRES_URL: process.env.POSTGRES_URL,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    console.error('Missing environment variables:', missingEnvVars);
    return NextResponse.json({
      error: 'Server configuration error. Please contact support.',
      details: `Missing: ${missingEnvVars.join(', ')}`
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('fileType')?.toString();
    const context = formData.get('context')?.toString() || 'profile'; // 'profile' or 'job-application'

    console.log('Upload request:', { email, fileType, context, fileName: file?.name, fileSize: file?.size });

    if (!file || !fileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_FILE_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'Invalid fileType' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Only check for existing uploads if this is a profile upload (not job application)
    if (context === 'profile') {
      console.log('Checking for existing profile uploads...');
      const existingUploads = await db
        .select()
        .from(uploads)
        .where(and(eq(uploads.userEmail, email), eq(uploads.fileType, fileType)));

      if (existingUploads.length > 0) {
        console.log('Found existing uploads, blocking new profile upload');
        return NextResponse.json({
          error: `You can only upload one ${fileType === 'cv' ? 'resume' : 'cover letter'} to your profile. Please delete the existing one first.`,
        }, { status: 400 });
      }
    } else {
      console.log('Job application upload - allowing multiple uploads');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uniqueFileName = `uploads/${uuidv4()}_${file.name}`;

        console.log('=== S3 UPLOAD DEBUG ===');
    console.log('Upload Details:');
    console.log('  Bucket:', process.env.S3_BUCKET_NAME);
    console.log('  Region:', process.env.AWS_REGION);
    console.log('  Key:', uniqueFileName);
    console.log('  File Size:', buffer.length, 'bytes');
    console.log('  Content Type:', file.type);
    console.log('  S3 Client Region:', s3.config.region());
    console.log('========================');

    try {
      // Upload to S3
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: file.type,
      }));
      console.log('S3 upload successful');
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      console.error('S3 error details:', {
        code: s3Error instanceof Error ? (s3Error as any).code : 'Unknown',
        message: s3Error instanceof Error ? s3Error.message : 'Unknown error',
        name: s3Error instanceof Error ? s3Error.name : 'Unknown',
        region: process.env.AWS_REGION,
        bucket: process.env.S3_BUCKET_NAME,
        configuredRegion: process.env.AWS_REGION
      });

      // Return more detailed error information
      const errorMessage = s3Error instanceof Error ? s3Error.message : 'Unknown S3 error';
      const errorCode = s3Error instanceof Error ? (s3Error as any).code : 'Unknown';

      return NextResponse.json({
        error: 'Failed to upload file to storage. Please try again.',
        details: `${errorMessage} (Code: ${errorCode}, Region: ${process.env.AWS_REGION}, Bucket: ${process.env.S3_BUCKET_NAME})`
      }, { status: 500 });
    }

    // Generate S3 URL for eu-north-1 region
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

    console.log('Saving to database:', { userEmail: email, fileUrl: s3Url, fileType });

    try {
      // Save to DB
      await db.insert(uploads).values({
        userEmail: email,
        fileUrl: s3Url,
        fileType,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up the uploaded file if DB save fails
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: uniqueFileName,
        }));
      } catch (cleanupError) {
        console.error('Failed to cleanup S3 file after DB error:', cleanupError);
      }
      return NextResponse.json({
        error: 'Failed to save file information. Please try again.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }

    console.log('Upload successful');

    return NextResponse.json({
      message: `${fileType === 'cv' ? 'Resume' : 'Cover letter'} uploaded successfully`,
      url: s3Url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
