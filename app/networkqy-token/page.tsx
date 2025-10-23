'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Users,
    Shield,
    TrendingUp,
    Globe,
    Star,
    ArrowRight,
    ExternalLink,
    Twitter,
    MessageCircle,
    Download,
    Eye,
    Wallet,
    Brain,
    Network,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

// 3D Token Component
const Token3D: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 300;
        canvas.height = 300;

        let angle = 0;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Create gradient background
            const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw rotating token
            ctx.save();
            ctx.translate(150, 150);
            ctx.rotate(angle);

            // Token body
            ctx.beginPath();
            ctx.arc(0, 0, 80, 0, Math.PI * 2);
            const tokenGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
            tokenGradient.addColorStop(0, '#8b5cf6');
            tokenGradient.addColorStop(0.5, '#3b82f6');
            tokenGradient.addColorStop(1, '#1e40af');
            ctx.fillStyle = tokenGradient;
            ctx.fill();

            // Token glow
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, 85, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // NQY text
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('NQY', 0, 8);

            // Network lines
            for (let i = 0; i < 8; i++) {
                const lineAngle = (i * Math.PI * 2) / 8;
                const x1 = Math.cos(lineAngle) * 60;
                const y1 = Math.sin(lineAngle) * 60;
                const x2 = Math.cos(lineAngle) * 100;
                const y2 = Math.sin(lineAngle) * 100;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();

            angle += 0.02;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="size-64 mx-auto"
        />
    );
};

// Particle System Component
const ParticleSystem: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
        }> = [];

        // Initialize particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
                ctx.fill();

                // Draw connections
                particles.forEach((otherParticle, otherIndex) => {
                    if (index !== otherIndex) {
                        const distance = Math.sqrt(
                            Math.pow(particle.x - otherParticle.x, 2) +
                            Math.pow(particle.y - otherParticle.y, 2)
                        );
                        if (distance < 100) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 100)})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                });
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
};

// Tokenomics Data
const tokenomicsData = [
    { label: 'Private Sale', percentage: 20, color: '#8b5cf6' },
    { label: 'Public Sale', percentage: 15, color: '#3b82f6' },
    { label: 'Team & Advisors', percentage: 15, color: '#06b6d4' },
    { label: 'Ecosystem Development', percentage: 25, color: '#10b981' },
    { label: 'Community Rewards', percentage: 15, color: '#f59e0b' },
    { label: 'Liquidity', percentage: 10, color: '#ef4444' },
];

// Features Data
const features = [
    {
        icon: <Zap className="size-8" />,
        title: 'Incentivized Networking',
        description: 'Earn $NQY tokens for successful connections, introductions, and collaborations.',
        gradient: 'from-purple-500 to-blue-500',
    },
    {
        icon: <Brain className="size-8" />,
        title: 'AI-Matched Deals',
        description: 'Use tokens to access premium AI-powered matchmaking and deal flow.',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        icon: <Shield className="size-8" />,
        title: 'Decentralized Identity',
        description: 'Wallet-based trust system with zero-login networking capabilities.',
        gradient: 'from-cyan-500 to-green-500',
    },
    {
        icon: <TrendingUp className="size-8" />,
        title: 'Staking & Rewards',
        description: 'Stake $NQY for visibility boosts and participate in DAO governance.',
        gradient: 'from-green-500 to-yellow-500',
    },
];

// Testimonials Data
const testimonials = [
    {
        name: 'Alex Chen',
        role: 'DeFi Founder',
        avatar: '👨‍💻',
        quote: 'Networkqy Token revolutionized how I connect with investors. The AI matching is incredible!',
    },
    {
        name: 'Sarah Rodriguez',
        role: 'Web3 Developer',
        avatar: '👩‍💻',
        quote: 'Finally, a platform that rewards genuine networking. The tokenomics are perfectly designed.',
    },
    {
        name: 'Marcus Johnson',
        role: 'Crypto VC',
        avatar: '👨‍💼',
        quote: 'The staking mechanism creates real value. I\'ve found my best deals through Networkqy.',
    },
];

export default function NetworkqyTokenPage() {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <ParticleSystem />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="size-4" />
                            Introducing Networkqy Token
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            $NQY Token
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Fueling the future of AI-powered networking in the crypto era
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2"
                            >
                                Get Early Access
                                <ArrowRight className="size-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="border border-purple-500 text-purple-400 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-500/10 transition-colors"
                            >
                                View Tokenomics
                                <Eye className="size-5" />
                            </motion.button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="mt-12"
                    >
                        <Token3D />
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Token Value Propositions
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Discover how $NQY powers the next generation of professional networking
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="group"
                            >
                                <div className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient}/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105`}>
                                    <div className={`inline-flex items-center justify-center size-16 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tokenomics Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Tokenomics
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Strategic allocation for sustainable growth and community rewards
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            {tokenomicsData.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div
                                        className="size-4 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold">{item.label}</span>
                                            <span className="text-gray-300">{item.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div
                                                className="h-2 rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${item.percentage}%`,
                                                    backgroundColor: item.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <div className="relative size-80 mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full animate-pulse" />
                                <div className="absolute inset-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full animate-pulse delay-1000" />
                                <div className="absolute inset-8 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-full animate-pulse delay-2000" />
                                <div className="absolute inset-12 bg-gradient-to-br from-green-500/20 to-yellow-500/20 rounded-full animate-pulse delay-3000" />
                                <div className="absolute inset-16 bg-gradient-to-br from-yellow-500/20 to-red-500/20 rounded-full animate-pulse delay-4000" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Global Impact
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            See how Networkqy Token is transforming networking worldwide
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
                            >
                                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                                <p className="text-gray-300 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                <div>
                                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                    <p className="text-purple-400 text-sm">{testimonial.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Ready to Join the Future?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Be part of the revolution in AI-powered networking. Get early access to $NQY tokens.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2"
                            >
                                Join Whitelist
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="border border-purple-500 text-purple-400 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-purple-500/10 transition-colors"
                            >
                                Read Whitepaper
                                <Download className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Networkqy Token
                            </h3>
                            <p className="text-gray-300 text-sm">
                                Powering the future of AI-driven networking
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Token Info</h4>
                            <div className="space-y-2 text-sm text-gray-300">
                                <p>Contract: 0x1234...5678</p>
                                <p>Network: Ethereum</p>
                                <p>Total Supply: 100,000,000</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <div className="space-y-2 text-sm">
                                <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors block">
                                    Whitepaper
                                </Link>
                                <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors block">
                                    Audit Report
                                </Link>
                                <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors block">
                                    Tokenomics
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Community</h4>
                            <div className="flex gap-4">
                                <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                                    <Twitter className="size-5" />
                                </Link>
                                <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                                    <MessageCircle className="size-5" />
                                </Link>
                                <Link href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                                    <ExternalLink className="size-5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
                        <p>&copy; 2024 Networkqy Token. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 