'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getCookie } from 'cookies-next';
import { AppSidebar } from '@/components/app-sidebar';
import { Info } from 'lucide-react'; // or use any icon library you prefer

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';
import Image from 'next/image';

export default function LinkedInComparePage() {
    const [url, setUrl] = useState('');
    const [matchScore, setMatchScore] = useState<number | null>(null);
    const [comparison, setComparison] = useState<any | null>(null);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const emaili = getCookie('userEmail') || 'sachintest@gmail.com';
        const fetchData = async () => {
            try {
                const res = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emaili })
                });
                const data = await res.json();
                const { name, email } = data;
                if (name) setUserName(name);
                if (email) setUserEmail(email);
            } catch (err) {
                console.error('Failed to fetch user data', err);
            } finally {
                setIsLoading(false); // ✅ Add this line
            }
        };
        fetchData();
    }, []);

    const user = {
        name: userName,
        email: userEmail,
        phone: '+1 555 123 4567',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
    };

    const handleCompare = () => {
        if (!url.trim()) return;
        setMatchScore(85);
        setComparison({
            you: {
                title: 'Founder & CEO, Networkqy',
                location: 'Dubai, UAE',
                focus: 'AI-Powered Networking',
            },
            them: {
                title: 'Investor & Partner, VentureX',
                location: 'New York, USA',
                focus: 'Seed Stage SaaS',
            },
            synergy: 'Your profile and goals aligns well with their investment thesis and geographic interest.',
        });
    };
    // if (userEmail === 'sachintest@gmail.com') {
    //     return (
    //         <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col px-4">
    //             <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4 text-center">
    //                 Sign in to Unlock This Powerful Feature
    //             </h1>
    //             <button
    //                 onClick={() => window.location.href = '/register'}
    //                 className="bg-[#0E0B1E] text-white text-center px-6 py-3 rounded-lg shadow-lg shadow-purple-500/50 font-semibold hover:shadow-purple-600/60 transition duration-200"
    //             >
    //                 Sign in / Register
    //             </button>

    //         </div>
    //     );
    // }
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
                <div className="size-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
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
                <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center px-4">
                    <Head>
                        <title>Compare with LinkedIn | Networkqy</title>
                    </Head>

                    <div className="absolute top-4 left-4">
                        <SidebarToggle />


                    </div>
                    <div className="absolute top-4 right-4 group cursor-pointer">
                        <div className="flex items-center space-x-1 text-gray-400">
                            <Info size={18} />
                            <span className="text-xs hidden sm:inline">1 search/day</span>
                        </div>
                        <div className="absolute right-0 mt-2 w-48 p-2 rounded-md bg-gray-800 text-xs text-gray-200 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            You can compare your profile with one LinkedIn user per day.
                        </div>
                    </div>

                    <div className="text-center mb-10 mt-20">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">Compare Yourself with Any LinkedIn Profile</h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            See how aligned your skills, goals, and journey are with their profile. Paste a LinkedIn URL to begin.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full max-w-xl gap-2">
                        <input
                            className="flex-1 px-4 py-3 rounded-md bg-gray-900 border border-gray-700 text-white"
                            placeholder="e.g. https://linkedin.com/in/someperson"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button
                            onClick={handleCompare}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-bold"
                        >
                            Compare
                        </button>
                    </div>

                    {matchScore !== null && comparison && (
                        <div className="mt-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="relative size-28 mb-4">
                                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            stroke="#2d2d2d"
                                            strokeWidth="3"
                                            fill="none"
                                        />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="16"
                                            stroke="#5b21b6"
                                            strokeWidth="3"
                                            fill="none"
                                            strokeDasharray="100"
                                            strokeDashoffset={100 - matchScore}
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#a855f7" />
                                                <stop offset="100%" stopColor="#6b21a8" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-purple-500 to-purple-900 text-2xl font-bold">
                                        {matchScore}%
                                    </div>
                                </div>
                                <p className="text-green-400 font-semibold">Strong synergy! {comparison.synergy}</p>
                            </div>

                            {/* Centered Cards with Shadows */}
                            <div className="flex justify-center w-full mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl text-left">
                                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 shadow-lg shadow-purple-700/40">
                                        <h3 className="text-lg font-bold mb-2">You</h3>
                                        <p><strong>{comparison.you.title}</strong></p>
                                        <p>{comparison.you.location}</p>
                                        <p className="text-purple-400">Focus: {comparison.you.focus}</p>
                                    </div>
                                    <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 shadow-lg shadow-purple-700/40">
                                        <h3 className="text-lg font-bold mb-2">LinkedIn Profile</h3>
                                        <p><strong>{comparison.them.title}</strong></p>
                                        <p>{comparison.them.location}</p>
                                        <p className="text-purple-400">Focus: {comparison.them.focus}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
