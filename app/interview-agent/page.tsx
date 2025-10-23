'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { speakText, stopSpeech, isSpeechSupported } from '../../utils/speech';

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

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
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
];

export default function InterviewAgentPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [aiFeedback, setAiFeedback] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [speechSupported] = useState(isSpeechSupported());

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Cleanup speech when component unmounts
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, []);

    const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === INTERVIEW_QUESTIONS.length - 1;

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
            const newAnswer: InterviewAnswer = {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                answer: transcript,
            };

            setAnswers(prev => [...prev, newAnswer]);

            // Generate AI feedback
            await generateAIFeedback([...answers, newAnswer]);

        } catch (error: any) {
            console.error('Error processing recording:', error);
            const errorMessage = error.message || 'Failed to process recording. Please try again.';
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const generateAIFeedback = async (allAnswers: InterviewAnswer[]) => {
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

        } catch (error) {
            console.error('Error generating AI feedback:', error);
            toast.error('Failed to generate feedback. Please try again.');
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
            // Stop any ongoing speech when navigating
            stopSpeech();
            setCurrentQuestionIndex(prev => prev + 1);
            setShowFeedback(false);
            setAiFeedback('');
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
                    <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
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
                <div className="absolute top-10 left-5 w-96 h-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                {/* Bright Golden Yellow */}
                <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                <div className="absolute bottom-1/4 left-1/4 w-88 h-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                {/* Crimson Red */}
                <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                {/* Charcoal Black */}
                <div className="absolute bottom-10 right-5 w-72 h-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                {/* Light Gray */}
                <div className="absolute top-1/4 left-1/2 w-60 h-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                {/* Mid-tone Blue */}
                <div className="absolute bottom-1/3 right-1/4 w-68 h-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                {/* Warm Golden Glow */}
                <div className="absolute top-1/2 left-1/5 w-76 h-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                {/* Vibrant Red */}
                <div className="absolute top-2/3 right-1/5 w-52 h-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                {/* Neon Purple */}
                <div className="absolute top-1/6 left-2/3 w-84 h-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                <div className="absolute bottom-1/6 left-1/6 w-48 h-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/20 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    🎤 Interview Practice Agent
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Question {currentQuestionIndex + 1} of {INTERVIEW_QUESTIONS.length}
                                    </span>
                                    <div className="flex space-x-1">
                                        {INTERVIEW_QUESTIONS.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-2 h-2 rounded-full ${index <= currentQuestionIndex
                                                    ? 'bg-purple-500'
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Speech Controls */}
                            {speechSupported && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            if (isMuted) {
                                                setIsMuted(false);
                                                toast.success('Voice playback enabled');
                                            } else {
                                                setIsMuted(true);
                                                stopSpeech();
                                                toast.success('Voice playback disabled');
                                            }
                                        }}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isMuted
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/30'
                                            }`}
                                        title={isMuted ? 'Enable voice playback' : 'Disable voice playback'}
                                    >
                                        {isMuted ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                                </svg>
                                                <span>Muted</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                </svg>
                                                <span>Voice On</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
                    <div className="flex-1 flex items-center justify-center px-4 py-8">
                        <div className="max-w-4xl w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
                            {/* Question */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                                        {currentQuestion.category}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {currentQuestion.question}
                                </h2>
                            </div>

                            {/* Recording Controls */}
                            <div className="flex justify-center mb-8">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isProcessing}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all ${isRecording
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                                                <span>Stop Recording</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"></div>
                                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <span className="text-gray-600 dark:text-gray-400">Processing your response...</span>
                                    </div>
                                </div>
                            )}

                            {/* Answer Display */}
                            {currentAnswer && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
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
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>

                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {currentQuestionIndex + 1} of {INTERVIEW_QUESTIONS.length}
                                </div>

                                <button
                                    onClick={nextQuestion}
                                    disabled={isLastQuestion}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLastQuestion ? 'Finish' : 'Next →'}
                                </button>
                            </div>
                        </div>
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
                <div className="bg-white/80 dark:bg-gray-900/80 text-black dark:text-white text-xs sm:text-sm px-3 py-1 rounded-full shadow-md backdrop-blur hover:bg-white dark:hover:bg-gray-800 transition cursor-pointer">
                    Powered by{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
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