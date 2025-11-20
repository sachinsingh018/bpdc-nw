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
    const { data: session, status } = useSession();

    useEffect(() => {
        setHasMounted(true);
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

            {/* Main Content */}
            <div className="relative overflow-hidden font-sans antialiased transition-colors duration-300" style={{
                background: `
                  radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
                  radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
                `
            }}>
                {/* Dynamic Vibrant Background Elements */}
                <div className="fixed inset-0 z-0">
                    {/* Deep Royal Blue */}
                    <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                    <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                    {/* White Bubbles in Upper Left */}
                    <div className="absolute top-16 left-8 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-300" style={{ background: 'rgba(255, 255, 255, 0.6)' }}></div>
                    <div className="absolute top-8 left-16 size-56 rounded-full blur-3xl opacity-45 animate-pulse delay-700" style={{ background: 'rgba(255, 255, 255, 0.55)' }}></div>
                    <div className="absolute top-24 left-4 size-64 rounded-full blur-3xl opacity-48 animate-pulse delay-1100" style={{ background: 'rgba(255, 255, 255, 0.58)' }}></div>
                    <div className="absolute top-12 left-12 size-48 rounded-full blur-3xl opacity-42 animate-pulse delay-1500" style={{ background: 'rgba(255, 255, 255, 0.52)' }}></div>
                    <div className="absolute top-32 left-20 size-52 rounded-full blur-3xl opacity-40 animate-pulse delay-1900" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>

                    {/* Bright Golden Yellow */}
                    <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                    <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                    {/* White Bubbles in Upper Right */}
                    <div className="absolute top-16 right-8 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-400" style={{ background: 'rgba(255, 255, 255, 0.6)' }}></div>
                    <div className="absolute top-8 right-16 size-56 rounded-full blur-3xl opacity-45 animate-pulse delay-800" style={{ background: 'rgba(255, 255, 255, 0.55)' }}></div>
                    <div className="absolute top-24 right-4 size-64 rounded-full blur-3xl opacity-48 animate-pulse delay-1200" style={{ background: 'rgba(255, 255, 255, 0.58)' }}></div>
                    <div className="absolute top-12 right-12 size-48 rounded-full blur-3xl opacity-42 animate-pulse delay-1600" style={{ background: 'rgba(255, 255, 255, 0.52)' }}></div>
                    <div className="absolute top-32 right-20 size-52 rounded-full blur-3xl opacity-40 animate-pulse delay-2000" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>

                    {/* White Bubbles on Right Side */}
                    <div className="absolute top-1/3 right-8 size-68 rounded-full blur-3xl opacity-46 animate-pulse delay-2300" style={{ background: 'rgba(255, 255, 255, 0.56)' }}></div>
                    <div className="absolute top-1/2 right-12 size-60 rounded-full blur-3xl opacity-44 animate-pulse delay-2700" style={{ background: 'rgba(255, 255, 255, 0.54)' }}></div>
                    <div className="absolute top-2/3 right-6 size-56 rounded-full blur-3xl opacity-42 animate-pulse delay-3100" style={{ background: 'rgba(255, 255, 255, 0.52)' }}></div>
                    <div className="absolute top-3/4 right-10 size-64 rounded-full blur-3xl opacity-40 animate-pulse delay-3500" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                    <div className="absolute top-1/4 right-4 size-52 rounded-full blur-3xl opacity-38 animate-pulse delay-3900" style={{ background: 'rgba(255, 255, 255, 0.48)' }}></div>

                    {/* Crimson Red */}
                    <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                    <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                    {/* Charcoal Black */}
                    <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                    {/* Light Gray */}
                    <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                    {/* Mid-tone Blue */}
                    <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                    {/* Warm Golden Glow */}
                    <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                    {/* Vibrant Red */}
                    <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                    {/* Neon Purple */}
                    <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                    <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>

                    {/* More White Bubbles Throughout */}
                    <div className="absolute top-1/3 left-1/3 size-96 rounded-full blur-3xl opacity-50 animate-pulse delay-500" style={{ background: 'rgba(255, 255, 255, 0.65)' }}></div>
                    <div className="absolute bottom-1/3 right-1/3 size-80 rounded-full blur-3xl opacity-45 animate-pulse delay-1500" style={{ background: 'rgba(255, 255, 255, 0.6)' }}></div>
                    <div className="absolute top-2/3 left-1/2 size-72 rounded-full blur-3xl opacity-48 animate-pulse delay-2500" style={{ background: 'rgba(255, 255, 255, 0.63)' }}></div>
                    <div className="absolute top-1/4 right-1/4 size-88 rounded-full blur-3xl opacity-42 animate-pulse delay-3200" style={{ background: 'rgba(255, 255, 255, 0.58)' }}></div>
                    <div className="absolute bottom-1/4 left-1/4 size-76 rounded-full blur-3xl opacity-44 animate-pulse delay-3800" style={{ background: 'rgba(255, 255, 255, 0.6)' }}></div>
                    <div className="absolute top-1/5 left-1/5 size-84 rounded-full blur-3xl opacity-40 animate-pulse delay-4500" style={{ background: 'rgba(255, 255, 255, 0.55)' }}></div>
                    <div className="absolute bottom-1/5 right-1/5 size-90 rounded-full blur-3xl opacity-42 animate-pulse delay-5200" style={{ background: 'rgba(255, 255, 255, 0.58)' }}></div>
                    <div className="absolute top-1/2 right-1/2 size-100 rounded-full blur-3xl opacity-38 animate-pulse delay-6000" style={{ background: 'rgba(255, 255, 255, 0.52)' }}></div>
                    <div className="absolute top-1/6 left-2/3 size-92 rounded-full blur-3xl opacity-36 animate-pulse delay-7000" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                    <div className="absolute bottom-1/6 right-2/3 size-86 rounded-full blur-3xl opacity-38 animate-pulse delay-8000" style={{ background: 'rgba(255, 255, 255, 0.52)' }}></div>
                    <div className="absolute top-3/4 left-1/6 size-78 rounded-full blur-3xl opacity-40 animate-pulse delay-9000" style={{ background: 'rgba(255, 255, 255, 0.55)' }}></div>
                    <div className="absolute bottom-3/4 right-1/6 size-82 rounded-full blur-3xl opacity-35 animate-pulse delay-10000" style={{ background: 'rgba(255, 255, 255, 0.48)' }}></div>
                    <div className="absolute top-1/2 left-1/6 size-94 rounded-full blur-3xl opacity-37 animate-pulse delay-11000" style={{ background: 'rgba(255, 255, 255, 0.5)' }}></div>
                    <div className="absolute bottom-1/2 right-1/6 size-88 rounded-full blur-3xl opacity-39 animate-pulse delay-12000" style={{ background: 'rgba(255, 255, 255, 0.53)' }}></div>
                    <div className="absolute top-3/5 left-3/5 size-74 rounded-full blur-3xl opacity-41 animate-pulse delay-13000" style={{ background: 'rgba(255, 255, 255, 0.54)' }}></div>
                    <div className="absolute bottom-2/5 right-3/5 size-70 rounded-full blur-3xl opacity-43 animate-pulse delay-14000" style={{ background: 'rgba(255, 255, 255, 0.56)' }}></div>
                    <div className="absolute top-4/5 left-1/3 size-66 rounded-full blur-3xl opacity-39 animate-pulse delay-15000" style={{ background: 'rgba(255, 255, 255, 0.51)' }}></div>
                    <div className="absolute bottom-1/5 left-2/5 size-68 rounded-full blur-3xl opacity-41 animate-pulse delay-16000" style={{ background: 'rgba(255, 255, 255, 0.53)' }}></div>
                </div>

                {/* Header Bar with Auth Buttons */}
                <header className="fixed top-0 left-0 w-full z-20 flex justify-between items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-transparent">
                    <Link href="/" className="flex items-center group">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Subtle backdrop container */}
                            <div className="relative bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg p-1.5 sm:p-2 shadow-lg group-hover:bg-white/40 group-hover:shadow-xl transition-all duration-300">
                                <img
                                    src="/img.jpg"
                                    alt="BITS Pilani Dubai Campus Logo"
                                    className="h-10 sm:h-12 md:h-14 w-auto object-contain filter drop-shadow-md"
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
                    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20 sm:pt-28 lg:pt-32
 pb-20 overflow-hidden">
                        <motion.div
                            className="max-w-6xl mx-auto space-y-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="space-y-6">
                                <div className="relative inline-block">
                                    {/* Glow effect behind text */}
                                    <div className="absolute inset-0 blur-3xl opacity-60 animate-pulse"
                                        style={{
                                            background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(25,25,112,0.6) 100%)',
                                        }}
                                    />
                                    <motion.h1
                                        className="text-[clamp(3rem,10vw,8rem)] font-black tracking-tight break-words 
        text-white
        dark:text-bits-golden-yellow
        relative z-10
        leading-tight
        drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]
        dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        <span className="block">BITS Pilani</span>
                                        <span className="block mt-2">Dubai Campus</span>
                                    </motion.h1>
                                </div>

                                {/* Login Button / Go to Profile Button */}
                                <motion.div variants={itemVariants} className="flex flex-col items-center mb-8 w-full px-4">
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