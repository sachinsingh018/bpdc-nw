'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Loader2, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CommonNavbar } from '@/components/common-navbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

interface Skill {
    id: number;
    name: string;
}

interface SkillQuestion {
    id: number;
    skillId: number;
    question: string;
    options: string[];
    correctIndex: number;
}

export default function SkillAssessmentPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [questions, setQuestions] = useState<SkillQuestion[]>([]);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);

    // Authentication check
    useEffect(() => {
        const initialize = async () => {
            // Check for NextAuth session first
            if (session?.user?.email) {
                // Set up userEmail cookie for Google users
                try {
                    const response = await fetch('/api/auth/google-setup');
                    if (response.ok) {
                        loadSkills();
                        return;
                    }
                } catch (error) {
                    console.error('Error setting up Google session:', error);
                }
            }

            // Fallback to cookie-based authentication
            const userEmail = await getCookie('userEmail');
            if (!userEmail) {
                router.push('/login');
            } else {
                loadSkills();
            }
        };

        // Only initialize after session status is determined
        if (status !== 'loading') {
            initialize();
        }
    }, [router, session, status]);

    // Load skills on component mount
    useEffect(() => {
        // Skills will be loaded in the authentication check
    }, []);

    const loadSkills = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/skills');
            if (response.ok) {
                const data = await response.json();
                setSkills(data);
            }
        } catch (error) {
            console.error('Error loading skills:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadQuestions = async (skillId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/skills/${skillId}/questions`);
            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
                setAnswers(new Array(data.length).fill(-1));
                setTotal(data.length);
                setShowResults(false);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkillChange = (skillId: string) => {
        setSelectedSkill(skillId);
        if (skillId) {
            loadQuestions(skillId);
        } else {
            setQuestions([]);
            setAnswers([]);
        }
    };

    const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctIndex) {
                correct++;
            }
        });
        return correct;
    };

    const handleSubmit = async () => {
        if (answers.includes(-1)) return; // Not all questions answered

        const finalScore = calculateScore();
        setScore(finalScore);

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/skill-attempts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    skillId: parseInt(selectedSkill),
                    score: finalScore,
                    total: questions.length,
                    selectedAnswers: answers,
                }),
            });

            if (response.ok) {
                setShowResults(true);
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const allQuestionsAnswered = answers.length > 0 && !answers.includes(-1);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed',
                        filter: 'blur(4px)'
                    }}
                />
                <div className="relative z-10 text-center">
                    <Loader2 className="size-8 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-black font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Blurred Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/bpdcbg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    filter: 'blur(4px)'
                }}
            />

            {/* Common Navbar */}
            <CommonNavbar currentPage="/skill-assessment" />

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Brain className="size-8 text-purple-600" />
                        <h1 className="text-4xl font-bold text-black">
                            Skill Assessment
                        </h1>
                        <Brain className="size-8 text-purple-600" />
                    </div>
                    <p className="text-lg text-black/80 max-w-2xl mx-auto font-medium">
                        Test your knowledge and track your progress across different skills
                    </p>
                </motion.div>

                {/* Skill Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-md mx-auto mb-8"
                >
                    <Card className="backdrop-blur-sm rounded-2xl border-2 shadow-xl" style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 30%, rgba(138, 43, 226, 0.1) 70%, rgba(255, 255, 255, 0.95) 100%)',
                        borderColor: 'rgba(255, 215, 0, 0.6)',
                        boxShadow: '0 25px 50px rgba(25, 25, 112, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)'
                    }}>
                        <CardHeader>
                            <CardTitle className="text-black flex items-center gap-2 font-bold">
                                <Target className="size-5 text-yellow-600" />
                                Choose a Skill
                            </CardTitle>
                            <CardDescription className="text-black/70 font-medium">
                                Select a skill to begin your assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedSkill} onValueChange={handleSkillChange}>
                                <SelectTrigger className="bg-white/80 border-gray-300 text-black">
                                    <SelectValue placeholder="Select a skill..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200">
                                    {skills.map((skill) => (
                                        <SelectItem
                                            key={skill.id}
                                            value={skill.id.toString()}
                                            className="text-black hover:bg-purple-100 focus:bg-purple-100"
                                        >
                                            {skill.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center items-center py-12"
                    >
                        <div className="text-center">
                            <Loader2 className="size-8 text-purple-600 animate-spin mx-auto mb-4" />
                            <p className="text-black font-medium">Loading questions...</p>
                        </div>
                    </motion.div>
                )}

                {/* Questions */}
                <AnimatePresence mode="wait">
                    {questions.length > 0 && !isLoading && !showResults && (
                        <motion.div
                            key="questions"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-4xl mx-auto space-y-6"
                        >
                            {questions.map((question, questionIndex) => (
                                <Card
                                    key={question.id}
                                    className="backdrop-blur-sm rounded-2xl border-2 shadow-xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(70, 130, 180, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                        borderColor: 'rgba(70, 130, 180, 0.6)',
                                        boxShadow: '0 25px 50px rgba(70, 130, 180, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)'
                                    }}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-black font-bold">
                                            Question {questionIndex + 1}
                                        </CardTitle>
                                        <CardDescription className="text-black/80 text-base font-medium">
                                            {question.question}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup
                                            value={answers[questionIndex]?.toString() || ''}
                                            onValueChange={(value: string) => handleAnswerChange(questionIndex, parseInt(value))}
                                            className="space-y-3"
                                        >
                                            {question.options.map((option, optionIndex) => (
                                                <div
                                                    key={optionIndex}
                                                    className="flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors bg-white/50"
                                                    style={{
                                                        borderColor: 'rgba(70, 130, 180, 0.3)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = 'rgba(70, 130, 180, 0.6)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = 'rgba(70, 130, 180, 0.3)';
                                                    }}
                                                >
                                                    <RadioGroupItem
                                                        value={optionIndex.toString()}
                                                        id={`question-${questionIndex}-option-${optionIndex}`}
                                                        className="text-blue-600 border-gray-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                                    />
                                                    <Label
                                                        htmlFor={`question-${questionIndex}-option-${optionIndex}`}
                                                        className="text-black cursor-pointer flex-1 font-medium"
                                                    >
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex justify-center pt-6"
                            >
                                <div className="relative">
                                    {/* Glow effect behind button */}
                                    <div
                                        className="absolute inset-0 blur-xl opacity-70 rounded-full"
                                        style={{
                                            background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
                                            transform: 'scale(1.2)'
                                        }}
                                    />
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!allQuestionsAnswered || isSubmitting}
                                        className={`relative px-12 py-5 text-xl font-extrabold transition-all duration-200 hover:scale-105 ${allQuestionsAnswered && !isSubmitting
                                            ? 'shadow-2xl hover:shadow-3xl'
                                            : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                                            }`}
                                        style={allQuestionsAnswered && !isSubmitting ? {
                                            background: 'linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #5c6bc0 100%)',
                                            color: '#FFFFFF',
                                            border: '4px solid rgba(255, 255, 255, 0.9)',
                                            boxShadow: '0 10px 40px rgba(26, 35, 126, 0.8), 0 0 60px rgba(40, 53, 147, 0.6), 0 0 80px rgba(57, 73, 171, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.3)',
                                            textShadow: '0 3px 6px rgba(0, 0, 0, 0.7), 0 0 10px rgba(255, 255, 255, 0.2)',
                                            filter: 'brightness(0.95)'
                                        } : {}}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="size-6 mr-2 animate-spin text-white" />
                                                <span className="text-white">Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trophy className="size-6 mr-2 text-white" />
                                                <span className="text-white">Submit Assessment</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {showResults && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className="backdrop-blur-sm rounded-2xl border-2 shadow-xl" style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 50%, rgba(255, 255, 255, 0.95) 100%)',
                                borderColor: 'rgba(255, 215, 0, 0.6)',
                                boxShadow: '0 25px 50px rgba(255, 215, 0, 0.2), 0 0 30px rgba(138, 43, 226, 0.1)'
                            }}>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl text-black flex items-center justify-center gap-2 font-bold">
                                        <Trophy className="size-6 text-yellow-600" />
                                        Assessment Complete!
                                    </CardTitle>
                                    <CardDescription className="text-black/80 text-lg font-medium">
                                        You got {score} out of {total} correct
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Score Display */}
                                    <div className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className={`text-lg px-4 py-2 font-bold ${score === total
                                                ? 'bg-green-500/30 text-green-800 border-green-500/50'
                                                : score >= total / 2
                                                    ? 'bg-yellow-500/30 text-yellow-800 border-yellow-500/50'
                                                    : 'bg-red-500/30 text-red-800 border-red-500/50'
                                                }`}
                                        >
                                            {Math.round((score / total) * 100)}% Score
                                        </Badge>
                                    </div>

                                    {/* Question Review */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-black">Question Review</h3>
                                        {questions.map((question, questionIndex) => {
                                            const isCorrect = answers[questionIndex] === question.correctIndex;
                                            const userAnswer = answers[questionIndex];

                                            return (
                                                <Card
                                                    key={question.id}
                                                    className={`border-2 ${isCorrect
                                                        ? 'border-green-500/50 bg-green-500/20'
                                                        : 'border-red-500/50 bg-red-500/20'
                                                        }`}
                                                >
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            {isCorrect ? (
                                                                <CheckCircle className="size-5 text-green-600 mt-1 shrink-0" />
                                                            ) : (
                                                                <XCircle className="size-5 text-red-600 mt-1 shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-black font-bold mb-2">
                                                                    Question {questionIndex + 1}
                                                                </p>
                                                                <p className="text-black/80 mb-3 font-medium">{question.question}</p>

                                                                {/* Options */}
                                                                <div className="space-y-2">
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <div
                                                                            key={optionIndex}
                                                                            className={`p-2 rounded border-2 font-medium ${optionIndex === question.correctIndex
                                                                                ? 'border-green-500/70 bg-green-500/30 text-green-900'
                                                                                : optionIndex === userAnswer && !isCorrect
                                                                                    ? 'border-red-500/70 bg-red-500/30 text-red-900'
                                                                                    : 'border-gray-300 bg-white/50 text-black'
                                                                                }`}
                                                                        >
                                                                            {option}
                                                                            {optionIndex === question.correctIndex && (
                                                                                <CheckCircle className="size-4 text-green-700 ml-2 inline" />
                                                                            )}
                                                                            {optionIndex === userAnswer && !isCorrect && (
                                                                                <XCircle className="size-4 text-red-700 ml-2 inline" />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                        <Button
                                            onClick={() => {
                                                setShowResults(false);
                                                setAnswers(new Array(questions.length).fill(-1));
                                            }}
                                            variant="outline"
                                            className="border-purple-600 text-black hover:bg-purple-100 font-bold"
                                        >
                                            Retry Assessment
                                        </Button>
                                        <div className="relative">
                                            {/* Glow effect behind button */}
                                            <div
                                                className="absolute inset-0 blur-lg opacity-70 rounded-full"
                                                style={{
                                                    background: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #C2185B 100%)',
                                                    transform: 'scale(1.15)'
                                                }}
                                            />
                                            <Button
                                                onClick={() => {
                                                    setSelectedSkill('');
                                                    setQuestions([]);
                                                    setAnswers([]);
                                                    setShowResults(false);
                                                }}
                                                className="relative font-extrabold hover:shadow-2xl transition-all duration-200 hover:scale-105 px-8 py-4 text-lg"
                                                style={{
                                                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C42 30%, #FF6B35 60%, #C2185B 100%)',
                                                    color: '#FFFFFF',
                                                    border: '4px solid #FFFFFF',
                                                    boxShadow: '0 10px 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 107, 53, 0.6), 0 0 80px rgba(194, 24, 91, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.4), inset 0 -2px 6px rgba(0, 0, 0, 0.2)',
                                                    textShadow: '0 3px 6px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.3)',
                                                    filter: 'brightness(1.1) saturate(1.2)'
                                                }}
                                            >
                                                Choose Different Skill
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
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