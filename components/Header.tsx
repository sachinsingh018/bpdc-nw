'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export const Header = () => {
    const [navOpen, setNavOpen] = useState(false);
    const toggleNav = () => setNavOpen((prev) => !prev);
    const [isAtTop, setIsAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY <= 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl rounded-2xl z-50 transition-all duration-500 ${isAtTop
                ? 'bg-transparent border-transparent shadow-none'
                : 'backdrop-blur-2xl border border-zinc-800/50 bg-black/70 shadow-[0_8px_32px_rgba(139,92,246,0.15)]'
                }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex justify-between items-center px-8 py-5">
                {/* NetworkQY Logo Link */}
                <Link
                    href="/"
                    className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent tracking-tight cursor-pointer"
                >
                    <motion.span whileHover={{ scale: 1.05 }}>Networkqy</motion.span>
                </Link>

                <nav className="hidden md:flex space-x-8 text-sm font-medium">
                    {['About', 'FAQs', 'Chatbot'].map((item) => (
                        <motion.div key={item} whileHover={{ scale: 1.05 }} className="relative group">
                            <Link
                                href={`/${item.toLowerCase()}`}
                                className="text-zinc-300 hover:text-white transition-all duration-200"
                            >
                                {item}
                            </Link>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-400 to-purple-400 transition-all duration-200 group-hover:w-full"></span>
                        </motion.div>
                    ))}
                </nav>

                <button onClick={toggleNav} className="md:hidden text-zinc-300 hover:text-white transition-colors">
                    {navOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {navOpen && (
                    <motion.div
                        className="md:hidden px-8 pb-6 pt-2 space-y-4 text-zinc-300 text-sm font-medium border-t border-zinc-800/50"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {['About', 'FAQs', 'Chatbot'].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="block hover:text-white transition-colors"
                                onClick={() => setNavOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};