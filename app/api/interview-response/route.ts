import { NextRequest, NextResponse } from 'next/server';

interface InterviewAnswer {
    questionId: number;
    question: string;
    answer: string;
    aiFeedback?: string;
}

interface FeedbackRequest {
    answers: InterviewAnswer[];
    currentQuestion: {
        id: number;
        question: string;
        category: string;
    };
}

interface FeedbackResponse {
    feedback: string;
    success: boolean;
    error?: string;
}

// Mock AI feedback generator
async function generateMockFeedback(answers: InterviewAnswer[], currentQuestion: any): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const feedbackTemplates = {
        "Introduction": [
            "That's a solid start! I like how you covered your background. As an interviewer, I'd want to hear more specific examples of your achievements. Can you think of any metrics or concrete results from your previous roles?",
            "Good foundation there. From an interviewer's perspective, I'm looking for more than just your job titles. What really drives you? What are you passionate about in your work? That's what makes candidates memorable.",
            "You've got the basics down. But as someone who interviews candidates regularly, I want to hear what makes you unique. What's your story? What challenges have shaped your career path?"
        ],
        "Self-Assessment": [
            "I appreciate your honesty about weaknesses - that shows maturity. As an interviewer, I'm looking for candidates who can be self-aware. Your strength examples are good, but can you give me a specific situation where you demonstrated that strength?",
            "Good self-reflection. I like that you're not afraid to admit areas for improvement. That's exactly what I look for in candidates. Can you tell me about a time you actively worked on one of those weaknesses?",
            "You're showing good self-awareness, which is crucial. As an interviewer, I want to see how your strengths align with what we need. Can you connect your strengths more directly to this role?"
        ],
        "Motivation": [
            "I can hear your enthusiasm, which is great! As an interviewer, I want to know you've done your homework. What specifically about our company culture or mission resonates with you?",
            "Good answer, but I need to know more. Why us specifically? What research have you done about our company? I want to see genuine interest, not just generic enthusiasm.",
            "You've expressed interest, but I'm looking for deeper connection. What aspects of this role excite you most? How does this fit into your career trajectory?"
        ],
        "Problem Solving": [
            "Excellent! You've given me a clear situation, action, and result. That's exactly what I look for as an interviewer. The way you handled that shows real problem-solving skills. Can you tell me about another challenging situation?",
            "Good example, but I need more details. What was the specific impact of your solution? As an interviewer, I want to see quantifiable results. How did this affect the business?",
            "You've shown good problem-solving approach. I like that you took initiative. Can you give me more specific details about the outcome? What did you learn from this experience?"
        ],
        "Career Goals": [
            "I like your ambition! As an interviewer, I want to see realistic goals that align with our company's growth. Your 5-year vision sounds good, but how does this role specifically help you get there?",
            "Good planning. I can see you've thought about your future. But as someone who hires people, I want to know how your goals align with our company's trajectory. How do you see yourself growing with us?",
            "You've outlined clear goals, which I appreciate. But I need to understand how this opportunity fits into your bigger picture. What does success look like for you in this role?"
        ],
        "Leadership": [
            "I like your collaborative approach! That's exactly the kind of leadership style we value here. As an interviewer, I want to see specific examples. Can you tell me about a time you successfully led a team through a difficult project?",
            "Good leadership philosophy. I appreciate that you focus on empowering others. But I need concrete examples. When have you applied this style? What was the outcome?",
            "You've articulated your approach well. I'm looking for evidence of your leadership in action. Can you give me a specific example of when you successfully led a team?"
        ],
        "Work Style": [
            "I like your practical approach to stress management. That's exactly what I look for in candidates. As an interviewer, I want to know you can handle pressure while maintaining quality. Can you give me a specific example?",
            "Good stress management techniques. I appreciate that you're self-aware about how you handle pressure. But I need to see this in action. Can you tell me about a high-pressure situation you've handled?",
            "You've shown good stress management awareness. I want to see how you maintain quality under pressure. Can you give me a specific example of a challenging deadline you met?"
        ],
        "Closing": [
            "Excellent questions! You've shown genuine interest and done your research. That's exactly what I look for as an interviewer. Your questions demonstrate you've thought about this role seriously.",
            "Good questions, but I want to see deeper engagement. What specific aspects of our company culture or team dynamics interest you? I'm looking for thoughtful, researched questions.",
            "You've asked some good questions. But as an interviewer, I want to see questions that show you've done your homework. What specific aspects of this role or company excite you most?"
        ]
    };

    const category = currentQuestion.category;
    const templates = feedbackTemplates[category as keyof typeof feedbackTemplates] || feedbackTemplates["Introduction"];

    // Return a random feedback for the current question category
    return templates[Math.floor(Math.random() * templates.length)];
}

async function generateAIFeedback(answers: InterviewAnswer[], currentQuestion: any): Promise<string> {
    const openaiApiKey = process.env.OPENAI_API_KEY;


    if (!openaiApiKey) {
        console.error('OpenAI API key not configured');
        return await generateMockFeedback(answers, currentQuestion);
    }

    const prompt = `You are an expert interview coach acting as a real interviewer. Analyze the following interview answers and provide constructive feedback for the current question.

Previous Answers:
${answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')}

Current Question: ${currentQuestion.question}
Category: ${currentQuestion.category}

Please provide feedback that sounds like a real interviewer would give. Your response should:
1. Use first-person perspective ("As an interviewer, I...", "I like...", "I want to see...")
2. Be conversational and natural, not formal
3. Acknowledge what was done well
4. Ask follow-up questions to push for more detail
5. Provide specific, actionable advice
6. Maintain an encouraging but direct tone
7. Show what interviewers actually look for in candidates

Keep your response concise (2-3 sentences) and focus on the current question.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert interview coach. Provide constructive, specific feedback that sounds like a real interviewer would give. Use first-person perspective and be conversational."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
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

        console.log('AI feedback generated successfully');
        return aiResponse;

    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        console.log('Falling back to mock feedback');
        return await generateMockFeedback(answers, currentQuestion);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: FeedbackRequest = await request.json();
        const { answers, currentQuestion } = body;

        if (!answers || !currentQuestion) {
            return NextResponse.json(
                { error: 'Answers and current question are required', success: false },
                { status: 400 }
            );
        }

        const feedback = await generateAIFeedback(answers, currentQuestion);

        return NextResponse.json({
            feedback,
            success: true
        } as FeedbackResponse);

    } catch (error) {
        console.error('Interview Response API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate feedback',
                success: false,
                feedback: 'Unable to generate feedback at this time. Please try again.'
            } as FeedbackResponse,
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Interview Response API is running',
        version: '1.0.0',
        features: [
            'Contextual feedback generation',
            'Mock AI responses (for development)',
            'OpenAI integration ready',
            'Question-specific feedback'
        ]
    });
} 