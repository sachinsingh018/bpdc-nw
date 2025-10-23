'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600`} />
            {text && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>
            )}
        </div>
    );
}

interface PageLoadingProps {
    title?: string;
    subtitle?: string;
}

export function PageLoading({
    title = "Loading Networkqy...",
    subtitle = "Please wait while we fetch your data"
}: PageLoadingProps) {
    return (
        <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Image
                    src="/img.jpg"
                    alt="Networkqy Logo"
                    width={240}
                    height={120}
                    className="rounded-md mb-6 shadow-lg hover:scale-105 transition-transform duration-300"
                />
            </motion.div>

            <motion.h1
                className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                {title}
            </motion.h1>

            <motion.div
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            />

            <motion.p
                className="text-sm text-gray-600 dark:text-gray-400 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
            >
                {subtitle}
            </motion.p>
        </div>
    );
}

interface SkeletonCardProps {
    className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
    return (
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-white/20 shadow-lg ${className}`}>
            <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
}

interface NavigationLoadingProps {
    isVisible: boolean;
}

export function NavigationLoading({ isVisible }: NavigationLoadingProps) {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div className="h-1 bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse">
                <div className="h-full bg-white/20 animate-ping"></div>
            </div>
        </motion.div>
    );
}

interface QuickLoadingProps {
    message?: string;
}

export function QuickLoading({ message = "Loading..." }: QuickLoadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center p-4"
        >
            <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
            </div>
        </motion.div>
    );
} 