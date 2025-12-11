"use client";

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { useState, useEffect } from 'react';
import { SubmitButton } from '@/components/submit-button';
import { toast } from '@/components/toast';
import { setCookie } from 'cookies-next';
import { useActionState } from 'react';
import { recruiterSignUp, type RecruiterSignUpActionState } from '../actions';

export default function RecruiterSignUp() {
  const router = useRouter();

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
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wide">Recruiter Sign Up</h1>
        <AuthForm action={handleSubmit} defaultEmail={email} defaultName={name} showNameField={true}>
          <SubmitButton isSuccessful={isSuccessful} isLoading={state.status === 'in_progress'}>Sign up</SubmitButton>
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

