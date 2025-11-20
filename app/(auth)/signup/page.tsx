"use client";

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';
import { useState, useEffect } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from '@/components/toast';
import { setCookie } from 'cookies-next';
import { useActionState } from 'react';
import { recruiterSignUp, type RecruiterSignUpActionState } from '../actions';

export default function RecruiterSignUp() {
    const router = useRouter();
    const { setTheme, theme } = useTheme();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSuccessful, setIsSuccessful] = useState(false);

    const [state, formAction] = useActionState<RecruiterSignUpActionState, FormData>(
        recruiterSignUp,
        {
            status: 'idle',
        },
    );

    useEffect(() => {
        if (state.status === 'failed') {
            toast({
                type: 'error',
                description: 'Failed to create account. Please try again!',
            });
        } else if (state.status === 'invalid_data') {
            toast({
                type: 'error',
                description: 'Failed validating your submission!',
            });
        } else if (state.status === 'user_exists') {
            toast({
                type: 'error',
                description: 'An account with this email already exists!',
            });
        } else if (state.status === 'success') {
            setIsSuccessful(true);
            setCookie('userEmail', email, {
                path: '/',
                maxAge: 60 * 60 * 24 * 15,
            });
            toast({
                type: 'success',
                description: 'Account created successfully! Welcome!',
            });
            router.push('/profile');
        }
    }, [state.status, email, router]);

    const handleSubmit = (formData: FormData) => {
        const emailValue = formData.get('email') as string;
        const nameValue = formData.get('name') as string;
        setEmail(emailValue);
        setName(nameValue);
        formAction(formData);
    };

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4" style={{
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
            <div className="absolute inset-0 z-0">
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
            {/* Form Card */}
            <div className="relative z-10 backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-xl text-black dark:text-white animate-fade-in">
                <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">Recruiter Sign Up</h1>
                <AuthForm action={handleSubmit} defaultEmail={email} defaultName={name} showNameField={true}>
                    <SubmitButton isSuccessful={isSuccessful} isLoading={state.status === 'in_progress'}>Sign up</SubmitButton>
                </AuthForm>
            </div>
            <div className="absolute bottom-4 z-10 text-sm text-center w-full flex justify-center">
                <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white rounded-full shadow-md hover:scale-105 transition-all"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={16} className="text-yellow-400" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon size={16} className="text-purple-600" />
                            Dark Mode
                        </>
                    )}
                </button>
            </div>
            <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}

