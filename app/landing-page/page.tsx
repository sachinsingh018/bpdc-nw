'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Brain, Zap, Target } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import Script from 'next/script';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

// Import your Header and Footer components
import { Header } from '@/components/Header'; // Adjust path as needed
import { Footer } from '@/components/Footer'; // Adjust path as needed
import { ChatInput } from '@/components/ChatInput'; // Import ChatInput from its new components directory
import { GoogleSignIn } from '@/components/GoogleSignIn'; // Import GoogleSignIn component


const sections = [
    {
        heading: 'Reimagine Connections.',
        subheading: 'The First AI-Powered Professional Social Network.',
        cta: 'Unlock Smarter Connections',
        description: 'Networkqy leverages artificial intelligence to help you build meaningful professional relationships faster and smarter.'
    },
    {
        heading: 'Why Networkqy?',
        bullets: [
            { icon: Target, title: 'Find Hidden Matches', text: 'AI surfaces connections based on your intent, values, and timing — not just keywords.' },
            { icon: Users, title: 'Warm Intros, Always', text: 'Receive high-context intros that feel organic, not cold calls.' },
            { icon: Brain, title: 'Smarter Follow-Ups', text: 'Get notified when it\'s the right time to reconnect or make a move.' },
            { icon: Zap, title: 'Accelerate Growth', text: 'Build meaningful relationships that drive your startup\'s success.' },
            { icon: Sparkles, title: 'Intent-Aware Discovery', text: 'Our AI adapts to your goals in real time, helping you connect with the right people, faster.' }
        ]
    },
    {
        heading: 'Built for Builders.',
        tagline: 'Whether you\'re fundraising, hiring, or launching something new — Networkqy is your sidekick for serendipity.',
        cta: 'Join the Beta'
    }
];

const rotatingTexts = [
    'Find your cofounder',
    'Pitch your startup',
    'Connect with investors',
    'Join powerful communities',
    'Get discovered by talent'
];//kmk

const partnerLogos = [
    { name: 'PerplexityAI', src: '/partners/perplexity.png' },
    { name: 'Google', src: '/partners/gcp.png' },
    { name: 'in5 Dubai', src: '/partners/in5.png' },
    { name: 'NVIDIA', src: '/partners/nvidea.png' },
    { name: 'Dubai Holding', src: '/partners/dh.jpg' }
];

