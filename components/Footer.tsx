'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Linkedin } from 'lucide-react';

export const Footer = () => {

    return (
        <footer className="relative bg-zinc-950/70 backdrop-blur-xl border-t border-zinc-800/50 py-20 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column - Brand and Description */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-bits-golden-yellow to-bits-golden-yellow-600 bg-clip-text text-transparent mb-4">
                        BITS Pilani Dubai Campus
                    </h2>
                    <p className="text-white leading-relaxed font-medium text-base">
                        An initiative by BITS Pilani Dubai Campus for its students and alumni to interconnect, powered by NetworkQY — bringing AI-driven insights, career forecasting, and mentorship opportunities to help students connect, grow, and lead in a global future.
                    </p>
                </div>

                {/* Middle Column - Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
                    <ul className="space-y-3 text-white">
                        {[
                            { label: 'FAQs', path: '/faq' },
                            { label: 'Privacy Policy', path: '/privacy-policy' },
                            { label: 'Terms of Use', path: '/terms-of-use' }
                        ].map(({ label, path }) => (
                            <li key={label}>
                                <Link
                                    href={path}
                                    onClick={(e) => {
                                        const el = e.currentTarget;
                                        el.textContent = 'Redirecting...';
                                    }}
                                    className="hover:text-bits-golden-yellow transition-colors font-medium"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right Column - Social Links */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Connect With Us</h3>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { icon: MessageCircle, href: 'https://twitter.com/Networkqy', label: 'Twitter' },
                            { icon: Linkedin, href: 'https://linkedin.com/company/networkqy', label: 'LinkedIn' },
                            { icon: Mail, href: 'mailto:yatharth.kher@networkqy.com', label: 'Email' },
                        ].map((social, i) => {
                            const IconComponent = social.icon;
                            return (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-12 bg-zinc-900/60 hover:bg-zinc-800/60 rounded-xl flex items-center justify-center text-white hover:text-bits-golden-yellow transition-all duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    aria-label={social.label}
                                >
                                    <IconComponent size={18} />
                                </motion.a>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-800/50 mt-12 pt-8">
                <p className="text-center text-white text-sm font-medium">
                    &copy; 2025 Networkqy. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
