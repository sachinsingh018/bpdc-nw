'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GoogleSignIn } from './GoogleSignIn';
import { toast } from 'sonner';

interface ApplyButtonProps {
    job: any;
    onApply?: () => void;
    className?: string;
}

export function ApplyButton({ job, onApply, className = '' }: ApplyButtonProps) {
    const { data: session, status } = useSession();
    const [showSignInModal, setShowSignInModal] = useState(false);

    // Handle escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showSignInModal) {
                setShowSignInModal(false);
            }
        };

        if (showSignInModal) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showSignInModal]);

    const handleApplyClick = () => {
        if (status === 'loading') {
            return; // Still loading session
        }

        if (session) {
            // User is signed in
            if (job.posted_by === 'external' && job.job_apply_link) {
                // For external jobs, redirect directly to the application link
                window.open(job.job_apply_link, '_blank');
            } else if (job.posted_by === 'external' && !job.job_apply_link) {
                // External job without application link - show error or fallback
                toast.error('No application link available for this job.');
            } else {
                // For alumni and career_team jobs, proceed with application form
                if (onApply) {
                    onApply();
                }
            }
        } else {
            // User is not signed in, show sign-in modal
            setShowSignInModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowSignInModal(false);
    };

    const handleGoogleSignIn = () => {
        setShowSignInModal(false);
    };

    return (
        <>
            <button
                onClick={handleApplyClick}
                className={`px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className}`}
                disabled={status === 'loading'}
            >
                {status === 'loading' ? 'Loading...' :
                    job.posted_by === 'external' ? 'Apply on Company Site' : 'Apply'}
            </button>

            {/* Sign-In Modal */}
            {showSignInModal && typeof window !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 border border-purple-200/50 dark:border-purple-700/50 shadow-2xl shadow-purple-500/20"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            <X className="size-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    Sign In to Apply
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    You need to sign in to apply for this job.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <GoogleSignIn
                                    callbackUrl="/job-board"
                                    className="w-full"
                                />

                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    After signing in, you&apos;ll be redirected back to the job board to complete your application.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}
