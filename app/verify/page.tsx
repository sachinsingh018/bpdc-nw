'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function VerifyPage() {
    const router = useRouter();

    useEffect(() => {
        const email = window.localStorage.getItem('emailForSignIn');

        if (email && isSignInWithEmailLink(auth, window.location.href)) {
            signInWithEmailLink(auth, email, window.location.href)
                .then(() => {
                    window.localStorage.removeItem('emailForSignIn');
                    router.push('/connect-setup'); // or wherever you want to go next
                })
                .catch((error) => {
                    console.error('Sign-in error:', error);
                });
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Verifying your email...</p>
        </div>
    );
}
