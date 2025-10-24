'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserFriends, FaHandshake } from 'react-icons/fa';
import Avatar from 'boring-avatars';
import { toast } from '@/components/toast';
import { motion } from 'framer-motion';
import { getCookie } from 'cookies-next';

export default function MatchesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false); // 👈 NEWnnn
    const [matches, setMatches] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<number>>(new Set());
    const [isFindingMore, setIsFindingMore] = useState(false);
    //comms
    useEffect(() => {
        setTimeout(() => {
            const allProfiles = [
                {
                    name: 'Ayesha Patel',
                    title: 'VC @ Horizon Ventures',
                    email: 'ayesha.patel@horizonventures.com',
                    tags: ['AI', 'SaaS', 'Seed'],
                    mutual: 'Interested in early-stage fintech',
                },
                {
                    name: 'Ravi Kumar',
                    title: 'Co-founder @ BuildLabs',
                    email: 'ravi.kumar@buildlabs.com',
                    tags: ['No-Code', 'Product', 'Founders'],
                    mutual: 'Looking for growth partners',
                },
                {
                    name: 'Sara Ahmed',
                    title: 'Hiring @ Nimbus AI',
                    email: 'sara.ahmed@nimbusai.com',
                    tags: ['ML', 'Recruiting', 'Remote'],
                    mutual: 'Actively hiring engineers',
                },
                {
                    name: 'Fatima Noor',
                    title: 'Growth @ ZephyrX',
                    email: 'fatima.noor@zephyrx.com',
                    tags: ['Marketing', 'B2B', 'SaaS'],
                    mutual: 'Open to partnerships in MENA',
                },
                {
                    name: 'Leo Fernandez',
                    title: 'Product @ Clickly',
                    email: 'leo.fernandez@clickly.com',
                    tags: ['Product', 'UX', 'PMF'],
                    mutual: 'Interested in improving retention',
                },
                {
                    name: 'Nora Sayegh',
                    title: 'Investor @ Riyadh Capital',
                    email: 'nora.sayegh@riyadhcapital.com',
                    tags: ['EdTech', 'Series A', 'MENA'],
                    mutual: 'Looking to back Saudi founders',
                },
                {
                    name: 'Jason Blake',
                    title: 'Founder @ Finly',
                    email: 'jason.blake@finly.com',
                    tags: ['Fintech', 'RegTech', 'Web3'],
                    mutual: 'Exploring talent for token launch',
                },
                {
                    name: 'Ananya Sharma',
                    title: 'VC Scout @ Alpha Angels',
                    email: 'ananya.sharma@alphaangels.com',
                    tags: ['Consumer', 'Pre-seed', 'Angel'],
                    mutual: 'Curious about Indian social apps',
                },
                {
                    name: 'Mohammed Zaki',
                    title: 'Engineer @ Tesla AI',
                    email: 'mohammed.zaki@teslaai.com',
                    tags: ['AI', 'Robotics', 'Autonomy'],
                    mutual: 'Mentoring early-stage tech teams',
                },
                {
                    name: 'Elena Petrova',
                    title: 'Founder @ GlobaLink',
                    email: 'elena.petrova@globalink.com',
                    tags: ['Events', 'Communities', 'Growth'],
                    mutual: 'Wants to build a local UAE network',
                },
                {
                    name: 'Rahul Deshmukh',
                    title: 'CTO @ SmartHire',
                    email: 'rahul.deshmukh@smarthire.com',
                    tags: ['HR Tech', 'Startups', 'Remote'],
                    mutual: 'Hiring full-stack devs globally',
                },
                {
                    name: 'Chloe Zhang',
                    title: 'AI Strategist @ Bytecore',
                    email: 'chloe.zhang@bytecore.com',
                    tags: ['LLMs', 'Vision', 'Strategy'],
                    mutual: 'Looking for global expansion leads',
                },
            ];

            // Randomly select 3 unique profiles
            const randomSelection = allProfiles
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            setMatches(randomSelection);

            setLoading(false);
        }, 1500);
    }, []);

    const handleContinue = () => {
        router.push('/');
    };

    const handleConnectionRequest = async (index: number) => {
        try {
            const senderEmail = getCookie('userEmail') as string;
            const receiverEmail = matches[index].email;

            if (!senderEmail || !receiverEmail) {
                toast({
                    type: 'error',
                    description: 'Unable to send connection request',
                });
                return;
            }

            const response = await fetch('/api/connections/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderEmail,
                    receiverEmail,
                    message: 'I would like to connect with you!'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSentRequests(prev => new Set([...prev, index]));
                toast({
                    type: 'success',
                    description: 'Connection request sent successfully!',
                });
            } else {
                toast({
                    type: 'error',
                    description: data.error || 'Failed to send request',
                });
            }
        } catch (error) {
            console.error('Connection request error:', error);
            toast({
                type: 'error',
                description: 'Error sending request',
            });
        }
    };

    const handleFindMore = () => {
        setIsFindingMore(true);
        setTimeout(() => router.push('/chat'), 1200);
    };

    return (
        <div className="relative min-h-screen bg-white text-black dark:bg-black dark:text-white overflow-hidden flex items-center justify-center px-4">
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute size-80 bg-purple-500 opacity-20 blur-3xl rounded-full top-10 left-10 animate-pulse" />
                <div className="absolute size-60 bg-blue-400 opacity-10 blur-2xl rounded-full bottom-20 right-20 animate-spin-slow" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-6xl mx-auto"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-4xl font-bold mb-10 text-center tracking-wide"
                >
                    🎯 Your AI Matches
                </motion.h1>

                {loading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center text-purple-600 dark:text-purple-300 animate-pulse text-lg"
                    >
                        Finding people who match your vibe...
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {matches.map((match, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.5 + (i * 0.1),
                                    ease: "easeOut"
                                }}
                                className="bg-white dark:bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-white/20 hover:shadow-purple-500/40 transition flex flex-col items-center hover:scale-105 duration-300"
                            >
                                <Avatar
                                    size={90}
                                    name={match.name}
                                    variant="beam"
                                    colors={["#8b5cf6", "#ec4899", "#22d3ee", "#e879f9", "#a855f7"]}
                                    className="mb-4 border-4 border-purple-600 shadow-md rounded-full"
                                />
                                <h2 className="text-lg font-semibold mb-1 text-center text-black dark:text-white/90">{match.name}</h2>
                                <p className="text-sm text-purple-700 dark:text-purple-200 mb-2 text-center">{match.title}</p>
                                <div className="flex flex-wrap justify-center gap-2 mb-3">
                                    {match.tags.map((tag: string, j: number) => (
                                        <span
                                            key={j}
                                            className="bg-zinc-200 dark:bg-[#0E0B1E] text-black dark:text-white text-xs px-3 py-1 rounded-full shadow-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm italic text-purple-600 dark:text-purple-300 mb-4 text-center">
                                    {match.mutual}
                                </p>
                                <button
                                    onClick={() => handleConnectionRequest(i)}
                                    disabled={sentRequests.has(i)}
                                    className={`w-full py-2 rounded-lg text-sm transition shadow ${sentRequests.has(i)
                                        ? 'bg-green-600 dark:bg-green-700 text-white cursor-not-allowed'
                                        : 'bg-black dark:bg-[#0E0B1E] hover:bg-gray-800 dark:hover:bg-[#1c1735] text-white hover:shadow-purple-400'
                                        }`}
                                >
                                    {sentRequests.has(i) ? (
                                        'Connection Request Sent'
                                    ) : (
                                        <>
                                            <FaHandshake className="inline mr-2" /> Send Connection Request
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-center mt-12"
                    >
                        <button
                            onClick={() => {
                                setIsRedirecting(true);
                                setTimeout(() => router.push('/join'), 1200);
                            }}
                            className="px-8 py-3 bg-black dark:bg-[#0E0B1E] hover:bg-gray-800 dark:hover:bg-[#1c1735] text-white text-lg rounded-full shadow-lg transition hover:shadow-purple-400"
                            disabled={isRedirecting}
                        >
                            {isRedirecting ? 'Loading...' : 'Continue'}
                        </button>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="text-center mt-10 text-sm text-purple-700 dark:text-purple-400"
                >
                    {"Don't see your type?"}

                    <button
                        onClick={handleFindMore}
                        disabled={isFindingMore}
                        className={`underline transition ${isFindingMore
                            ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'hover:text-purple-500 dark:hover:text-purple-200'
                            }`}
                    >
                        {isFindingMore ? 'Redirecting...' : 'Ask AI to find More'}
                    </button>
                </motion.div>
            </motion.div>

            {/* Global Animations */}
            <style jsx global>{`
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
