'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation'; // make sure this import is at the top

import Image from 'next/image';

const defaultZoom = 13;

export default function NearbyEventsPage() {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter(); // inside your component

    const handleLocationAccess = async () => {
        setIsLocating(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    setIsLocating(false);
                },
                async () => {
                    console.warn('Geolocation denied, using IP fallback');

                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        const data = await res.json();
                        if (data && data.latitude && data.longitude) {
                            setPosition({ lat: data.latitude, lng: data.longitude });
                        } else {
                            alert('Unable to detect location via IP.');
                        }
                    } catch (err) {
                        alert('IP-based location failed.');
                        console.error(err);
                    }

                    setIsLocating(false);
                }
            );
        } else {
            // If geolocation is not supported, fallback immediately
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                    setPosition({ lat: data.latitude, lng: data.longitude });
                } else {
                    alert('Unable to detect location via IP.');
                }
            } catch (err) {
                alert('IP-based location failed.');
                console.error(err);
            }

            setIsLocating(false);
        }
    };


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
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const Map = useMemo(
        () =>
            dynamic(() => import('@/components/leafletmap'), {
                loading: () => <p className="text-center">🗺️ Loading map...</p>,
                ssr: false,
            }),
        []
    );

    const user = {
        name: userName,
        email: userEmail,
        phone: '+1 555 123 4567',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
    };

    const selectedevents = [
        {
            title: 'TechConnect DXB',
            date: 'June 12, 2025',
            location: 'Dubai Internet City',
            desc: 'An elite networking event for MENA-based founders, VCs, and product leaders.',
        },
        {
            title: 'AI Founders Mixer',
            date: 'June 15, 2025',
            location: 'Downtown Dubai',
            desc: 'Meet top AI founders and researchers building the next generation of intelligent apps.',
        },
        {
            title: 'Startup Sprint',
            date: 'June 20, 2025',
            location: 'Astrolabs, JLT',
            desc: 'Speed networking and investor Q&A sessions for early-stage startup founders.',
        },
        {
            title: 'Fintech Future Forum',
            date: 'June 25, 2025',
            location: 'DIFC Innovation Hub',
            desc: 'Fintech startups meet banks, regulators, and VCs for a deep dive on the future of money.',
        },
        {
            title: 'UX Unplugged',
            date: 'June 28, 2025',
            location: 'Warehouse Four, Al Quoz',
            desc: 'A design-focused meetup for product designers and UX researchers to exchange insights.',
        },
        {
            title: 'Pitch & Padels',
            date: 'July 2, 2025',
            location: 'Padel Pro Club, Al Quoz',
            desc: 'Casual padel games followed by lightning startup pitches and networking.',
        },
        {
            title: 'Web3 Weekend',
            date: 'July 5, 2025',
            location: 'Crypto Oasis, Business Bay',
            desc: 'A weekend summit for Web3 devs, founders, and DAOs exploring blockchain ecosystems.',
        },
        {
            title: 'Growth Hack Night',
            date: 'July 8, 2025',
            location: 'Hub71, Abu Dhabi',
            desc: 'Startup teams compete to present real growth ideas to a panel of marketing experts.',
        },
        {
            title: 'Investor Intros',
            date: 'July 11, 2025',
            location: 'Seedspace Dubai',
            desc: 'Founders get direct access to pitch and get feedback from regional angel investors.',
        },
        {
            title: 'Code & Coffee',
            date: 'July 15, 2025',
            location: 'One Central, DWTC',
            desc: 'Morning meetup for developers and product engineers to share tools and collaborate.',
        },
    ];
    function getRandomEvents(count = 3) {
        const shuffled = [...selectedevents].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    const eventCards = getRandomEvents();
    console.log(eventCards);



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
                <div className="relative min-h-screen w-full text-white">
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute size-64 bg-purple-700 rounded-full opacity-30 blur-2xl animate-float-slow top-[10%] left-[10%]" />
                        <div className="absolute size-56 bg-purple-600 rounded-full opacity-25 blur-2xl animate-float-medium top-[40%] left-[60%]" />
                        <div className="absolute size-72 bg-purple-400 rounded-full opacity-25 blur-2xl animate-float-fast bottom-[5%] left-[30%]" />
                        <div className="absolute size-48 bg-purple-200 rounded-full opacity-25 blur-2xl animate-float-slow top-[70%] left-[80%]" />
                    </div>
                    <div className="absolute top-4 left-4 z-50 flex items-center space-x-2">
                        <SidebarToggle />
                        <button
                            onClick={() => router.back()}
                            className="relative px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-700 to-fuchsia-700 shadow-lg backdrop-blur-sm border border-purple-500 hover:scale-105 transition-transform duration-300 hover:shadow-fuchsia-500/40"
                        >
                            <span className="z-10 relative">← Back</span>
                            <span className="absolute inset-0 rounded-xl bg-purple-500 opacity-20 blur-lg animate-pulse pointer-events-none" />
                        </button>

                    </div>
                    {position ? (
                        <div className="flex flex-col items-center justify-center px-4 py-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono uppercase tracking-wider text-center text-transparent bg-gradient-to-r from-purple-700 to-gray-500 bg-clip-text animate-pulse">
                                🚀 Let’s Find Your Networkqy Opportunities
                            </h2>



                            <div
                                className="w-full max-w-6xl backdrop-blur-lg bg-white/5 dark:bg-black/10 border border-purple-700 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.35)] mb-12"
                                style={{ height: '650px' }}
                            >
                                <Map position={position} zoom={defaultZoom} />
                            </div>

                            {/* Event Suggestion Header */}
                            <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center font-mono uppercase tracking-wide bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent animate-fade-in">
                                🌟 AI-Picked Events Happening Near You
                            </h3>

                            {/* Event Suggestion Cards */}
                            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
                                {eventCards.map((event, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-br from-black via-gray-900 to-purple-950 border border-purple-700 rounded-xl p-6 shadow-[0_0_25px_rgba(147,51,234,0.3)] hover:scale-[1.02] hover:shadow-purple-500/40 transition-all duration-300"
                                    >

                                        <h3 className="text-lg font-bold text-purple-400 mb-2 tracking-wide uppercase">{event.title}</h3>
                                        <p className="text-sm text-gray-400 mb-1">📍 <span className="font-semibold">{event.location}</span></p>
                                        <p className="text-sm text-gray-500 mb-3">📅 {event.date}</p>
                                        <p className="text-gray-300 text-sm leading-relaxed">{event.desc}</p>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-purple-50 dark:from-black dark:via-gray-900 dark:to-purple-950 flex flex-col items-center justify-center text-center px-4 transition-colors duration-500">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent animate-pulse drop-shadow-lg">
                                🌐 Find Networking Events Near You
                            </h1>

                            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6 max-w-md tracking-wide font-medium">
                                Enable your location to unlock AI-powered recommendations for events happening around you.
                            </p>

                            <button
                                onClick={handleLocationAccess}
                                disabled={isLocating}
                                className={`relative px-6 py-3 rounded-full font-semibold tracking-wider transition-all duration-300
      ${isLocating
                                        ? 'bg-purple-600/60 text-white cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'}
      shadow-2xl`}
                            >
                                <span className="relative z-10">
                                    {isLocating ? '🔄 Locating...' : '📍 Enable Location'}
                                </span>
                                {!isLocating && (
                                    <span className="absolute inset-0 rounded-full border border-purple-400 blur-[3px] opacity-40 animate-pulse pointer-events-none" />
                                )}
                            </button>
                        </div>

                    )}<style jsx global>{`
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

                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
