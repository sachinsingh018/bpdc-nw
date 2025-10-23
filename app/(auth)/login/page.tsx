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
import { login, type LoginActionState } from '../actions';

export default function LoginTry() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      setCookie('userEmail', email, {
        path: '/',
        maxAge: 60 * 60 * 24 * 15,
      });
      router.push('/profile');
    }
  }, [state.status, email, router]);

  const handleSubmit = (formData: FormData) => {
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);
    formAction(formData);
  };

  return (
    <div className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-hidden flex items-center justify-center px-4">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse top-[-100px] left-[-100px]" />
        <div className="absolute w-72 h-72 bg-blue-400 rounded-full opacity-10 blur-2xl animate-spin-slow bottom-[-80px] right-[-60px]" />
      </div>
      {/* Form Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-xl text-black dark:text-white animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">Welcome Back</h1>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful} isLoading={state.status === 'in_progress'}>Sign in</SubmitButton>
          <div className="flex justify-end mt-2">
            <a href="/forgot-password" className="text-sm text-purple-600 hover:underline">Forgot password?</a>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            Don&apos;t have an account?{' '}
            <a href="/onboarding" className="font-semibold text-gray-800 hover:underline dark:text-zinc-200">
              Sign up
            </a>{' '}for free.
          </p>
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
