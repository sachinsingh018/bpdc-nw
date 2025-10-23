import { NextRequest, NextResponse } from 'next/server';

interface CVCuratorRequest {
    resumeText: string;
    userPrompt: string;
}

interface CVCuratorResponse {
    reply: string;
    success: boolean;
    error?: string;
}

async function generateCVResponse(resumeText: string, userMessage: string): Promise<string> {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
        console.error('OpenAI API key not configured');
        return 'Sorry, the CV analysis service is not currently available. Please try again later.';
    }

    const prompt = `You are an expert CV/resume consultant. Analyze the following resume and respond to the user's question.

RESUME:
${resumeText}

USER QUESTION:
${userMessage}

Please provide a helpful, specific response that addresses the user's question about their resume. Focus on actionable advice and improvements. Be concise but thorough, and provide specific examples when possible.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert CV/resume consultant. Provide helpful, specific advice for resume improvements. Be professional, actionable, and encouraging."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content;

        if (!aiResponse) {
            throw new Error('OpenAI returned empty response');
        }

        console.log('CV analysis completed successfully');
        return aiResponse;

    } catch (error) {
        console.error('Error calling OpenAI API:', error);

        // Fallback to basic response if OpenAI fails
        return `I apologize, but I'm having trouble analyzing your resume right now. Please try again in a moment. If the problem persists, you can try rephrasing your question or uploading your resume again.`;
    }
}

// TODO: Implement PDF to text conversion
async function convertPdfToText(file: File): Promise<string> {
    // This would use a library like pdf-parse or pdf2pic
    // For now, return dummy text
    return `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 5+ years developing scalable web applications using React, Node.js, and Python. Passionate about clean code, user experience, and continuous learning.

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Mentored 3 junior developers and conducted code reviews
• Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer | StartupXYZ | 2019 - 2021
• Built full-stack web applications using React and Node.js
• Collaborated with cross-functional teams to deliver features on time
• Optimized database queries improving performance by 40%

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2019

SKILLS
Programming: JavaScript, TypeScript, Python, Java, SQL
Frameworks: React, Node.js, Express, Django, Spring Boot
Tools: Git, Docker, AWS, Jenkins, Jira
Cloud: AWS, Google Cloud Platform, Azure`;
}

export async function POST(request: NextRequest) {
    try {
        const body: CVCuratorRequest = await request.json();
        const { resumeText, userPrompt } = body;

        if (!resumeText || !userPrompt) {
            return NextResponse.json(
                { error: 'Resume text and user prompt are required' },
                { status: 400 }
            );
        }

        // TODO: Add rate limiting per user
        // TODO: Add user authentication check

        const reply = await generateCVResponse(resumeText, userPrompt);

        return NextResponse.json({
            reply,
            success: true
        } as CVCuratorResponse);

    } catch (error) {
        console.error('CV Curator API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'CV Curator API is running',
        version: '1.0.0',
        features: [
            'PDF to text conversion (placeholder)',
            'OpenAI-powered resume analysis',
            'Real-time AI responses',
            'Secure API key handling',
            'Rate limiting (placeholder)',
            'User authentication (placeholder)'
        ]
    });
} 