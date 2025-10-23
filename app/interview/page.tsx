'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, RotateCcw, Settings, Volume2, Sparkles, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function InterviewPage() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [interviewDuration, setInterviewDuration] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [interviewStatus, setInterviewStatus] = useState<'idle' | 'preparing' | 'active' | 'paused' | 'completed'>('idle');

    // Weekly constraint state
    const [eligibility, setEligibility] = useState<{
        canStart: boolean;
        daysUntilNext: number;
        lastInterviewDate: Date | null;
        interviewCount: number;
        message: string;
    } | null>(null);
    const [isLoadingEligibility, setIsLoadingEligibility] = useState(true);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Check eligibility on component mount
    useEffect(() => {
        checkEligibility();
    }, []);

    const checkEligibility = async () => {
        try {
            setIsLoadingEligibility(true);
            const response = await fetch('/api/interview/eligibility');
            if (response.ok) {
                const data = await response.json();
                setEligibility(data);
            } else {
                console.error('Failed to check eligibility');
            }
        } catch (error) {
            console.error('Error checking eligibility:', error);
        } finally {
            setIsLoadingEligibility(false);
        }
    };

    const markInterviewCompleted = async () => {
        try {
            const response = await fetch('/api/interview/eligibility', {
                method: 'POST'
            });
            if (response.ok) {
                // Refresh eligibility after completion
                await checkEligibility();
            }
        } catch (error) {
            console.error('Error marking interview as completed:', error);
        }
    };

    const questions = [
        "Tell me about a challenging project you worked on and how you overcame obstacles.",
        "Describe a time when you had to learn a new technology quickly. How did you approach it?",
        "How do you handle working with difficult team members or stakeholders?",
        "What's your process for debugging complex technical issues?",
        "How do you stay updated with the latest industry trends and technologies?"
    ];

    const startInterview = () => {
        if (!eligibility?.canStart) {
            return;
        }

        setInterviewStatus('preparing');
        setTimeout(() => {
            setInterviewStatus('active');
            setIsRecording(true);
            startTimer();
            // Simulate AI starting to speak
            setTimeout(() => {
                setTranscript("Hello! I'm your AI interviewer. I'll be asking you a series of questions to assess your technical skills and experience. Let's begin with the first question...");
            }, 1000);
        }, 2000);
    };

    const stopInterview = () => {
        setIsRecording(false);
        setIsPlaying(false);
        setInterviewStatus('paused');
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const resetInterview = () => {
        setIsRecording(false);
        setIsPlaying(false);
        setInterviewDuration(0);
        setTranscript('');
        setCurrentQuestion(0);
        setInterviewStatus('idle');
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    const startTimer = () => {
        intervalRef.current = setInterval(() => {
            setInterviewDuration(prev => prev + 1);
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setTranscript(prev => prev + `\n\nQuestion ${currentQuestion + 2}: ${questions[currentQuestion + 1]}`);
        } else {
            setInterviewStatus('completed');
            setIsRecording(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Mark interview as completed
            markInterviewCompleted();
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute w-96 h-96 bg-purple-600 rounded-full opacity-20 blur-3xl animate-pulse top-[-100px] left-[-100px]" />
                <div className="absolute w-80 h-80 bg-violet-500 rounded-full opacity-15 blur-2xl animate-spin-slow bottom-[-80px] right-[-60px]" />
                <div className="absolute w-64 h-64 bg-purple-400 rounded-full opacity-25 blur-2xl animate-float-slow top-[40%] left-[20%]" />
                <div className="absolute w-72 h-72 bg-violet-600 rounded-full opacity-20 blur-2xl animate-float-medium top-[20%] right-[30%]" />
                <div className="absolute w-56 h-56 bg-purple-300 rounded-full opacity-15 blur-2xl animate-float-fast bottom-[20%] left-[60%]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            AI Interview Studio
                        </h1>
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                        Experience the future of interviewing with AI-powered voice conversations
                    </p>
                </motion.div>

                {/* Interview Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center mb-6"
                >
                    <Badge
                        variant={interviewStatus === 'active' ? 'default' : 'secondary'}
                        className={`text-sm px-4 py-2 ${interviewStatus === 'active'
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : interviewStatus === 'preparing'
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}
                    >
                        {interviewStatus === 'idle' && 'Ready to Start'}
                        {interviewStatus === 'preparing' && 'Preparing Interview...'}
                        {interviewStatus === 'active' && 'Interview Active'}
                        {interviewStatus === 'paused' && 'Interview Paused'}
                        {interviewStatus === 'completed' && 'Interview Completed'}
                    </Badge>
                </motion.div>

                {/* Weekly Constraint Status */}
                {!isLoadingEligibility && eligibility && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center mb-6"
                    >
                        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-xl">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-purple-300" />
                                        <span className="text-sm text-purple-200">
                                            {eligibility.interviewCount} interviews completed
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-300" />
                                        <span className={`text-sm ${eligibility.canStart ? 'text-green-300' : 'text-yellow-300'}`}>
                                            {eligibility.canStart ? 'Available now' : `${eligibility.daysUntilNext} days until next`}
                                        </span>
                                    </div>
                                </div>
                                {!eligibility.canStart && eligibility.lastInterviewDate && (
                                    <p className="text-xs text-purple-300 mt-2 text-center">
                                        Last interview: {new Date(eligibility.lastInterviewDate).toLocaleDateString()}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Timer and Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex justify-center mb-6"
                >
                    <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-purple-200 mb-2">
                            {formatTime(interviewDuration)}
                        </div>
                        <div className="w-64">
                            <Progress
                                value={(currentQuestion / questions.length) * 100}
                            />
                        </div>
                        <p className="text-sm text-purple-300 mt-2">
                            Question {currentQuestion + 1} of {questions.length}
                        </p>
                    </div>
                </motion.div>

                {/* Main Interview Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex-1 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full"
                >
                    {/* Transcript Card */}
                    <Card className="flex-1 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-200">
                                <Volume2 className="w-5 h-5" />
                                Interview Transcript
                            </CardTitle>
                            <CardDescription className="text-purple-300">
                                Real-time conversation with your AI interviewer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 h-96 overflow-y-auto border border-white/10">
                                {transcript ? (
                                    <div className="space-y-4">
                                        {transcript.split('\n\n').map((paragraph, index) => (
                                            <motion.p
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="text-purple-100 leading-relaxed"
                                            >
                                                {paragraph}
                                            </motion.p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-purple-400">
                                        <div className="text-center">
                                            <Volume2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Transcript will appear here once the interview begins</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controls Card */}
                    <Card className="lg:w-80 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-purple-200">Interview Controls</CardTitle>
                            <CardDescription className="text-purple-300">
                                Manage your interview session
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Current Question Display */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                                <h4 className="font-semibold text-purple-200 mb-2">Current Question:</h4>
                                <p className="text-sm text-purple-100">
                                    {questions[currentQuestion]}
                                </p>
                            </div>

                            {/* Control Buttons */}
                            <div className="space-y-3">
                                <AnimatePresence mode="wait">
                                    {interviewStatus === 'idle' && (
                                        <motion.div
                                            key="start"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Button
                                                onClick={startInterview}
                                                disabled={!eligibility?.canStart || isLoadingEligibility}
                                                className={`w-full font-semibold py-3 ${eligibility?.canStart && !isLoadingEligibility
                                                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white'
                                                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Play className="w-5 h-5 mr-2" />
                                                {isLoadingEligibility ? 'Checking...' : eligibility?.canStart ? 'Start Interview' : 'Weekly Limit Reached'}
                                            </Button>
                                        </motion.div>
                                    )}

                                    {interviewStatus === 'active' && (
                                        <motion.div
                                            key="active"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-3"
                                        >
                                            <Button
                                                onClick={stopInterview}
                                                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3"
                                            >
                                                <Square className="w-5 h-5 mr-2" />
                                                Stop Interview
                                            </Button>

                                            <Button
                                                onClick={nextQuestion}
                                                variant="outline"
                                                className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                                            >
                                                Next Question
                                            </Button>
                                        </motion.div>
                                    )}

                                    {interviewStatus === 'paused' && (
                                        <motion.div
                                            key="paused"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-3"
                                        >
                                            <Button
                                                onClick={startInterview}
                                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3"
                                            >
                                                <Play className="w-5 h-5 mr-2" />
                                                Resume Interview
                                            </Button>

                                            <Button
                                                onClick={resetInterview}
                                                variant="outline"
                                                className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                                            >
                                                <RotateCcw className="w-5 h-5 mr-2" />
                                                Reset Interview
                                            </Button>
                                        </motion.div>
                                    )}

                                    {interviewStatus === 'completed' && (
                                        <motion.div
                                            key="completed"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-3"
                                        >
                                            <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                                                <p className="text-green-300 font-semibold">Interview Completed!</p>
                                                <p className="text-green-200 text-sm mt-1">Duration: {formatTime(interviewDuration)}</p>
                                            </div>

                                            <Button
                                                onClick={resetInterview}
                                                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-3"
                                            >
                                                <RotateCcw className="w-5 h-5 mr-2" />
                                                Start New Interview
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Voice Recording Status */}
                                <div className="flex items-center justify-center gap-2 p-3 bg-black/30 rounded-lg border border-white/10">
                                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                                    <span className="text-sm text-purple-300">
                                        {isRecording ? 'Recording...' : 'Voice Ready'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-8 text-purple-300 text-sm"
                >
                    <p>Powered by ElevenLabs AI Voice Technology</p>
                    <p className="mt-1">Weekly AI-powered voice interviews for skill assessment</p>
                </motion.div>
            </div>

            {/* Custom CSS for animations */}
            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
        </div>
    );
} 