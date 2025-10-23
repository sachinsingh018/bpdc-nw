import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface TranscribeResponse {
    transcript: string;
    success: boolean;
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Check if OpenAI API key is available
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.error('OpenAI API key not configured');
            return NextResponse.json(
                { error: 'Transcription service not configured', success: false },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided', success: false },
                { status: 400 }
            );
        }

        // Log file details for debugging
        console.log('Audio file received:', {
            name: audioFile.name,
            type: audioFile.type,
            size: audioFile.size
        });

        // Validate file type
        const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav'];
        if (!allowedTypes.includes(audioFile.type)) {
            return NextResponse.json(
                { error: `Invalid file type: ${audioFile.type}. Please upload .webm, .mp3, or .wav files only`, success: false },
                { status: 400 }
            );
        }

        // Check file size (max 25MB for OpenAI Whisper)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (audioFile.size > maxSize) {
            return NextResponse.json(
                { error: `File too large: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 25MB.`, success: false },
                { status: 400 }
            );
        }

        // Convert File to Buffer and save to temporary file
        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const tempDir = tmpdir();
        const tempFilePath = join(tempDir, `audio_${Date.now()}_${Math.random().toString(36).substring(2)}.webm`);

        try {
            await writeFile(tempFilePath, audioBuffer);
        } catch (writeError) {
            console.error('Failed to write temporary file:', writeError);
            return NextResponse.json(
                { error: 'Failed to process audio file', success: false },
                { status: 500 }
            );
        }

        try {
            // Create FormData for OpenAI API
            const openaiFormData = new FormData();
            openaiFormData.append('file', new Blob([audioBuffer], { type: audioFile.type }), audioFile.name);
            openaiFormData.append('model', 'whisper-1');

            // Call OpenAI Whisper API
            const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                },
                body: openaiFormData,
            });

            if (!openaiResponse.ok) {
                const errorData = await openaiResponse.json();
                console.error('OpenAI API error:', errorData);
                const errorMessage = errorData.error?.message || `HTTP ${openaiResponse.status}`;
                throw new Error(`OpenAI API failed: ${errorMessage}`);
            }

            const openaiData = await openaiResponse.json();
            const transcript = openaiData.text;

            if (!transcript) {
                throw new Error('OpenAI returned empty transcript');
            }

            console.log('Transcription successful:', transcript.substring(0, 100) + '...');

            return NextResponse.json({
                transcript,
                success: true
            } as TranscribeResponse);

        } finally {
            // Clean up temporary file
            try {
                await unlink(tempFilePath);
            } catch (cleanupError) {
                console.error('Failed to cleanup temporary file:', cleanupError);
            }
        }

    } catch (error) {
        console.error('Transcription API error:', error);

        // Return a more user-friendly error message
        let errorMessage = 'Failed to transcribe audio';
        if (error instanceof Error) {
            if (error.message.includes('OpenAI API failed')) {
                errorMessage = 'Transcription service temporarily unavailable';
            } else if (error.message.includes('API key')) {
                errorMessage = 'Transcription service not configured';
            } else if (error.message.includes('empty transcript')) {
                errorMessage = 'Could not understand audio. Please try speaking more clearly.';
            }
        }

        return NextResponse.json(
            {
                error: errorMessage,
                success: false,
                transcript: 'Could not transcribe audio. Please try again.'
            } as TranscribeResponse,
            { status: 500 }
        );
    }
}

export async function GET() {
    const openaiConfigured = true;

    return NextResponse.json({
        message: 'Transcription API is running',
        version: '1.0.0',
        features: [
            'OpenAI Whisper API integration',
            'Audio file upload (.webm, .mp3, .wav)',
            'Real-time transcription',
            'Secure API key handling',
            'Temporary file cleanup',
            'Error handling and fallbacks'
        ],
        openaiConfigured,
        status: openaiConfigured ? 'ready' : 'missing_api_key',
        supportedFormats: ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav']
    });
} 