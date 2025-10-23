'use client';

import { useState, useEffect, useRef } from 'react';
import { FaHeart, FaComment, FaShare, FaUpload, FaFire, FaStar, FaPlay, FaPause } from 'react-icons/fa';
import { IoSparkles, IoRocket } from 'react-icons/io5';
import { BiSolidLike } from 'react-icons/bi';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const dummyReels = [
    {
        id: 1,
        name: 'Sachin Singh',
        title: 'CTO & Consultant @ Stealth AI Startup',
        videoUrl: '/videos/reel1.mp4',
        likes: 1247,
        comments: 89,
        shares: 234,
        views: '12.4K',
        isLiked: false,
        isVerified: true,
        trending: true,
    },
    {
        id: 2,
        name: 'Yatharth Kher',
        title: 'PhD & Founder @ Networkqy',
        videoUrl: '/videos/reel2.mp4',
        likes: 892,
        comments: 156,
        shares: 445,
        views: '8.9K',
        isLiked: true,
        isVerified: true,
        trending: false,
    },
    {
        id: 3,
        name: 'Conan Dune',
        title: 'Marketing Maniac & Professional Networker',
        videoUrl: '/videos/reel3.mp4',
        likes: 2156,
        comments: 234,
        shares: 567,
        views: '23.1K',
        isLiked: false,
        isVerified: false,
        trending: true,
    },
];

export default function ReelsPage() {
    const [current, setCurrent] = useState(0);
    const [reelFile, setReelFile] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [userStats, setUserStats] = useState({ views: 0, likes: 0, shares: 0 });
    const [showConfetti, setShowConfetti] = useState(false);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Swipe detection
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
            setSwipeDirection('left');
        } else if (isRightSwipe) {
            handlePrev();
            setSwipeDirection('right');
        }

        setTimeout(() => setSwipeDirection(null), 300);
    };

    const handleNext = () => {
        setCurrent((prev) => (prev + 1) % dummyReels.length);
        setIsPlaying(true);
        setUserStats(prev => ({ ...prev, views: prev.views + 1 }));
    };

    const handlePrev = () => {
        setCurrent((prev) => (prev - 1 + dummyReels.length) % dummyReels.length);
        setIsPlaying(true);
        setUserStats(prev => ({ ...prev, views: prev.views + 1 }));
    };

    const toggleLike = () => {
        const updatedReels = [...dummyReels];
        updatedReels[current].isLiked = !updatedReels[current].isLiked;
        updatedReels[current].likes += updatedReels[current].isLiked ? 1 : -1;

        if (updatedReels[current].isLiked) {
            setUserStats(prev => ({ ...prev, likes: prev.likes + 1 }));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        }
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReelFile(file);
            setShowUploadModal(true);
            simulateUpload();
        }
    };

    const simulateUpload = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setShowUploadModal(false);
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 3000);
                    }, 500);
                    return 100;
                }
                return prev + Math.random() * 15;
            });
        }, 200);
    };

    const reel = dummyReels[current];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white relative overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute size-2 bg-white/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="relative z-10 pt-8 pb-4 px-4">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <div className="flex items-center gap-2">
                        <IoSparkles className="text-2xl text-yellow-400 animate-pulse" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Reels
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                            <span className="text-purple-300">🔥 {userStats.views}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Reel Container */}
            <div
                ref={containerRef}
                className="relative flex flex-col items-center justify-center px-4 py-6"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Progress Indicator */}
                <div className="w-full max-w-sm mb-4">
                    <div className="flex gap-1">
                        {dummyReels.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 rounded-full transition-all duration-300 ${index === current
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 flex-1'
                                    : 'bg-white/20 flex-1'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Reel Card */}
                <div className={`relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 ${swipeDirection === 'left' ? 'animate-slideOutLeft' :
                    swipeDirection === 'right' ? 'animate-slideOutRight' : ''
                    }`}>
                    <ReactPlayer
                        url={reel.videoUrl}
                        playing={isPlaying}
                        loop
                        controls={false}
                        muted
                        width="100%"
                        height="100%"
                        className="rounded-3xl"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Play/Pause Button */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute top-4 right-4 size-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
                    >
                        {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white ml-1" />}
                    </button>

                    {/* Trending Badge */}
                    {reel.trending && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <FaFire className="text-yellow-300" />
                            Trending
                        </div>
                    )}

                    {/* User Info */}
                    <div className="absolute bottom-6 inset-x-4 z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-white drop-shadow-lg">
                                {reel.name}
                            </h3>
                            {reel.isVerified && (
                                <div className="size-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <FaStar className="text-white text-xs" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-200 drop-shadow-lg mb-3">{reel.title}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-300">
                            <span>👁️ {reel.views}</span>
                            <span>❤️ {reel.likes.toLocaleString()}</span>
                            <span>💬 {reel.comments}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute right-4 bottom-20 flex flex-col gap-4">
                        <button
                            onClick={toggleLike}
                            className={`size-12 rounded-full flex items-center justify-center transition-all hover:scale-110 ${reel.isLiked
                                ? 'bg-red-500 text-white'
                                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                                }`}
                        >
                            {reel.isLiked ? <FaHeart className="text-lg" /> : <BiSolidLike className="text-lg" />}
                        </button>

                        <button className="size-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                            <FaComment className="text-white text-lg" />
                        </button>

                        <button className="size-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                            <FaShare className="text-white text-lg" />
                        </button>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4 mt-6">
                    <button
                        onClick={handlePrev}
                        className="size-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-300">{current + 1} / {dummyReels.length}</p>
                    </div>

                    <button
                        onClick={handleNext}
                        className="size-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Upload Section */}
            <div className="relative z-10 px-4 pb-8">
                <div className="max-w-sm mx-auto">
                    <label className="cursor-pointer block">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-0.5 rounded-2xl">
                            <div className="bg-black rounded-2xl p-4 text-center hover:bg-gray-900 transition-all">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <IoRocket className="text-2xl text-purple-400" />
                                    <span className="font-semibold text-lg">Create Your Reel</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">Share your story in 15 seconds</p>
                                <div className="flex items-center justify-center gap-2 text-purple-400">
                                    <FaUpload />
                                    <span className="text-sm">Upload Video</span>
                                </div>
                                <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    onChange={handleUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </label>

                    {reelFile && (
                        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-3">
                            <p className="text-sm text-green-400 flex items-center gap-2">
                                ✅ <span className="text-white">{reelFile.name}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-center">🚀 Uploading Your Reel</h3>
                        <div className="bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-center text-gray-400">
                            {uploadProgress < 100 ? 'Processing...' : '🎉 Upload Complete!'}
                        </p>
                    </div>
                </div>
            )}

            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Custom CSS for animations */}
            <style jsx>{`
                @keyframes slideOutLeft {
                    0% { transform: translateX(0) scale(1); opacity: 1; }
                    100% { transform: translateX(-100%) scale(0.8); opacity: 0; }
                }
                
                @keyframes slideOutRight {
                    0% { transform: translateX(0) scale(1); opacity: 1; }
                    100% { transform: translateX(100%) scale(0.8); opacity: 0; }
                }
                
                .animate-slideOutLeft {
                    animation: slideOutLeft 0.3s ease-out;
                }
                
                .animate-slideOutRight {
                    animation: slideOutRight 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
