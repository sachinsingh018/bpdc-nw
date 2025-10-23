'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCookie } from 'cookies-next';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
// import { toast } from '@/components/toast';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Make sure this import is at the top




export default function ArchivedChatsPage() {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [cardCount, setCardCount] = useState(4);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [archivedChats, setArchivedChats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter(); // Inside your component, before return

    useEffect(() => {
        const fetchArchivedCards = async () => {
            try {
                const res = await fetch('api/get-archived-cards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: 'rich@gmail.com' }),
                });
                const data = await res.json();
                setArchivedChats(data);
            } catch (err) {
                console.error('❌ Failed to fetch archived cards:', err);
            }
        };

        fetchArchivedCards();
    }, []);


    const placeholderChats = [
        {
            id: 1,
            name: 'Investor Chat',
            matchPercentage: "8",
            phone: '+971-500-123456',
            desc: 'Discussed Series A funding strategies and due diligence documentation.',
            contact: 'investor@example.com',
        },
        {
            id: 2,
            name: 'Co-founder Sync',
            matchPercentage: "92",
            phone: '+971-511-987654',
            desc: 'Brainstormed growth hacking ideas and product roadmap.',
            contact: 'cofounder@example.com',
        },
        {
            id: 3,
            name: 'UX Advisor',
            matchPercentage: "76",
            phone: '+971-522-333444',
            desc: 'Reviewed new user onboarding flow and feedback loops.',
            contact: 'uxadvisor@example.com',
        },
    ];

    useEffect(() => {
        const updateCount = () => {
            setCardCount(window.innerWidth < 768 ? 1 : 4);
        };
        updateCount();
        window.addEventListener('resize', updateCount);
        return () => window.removeEventListener('resize', updateCount);
    }, []);

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

    const user = {
        name: userName,
        email: userEmail,
        profilePicture: '',
    };


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
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar user={user} />
            <SidebarInset>
                {/* <div className="min-h-screen bg-background text-white p-6"> */}
                <div className="relative min-h-screen bg-background text-white p-6 z-10">
                    {/* 🌌 Floating Bubbles Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute w-64 h-64 bg-purple-700 rounded-full opacity-30 blur-2xl animate-float-slow top-[10%] left-[10%]" />
                        <div className="absolute w-56 h-56 bg-purple-600 rounded-full opacity-25 blur-2xl animate-float-medium top-[40%] left-[60%]" />
                        <div className="absolute w-72 h-72 bg-purple-400 rounded-full opacity-25 blur-2xl animate-float-fast bottom-[5%] left-[30%]" />
                        <div className="absolute w-48 h-48 bg-purple-200 rounded-full opacity-25 blur-2xl animate-float-slow top-[70%] left-[80%]" />
                    </div>

                    {/* Top Bar */}

                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <SidebarToggle />
                            <button
                                onClick={() => router.back()}
                                className="relative px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-700 shadow-lg backdrop-blur-sm border border-purple-500 hover:scale-105 transition-transform duration-300 hover:shadow-fuchsia-500/40"
                            >
                                <span className="z-10 relative">← Back</span>
                                <span className="absolute inset-0 rounded-xl bg-purple-500 opacity-20 blur-lg animate-pulse pointer-events-none" />
                            </button>
                            <h1 className="text-2xl font-bold ml-2 text-gray-900 dark:text-white">🗃️ Archived Chats</h1>

                        </div>
                    </div>

                    <div className="w-full relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all">
                            {(archivedChats.length > 0 ? archivedChats : placeholderChats).map((chat, index) => {
                                const isExpanded = expandedIndex === index;
                                const isOther = expandedIndex !== null && expandedIndex !== index;
                                const truncatedDesc =
                                    chat.desc.length > 100 ? chat.desc.slice(0, 100) + '...' : chat.desc;

                                return (
                                    <motion.div
                                        key={chat.id}
                                        layout
                                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                        className={`
                rounded-xl p-5 text-white transition-all duration-300 ease-in-out relative cursor-pointer
                shadow-lg ${isExpanded ? 'shadow-purple-600/70' : 'shadow-purple-500/50'}
                transform-gpu
            `}
                                        style={{
                                            backgroundColor: '#0E0B1E',
                                            wordBreak: 'break-word',
                                            transform: isExpanded ? 'scale(1.05)' : isOther ? 'scale(0.95)' : 'scale(1)',
                                            opacity: isOther ? 0.7 : 1,
                                            zIndex: isExpanded ? 10 : 1,
                                            gridColumn: isExpanded && cardCount > 1 ? 'span 2' : undefined,
                                        }}
                                    >

                                        {isExpanded ? (
                                            <Minimize2
                                                onClick={() => setExpandedIndex(null)}
                                                className="absolute top-3 right-3 w-5 h-5 text-white hover:text-purple-400 cursor-pointer"
                                            />
                                        ) : (
                                            <Maximize2 className="absolute top-3 right-3 w-5 h-5 text-white hover:text-purple-400" />
                                        )}
                                        <p className="font-bold text-lg mb-1 mt-6">{chat.name}</p>
                                        <p className="text-sm text-green-400 mb-2">Match: {chat.matchPercentage}%</p>
                                        <p className="text-sm text-zinc-400 mb-1">{chat.contact}</p>
                                        {chat.phone && <p className="text-sm text-zinc-400 mb-1">📞 {chat.phone}</p>}
                                        <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                                            {isExpanded ? chat.desc : truncatedDesc}
                                        </p>
                                        <br></br><br></br>
                                        {isExpanded && (

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const summary = `
    🔹 Name: ${chat.name}
    📬 Contact: ${chat.contact}
    📞 Phone: ${chat.phone || 'N/A'}
    🎯 Match %: ${chat.matchPercentage}
    📝 Notes: ${chat.desc}
        `.trim();

                                                    navigator.clipboard.writeText(summary)
                                                        .then(() => toast.success('📋 Info copied to clipboard!'))
                                                        .catch(() => toast.error('❌ Failed to copy info'));
                                                }}
                                                className="
        text-xs px-4 py-2 rounded-md font-mono bg-white text-black border-2 border-black
        hover:bg-black hover:text-white transition-colors duration-300
        mt-4
        sm:mt-0 sm:absolute sm:bottom-4 sm:right-4
    "
                                            >
                                                📋 Copy Info
                                            </button>

                                        )}

                                    </motion.div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
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
