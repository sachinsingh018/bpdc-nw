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
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>('');
    const [questions, setQuestions] = useState<SkillQuestion[]>([]);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);

    // Load skills on component mount
    useEffect(() => {
        loadSkills();
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
            <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Brain className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            Skill Assessment
                        </h1>
                        <Brain className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-lg text-purple-200 max-w-2xl mx-auto">
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
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-purple-200 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Choose a Skill
                            </CardTitle>
                            <CardDescription className="text-purple-300">
                                Select a skill to begin your assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedSkill} onValueChange={handleSkillChange}>
                                <SelectTrigger className="bg-black/30 border-white/20 text-white">
                                    <SelectValue placeholder="Select a skill..." />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/20">
                                    {skills.map((skill) => (
                                        <SelectItem
                                            key={skill.id}
                                            value={skill.id.toString()}
                                            className="text-white hover:bg-purple-600/20 focus:bg-purple-600/20"
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
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                            <p className="text-purple-200">Loading questions...</p>
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
                                    className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl"
                                >
                                    <CardHeader>
                                        <CardTitle className="text-purple-200">
                                            Question {questionIndex + 1}
                                        </CardTitle>
                                        <CardDescription className="text-purple-300 text-base">
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
                                                    className="flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:border-purple-400/50 transition-colors bg-black/20"
                                                >
                                                    <RadioGroupItem
                                                        value={optionIndex.toString()}
                                                        id={`question-${questionIndex}-option-${optionIndex}`}
                                                        className="text-purple-400 border-white/30 data-[state=checked]:border-purple-400 data-[state=checked]:bg-purple-400/20"
                                                    />
                                                    <Label
                                                        htmlFor={`question-${questionIndex}-option-${optionIndex}`}
                                                        className="text-white cursor-pointer flex-1"
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
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!allQuestionsAnswered || isSubmitting}
                                    className={`px-8 py-3 text-lg font-semibold ${allQuestionsAnswered && !isSubmitting
                                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-purple-500/30'
                                        : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="w-5 h-5 mr-2" />
                                            Submit Assessment
                                        </>
                                    )}
                                </Button>
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
                            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl text-purple-200 flex items-center justify-center gap-2">
                                        <Trophy className="w-6 h-6" />
                                        Assessment Complete!
                                    </CardTitle>
                                    <CardDescription className="text-purple-300 text-lg">
                                        You got {score} out of {total} correct
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Score Display */}
                                    <div className="text-center">
                                        <Badge
                                            variant="secondary"
                                            className={`text-lg px-4 py-2 ${score === total
                                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                                : score >= total / 2
                                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                                                }`}
                                        >
                                            {Math.round((score / total) * 100)}% Score
                                        </Badge>
                                    </div>

                                    {/* Question Review */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-purple-200">Question Review</h3>
                                        {questions.map((question, questionIndex) => {
                                            const isCorrect = answers[questionIndex] === question.correctIndex;
                                            const userAnswer = answers[questionIndex];

                                            return (
                                                <Card
                                                    key={question.id}
                                                    className={`border ${isCorrect
                                                        ? 'border-green-500/30 bg-green-500/10'
                                                        : 'border-red-500/30 bg-red-500/10'
                                                        }`}
                                                >
                                                    <CardContent className="pt-6">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            {isCorrect ? (
                                                                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-white font-medium mb-2">
                                                                    Question {questionIndex + 1}
                                                                </p>
                                                                <p className="text-purple-200 mb-3">{question.question}</p>

                                                                {/* Options */}
                                                                <div className="space-y-2">
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <div
                                                                            key={optionIndex}
                                                                            className={`p-2 rounded border ${optionIndex === question.correctIndex
                                                                                ? 'border-green-500/50 bg-green-500/20 text-green-200'
                                                                                : optionIndex === userAnswer && !isCorrect
                                                                                    ? 'border-red-500/50 bg-red-500/20 text-red-200'
                                                                                    : 'border-white/20 text-gray-300'
                                                                                }`}
                                                                        >
                                                                            {option}
                                                                            {optionIndex === question.correctIndex && (
                                                                                <CheckCircle className="w-4 h-4 text-green-400 ml-2 inline" />
                                                                            )}
                                                                            {optionIndex === userAnswer && !isCorrect && (
                                                                                <XCircle className="w-4 h-4 text-red-400 ml-2 inline" />
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
                                            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                                        >
                                            Retry Assessment
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setSelectedSkill('');
                                                setQuestions([]);
                                                setAnswers([]);
                                                setShowResults(false);
                                            }}
                                            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                                        >
                                            Choose Different Skill
                                        </Button>
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