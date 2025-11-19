'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { speakText, stopSpeech, isSpeechSupported } from '../../utils/speech';
import { CommonNavbar } from '@/components/common-navbar';
import { getCookie } from 'cookies-next';

interface InterviewQuestion {
    id: number;
    question: string;
    category: string;
}

interface InterviewAnswer {
    questionId: number;
    question: string;
    answer: string;
    aiFeedback?: string;
}

type InterviewCategory = 'behavioral' | 'technical' | 'data-science' | 'consulting' | 'data-analyst' | 'ai-engineer';

const INTERVIEW_QUESTIONS: Record<InterviewCategory, InterviewQuestion[]> = {
    behavioral: [
        {
            id: 1,
            question: "Tell me about yourself and your background.",
            category: "Introduction"
        },
        {
            id: 2,
            question: "What are your greatest strengths and weaknesses?",
            category: "Self-Assessment"
        },
        {
            id: 3,
            question: "Why are you interested in this position?",
            category: "Motivation"
        },
        {
            id: 4,
            question: "Describe a challenging situation you faced and how you overcame it.",
            category: "Problem Solving"
        },
        {
            id: 5,
            question: "Where do you see yourself in 5 years?",
            category: "Career Goals"
        },
        {
            id: 6,
            question: "What is your leadership style?",
            category: "Leadership"
        },
        {
            id: 7,
            question: "How do you handle stress and pressure?",
            category: "Work Style"
        },
        {
            id: 8,
            question: "Do you have any questions for us?",
            category: "Closing"
        }
    ],
    technical: [
        {
            id: 1,
            question: "Explain the difference between SQL and NoSQL databases. When would you use each?",
            category: "Database Systems"
        },
        {
            id: 2,
            question: "Describe the concept of RESTful APIs and explain the main HTTP methods used.",
            category: "API Design"
        },
        {
            id: 3,
            question: "What is the difference between authentication and authorization? Give examples.",
            category: "Security"
        },
        {
            id: 4,
            question: "Explain the difference between synchronous and asynchronous programming. When would you use each approach?",
            category: "Programming Concepts"
        },
        {
            id: 5,
            question: "What are design patterns? Explain one pattern you've used and why it was appropriate.",
            category: "Software Architecture"
        },
        {
            id: 6,
            question: "How do you handle errors and exceptions in your code? Walk me through your approach.",
            category: "Error Handling"
        },
        {
            id: 7,
            question: "Explain the concept of version control. How do you manage code conflicts in a team environment?",
            category: "Development Workflow"
        },
        {
            id: 8,
            question: "Describe your approach to testing. What types of testing do you prioritize and why?",
            category: "Quality Assurance"
        }
    ],
    'data-science': [
        {
            id: 1,
            question: "Explain the difference between supervised and unsupervised learning. Provide examples of each.",
            category: "Machine Learning"
        },
        {
            id: 2,
            question: "What is overfitting in machine learning? How would you detect and prevent it?",
            category: "Model Validation"
        },
        {
            id: 3,
            question: "Describe the bias-variance tradeoff. Why is it important in model development?",
            category: "Statistics & Theory"
        },
        {
            id: 4,
            question: "How do you handle missing data in a dataset? Walk me through your approach.",
            category: "Data Preprocessing"
        },
        {
            id: 5,
            question: "Explain the difference between classification and regression. When would you use each?",
            category: "ML Concepts"
        },
        {
            id: 6,
            question: "What is cross-validation? Why is it important in machine learning?",
            category: "Model Evaluation"
        },
        {
            id: 7,
            question: "Describe your approach to feature engineering. What factors do you consider when selecting features?",
            category: "Feature Engineering"
        },
        {
            id: 8,
            question: "How do you evaluate model performance? What metrics would you use for a classification problem?",
            category: "Performance Metrics"
        }
    ],
    consulting: [
        {
            id: 1,
            question: "Walk me through how you would structure a case interview. What framework would you use?",
            category: "Case Frameworks"
        },
        {
            id: 2,
            question: "A client's revenue has dropped by 20% over the last quarter. How would you diagnose the problem?",
            category: "Problem Diagnosis"
        },
        {
            id: 3,
            question: "How would you approach a situation where a client disagrees with your recommendations?",
            category: "Client Management"
        },
        {
            id: 4,
            question: "Describe a time when you had to make a decision with incomplete information. How did you proceed?",
            category: "Decision Making"
        },
        {
            id: 5,
            question: "How do you prioritize competing client demands when resources are limited?",
            category: "Resource Management"
        },
        {
            id: 6,
            question: "Explain the difference between strategy and tactics. Give an example of each.",
            category: "Strategic Thinking"
        },
        {
            id: 7,
            question: "How would you communicate a complex analysis to a non-technical client?",
            category: "Communication"
        },
        {
            id: 8,
            question: "Describe your approach to building trust and rapport with clients.",
            category: "Relationship Building"
        }
    ],
    'data-analyst': [
        {
            id: 1,
            question: "Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL. When would you use each?",
            category: "SQL Queries"
        },
        {
            id: 2,
            question: "How do you handle outliers in a dataset? Walk me through your approach.",
            category: "Data Cleaning"
        },
        {
            id: 3,
            question: "What is the difference between descriptive and inferential statistics? Provide examples.",
            category: "Statistics"
        },
        {
            id: 4,
            question: "How would you create a dashboard to track key business metrics? What considerations are important?",
            category: "Data Visualization"
        },
        {
            id: 5,
            question: "Explain the concept of A/B testing. How would you design and analyze an A/B test?",
            category: "Testing & Experimentation"
        },
        {
            id: 6,
            question: "How do you ensure data quality and accuracy in your analysis?",
            category: "Data Quality"
        },
        {
            id: 7,
            question: "Describe your process for translating business questions into analytical queries.",
            category: "Business Analysis"
        },
        {
            id: 8,
            question: "How do you present data findings to stakeholders? What makes an effective data presentation?",
            category: "Reporting & Communication"
        }
    ],
    'ai-engineer': [
        {
            id: 1,
            question: "Explain the architecture of a transformer model. What makes it effective for NLP tasks?",
            category: "Neural Networks"
        },
        {
            id: 2,
            question: "How would you deploy a machine learning model to production? Walk me through the pipeline.",
            category: "Model Deployment"
        },
        {
            id: 3,
            question: "What is the difference between fine-tuning and transfer learning? When would you use each?",
            category: "Model Training"
        },
        {
            id: 4,
            question: "How do you handle bias and fairness in AI models? What techniques would you use?",
            category: "AI Ethics"
        },
        {
            id: 5,
            question: "Explain the concept of attention mechanisms in neural networks. Why are they important?",
            category: "Deep Learning"
        },
        {
            id: 6,
            question: "How would you optimize a model for inference speed while maintaining accuracy?",
            category: "Model Optimization"
        },
        {
            id: 7,
            question: "Describe your approach to versioning and monitoring ML models in production.",
            category: "MLOps"
        },
        {
            id: 8,
            question: "What are the main differences between supervised, unsupervised, and reinforcement learning? Provide use cases for each.",
            category: "Learning Paradigms"
        }
    ]
};

