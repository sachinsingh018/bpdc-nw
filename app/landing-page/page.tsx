'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Footer } from '@/components/Footer';
import { Menu, X } from 'lucide-react';

export default function Home() {
    const [hasMounted, setHasMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Set body background to white immediately to prevent purple flash
    useEffect(() => {
        const originalBackground = document.body.style.background;

        document.body.style.background = 'white';
        // Hide pseudo-elements that create the purple overlay
        const style = document.createElement('style');
        style.id = 'landing-page-body-override';
        style.textContent = `
            body::before,
            body::after {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.body.style.background = originalBackground;
            const styleElement = document.getElementById('landing-page-body-override');
            if (styleElement) {
                styleElement.remove();
            }
        };
    }, []);

    // Preload background image
    useEffect(() => {
        const img = new Image();
        img.src = '/bpdcbg.png';
        img.onload = () => {
            setImageLoaded(true);
        };
        img.onerror = () => {
            // If image fails to load, still show the page after a delay
            setTimeout(() => setImageLoaded(true), 1000);
        };
    }, []);

    // Close mobile menu on escape key or outside click
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        if (mobileMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [mobileMenuOpen]);


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };
    if (!hasMounted) return null; // prevent mismatch during SSR

    return (
        <>
            {/* Google Analytics Tag */}
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-S2ZXYKNEC9"
                strategy="afterInteractive"
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-S2ZXYKNEC9');
                    `,
                }}
            />

            {/* Loading Screen */}
            <AnimatePresence>
                {!imageLoaded && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
                    >
                        <div className="text-center">
                            <motion.div
                                className="mb-8"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <img
                                    src="/img.jpg"
                                    alt="BITS Pilani Dubai Campus Logo"
                                    className="h-24 w-auto mx-auto object-contain"
                                />
                            </motion.div>
                            <motion.div
                                className="w-16 h-16 border-4 border-bits-royal-blue border-t-transparent rounded-full mx-auto"
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                            <motion.p
                                className="mt-6 text-bits-royal-blue font-semibold text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Loading...
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative overflow-hidden font-sans antialiased transition-colors duration-300 min-h-screen bg-white" data-landing-page>
                {/* Blurred Background */}
                <div
                    className="fixed inset-0 z-0 bg-white"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed',
                        filter: 'blur(4px)'
                    }}
                />

                {/* Header Bar with Auth Buttons */}
                <header className="relative z-20 flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-transparent">
                    <Link href="/" className="flex items-center group">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Subtle backdrop container */}
                            <div className="relative bg-white/50 backdrop-blur-md border-2 border-white/60 rounded-lg p-2 sm:p-3 md:p-4 shadow-2xl group-hover:bg-white/60 group-hover:shadow-2xl transition-all duration-300">
                                <img
                                    src="/img.jpg"
                                    alt="BITS Pilani Dubai Campus Logo"
                                    className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain filter drop-shadow-lg"
                                />
                            </div>
                        </motion.div>
                    </Link>

                    {/* Desktop Buttons - Hidden on mobile */}
                    <div className="hidden sm:flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {status === 'authenticated' ? (
                            <>
                                <Link href="/profile">
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {/* Glow effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-bits-golden-yellow via-bits-golden-yellow to-bits-royal-blue rounded-full blur-lg opacity-60"
                                            animate={{
                                                opacity: [0.5, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                        <motion.button
                                            type="button"
                                            className="relative px-6 py-3 md:px-8 text-base md:text-lg bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.7),0_0_40px_rgba(25,25,112,0.5)] border-2 border-bits-golden-yellow hover:border-bits-royal-blue transition-all duration-300 overflow-hidden group z-10"
                                            whileHover={{
                                                scale: 1.05,
                                                boxShadow: "0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(25,25,112,0.7)",
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span className="relative z-10 text-black font-bold drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)] whitespace-nowrap">
                                                Go to Profile
                                            </span>
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                                initial={{ x: '-100%' }}
                                                whileHover={{ x: '200%' }}
                                                transition={{ duration: 0.6 }}
                                            />
                                        </motion.button>
                                    </motion.div>
                                </Link>
                            </>
                        ) : (
                            <Link href="/signup">
                                <motion.div
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {/* Glow effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-bits-golden-yellow via-bits-golden-yellow to-bits-royal-blue rounded-full blur-lg opacity-60"
                                        animate={{
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <motion.button
                                        type="button"
                                        className="relative px-6 py-3 md:px-8 text-base md:text-lg bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.7),0_0_40px_rgba(25,25,112,0.5)] border-2 border-bits-golden-yellow hover:border-bits-royal-blue transition-all duration-300 overflow-hidden group z-10"
                                        whileHover={{
                                            scale: 1.05,
                                            boxShadow: "0 0 30px rgba(255,215,0,0.9), 0 0 60px rgba(25,25,112,0.7)",
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className="relative z-10 text-black font-bold drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)] whitespace-nowrap">
                                            Recruiter Sign Up
                                        </span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '200%' }}
                                            transition={{ duration: 0.6 }}
                                        />
                                    </motion.button>
                                </motion.div>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="sm:hidden p-2 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg hover:bg-white/40 transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6 text-black" />
                        ) : (
                            <Menu className="h-6 w-6 text-black" />
                        )}
                    </button>
                </header>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[25] sm:hidden"
                            />
                            {/* Menu */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="fixed top-16 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-xl border-b border-white/40 shadow-xl"
                            >
                                <div className="flex flex-col gap-3 p-4">
                                    {status === 'authenticated' ? (
                                        <>
                                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                                <motion.button
                                                    type="button"
                                                    className="w-full px-6 py-4 text-base bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.7),0_0_40px_rgba(25,25,112,0.5)] border-2 border-bits-golden-yellow transition-all duration-300 min-h-[48px]"
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="text-black font-bold drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]">
                                                        Go to Profile
                                                    </span>
                                                </motion.button>
                                            </Link>
                                        </>
                                    ) : (
                                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                                            <motion.button
                                                type="button"
                                                className="w-full px-6 py-4 text-base bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,215,0,0.7),0_0_40px_rgba(25,25,112,0.5)] border-2 border-bits-golden-yellow transition-all duration-300 min-h-[48px]"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span className="text-black font-bold drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]">
                                                    Recruiter Sign Up
                                                </span>
                                            </motion.button>
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <main className="relative z-10">
                    {/* Hero Section */}
                    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-2 sm:pt-4 lg:pt-6
 pb-20 overflow-hidden">
                        <motion.div
                            className="max-w-6xl mx-auto space-y-6 sm:space-y-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8 max-w-4xl mx-auto text-center">
                                <div className="relative inline-block w-full">
                                    {/* Glow effect behind text */}
                                    <div className="absolute inset-0 blur-3xl opacity-60 animate-pulse"
                                        style={{
                                            background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(25,25,112,0.6) 100%)',
                                        }}
                                    />
                                    <motion.h1
                                        className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tight break-words 
        text-white
        dark:text-bits-golden-yellow
        relative z-10
        leading-[1.1]
        drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]
        dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]
        mb-4 sm:mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        Your Gateway to Internships, Jobs & Career Growth
                                    </motion.h1>
                                </div>

                                {/* Subheading with enhanced visibility */}
                                <motion.div
                                    className="relative z-10 max-w-3xl mx-auto px-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                >
                                    {/* Backdrop for better visibility */}
                                    <div className="absolute inset-0 bg-black/40 dark:bg-black/50 backdrop-blur-md rounded-2xl -mx-2 sm:-mx-4"></div>
                                    <motion.p
                                        className="relative z-10 text-[clamp(1.1rem,2.5vw,1.4rem)] font-medium sm:font-semibold leading-relaxed sm:leading-loose
        text-white
        dark:text-white
        py-4 sm:py-6 px-4 sm:px-6
        drop-shadow-[0_2px_4px_rgba(0,0,0,0.9),0_4px_8px_rgba(0,0,0,0.7)]
        dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.9),0_4px_8px_rgba(0,0,0,0.7)]
        shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                                    >
                                        Discover opportunities tailored for our first year Higher Degree Students. Connect with top employers, access exclusive roles, and take the next confident step in your professional journey.
                                    </motion.p>
                                </motion.div>

                                {/* Login Button / Go to Profile Button */}
                                <motion.div variants={itemVariants} className="flex flex-col items-center mb-4 sm:mb-8 w-full px-4 mt-2 sm:mt-4">
                                    {status === 'authenticated' ? (
                                        <Link href="/profile" className="w-full max-w-sm">
                                            <motion.div
                                                className="relative w-full"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {/* Glow effect behind button */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-bits-golden-yellow via-bits-golden-yellow to-bits-royal-blue rounded-full blur-xl opacity-75"
                                                    animate={{
                                                        opacity: [0.6, 0.9, 0.6],
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                                {/* Outer glow ring */}
                                                <motion.div
                                                    className="absolute -inset-1 bg-gradient-to-r from-bits-golden-yellow via-bits-royal-blue to-bits-golden-yellow rounded-full opacity-60 blur-sm"
                                                    animate={{
                                                        opacity: [0.4, 0.7, 0.4],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                                <motion.button
                                                    className="relative w-full px-6 py-4 sm:px-12 sm:py-5 md:px-16 text-lg sm:text-xl md:text-2xl bg-white text-black font-black rounded-full shadow-[0_0_30px_rgba(255,215,0,0.8),0_0_60px_rgba(25,25,112,0.6),inset_0_0_20px_rgba(255,255,255,0.3)] border-2 sm:border-4 border-bits-golden-yellow hover:border-bits-royal-blue transition-all duration-300 overflow-hidden group z-10 min-h-[56px] sm:min-h-[64px]"
                                                    whileHover={{
                                                        scale: 1.05,
                                                        boxShadow: "0 0 50px rgba(255,215,0,1), 0 0 100px rgba(25,25,112,0.8), inset 0 0 30px rgba(255,255,255,0.5)",
                                                    }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-black font-black">
                                                        <span className="text-black drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]">
                                                            Go to Profile
                                                        </span>
                                                        <motion.span
                                                            className="text-xl sm:text-2xl md:text-3xl inline-block text-black drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]"
                                                            animate={{ x: [0, 8, 0] }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        >
                                                            →
                                                        </motion.span>
                                                    </span>
                                                    {/* Shimmer effect */}
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                                        initial={{ x: '-100%' }}
                                                        whileHover={{ x: '200%' }}
                                                        transition={{ duration: 0.8 }}
                                                    />
                                                </motion.button>
                                            </motion.div>
                                        </Link>
                                    ) : (
                                        <Link href="/login" className="w-full max-w-sm">
                                            <motion.div
                                                className="relative w-full"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {/* Glow effect behind button */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-bits-golden-yellow via-bits-golden-yellow to-bits-royal-blue rounded-full blur-xl opacity-75"
                                                    animate={{
                                                        opacity: [0.6, 0.9, 0.6],
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                                {/* Outer glow ring */}
                                                <motion.div
                                                    className="absolute -inset-1 bg-gradient-to-r from-bits-golden-yellow via-bits-royal-blue to-bits-golden-yellow rounded-full opacity-60 blur-sm"
                                                    animate={{
                                                        opacity: [0.4, 0.7, 0.4],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                />
                                                <motion.button
                                                    className="relative w-full px-6 py-4 sm:px-12 sm:py-5 md:px-16 text-lg sm:text-xl md:text-2xl bg-white text-black font-black rounded-full shadow-[0_0_30px_rgba(255,215,0,0.8),0_0_60px_rgba(25,25,112,0.6),inset_0_0_20px_rgba(255,255,255,0.3)] border-2 sm:border-4 border-bits-golden-yellow hover:border-bits-royal-blue transition-all duration-300 overflow-hidden group z-10 min-h-[56px] sm:min-h-[64px]"
                                                    whileHover={{
                                                        scale: 1.05,
                                                        boxShadow: "0 0 50px rgba(255,215,0,1), 0 0 100px rgba(25,25,112,0.8), inset 0 0 30px rgba(255,255,255,0.5)",
                                                    }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-black font-black">
                                                        <span className="text-black drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]">
                                                            Login
                                                        </span>
                                                        <motion.span
                                                            className="text-xl sm:text-2xl md:text-3xl inline-block text-black drop-shadow-[0_2px_4px_rgba(255,215,0,0.5)]"
                                                            animate={{ x: [0, 8, 0] }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        >
                                                            →
                                                        </motion.span>
                                                    </span>
                                                    {/* Shimmer effect */}
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                                        initial={{ x: '-100%' }}
                                                        whileHover={{ x: '200%' }}
                                                        transition={{ duration: 0.8 }}
                                                    />
                                                </motion.button>
                                            </motion.div>
                                        </Link>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </section>
                </main>

                {/* Footer Component */}
                <Footer />
                {/* <div className="fixed bottom-4 right-4 z-50 sm:static sm:w-full sm:flex sm:justify-center">

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-black rounded-full shadow-md hover:scale-105 transition-all"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={16} className="text-yellow-400" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon size={16} className="text-bits-golden-yellow" />
                            Dark Mode
                        </>
                    )}
                </button>
            </div> */}

            </div>
        </>
    );
}