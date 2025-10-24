'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, CheckCircle, Star, TrendingUp } from 'lucide-react';

export default function AuraQY() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

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
                        AuraQY — On‑chain Credibility
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        {/* TODO: Replace with actual whitepaper content */}
                        AuraQY represents the trust and reputation layer of the Networkqy ecosystem,
                        creating a decentralized system for verifying user contributions and building credibility.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Explanation */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h3 className="text-3xl font-bold text-white mb-6">
                            Building Trust Through Verification
                        </h3>
                        <p className="text-white/70 mb-8 leading-relaxed">
                            AuraQY is Networkqy&apos;s innovative trust layer that creates on-chain credibility scores
                            based on verified contributions, endorsements, and community participation.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="size-8 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                    <Shield className="size-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Verified Identity</h4>
                                    <p className="text-white/60 text-sm">Multi-factor authentication and KYC verification</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="size-8 bg-cyan-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                    <CheckCircle className="size-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Contribution Tracking</h4>
                                    <p className="text-white/60 text-sm">On-chain record of helpful interactions and content</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="size-8 bg-amber-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                    <Star className="size-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Community Endorsements</h4>
                                    <p className="text-white/60 text-sm">Peer validation and reputation building</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Diagram */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                            <div className="space-y-6">
                                {/* Inputs */}
                                <div className="text-center">
                                    <h4 className="text-white font-semibold mb-3">Inputs</h4>
                                    <div className="flex justify-center space-x-4">
                                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2">
                                            <span className="text-purple-300 text-sm">Contributions</span>
                                        </div>
                                        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-4 py-2">
                                            <span className="text-cyan-300 text-sm">Verification</span>
                                        </div>
                                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg px-4 py-2">
                                            <span className="text-amber-300 text-sm">Endorsements</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex justify-center">
                                    <div className="w-0.5 h-8 bg-gradient-to-b from-purple-400 to-cyan-400" />
                                </div>

                                {/* AuraQY Score */}
                                <div className="text-center">
                                    <h4 className="text-white font-semibold mb-3">AuraQY Score</h4>
                                    <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full size-24 mx-auto flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">850</span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex justify-center">
                                    <div className="w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-emerald-400" />
                                </div>

                                {/* Perks */}
                                <div className="text-center">
                                    <h4 className="text-white font-semibold mb-3">Perks</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-2">
                                            <span className="text-emerald-300 text-xs">Priority Access</span>
                                        </div>
                                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-2">
                                            <span className="text-emerald-300 text-xs">Higher Caps</span>
                                        </div>
                                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-3 py-2">
                                            <span className="text-emerald-300 text-xs">Tier Benefits</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Additional info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-xl">
                        <TrendingUp className="size-12 text-cyan-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Score-Based Benefits
                        </h3>
                        <p className="text-white/70 max-w-2xl mx-auto">
                            Higher AuraQY scores unlock increased rewards caps, priority access to new features,
                            and enhanced visibility in the Networkqy ecosystem.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
