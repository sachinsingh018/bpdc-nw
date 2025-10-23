'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { getCookie } from 'cookies-next';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // make sure this import is at the top

import Image from 'next/image';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';

import { useSwipeable } from 'react-swipeable';
import { FaArrowRight, FaArrowLeft, FaUpload } from 'react-icons/fa';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const dummyReels = [
    {
        name: 'Rhea Sharma',
        title: 'Startup Operator @ fintech.ai',
        email: 'rhea.sharma@fintech.ai',
        videoUrl: '/videos/reel1.mp4',
    },
    {
        name: 'Arjun Mehta',
        title: 'Founder @ growthverse.io',
        email: 'arjun.mehta@growthverse.io',
        videoUrl: '/videos/reel2.mp4',
    },
    {
        name: 'Lina Abbas',
        title: 'Community Head @ MENA Builders',
        email: 'lina.abbas@menabuilders.com',
        videoUrl: '/videos/reel3.mp4',
    },
];

export default function ReelsPage() {
    const [current, setCurrent] = useState(0);
    const [reelFile, setReelFile] = useState<File | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter(); // inside your component


    const handleNext = () => setCurrent((prev) => (prev + 1) % dummyReels.length);
    const handlePrev = () => setCurrent((prev) => (prev - 1 + dummyReels.length) % dummyReels.length);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setReelFile(file);
        alert('🎥 Your reel has been uploaded! (simulated)');
    };

    const handleConnect = async () => {
        try {
            const senderEmail = getCookie('userEmail') as string;
            const receiverEmail = dummyReels[current].email;

            if (!senderEmail || !receiverEmail) {
                alert('Unable to send connection request');
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
                alert(`🔗 Connection request sent to ${dummyReels[current].name}!`);
            } else {
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            console.error('Connection request error:', error);
            alert('Error sending request');
        }
    };

    const handlers = useSwipeable({
        onSwipedUp: handleNext,
        onSwipedDown: handlePrev,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    const user = {
        name: userName,
        email: userEmail,
        profilePicture: '',
    };
    useEffect(() => {
        const email = getCookie('userEmail') || 'sachintest@gmail.com';
        const fetchData = async () => {
            try {
                const res = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (data?.name) setUserName(data.name);
                if (data?.email) setUserEmail(data.email);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
            } finally {
                setIsLoading(false); // 🟢 Add this
            }
        };
        fetchData();
    }, []);

    const reel = dummyReels[current];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col items-center justify-center px-4">
                <Image
                    src="/img.jpg"
                    alt="Networkqy Logo"
                    width={240}
                    height={120}
                    className="rounded-md mb-6 shadow-lg hover:scale-105 transition-transform duration-300"
                />
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 text-center animate-pulse">
                    Loading Networkqy...
                </h1>
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    Please wait while we fetch your data
                </p>
            </div>
        );

    }
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar user={user} />
            <SidebarInset>
                <div
                    {...handlers}
                    className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white flex flex-col items-center justify-center relative overflow-hidden px-4 transition-colors duration-500"
                >
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute w-64 h-64 bg-purple-700 rounded-full opacity-30 blur-2xl animate-float-slow top-[10%] left-[10%]" />
                        <div className="absolute w-56 h-56 bg-purple-600 rounded-full opacity-25 blur-2xl animate-float-medium top-[40%] left-[60%]" />
                        <div className="absolute w-72 h-72 bg-purple-400 rounded-full opacity-25 blur-2xl animate-float-fast bottom-[5%] left-[30%]" />
                        <div className="absolute w-48 h-48 bg-purple-200 rounded-full opacity-25 blur-2xl animate-float-slow top-[70%] left-[80%]" />
                    </div>
                    <div className="w-full px-4 flex items-center justify-between mt-4 mb-2 z-50">
                        {/* Left Side: Sidebar + Back */}
                        <div className="flex items-center space-x-2">
                            <SidebarToggle />
                            <button
                                onClick={() => router.back()}
                                className="relative px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-700 shadow-lg backdrop-blur-sm border border-purple-500 hover:scale-105 transition-transform duration-300 hover:shadow-fuchsia-500/40"
                            >
                                <span className="z-10 relative">← Back</span>
                                <span className="absolute inset-0 rounded-xl bg-purple-500 opacity-20 blur-lg animate-pulse pointer-events-none" />
                            </button>

                        </div>

                        {/* Center Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg uppercase text-center"
                        >
                            🧬 Elevator Reels
                        </motion.h1>

                        {/* Right spacer for layout symmetry */}
                        <div className="w-24" />
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="text-sm text-purple-300 tracking-widest uppercase mb-6 font-mono opacity-90"
                    >
                        ⬆ Swipe to Discover — AI-curated Connections
                    </motion.p>


                    <div className="relative w-full max-w-sm aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden shadow-xl flex items-center justify-between">
                        {/* ← Prev */}
                        <button
                            onClick={handlePrev}
                            className="hidden md:flex items-center justify-center w-10 h-full bg-black/30 hover:bg-black/50 z-10"
                        >
                            <FaArrowLeft size={16} />
                        </button>

                        {/* Reel Video */}
                        <div className="relative w-full h-full">
                            <ReactPlayer
                                url={reel.videoUrl}
                                playing
                                loop
                                controls={false}
                                muted
                                width="100%"
                                height="100%"
                                className="rounded-xl"
                            />
                            <div className="absolute bottom-4 left-4 z-10 text-left">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-wide uppercase"
                                >
                                    {reel.name}
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.7, delay: 0.1 }}
                                    className="text-xs font-mono text-purple-300 opacity-80 tracking-wider"
                                >
                                    {reel.title}
                                </motion.p>
                            </div>

                            <div className="absolute top-4 right-4 z-10">
                                <motion.button
                                    onClick={handleConnect}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative z-10 px-5 py-2 text-sm font-semibold tracking-wide rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-xl transition duration-300"
                                >
                                    <span className="relative z-10">👁️‍🗨️ View Profile</span>
                                    <span className="absolute inset-0 rounded-full border border-purple-500 blur-[3px] opacity-40 animate-pulse" />
                                </motion.button>


                            </div>
                        </div>

                        {/* → Next */}
                        <button
                            onClick={handleNext}
                            className="hidden md:flex items-center justify-center w-10 h-full bg-black/30 hover:bg-black/50 z-10"
                        >
                            <FaArrowRight size={16} />
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">⬆ Swipe or click arrows</p>

                    <div className="mt-6 text-center">
                        <motion.label
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative cursor-pointer inline-flex items-center gap-3 px-5 py-2 rounded-full text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg transition-all duration-300"
                        >
                            <FaUpload className="text-white" />
                            Upload Your Reel
                            <input
                                type="file"
                                accept="video/mp4,video/webm"
                                onChange={handleUpload}
                                className="hidden"
                            />
                            <span className="absolute inset-0 rounded-full border border-purple-400 blur-sm opacity-30 animate-pulse pointer-events-none" />
                        </motion.label>

                        {reelFile && (
                            <p className="text-xs text-green-400 mt-2">✅ Selected: {reelFile.name}</p>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>);
    <style jsx global>{`
  @keyframes float {
    0% {
      transform: translateY(0) translateX(0);
    }
    50% {
      transform: translateY(-20px) translateX(10px);
    }
    100% {
      transform: translateY(0) translateX(0);
    }
  }

  .animate-float-slow {
    animation: float 12s ease-in-out infinite;
  }

  .animate-float-medium {
    animation: float 8s ease-in-out infinite;
  }

  .animate-float-fast {
    animation: float 6s ease-in-out infinite;
  }
`}</style>

}
