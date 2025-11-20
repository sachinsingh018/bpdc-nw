#!/usr/bin/env node

import { S3Client, HeadBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function checkS3Configuration() {
  console.log('🔍 S3 Configuration Check Script');
  console.log('================================\n');

  // Check environment variablesaa
  console.log('📋 Environment Variables:');
  console.log('  AWS_REGION:', process.env.AWS_REGION);
  console.log('  AWS_DEFAULT_REGION:', process.env.AWS_DEFAULT_REGION);
  console.log('  S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
  console.log('  AWS_ACCESS_KEY_ID exists:', !!process.env.AWS_ACCESS_KEY_ID);
  console.log('  AWS_SECRET_ACCESS_KEY exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
  console.log('');

  if (!process.env.AWS_REGION || !process.env.S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ Missing required environment variables');
    return;
  }

  // Create S3 client
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  console.log('🔗 S3 Client Configuration:');
  console.log('  Region:', s3Client.config.region());
  console.log('  Endpoint:', s3Client.config.endpoint?.toString() || 'Auto-detected');
  console.log('');

  try {
    // Check if bucket exists
    console.log('🔍 Checking bucket existence...');
    const headCommand = new HeadBucketCommand({
      Bucket: process.env.S3_BUCKET_NAME,
    });
    
    await s3Client.send(headCommand);
    console.log('✅ Bucket exists and is accessible');
    console.log('');

    // Generate presigned URL
    console.log('🔗 Generating presigned URL...');
    const testKey = `test-${Date.now()}.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: testKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });
    const url = new URL(presignedUrl);

    console.log('✅ Presigned URL generated successfully');
    console.log('  Full URL:', presignedUrl);
    console.log('  Host:', url.host);
    console.log('  Protocol:', url.protocol);
    console.log('  Pathname:', url.pathname);
    console.log('  Region in URL:', url.hostname.split('.')[1] || 'Not found');
    console.log('');

    // Test the presigned URL
    console.log('🧪 Testing presigned URL...');
    const testResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: 'test content',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (testResponse.ok) {
      console.log('✅ Presigned URL test successful');
    } else {
      console.log('❌ Presigned URL test failed:', testResponse.status, testResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Name:', error.name);
    
    if (error.code === 'NoSuchBucket') {
      console.log('\n💡 The bucket does not exist or you don\'t have access to it');
    } else if (error.code === 'AccessDenied') {
      console.log('\n💡 Access denied - check your IAM permissions');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.log('\n💡 Invalid AWS credentials');
    }
  }
}

// Run the check
checkS3Configuration().catch(console.error);
