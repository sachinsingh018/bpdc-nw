'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { TOKEN_CONFIG } from '../config';

export default function HowToBuy() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
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
                setEmail('');
                setTimeout(() => {
                    setIsSuccess(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Subscription error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 px-4 relative">
            <div className="container mx-auto">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        How to Buy ${TOKEN_CONFIG.symbol}
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        Get ready for the launch of Networkqy&apos;s utility token
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Pre-launch state */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                            <div className="text-center mb-8">
                                <div className="size-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="size-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Launching Soon
                                </h3>
                                <p className="text-white/70">
                                    ${TOKEN_CONFIG.symbol} is not yet available for purchase
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center space-x-3 text-white/70">
                                    <CheckCircle className="size-5 text-green-400" />
                                    <span>Token Generation Event (TGE) coming soon</span>
                                </div>
                                <div className="flex items-center space-x-3 text-white/70">
                                    <CheckCircle className="size-5 text-green-400" />
                                    <span>Initial DEX offering planned</span>
                                </div>
                                <div className="flex items-center space-x-3 text-white/70">
                                    <CheckCircle className="size-5 text-green-400" />
                                    <span>Multiple chain support</span>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                                onClick={() => document.getElementById('email-capture')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Get Notified at Launch
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right: Future launch state */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                            <div className="text-center mb-8">
                                <div className="size-20 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wallet className="size-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    When Live
                                </h3>
                                <p className="text-white/70">
                                    Here&apos;s how you&apos;ll be able to purchase ${TOKEN_CONFIG.symbol}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="size-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                        <span className="text-white font-bold text-sm">1</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">Connect Wallet</h4>
                                        <p className="text-white/60 text-sm">Connect your Solana wallet (Phantom, Solflare, etc.)</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="size-8 bg-cyan-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                        <span className="text-white font-bold text-sm">2</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">Add SOL</h4>
                                        <p className="text-white/60 text-sm">Ensure you have SOL for transaction fees</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="size-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                        <span className="text-white font-bold text-sm">3</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">Swap for ${TOKEN_CONFIG.symbol}</h4>
                                        <p className="text-white/60 text-sm">Use Raydium or Jupiter to swap SOL for ${TOKEN_CONFIG.symbol}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Email capture section */}
                <motion.div
                    id="email-capture"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-20 text-center"
                >
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Be First in Line
                        </h3>
                        <p className="text-white/70 mb-6">
                            Get notified the moment ${TOKEN_CONFIG.symbol} becomes available for purchase.
                            Early subscribers will receive exclusive updates and early access opportunities.
                        </p>

                        {isSuccess ? (
                            <div className="text-center py-4">
                                <div className="size-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="size-8 text-white" />
                                </div>
                                <p className="text-green-400 font-semibold">Successfully subscribed!</p>
                                <p className="text-white/60 text-sm mt-2">We&apos;ll notify you when ${TOKEN_CONFIG.symbol} launches</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Subscribing...' : 'Notify Me'}
                                </Button>
                            </form>
                        )}

                        <p className="text-white/50 text-xs mt-4">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