const CATEGORY_INFO = {
    behavioral: {
        title: "Behavioral Interview",
        description: "Practice answering questions about your experience, teamwork, and problem-solving skills",
        icon: "👥",
        color: "purple"
    },
    technical: {
        title: "Technical Interview",
        description: "Test your knowledge of software engineering, databases, and system design",
        icon: "💻",
        color: "blue"
    },
    'data-science': {
        title: "Data Science Interview",
        description: "Demonstrate your understanding of machine learning, statistics, and data analysis",
        icon: "📊",
        color: "green"
    },
    consulting: {
        title: "Consulting Interview",
        description: "Master case studies, frameworks, and client management scenarios",
        icon: "🎯",
        color: "orange"
    },
    'data-analyst': {
        title: "Data Analyst Interview",
        description: "Showcase your SQL skills, data visualization, and analytical thinking",
        icon: "📈",
        color: "teal"
    },
    'ai-engineer': {
        title: "AI Engineer Interview",
        description: "Prove your expertise in ML models, neural networks, and AI deployment",
        icon: "🤖",
        color: "indigo"
    }
};

export default function InterviewAgentPage() {
    const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [aiFeedback, setAiFeedback] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [speechSupported] = useState(isSpeechSupported());
    const [eligibility, setEligibility] = useState<{
        canStart: boolean;
        hasDoneToday?: boolean;
        isInProgress?: boolean;
        inProgressCategory?: string;
        message?: string;
        nextAvailableDate?: string;
        isLoading: boolean;
    }>({ canStart: false, isLoading: true });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Helper function to get current user ID
    const getCurrentUserId = async (): Promise<string | null> => {
        const userEmail = getCookie('userEmail');
        if (!userEmail) return null;

        try {
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            return data?.id || null;
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return null;
        }
    };

    // Helper function to track activity
    const trackActivity = async (actionType: string, actionCategory: string, metadata?: any) => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        try {
            await fetch('/api/activity/track-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    actionType,
                    actionCategory,
                    resourceType: 'interview_agent',
                    metadata: {
                        ...metadata,
                        pagePath: '/interview-agent',
                        timestamp: new Date().toISOString(),
                    },
                }),
            }).catch(console.error);
        } catch (error) {
            console.error('Error tracking activity:', error);
        }
    };

    useEffect(() => {
        setMounted(true);
        checkEligibility();
    }, []);

    // Check interview eligibility and load progress
    const checkEligibility = async () => {
        try {
            const response = await fetch('/api/interview/eligibility');
            if (response.ok) {
                const data = await response.json();
                setEligibility({
                    canStart: data.canStart ?? false,
                    hasDoneToday: data.hasDoneToday,
                    isInProgress: data.isInProgress,
                    inProgressCategory: data.inProgressCategory,
                    message: data.message,
                    nextAvailableDate: data.nextAvailableDate,
                    isLoading: false,
                });

                // If there's an in-progress interview, load it
                if (data.isInProgress && data.inProgressCategory) {
                    await loadInterviewProgress(data.inProgressCategory);
                }
            } else {
                setEligibility({
                    canStart: false,
                    isLoading: false,
                    message: 'Unable to check eligibility. Please try again.',
                });
            }
        } catch (error) {
            console.error('Error checking eligibility:', error);
            setEligibility({
                canStart: false,
                isLoading: false,
                message: 'Error checking eligibility. Please try again.',
            });
        }
    };

    // Load interview progress
    const loadInterviewProgress = async (category: InterviewCategory) => {
        try {
            const response = await fetch('/api/interview/progress');
            if (response.ok) {
                const data = await response.json();
                if (data.hasProgress && data.category === category) {
                    // Set the category
                    setSelectedCategory(category);

                    // Load answers
                    const loadedAnswers: InterviewAnswer[] = data.answers.map((a: any) => ({
                        questionId: a.questionId,
                        question: a.question,
                        answer: a.answer,
                        aiFeedback: a.aiFeedback,
                    }));
                    setAnswers(loadedAnswers);

                    // Find the first unanswered question
                    const questions = INTERVIEW_QUESTIONS[category];
                    const answeredQuestionIds = new Set(loadedAnswers.map(a => a.questionId));
                    const firstUnansweredIndex = questions.findIndex(q => !answeredQuestionIds.has(q.id));

                    if (firstUnansweredIndex >= 0) {
                        setCurrentQuestionIndex(firstUnansweredIndex);
                    } else {
                        // All questions answered, go to last question
                        setCurrentQuestionIndex(questions.length - 1);
                    }

                    toast.success('Resuming your interview from where you left off!');
                }
            }
        } catch (error) {
            console.error('Error loading interview progress:', error);
        }
    };

    // Cleanup speech when component unmounts
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, []);

    // Initialize interview when category is selected
    useEffect(() => {
        if (selectedCategory) {
            // Don't reset if we're loading progress
            const initializeInterview = async () => {
                // Start the interview in the database
                try {
                    await fetch('/api/interview/progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ category: selectedCategory }),
                    });
                } catch (error) {
                    console.error('Error initializing interview:', error);
                }
            };
            initializeInterview();
        }
    }, [selectedCategory]);

    const currentQuestions = selectedCategory ? INTERVIEW_QUESTIONS[selectedCategory] : [];
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isLastQuestion = selectedCategory ? currentQuestionIndex === currentQuestions.length - 1 : false;

    const handleCategorySelect = async (category: InterviewCategory) => {
        // Wait for eligibility check to complete if still loading
        if (eligibility.isLoading) {
            toast.info('Please wait while we check your eligibility...');
            return;
        }

        // Check eligibility before allowing category selection
        if (!eligibility.canStart) {
            if (eligibility.hasDoneToday) {
                const nextDate = eligibility.nextAvailableDate 
                    ? new Date(eligibility.nextAvailableDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    })
                    : 'tomorrow';
                toast.error(`You have already completed an interview today. Come back ${nextDate} for another interview!`);
            } else {
                toast.error(eligibility.message || 'Unable to start interview. Please try again.');
            }
            return;
        }

        // If there's an in-progress interview for a different category, prevent switching
        if (eligibility.isInProgress && eligibility.inProgressCategory && eligibility.inProgressCategory !== category) {
            toast.error(`You have an interview in progress for ${eligibility.inProgressCategory}. Please complete that interview first.`);
            return;
        }

        // If already have a category selected and trying to switch, prevent it
        if (selectedCategory && selectedCategory !== category) {
            toast.error(`You have already started a ${selectedCategory} interview. Please complete it before starting a new one.`);
            return;
        }

        setSelectedCategory(category);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processRecording(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.success('Recording started...');
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Failed to start recording. Please check microphone permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            toast.success('Recording stopped. Processing...');
        }
    };

    const processRecording = async (audioBlob: Blob) => {
        setIsProcessing(true);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transcription failed');
            }

            const data = await response.json();
            const transcript = data.transcript || 'Could not transcribe audio';

            // Add answer to history
            if (currentQuestion) {
                const newAnswer: InterviewAnswer = {
                    questionId: currentQuestion.id,
                    question: currentQuestion.question,
                    answer: transcript,
                };

                // Check if this question was already answered
                const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
                if (existingAnswer) {
                    toast.warning('This question has already been answered. Moving to next question.');
                    // Update the existing answer
                    setAnswers(prev => prev.map(a =>
                        a.questionId === currentQuestion.id ? newAnswer : a
                    ));
                } else {
                setAnswers(prev => [...prev, newAnswer]);
                }

                // Save progress to database
                await saveAnswerProgress(currentQuestion, transcript);

                // Generate AI feedback
                await generateAIFeedback([...answers, newAnswer]);
            }

        } catch (error: any) {
            console.error('Error processing recording:', error);
            const errorMessage = error.message || 'Failed to process recording. Please try again.';
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const generateAIFeedback = async (allAnswers: InterviewAnswer[]) => {
        if (!currentQuestion) return;

        try {
            const response = await fetch('/api/interview-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: allAnswers,
                    currentQuestion: currentQuestion,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate feedback');
            }

            const data = await response.json();
            setAiFeedback(data.feedback);
            setShowFeedback(true);

            // Speak the AI feedback if not muted and speech is supported
            if (!isMuted && speechSupported && data.feedback) {
                speakText(data.feedback);
            }

            // Update the latest answer with feedback
            setAnswers(prev => {
                const updated = [...prev];
                if (updated.length > 0) {
                    updated[updated.length - 1].aiFeedback = data.feedback;
                }
                return updated;
            });

            // Save feedback to database
            if (currentQuestion && data.feedback) {
                await saveAnswerProgress(currentQuestion, answers.find(a => a.questionId === currentQuestion.id)?.answer || '', data.feedback);
            }

            // Track activity when user gets an answer/feedback
            trackActivity('question_answered', 'content', {
                feature: 'interview_agent',
                questionId: currentQuestion.id,
                questionCategory: selectedCategory,
                questionText: currentQuestion.question,
                hasFeedback: !!data.feedback,
            });

        } catch (error) {
            console.error('Error generating AI feedback:', error);
            toast.error('Failed to generate feedback. Please try again.');
        }
    };

    const nextQuestion = async () => {
        if (selectedCategory && currentQuestionIndex < currentQuestions.length - 1) {
            // Stop any ongoing speech when navigating
            stopSpeech();
            setCurrentQuestionIndex(prev => prev + 1);
            setShowFeedback(false);
            setAiFeedback('');
        } else if (isLastQuestion) {
            // Interview is complete - record it
            await recordInterviewCompletion();
        }
    };

    // Save answer progress to database
    const saveAnswerProgress = async (question: InterviewQuestion, answer: string, aiFeedback?: string) => {
        if (!selectedCategory) return;

        try {
            await fetch('/api/interview/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: selectedCategory,
                    questionId: question.id,
                    question: question.question,
                    answer,
                    aiFeedback,
                }),
            });
        } catch (error) {
            console.error('Error saving answer progress:', error);
            // Don't show error to user, just log it
        }
    };

    // Record interview completion
    const recordInterviewCompletion = async () => {
        try {
            const response = await fetch('/api/interview/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: selectedCategory }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    toast.success('Interview completed successfully! Come back tomorrow for another interview.');
                    // Update eligibility to prevent further interviews today
                    setEligibility({
                        canStart: false,
                        hasDoneToday: true,
                        isLoading: false,
                        message: 'You have completed your interview for today. Come back tomorrow!',
                    });
                } else {
                    toast.error(data.message || 'Failed to record interview completion');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to record interview completion');
            }
        } catch (error) {
            console.error('Error recording interview completion:', error);
            toast.error('Failed to record interview completion. Please try again.');
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            // Stop any ongoing speech when navigating
            stopSpeech();
            setCurrentQuestionIndex(prev => prev - 1);
            setShowFeedback(false);
            setAiFeedback('');
        }
    };

    const getCurrentAnswer = () => {
        if (!currentQuestion) return undefined;
        return answers.find(a => a.questionId === currentQuestion.id);
    };

    const currentAnswer = getCurrentAnswer();

    if (!mounted) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
                background: `
                  radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
                  radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
                `
            }}>
                <div className="text-center">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">
                        Loading Interview Agent...
                    </h2>
                    <p className="text-black font-medium">
                        Preparing your AI interviewer
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
              radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
              radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
              radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
              linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
            `
        }}>
            {/* Dynamic Vibrant Background Elements */}
            <div className="fixed inset-0 z-0">
                {/* Deep Royal Blue */}
                <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                {/* Bright Golden Yellow */}
                <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                {/* Crimson Red */}
                <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                {/* Charcoal Black */}
                <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                {/* Light Gray */}
                <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                {/* Mid-tone Blue */}
                <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                {/* Warm Golden Glow */}
                <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                {/* Vibrant Red */}
                <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                {/* Neon Purple */}
                <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Common Navbar */}
                <CommonNavbar currentPage="/interview-agent" showThemeToggle={true} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
                    <div className="flex-1 flex items-center justify-center px-4 py-8">
                        {!selectedCategory ? (
                            /* Category Selection Screen */
                            <div className="max-w-5xl w-full">
                                <div className="text-center mb-8">
                                    <h1 className="text-4xl font-bold text-black dark:text-black mb-4">
                                        🎤 Choose Your Interview Category
                                    </h1>
                                    <p className="text-lg text-black dark:text-black opacity-80">
                                        Select a category to begin your practice interview
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                                        const categoryKey = key as InterviewCategory;
                                        const colorClasses = {
                                            purple: 'bg-purple-300 hover:bg-purple-400 border-purple-200',
                                            blue: 'bg-blue-300 hover:bg-blue-400 border-blue-200',
                                            green: 'bg-green-300 hover:bg-green-400 border-green-200',
                                            orange: 'bg-orange-300 hover:bg-orange-400 border-orange-200',
                                            teal: 'bg-teal-300 hover:bg-teal-400 border-teal-200',
                                            indigo: 'bg-indigo-300 hover:bg-indigo-400 border-indigo-200'
                                        };
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleCategorySelect(categoryKey)}
                                                disabled={eligibility.isLoading}
                                                className={`${colorClasses[info.color as keyof typeof colorClasses]} text-black rounded-2xl p-8 border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left ${
                                                    eligibility.isLoading 
                                                        ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                                                        : ''
                                                }`}
                                            >
                                                <div className="text-5xl mb-4">{info.icon}</div>
                                                <h2 className="text-2xl font-bold mb-3">{info.title}</h2>
                                                <p className="text-black opacity-90 mb-4">{info.description}</p>
                                                <div className="text-sm font-semibold opacity-80">
                                                    {INTERVIEW_QUESTIONS[categoryKey].length} questions
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : currentQuestion ? (
                            <div className="max-w-4xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
                                {/* Question Progress Tracker */}
                                <div className="mb-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                                    {/* Category Tag */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-black dark:text-black bg-purple-100 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                                            {currentQuestion.category}
                                        </span>
                                        {!eligibility.isInProgress && (
                                        <button
                                                onClick={() => {
                                                    if (answers.length > 0) {
                                                        if (confirm('Are you sure you want to change category? Your progress will be lost.')) {
                                                            setSelectedCategory(null);
                                                        }
                                                    } else {
                                                        setSelectedCategory(null);
                                                    }
                                                }}
                                            className="flex items-center space-x-1.5 text-xs font-medium text-black dark:text-black bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                                            title="Change interview category"
                                        >
                                            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>Change Category</span>
                                        </button>
                                        )}
                                        {eligibility.isInProgress && (
                                            <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg">
                                                Interview in progress - Category locked
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm font-semibold text-black dark:text-black">
                                                Question {currentQuestionIndex + 1} of {currentQuestions.length}
                                            </span>
                                            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full flex-1 max-w-xs" style={{ maxWidth: '200px' }}>
                                                <div
                                                    className="h-full bg-purple-600 rounded-full transition-all duration-300"
                                                    style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Progress Dots */}
                                    <div className="flex items-center justify-center space-x-2">
                                        {currentQuestions.map((_, index) => {
                                            const isCompleted = answers.some(a => a.questionId === currentQuestions[index].id);
                                            const isCurrent = index === currentQuestionIndex;
                                            return (
                                                <div
                                                    key={index}
                                                    className={`transition-all duration-300 ${isCurrent
                                                        ? 'size-3 bg-purple-600 ring-2 ring-purple-300 dark:ring-purple-500'
                                                        : isCompleted
                                                            ? 'size-2.5 bg-purple-400 dark:bg-purple-500'
                                                            : 'size-2 bg-gray-300 dark:bg-gray-600'
                                                        } rounded-full`}
                                                    title={`Question ${index + 1}: ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Question */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-black dark:text-black mb-4">
                                        {currentQuestion.question}
                                    </h2>
                                </div>

                                {/* Show warning if question already answered */}
                                {currentAnswer && (
                                    <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            ⚠️ This question has already been answered. You can record a new answer to update it.
                                        </p>
                                    </div>
                                )}

                                {/* Recording Controls */}
                                <div className="flex justify-center mb-8">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isProcessing}
                                            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all ${isRecording
                                                ? 'bg-red-500 hover:bg-red-600 text-black'
                                                : 'bg-purple-600 hover:bg-purple-700 text-black'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isRecording ? (
                                                <>
                                                    <div className="size-4 bg-white rounded-full animate-pulse" />
                                                    <span>Stop Recording</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                    </svg>
                                                    <span>Start Recording</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Processing Indicator */}
                                {isProcessing && (
                                    <div className="text-center mb-6">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="size-4 bg-purple-500 rounded-full animate-bounce"></div>
                                            <div className="size-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="size-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <span className="text-gray-600 dark:text-gray-400">Processing your response...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Answer Display */}
                                {currentAnswer && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-3">
                                            Your Answer:
                                        </h3>
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                            <p className="text-gray-800 dark:text-gray-200">
                                                {currentAnswer.answer}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* AI Feedback */}
                                {showFeedback && aiFeedback && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-3">
                                            AI Feedback:
                                        </h3>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                            <p className="text-gray-800 dark:text-gray-200">
                                                {aiFeedback}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={previousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-4 py-2 text-black dark:text-black hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Previous
                                    </button>

                                    <div className="text-sm text-black dark:text-black">
                                        {currentQuestionIndex + 1} of {currentQuestions.length}
                                    </div>

                                    <button
                                        onClick={nextQuestion}
                                        disabled={isLastQuestion && (!currentAnswer || !currentAnswer.answer)}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLastQuestion ? 'Finish Interview' : 'Next →'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8 text-center">
                                <p className="text-black dark:text-black">Loading questions...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating "Powered by Networkqy" Bubble */}
            <a
                href="https://www.networkqy.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50"
            >
                <div className="bg-white/80 dark:bg-gray-900/80 text-black dark:text-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white dark:hover:bg-gray-800 transition cursor-pointer">
                    Powered by{' '}
                    <span className="font-semibold text-gray-900 dark:text-black">
                        Networkqy
                    </span>
                </div>
            </a>

            {/* Animation styles */}
            <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }

        .animate-float-slow {
          animation: float 12s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-fast {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
} 