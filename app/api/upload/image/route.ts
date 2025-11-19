import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

// Create S3 client with proper configuration for eu-north-1
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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

        console.log('Image upload request:', {
            email,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type
        });

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json({
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
            }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({
                error: 'File too large. Maximum size is 5MB.'
            }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get folder from formData, default to anonymous-feed-images for backward compatibility
        const folder = (formData.get('folder') as string) || 'anonymous-feed-images';
        const uniqueFileName = `${folder}/${uuidv4()}_${file.name}`;

        console.log('=== S3 IMAGE UPLOAD DEBUG ===');
        console.log('Upload Details:');
        console.log('  Bucket:', process.env.S3_BUCKET_NAME);
        console.log('  Region:', process.env.AWS_REGION);
        console.log('  Key:', uniqueFileName);
        console.log('  File Size:', buffer.length, 'bytes');
        console.log('  Content Type:', file.type);
        console.log('========================');

        try {
            // Upload to S3
            await s3.send(new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: uniqueFileName,
                Body: buffer,
                ContentType: file.type,
            }));
            console.log('S3 image upload successful');
        } catch (s3Error) {
            console.error('S3 image upload error:', s3Error);
            console.error('S3 error details:', {
                code: s3Error instanceof Error ? (s3Error as any).code : 'Unknown',
                message: s3Error instanceof Error ? s3Error.message : 'Unknown error',
                name: s3Error instanceof Error ? s3Error.name : 'Unknown',
                region: process.env.AWS_REGION,
                bucket: process.env.S3_BUCKET_NAME,
            });

            const errorMessage = s3Error instanceof Error ? s3Error.message : 'Unknown S3 error';
            const errorCode = s3Error instanceof Error ? (s3Error as any).code : 'Unknown';

            return NextResponse.json({
                error: 'Failed to upload image to storage. Please try again.',
                details: `${errorMessage} (Code: ${errorCode}, Region: ${process.env.AWS_REGION}, Bucket: ${process.env.S3_BUCKET_NAME})`
            }, { status: 500 });
        }

        // Generate S3 URL for eu-north-1 region
        const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

        console.log('Image upload successful:', { userEmail: email, fileUrl: s3Url });

        return NextResponse.json({
            success: true,
            fileUrl: s3Url,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return NextResponse.json({
            error: 'Failed to process image upload',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
