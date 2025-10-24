'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Bell } from 'lucide-react';
import { TOKEN_CONFIG } from '../config';
import Scene3D from './Scene3D';
import { useState } from 'react';

export default function Hero() {
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* 3D Background Scene */}
            <div className="absolute inset-0 z-0">
                <Scene3D />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Main Headline */}
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        ${TOKEN_CONFIG.symbol}
                    </motion.h1>

                    <motion.h2
                        className="text-2xl md:text-4xl font-semibold mb-8 text-white/90"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        Fueling AI-powered Professional Networking
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        The utility token behind Networkqy&apos;s B2C layer. Rewards, reputation, and real-time access to AI features.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                    >
                        <Button
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled
                            onClick={() => setShowNotifyModal(true)}
                        >
                            <Bell className="mr-2 size-5" />
                            Launching Soon — ${TOKEN_CONFIG.symbol}
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                            onClick={() => window.open(TOKEN_CONFIG.whitepaperUrl, '_blank')}
                        >
                            <FileText className="mr-2 size-5" />
                            Read Whitepaper
                        </Button>
                    </motion.div>

                    {/* Status Badge */}
                    <motion.div
                        className="mt-8 inline-block"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                    >
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <div className="size-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                            {TOKEN_CONFIG.status}
                        </span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Notify Modal */}
            {showNotifyModal && (
                <NotifyModal onClose={() => setShowNotifyModal(false)} />
            )}
        </section>
    );
}

function NotifyModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Subscription error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1A1A2E] border border-purple-500/30 rounded-2xl p-8 max-w-md w-full backdrop-blur-xl"
            >
                <h3 className="text-2xl font-bold text-white mb-4">Get Notified</h3>
                <p className="text-white/70 mb-6">
                    Be the first to know when ${TOKEN_CONFIG.symbol} launches. We&apos;ll send you updates and early access opportunities.
                </p>

                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="size-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="size-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-green-400 font-semibold">Successfully subscribed!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors"
                        >
                            {isSubmitting ? 'Subscribing...' : 'Notify Me'}
                        </Button>
                    </form>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </motion.div>
        </div>
    );
}
