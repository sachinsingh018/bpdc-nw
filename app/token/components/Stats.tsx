'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TOKEN_CONFIG } from '../config';
import {
    Link,
    Coins,
    Clock,
    FileText
} from 'lucide-react';

const stats = [
    {
        icon: Link,
        label: 'Chain',
        value: TOKEN_CONFIG.chain,
        color: 'from-cyan-400 to-cyan-600'
    },
    {
        icon: Coins,
        label: 'Supply',
        value: 'TBD at TGE',
        color: 'from-purple-400 to-purple-600'
    },
    {
        icon: Clock,
        label: 'Status',
        value: TOKEN_CONFIG.status,
        color: 'from-amber-400 to-amber-600'
    },
    {
        icon: FileText,
        label: 'Whitepaper',
        value: 'v1.0',
        color: 'from-emerald-400 to-emerald-600'
    }
];

export default function Stats() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-20 px-4 relative">
            <div className="container mx-auto">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Token Overview
                    </h2>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        Essential information about ${TOKEN_CONFIG.symbol} and its launch
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.2 }
                            }}
                            className="group relative"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 transition-all duration-300 hover:border-white/20">
                                {/* Glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300 blur-xl`} />

                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className={`size-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="size-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {stat.value}
                                    </h3>
                                    <p className="text-white/70 font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
