'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight, CheckCircle } from 'lucide-react';
import { TOKEN_CONFIG } from '../config';

export default function CTA() {
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
                    className="text-center"
                >
                    <div className="bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-amber-500/10 border border-purple-500/20 rounded-2xl p-12 backdrop-blur-xl max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className="size-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="size-10 text-white" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Get Updates Before Launch
                            </h2>
                            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                                Be the first to know when ${TOKEN_CONFIG.symbol} launches. Get exclusive updates,
                                early access opportunities, and community insights delivered to your inbox.
                            </p>
                        </motion.div>

                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-8"
                            >
                                <div className="size-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="size-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-400 mb-2">Successfully Subscribed!</h3>
                                <p className="text-white/70">
                                    You&apos;ll receive updates about ${TOKEN_CONFIG.symbol} launch and exclusive opportunities.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                onSubmit={handleSubmit}
                                className="max-w-md mx-auto"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="flex-1 px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center sm:text-left"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        size="lg"
                                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Subscribing...' : 'Notify Me'}
                                        <ArrowRight className="ml-2 size-5" />
                                    </Button>
                                </div>
                                <p className="text-white/50 text-sm">
                                    We respect your privacy. Unsubscribe at any time.
                                </p>
                            </motion.form>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mt-12 pt-8 border-t border-white/10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="size-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-purple-400 font-bold text-lg">🚀</span>
                                    </div>
                                    <h4 className="text-white font-semibold mb-2">Early Access</h4>
                                    <p className="text-white/60 text-sm">Be first to test new features</p>
                                </div>

                                <div>
                                    <div className="size-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-cyan-400 font-bold text-lg">💎</span>
                                    </div>
                                    <h4 className="text-white font-semibold mb-2">Exclusive Updates</h4>
                                    <p className="text-white/60 text-sm">Get insider information first</p>
                                </div>

                                <div>
                                    <div className="size-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-amber-400 font-bold text-lg">🎯</span>
                                    </div>
                                    <h4 className="text-white font-semibold mb-2">Community Access</h4>
                                    <p className="text-white/60 text-sm">Join exclusive community channels</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
