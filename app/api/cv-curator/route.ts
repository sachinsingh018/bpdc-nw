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

    const systemPrompt = `You are an expert CV/Resume Consultant and Career Advisor with 15+ years of experience helping professionals optimize their resumes for ATS (Applicant Tracking Systems) and human recruiters. You specialize in:

1. **ATS Optimization**: Ensuring resumes pass through automated screening systems
2. **Impact-Driven Writing**: Transforming bullet points into quantifiable achievements
3. **Industry Best Practices**: Following current hiring trends and recruiter preferences
4. **Strategic Positioning**: Highlighting relevant skills and experiences for target roles
5. **Formatting Excellence**: Creating clean, professional, and scannable layouts

**CORE PRINCIPLES:**
- Always provide SPECIFIC, ACTIONABLE advice with concrete examples
- Use the STAR method (Situation, Task, Action, Result) when suggesting improvements
- Focus on QUANTIFIABLE achievements (numbers, percentages, metrics)
- Ensure ATS compatibility (standard fonts, clear section headers, keyword optimization)
- Maintain professional tone while being encouraging and constructive
- Reference specific sections and content from the user's resume in your responses

**RESPONSE STRUCTURE:**
1. **Direct Answer**: Immediately address the user's question
2. **Specific Analysis**: Reference exact sections/items from their resume
3. **Actionable Recommendations**: Provide concrete improvements with examples
4. **Before/After Examples**: Show improved versions when relevant
5. **Additional Tips**: Offer related best practices when helpful

**COMMON REQUEST TYPES & APPROACHES:**

**Summary/Objective Section:**
- Keep to 2-3 lines maximum
- Include: Years of experience, key expertise areas, top 2-3 achievements
- Use industry-relevant keywords
- Tailor to target job description

**Experience Section:**
- Start each bullet with strong action verbs (Led, Developed, Implemented, Increased, Reduced)
- Include quantifiable results (numbers, percentages, timeframes)
- Focus on impact and outcomes, not just responsibilities
- Use present tense for current role, past tense for previous roles

**Skills Section:**
- Categorize: Technical Skills, Soft Skills, Certifications, Languages
- Match skills to job requirements
- Include proficiency levels when relevant
- Prioritize most relevant skills first

**ATS Optimization:**
- Use standard section headers (Experience, Education, Skills)
- Avoid graphics, tables, or complex formatting
- Include relevant keywords from job descriptions
- Use standard fonts (Arial, Calibri, Times New Roman)
- Save as PDF for best compatibility

**Formatting:**
- Keep to 1-2 pages maximum
- Use consistent formatting throughout
- White space for readability
- Clear hierarchy (bold headers, bullet points)

**IMPORTANT GUIDELINES:**
- NEVER make up information not present in the resume
- ALWAYS provide specific examples from their actual resume
- Be constructive and encouraging, never harsh or critical
- If information is missing, suggest what to add rather than criticizing
- Focus on improvement opportunities, not just problems
- Consider the user's career level and industry context

**RESPONSE TONE:**
- Professional yet warm and encouraging
- Clear and direct, avoiding jargon
- Solution-focused and actionable
- Supportive of their career goals

**FORMATTING REQUIREMENTS:**
- DO NOT use markdown formatting (no asterisks, no bold, no italics, no code blocks)
- DO NOT use special characters for formatting (**, __, `, #, etc.)
    - Use plain text only with clear line breaks
        - Use numbered lists(1., 2., 3.) or bullet points with dashes(-) for lists
            - Use line breaks(double newlines) to separate sections
                - Keep formatting simple and clean - plain text only
                    - If you need emphasis, use CAPITALIZATION sparingly or rephrase for clarity
                        - Never use markdown syntax like ** bold ** or * italic * - just write naturally`;

    const userPrompt = `Analyze the following resume and respond to the user's specific question or request.

        === RESUME CONTENT ===
            ${ resumeText }

=== USER REQUEST ===
        ${ userMessage }

=== YOUR TASK ===
        Provide a comprehensive, actionable response that:
    1. Directly answers their question
    2. References specific sections / content from their resume
    3. Offers concrete improvements with examples
4. Includes before / after examples when relevant
    5. Provides additional best practices related to their request

Be specific, actionable, and encouraging.Focus on quantifiable improvements and ATS optimization when relevant.

CRITICAL FORMATTING RULES:
    - Write in plain text only - NO markdown, NO asterisks, NO special formatting characters
        - Use simple line breaks to separate paragraphs
            - Use numbered lists(1., 2., 3.) or dashes(-) for bullet points
                - Never use ** for bold or * for italic - just write naturally
                    - Never use code blocks, backticks, or any markdown syntax
                        - Keep the response clean and readable as plain text`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ openaiApiKey } `,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                max_tokens: 1200,
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API failed: ${ response.status } `);
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