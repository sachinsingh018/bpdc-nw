'use client';

import React, { useState } from 'react';

import {
    ChevronDown,
    Search,
    Plus,
    Minus,

} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Import your Header and Footer components
import { Header } from '@/components/Header'; // Adjust path as needed
import { Footer } from '@/components/Footer'; // Adjust path as needed

const faqs = [
    {
        category: 'Basics',
        question: 'What is Networkqy?',
        answer:
            'Networkqy is a smart networking platform designed to connect professionals with recruiters and industry experts to help you grow your career and business relationships effectively.',
    },
    {
        category: 'Basics',
        question: 'Who can use Networkqy?',
        answer:
            'Networkqy is ideal for job seekers, recruiters, HR professionals, and anyone looking to expand their professional network in a meaningful and efficient way.',
    },
    {
        category: 'Functionality',
        question: 'How does Networkqy match me with recruiters and contacts?',
        answer:
            'Our AI-powered system analyzes your skills, career goals, and preferences, then recommends the most relevant recruiters and professionals to connect with.',
    },
    {
        category: 'Functionality',
        question: 'Can I customize the types of professionals I want to connect with?',
        answer:
            'Yes, you can filter recommendations based on industry, job roles, experience level, and geographic location to tailor your networking experience.',
    },
    {
        category: 'Functionality',
        question: 'Does Networkqy support direct messaging with recruiters?',
        answer:
            'Yes, once connected, you can message recruiters and professionals directly through a secure chat interface within the platform.',
    },
    {
        category: 'Privacy & Security',
        question: 'How is my personal data protected?',
        answer:
            'Your data is securely encrypted and used only to enhance your networking experience. We adhere to strict privacy policies and do not share your information without your explicit consent.',
    },
    {
        category: 'Privacy & Security',
        question: 'Can recruiters see my full profile?',
        answer:
            'You control what parts of your profile are visible to recruiters. You can choose to highlight key skills or keep sensitive information private.',
    },
    {
        category: 'Platform Usage',
        question: 'Is there a mobile app available?',
        answer: 'Yes, NetworkQY has a mobile app for both iOS and Android, enabling you to network on the go.',
    },
    {
        category: 'Platform Usage',
        question: 'Are there any subscription fees?',
        answer:
            'NetworkQY offers both free and premium membership tiers. Premium plans provide advanced features such as enhanced profile visibility and unlimited messaging.',
    },
    {
        category: 'Platform Usage',
        question: 'How do I report inappropriate behavior or spam?',
        answer:
            'You can report any suspicious or inappropriate activity directly through the user profile or chat interface, and our moderation team will review it promptly.',
    },
    {
        category: 'Support & Feedback',
        question: 'How can I get help or support?',
        answer: 'You can reach our support team via the in-app help center or email support@networkqy.com.',
    },
    {
        category: 'Support & Feedback',
        question: 'Can I suggest new features or improvements?',
        answer: 'Absolutely! We welcome user feedback to help us improve. Use the feedback form available in your account settings.',
    },
];

const additionalFaqs = [
    {
        question: 'Will Networkqy notify me of new recruiters or connections?',
        answer:
            'Yes, you can enable notifications for new recruiter recommendations and connection requests to stay updated in real-time.',
    },
    {
        question: 'Can I integrate Networkqy with my existing LinkedIn profile?',
        answer: 'We plan to support integrations with LinkedIn and other professional networks soon to streamline your profile and contacts.',
    },
    {
        question: 'Is my networking activity private from my current employer?',
        answer:
            'Yes, your activity on Networkqy is confidential and only shared with the contacts and recruiters you choose to connect with.',
    },
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [openAdditionalIndex, setOpenAdditionalIndex] = useState<number | null>(null);
    // Removed navOpen, isAtTop, and toggleNav states as they are handled in the Header component
    const [searchQuery, setSearchQuery] = useState('');

    // Removed useEffect for handling scroll and setting isAtTop, as Header component handles it.
    // useEffect(() => {
    //     const handleScroll = () => {
    //         setIsAtTop(window.scrollY <= 10);
    //     };
    //     window.addEventListener("scroll", handleScroll);
    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, []);

    const categories = ['All', ...new Set(faqs.map((f) => f.category))];
    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
        const matchesSearch =
            searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-black via-violet-950/20 to-purple-950/30" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            {/* Floating Orbs */}
            <div className="fixed top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="fixed bottom-20 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="fixed top-1/2 left-1/2 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl animate-pulse delay-500" />

            {/* Header Component */}
            {/* <Header /> */}

            {/* Main Content */}
            <main className="relative z-10 pt-32 pb-20">
                {' '}
                {/* Added pt-32 for spacing below fixed header */}
                <div className="max-w-6xl mx-auto px-6">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
                            <span className="bg-gradient-to-r from-white via-purple-200 to-violet-400 bg-clip-text text-transparent">
                                Frequently Asked
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
                                Questions
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Everything you need to know about NetworkQY and how it can transform your professional networking
                            experience.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative mb-12 max-w-2xl mx-auto"
                    >
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search frequently asked questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 backdrop-blur-xl focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                    </motion.div>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-3 mb-16"
                    >
                        {categories.map((category) => (
                            <motion.button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === category
                                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {category}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* FAQ Grid */}
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 mb-16">
                        {filteredFaqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden ${isOpen
                                        ? 'border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-violet-500/10 shadow-2xl shadow-purple-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-violet-600/0 group-hover:from-purple-600/5 group-hover:to-violet-600/5 transition-all duration-500" />
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                        className="relative w-full px-8 py-6 text-left flex items-center justify-between group"
                                    >
                                        <div className="flex-1 pr-4">
                                            <div className="text-sm font-medium text-purple-400 mb-2">{faq.category}</div>
                                            <h3 className="text-xl font-semibold text-white group-hover:text-purple-200 transition-colors">
                                                {faq.question}
                                            </h3>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-purple-400 group-hover:text-purple-300"
                                        >
                                            {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="relative"
                                            >
                                                <div className="px-8 pb-6">
                                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6" />
                                                    <p className="text-gray-300 leading-relaxed text-lg">{faq.answer}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* People Also Ask Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h2 className="text-4xl font-bold mb-4">
                                <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                                    People Also Ask
                                </span>
                            </h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto rounded-full" />
                        </div>

                        <div className="grid gap-4 max-w-4xl mx-auto">
                            {additionalFaqs.map((faq, index) => {
                                const isOpen = openAdditionalIndex === index;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className={`group relative rounded-xl border transition-all duration-300 ${isOpen
                                            ? 'border-violet-500/50 bg-gradient-to-r from-violet-500/10 to-purple-500/10 shadow-xl shadow-violet-500/20'
                                            : 'border-white/10 bg-white/5 hover:border-violet-500/30'
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenAdditionalIndex(isOpen ? null : index)}
                                            className="w-full px-6 py-5 text-left flex items-center justify-between"
                                        >
                                            <span className="text-lg font-medium text-white pr-4">{faq.question}</span>
                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-violet-400"
                                            >
                                                <ChevronDown size={20} />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="px-6 pb-5"
                                                >
                                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent mb-4" />
                                                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer Component */}
            <Footer />
        </div>
    );
}