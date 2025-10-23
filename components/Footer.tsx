'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Linkedin, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export const Footer = () => {
    const { theme, setTheme } = useTheme();

    return (
        <footer className="relative bg-zinc-950/70 backdrop-blur-xl border-t border-zinc-800/50 py-20 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column */}
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        Networkqy
                    </h2>
                    <p className="text-zinc-400 leading-relaxed font-medium">
                        Reimagining how professionals connect through AI-powered, intent-based networking. Build smarter, deeper relationships.
                    </p>
                </div>

                {/* Middle Column */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Quick Links</h3>
                    <ul className="space-y-3 text-zinc-400">
                        {[
                            { label: 'About Us', path: '/about' },
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
                                    className="hover:text-violet-400 transition-colors font-medium"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}

                    </ul>
                </div>

                {/* Right Column */}
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Stay Updated</h3>
                    <form className="w-full flex flex-col sm:flex-row gap-4 mb-6">
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 placeholder-zinc-500 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-blur-xl"
                        />
                        <motion.button
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white rounded-xl transition-all duration-200 font-medium"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Subscribe
                        </motion.button>
                    </form>

                    <div className="flex flex-wrap gap-4">
                        {[
                            { icon: MessageCircle, href: 'https://twitter.com/Networkqy' },
                            { icon: Linkedin, href: 'https://linkedin.com/company/networkqy' },
                            { icon: Mail, href: 'mailto:yatharth.kher@networkqy.com' },
                        ].map((social, i) => {
                            const IconComponent = social.icon;
                            return (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-zinc-900/60 hover:bg-zinc-800/60 rounded-xl flex items-center justify-center text-zinc-400 hover:text-violet-400 transition-all duration-200"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <IconComponent size={18} />
                                </motion.a>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-12 grid gap-4 text-center text-zinc-400 text-sm font-medium">
                <p>📍 in5 Tech, Dubai Internet City, Dubai, United Arab Emirates</p>
                <p>📍 20-22, Wenlock Road, London, England, N1 7GU</p>
                <p>📍 614 21st St S, Arlington, VA, USA</p>
            </div>

            {/* Theme Toggle Icon */}
            {/* Theme Toggle with Text */}
            <div className="mt-10 flex justify-center">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white rounded-full shadow-md hover:scale-105 transition-all"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={18} className="text-yellow-400" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon size={18} className="text-purple-600" />
                            Dark Mode
                        </>
                    )}
                </button>
            </div>

            <div className="border-t border-zinc-800/50 mt-12 pt-8">
                <p className="text-center text-zinc-500 text-sm font-medium">
                    &copy; 2025 Networkqy. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
