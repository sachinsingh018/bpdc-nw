"use client";

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useState, useEffect } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from '@/components/toast';
import { setCookie } from 'cookies-next';
import { useActionState } from 'react';
import { login, type LoginActionState } from '../actions';

export default function LoginTry() {
  const router = useRouter();

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
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
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
      {/* Form Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-xl text-black dark:text-white animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">Welcome Back</h1>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful} isLoading={state.status === 'in_progress'}>Sign in</SubmitButton>
        </AuthForm>
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