export default function Home() { // Renamed from PageNew to Home, common practice for homepage
    const [displayedText, setDisplayedText] = useState('');
    const [fullText, setFullText] = useState(rotatingTexts[0]);
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [responseGenerated, setResponseGenerated] = useState(false);
    const { setTheme, theme } = useTheme();
    const [hasMounted, setHasMounted] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        setHasMounted(true);
    }, []);
    useEffect(() => {
        const typingSpeed = 80;
        const delayBetweenPhrases = 1200;

        if (charIndex < fullText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + fullText.charAt(charIndex));
                setCharIndex((prev) => prev + 1);
            }, typingSpeed);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                const nextIndex = (textIndex + 1) % rotatingTexts.length;
                setFullText(rotatingTexts[nextIndex]);
                setDisplayedText('');
                setCharIndex(0);
                setTextIndex(nextIndex);
            }, delayBetweenPhrases);
            return () => clearTimeout(timeout);
        }
    }, [charIndex, fullText, textIndex]);


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
            <div className="bg-white text-black dark:bg-black dark:text-white font-sans antialiased transition-colors duration-300">
                {/* Ambient Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-700/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-800/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>

                {/* Header Bar with Auth Buttons */}
                <header className="fixed top-0 left-0 w-full z-20 flex justify-end items-center px-8 py-4 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                    {status === 'authenticated' ? (
                        <div className="flex gap-2">
                            <Link href="/profile">
                                <button type="button" className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200">
                                    Go to Profile
                                </button>
                            </Link>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <button type="button" className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200">
                                Recruiter Sign In
                            </button>
                        </Link>
                    )}
                </header>

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
                                <motion.h1
                                    className="text-[clamp(2.5rem,8vw,6rem)] font-black tracking-tight break-words 
    bg-gradient-to-r from-zinc-800 via-purple-700 to-zinc-900 
    dark:from-white dark:via-purple-400 dark:to-white 
    bg-clip-text text-transparent"
                                >
                                    Networkqy
                                </motion.h1>


                                <motion.p
                                    className="text-2xl sm:text-3xl md:text-4xl font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent min-h-[4rem] flex items-center justify-center"
                                    variants={itemVariants}
                                >
                                    {displayedText}
                                    <motion.span
                                        className="ml-1 w-1 h-8 bg-violet-400"
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                </motion.p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="w-full px-4 sm:px-8 max-w-xl mx-auto">
                                <ChatInput onResponse={() => setResponseGenerated(true)} />
                                {/* Now correctly imported from components/ChatInput */}
                            </motion.div>

                            <motion.p
                                variants={itemVariants}
                                className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed font-medium"
                            >
                                {sections[0].description}
                            </motion.p>



                            {/* Google Sign-In Section */}
                            <motion.div variants={itemVariants} className="flex flex-col items-center">
                                <GoogleSignIn className="w-full max-w-md" />
                            </motion.div>

                            {/* <motion.div variants={itemVariants}>
                                <motion.a
                                    href="/onboarding"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="block"
                                >
                                    <motion.button
                                        className={`group relative px-12 py-4 rounded-2xl shadow-xl font-semibold text-lg text-white transition-all duration-300 bg-gradient-to-r from-violet-600 to-purple-700 ${responseGenerated ? 'border-2 border-[#5B21B6]' : 'border-2 border-transparent'
                                            }`}
                                        animate={responseGenerated ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 1.5 }}
                                        whileHover={{
                                            scale: 1.05,
                                            y: -2,
                                            boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="relative z-10 flex items-center space-x-2">
                                            <span>{sections[0].cta}</span>
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
                                    </motion.button>
                                </motion.a>
                            </motion.div> */}
                        </motion.div>
                    </section>

                    {/* Features Section */}
                    <section className="relative py-32 px-6">
                        <div className="max-w-7xl mx-auto">
                            <motion.div
                                className="text-center mb-20"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-5xl sm:text-6xl font-black mb-6 
    bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700 
    dark:from-white dark:via-zinc-300 dark:to-white 
    bg-clip-text text-transparent">
                                    {sections[1].heading}
                                </h2>

                            </motion.div>

                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {sections[1].bullets?.map((item, i) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            variants={itemVariants}
                                            className="group relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/25 to-purple-700/25 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                            <div className="relative bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 hover:border-zinc-700/50 transition-all duration-300 h-full">
                                                <div className="mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                        <IconComponent size={28} className="text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <p className="text-zinc-400 leading-relaxed font-medium">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="relative py-32 px-6">
                        <div className="max-w-5xl mx-auto">
                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/25 to-purple-700/25 rounded-3xl blur-2xl"></div>
                                <div className="relative bg-zinc-950/60 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl p-12 sm:p-16 text-center">
                                    <h2 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                                        {sections[2].heading}
                                    </h2>
                                    <p className="text-xl text-zinc-300 mb-10 leading-relaxed font-medium max-w-3xl mx-auto">
                                        {sections[2].tagline}
                                    </p>
                                    <motion.a
                                        href="/join"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="block"
                                    >
                                        <motion.button
                                            className="group relative px-12 py-4 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 rounded-2xl shadow-xl hover:shadow-violet-500/30 transition-all duration-300 font-semibold text-lg"
                                            whileHover={{
                                                scale: 1.05,
                                                y: -2,
                                                boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)"
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="relative z-10 flex items-center space-x-2">
                                                <span>{sections[2].cta}</span>
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
                                        </motion.button>
                                    </motion.a>

                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* Partners Section */}
                    <section className="relative py-20 px-6">
                        <div className="max-w-7xl mx-auto">
                            <motion.h2
                                className="text-lg font-bold text-zinc-400 uppercase tracking-wider text-center mb-12"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                Backed by Leading Innovators
                            </motion.h2>

                            <motion.div
                                className="flex flex-wrap justify-center items-center gap-12"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                {partnerLogos.map((logo, i) => (
                                    <motion.div
                                        key={i}
                                        variants={itemVariants}
                                        className="relative w-40 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <img
                                            src={logo.src}
                                            alt={logo.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}

                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </section>
                </main>

                {/* Footer Component */}
                <Footer />
                {/* <div className="fixed bottom-4 right-4 z-50 sm:static sm:w-full sm:flex sm:justify-center">

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white rounded-full shadow-md hover:scale-105 transition-all"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun size={16} className="text-yellow-400" />
                            Light Mode
                        </>
                    ) : (
                        <>
                            <Moon size={16} className="text-purple-600" />
                            Dark Mode
                        </>
                    )}
                </button>
            </div> */}

            </div>
        </>
    );
}