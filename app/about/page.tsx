'use client';
import { Header } from '@/components/Header'; // Adjust path as needed
import { Footer } from '@/components/Footer';
import Link from 'next/link'; // Keep this import
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Network,
  Briefcase,
  Share2,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Users,
  Target,
  Zap,
  Linkedin,
  Twitter,
  Github,

} from "lucide-react";

interface StarProps {
  starColor1: string;
  starColor2: string;
  numStars: number;
}

interface StarInstance {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  direction: 1 | -1;
  color: string;
  pulsePhase: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  update: () => void;
  drawSparkle?: (ctx: CanvasRenderingContext2D) => void;
}

const StarryBackground: React.FC<StarProps> = ({ starColor1, starColor2, numStars }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stars = useRef<StarInstance[]>([]);
  const animationFrameId = useRef<number | null>(null);

  class Star implements StarInstance {
    x: number;
    y: number;//asas
    radius: number;
    alpha: number;
    twinkleSpeed: number;
    direction: 1 | -1;
    color: string;
    pulsePhase: number;

    constructor(canvasWidth: number, canvasHeight: number) {
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.radius = Math.random() * 1.5 + 0.5; // Increased size
      this.alpha = Math.random() * 0.6 + 0.1; // Increased opacity range
      this.twinkleSpeed = Math.random() * 0.02 + 0.005; // Faster twinkling
      this.direction = Math.random() > 0.5 ? 1 : -1;
      this.color = Math.random() > 0.5 ? starColor1 : starColor2;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    draw(ctx: CanvasRenderingContext2D) {
      // Enhanced glow effect
      const glowSize = this.radius * (2 + Math.sin(this.pulsePhase) * 0.5);

      // Create radial gradient for glow
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);

      if (this.color === 'white') {
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
      } else {
        gradient.addColorStop(0, `rgba(139, 92, 246, ${this.alpha})`);
        gradient.addColorStop(0.3, `rgba(139, 92, 246, ${this.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color === 'white'
        ? `rgba(255, 255, 255, ${Math.min(1, this.alpha * 1.5)})`
        : `rgba(139, 92, 246, ${Math.min(1, this.alpha * 1.5)})`;
      ctx.fill();

      if (this.alpha > 0.4) {
        this.drawSparkle(ctx);
      }
    }

    drawSparkle(ctx: CanvasRenderingContext2D) {
      const sparkleLength = this.radius * 3;
      ctx.strokeStyle = this.color === 'white'
        ? `rgba(255, 255, 255, ${this.alpha * 0.8})`
        : `rgba(139, 92, 246, ${this.alpha * 0.8})`;
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y - sparkleLength);
      ctx.lineTo(this.x, this.y + sparkleLength);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.x - sparkleLength, this.y);
      ctx.lineTo(this.x + sparkleLength, this.y);
      ctx.stroke();
    }

    update() {
      this.alpha += this.twinkleSpeed * this.direction;
      this.pulsePhase += 0.05;

      if (this.alpha > 0.7 || this.alpha < 0.1) {
        this.direction *= -1;
        this.alpha = Math.max(0.1, Math.min(0.7, this.alpha));
      }
    }
  }

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      animationFrameId.current = null;
      return;
    }

    animationFrameId.current = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.current.forEach(star => {
      star.update();
      star.draw(ctx);
    });

  }, []);

  const initStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    stars.current = [];
    for (let i = 0; i < numStars; i++) {
      stars.current.push(new Star(canvas.width, canvas.height));
    }
  }, [numStars, starColor1, starColor2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [initStars, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    ></canvas>
  );
};

// Data Types
interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature {
  emoji: string;
  title: string;
  text: string;
}

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  avatar: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  gradient: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  }
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const howItWorksSteps: HowItWorksStep[] = [
  {
    step: '1',
    title: 'Define Your Intent',
    description: 'Share your goals—whether fundraising, hiring, or finding co-founders',
    icon: <Target className="w-8 h-8" />
  },
  {
    step: '2',
    title: 'AI-Powered Discovery',
    description: 'Our AI analyzes compatibility beyond keywords—values, timing, and intent',
    icon: <Sparkles className="w-8 h-8" />
  },
  {
    step: '3',
    title: 'Meaningful Connections',
    description: 'Receive warm introductions with context that drive real relationships',
    icon: <Users className="w-8 h-8" />
  },
];

const allFeatures: Feature[] = [
  { emoji: '🧠', title: 'Intent-Aware Discovery', text: 'Our AI adapts to your goals in real time, helping you connect with the right people, faster.' },
  { emoji: '✨', title: '"Why Connect" Explanations', text: 'Understand the precise reasons behind recommended connections.' },
  { emoji: '🏅', title: 'Profile Match Score', text: 'Get detailed compatibility scores indicating strong alignment.' },
  { emoji: '📁', title: 'Save Connections to Folders', text: 'Organize and manage your valuable connections efficiently.' },
  { emoji: '⚡', title: 'Streaks & Referrals', text: 'Track your networking progress and facilitate seamless referrals.' },
  { emoji: '🗺️', title: 'Gamified Heatmap View', text: 'Visualize your networking activity and identify key engagement areas.' },
];

const testimonials: Testimonial[] = [
  {
    quote: "BITS Pilani Dubai Campus transformed my fundraising journey. I connected with investors who truly understood my vision, leading to successful seed funding!",
    author: "Sarah Chen",
    title: "Startup Founder",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "Finding the right talent used to be a headache. BITS Pilani Dubai Campus's AI-driven matching brought me incredible candidates I wouldn't have found elsewhere.",
    author: "Marcus Rodriguez",
    title: "Tech Recruiter",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "The 'Why Connect' explanations are a game-changer. Every introduction feels genuinely warm and relevant.",
    author: "Emily Zhang",
    title: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    quote: "I've built more meaningful professional relationships in months on BITS Pilani Dubai Campus than years on other platforms. Highly recommended!",
    author: "David Kumar",
    title: "Industry Veteran",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }];


const coreValues: Value[] = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI-First Innovation",
    description: "We leverage cutting-edge artificial intelligence to solve real human connection challenges with unprecedented precision."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Authentic Relationships",
    description: "Every connection facilitated through our platform prioritizes genuine compatibility and mutual value creation."
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Intent-Driven Matching",
    description: "We go beyond surface-level matching to understand deep motivations, timing, and professional objectives."
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Accelerated Growth",
    description: "Our mission is to compress the traditional networking timeline, helping professionals achieve their goals faster."
  }
];
const apiIntegrations = [
  {
    title: "Community & Event Platforms",
    description: "Embed smart networking features into your community platform to help members discover and connect with like-minded professionals.",
    icon: <Network className="w-8 h-8" />
  },
  {
    title: "Corporate HR Tools",
    description: "Integrate our AI-powered matching into your HR platform to facilitate internal networking, mentorship, and team collaboration.",
    icon: <Briefcase className="w-8 h-8" />
  },
  {
    title: "Slack/Discord Bots",
    description: "Deploy our intelligent networking bot in your workspace to suggest connections and foster meaningful professional relationships.",
    icon: <Share2 className="w-8 h-8" />
  },
  {
    title: "Embedded Chat Widgets",
    description: "Add our networking widget to your website or app to help users connect with relevant professionals in real-time.",
    icon: <MessageCircle className="w-8 h-8" />
  }
];
const partnerLogos = [
  { name: 'PerplexityAI', src: '/partners/perplexity.png' },
  { name: 'Google', src: '/partners/gcp.png' },
  { name: 'in5 Dubai', src: '/partners/in5.png' },
  { name: 'NVIDIA', src: '/partners/nvidea.png' },
  { name: 'Dubai Holding', src: '/partners/dh.jpg' }
];
export default function About() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']); // Reduced parallax effect
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-violet-950/30 text-white font-sans leading-relaxed tracking-wide">
      {/* Enhanced Header */}
      {/* <Header /> */}
      <main>
        {/* Hero Section with Parallax */}
        <motion.section
          className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 bg-gradient-to-b from-black via-gray-900 to-purple-950 text-white overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Decorative Blurs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <div className="absolute top-40 right-10 w-56 h-56 bg-violet-700/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm mb-8">
                <Sparkles className="size-4 text-violet-400" />
                <span className="text-sm text-violet-300 font-medium">Revolutionizing Professional Networking</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-7xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-white via-violet-300 to-purple-300 bg-clip-text text-transparent">
                About
              </span>
              <br />
              <span className="bg-gradient-to-r from-bits-blue-400 via-bits-gold-400 to-bits-blue-500 bg-clip-text text-transparent">
                BITS Pilani Dubai Campus
              </span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              The first AI-powered professional network that understands
              <span className="text-violet-300 font-semibold"> intent, timing, and values</span> — not just keywords.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <button className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25">
                <span className="relative z-10 flex items-center gap-2">
                  Join the Revolution
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              </button>
              <button className="px-8 py-4 border border-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all duration-300 hover:bg-white/5">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-violet-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-violet-500/20 blur-sm"></div>
        </div>

        {/* Mission & Vision Section */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} // Reduced X offset
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} // Reduced duration
              viewport={{ once: true, amount: 0.4 }} // Increased amount
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We believe professional networking is broken. Traditional platforms focus on broadcasting rather than meaningful connection, leading to noise instead of value. BITS Pilani Dubai Campus leverages AI to transform how professionals discover, connect, and grow together.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-bits-blue-900/20 to-bits-gold-900/20 border border-bits-blue-500/20 backdrop-blur-sm">
                <blockquote className="text-xl italic text-bits-blue-200">
                  <p>{`We're not just building another social network. We're creating an intelligent system that understands human intent and facilitates serendipitous yet purposeful connections.`}</p>

                </blockquote>
                <cite className="text-sm text-gray-400 not-italic mt-4 block">— BITS Pilani Dubai Campus Founding Team</cite>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} // Reduced X offset
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} // Reduced duration
              viewport={{ once: true, amount: 0.4 }} // Increased amount
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-8 backdrop-blur-sm border border-white/10">
                <div className="h-full flex flex-col justify-center space-y-6">
                  {['Intent Recognition', 'Smart Matching', 'Relationship Building'].map((item, i) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm"
                      initial={{ opacity: 0, x: 10 }} // Reduced X offset
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }} // Reduced delay and duration
                      viewport={{ once: true, amount: 0.6 }} // Increased amount
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center font-bold text-white">
                        {i + 1}
                      </div>
                      <span className="font-semibold text-white">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-violet-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-violet-500/20 blur-sm"></div>
        </div>

        {/* How It Works Section */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How BITS Pilani Dubai Campus Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our AI-powered approach transforms traditional networking into intelligent, purposeful connections
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 30 }} // Reduced Y offset
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }} // Reduced delay and duration
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out h-full hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10 text-center">
                    <div className="w-12 h-12 mx-auto mb-6 text-violet-400 transition-colors duration-300 group-hover:text-violet-300">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white transition-colors duration-300 group-hover:text-violet-200">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                {i < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-transparent transform -translate-y-1/2 z-10"></div>
                )}
                {i < howItWorksSteps.length - 1 && (
                  <div className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 h-8 w-0.5 bg-gradient-to-b from-violet-500 to-transparent z-10"></div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-purple-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-purple-500/20 blur-sm"></div>
        </div>
        {/* Core Values */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The principles that guide everything we build and every decision we make
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, i) => (
              <motion.div
                key={i}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-500 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }} // Reduced delay and duration
                viewport={{ once: true, amount: 0.5 }}
              // Removed whileHover for a calmer feel, keeping only CSS transitions
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-purple-200 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-violet-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-violet-500/20 blur-sm"></div>
        </div>

        {/* Key Features Section */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Key Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover the powerful capabilities that make BITS Pilani Dubai Campus unique
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allFeatures.map((feature, i) => (
              <motion.div
                key={i}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all duration-500 h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }} // Reduced delay and duration
                viewport={{ once: true, amount: 0.5 }}
              // Removed whileHover
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="text-4xl leading-none">{feature.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-violet-200 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-purple-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-purple-500/20 blur-sm"></div>
        </div>
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Plug our AI into your platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Seamlessly integrate BITS Pilani Dubai Campus's intelligent networking capabilities into your existing tools and platforms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {apiIntegrations.map((integration, i) => (
              <motion.div
                key={i}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all duration-500 h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-violet-400 group-hover:text-violet-300 transition-colors duration-300">
                    {integration.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-violet-200 transition-colors duration-300">
                    {integration.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {integration.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <button className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/25">
              <span className="relative z-10 flex items-center gap-2">
                Explore API Documentation
                <Share2 className="size-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
            </button>
          </motion.div>
        </section>
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-purple-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-purple-500/20 blur-sm"></div>
        </div>
        {/* Testimonials Section */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from the founders and professionals who are thriving with BITS Pilani Dubai Campus
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all duration-500 h-full flex flex-col justify-between"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true, amount: 0.5 }}
              // Removed whileHover
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <p className="text-lg italic text-gray-300 mb-6">{`"${testimonial.quote}"`}</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full mr-4 object-cover border border-violet-400"
                    />
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-violet-300">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-violet-700/50 to-transparent mx-auto max-w-7xl my-10 md:my-12">
          <div className="absolute -inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-violet-500/20 blur-sm"></div>
        </div>


        {/* Partners Section */}
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.h2
            className="text-lg font-bold text-zinc-400 uppercase tracking-wider text-center mb-12"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Backed by Leading Innovators
          </motion.h2>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08 // Reduced stagger
                }
              }
            }}
          >
            {partnerLogos.map((logo, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                      ease: "easeOut"
                    }
                  }
                }}
                className="relative w-40 h-20 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.1 }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="w-full h-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.style.display = 'none';
                  }}

                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
      <Footer />
      {/* Footer component would go here */}
    </div>
  );
}