'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function JoinLoadingPage() {
    const router = useRouter();
    const [message, setMessage] = useState('Setting up your Network...');
    const [showOptions, setShowOptions] = useState(false);
    const [videoWatched, setVideoWatched] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);


    useEffect(() => {
        const textTimer = setTimeout(() => {
            setMessage('Your Network is Ready');
            setShowOptions(true);
        }, 3000);

        return () => clearTimeout(textTimer);
    }, []);

    useEffect(() => {
        if (videoWatched) {
            const redirectTimer = setTimeout(() => {
                router.push('/profile');
            }, 17000);
            return () => clearTimeout(redirectTimer);
        }
    }, [videoWatched, router]);

    const handleContinue = () => {
        setIsRedirecting(true);
        router.push('/profile');
    };


    const handleWatchVideo = () => {
        setVideoWatched(true);
        setShowOptions(false);
    };

    return (
        <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* ✅ Hide logo and heading when video is being watched */}
            {!videoWatched && (
                <>
                    <Image
                        src="/img.jpg"
                        alt="Networkqy Logo"
                        width={240}
                        height={120}
                        className="rounded-md mb-6 shadow-lg hover:scale-105 transition-transform duration-300 z-10"
                    />

                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4 text-center animate-pulse z-10">
                        {message}
                    </h1>

                    <div className="h-6" />
                </>
            )}

            {/* ✅ Show buttons only if message is ready and video hasn't started */}
            {showOptions && !videoWatched && (
                <div className="flex flex-col items-center gap-3 z-10">
                    <div
                        onClick={handleContinue}
                        className="w-full bg-[#0E0B1E] dark:bg-[#0E0B1E] text-white text-center py-2 px-4 rounded-lg shadow-lg shadow-purple-500/50 cursor-pointer"
                    >

                        <p className="text-sm font-bold flex justify-center items-center gap-2">
                            🚀 {isRedirecting ? 'Redirecting...' : 'Continue'}
                        </p>
                    </div>
                    <button
                        onClick={handleWatchVideo}
                        className="text-sm font-semibold underline text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-200 shadow-md hover:shadow-lg transition-shadow duration-300 drop-shadow-[0_1.5px_1.5px_rgba(200,100,255,0.7)]"
                    >
                        Watch the Video
                    </button>

                </div>
            )}

            <video
                autoPlay
                loop
                muted
                playsInline
                className={`absolute top-0 left-0 w-full h-full object-cover z-0 ${videoWatched ? '' : 'opacity-30'}`}
                src="/videos/network-bg.mp4"
            />

            {videoWatched && (
                <p className="absolute bottom-6 text-sm text-gray-600 dark:text-gray-300 z-10 font-mono">
                    Redirecting after the video...
                </p>

            )}
        </div>
    );
}
