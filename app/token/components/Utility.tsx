'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TOKEN_CONFIG } from '../config';
import {
    Brain,
    Award,
    TrendingUp,
    Percent,
    Users
} from 'lucide-react';

const utilityFeatures = [
    {
        icon: Brain,
        title: 'Premium AI Access',
        description: 'Access to premium AI features in the Networkqy app',
        color: 'from-purple-400 to-purple-600'
    },
    {
        icon: Award,
        title: 'Earn Rewards',
        description: 'Earn for verified contributions & helpful interactions',
        color: 'from-amber-400 to-amber-600'
    },
    {
        icon: TrendingUp,
        title: 'Priority Discovery',
        description: 'Priority boosts in discovery & matching algorithms',
        color: 'from-cyan-400 to-cyan-600'
    },
    {
        icon: Percent,
        title: 'Fee Discounts',
        description: 'Fee discounts on partner services and premium features',
        color: 'from-emerald-400 to-emerald-600'
    },
    {
        icon: Users,
        title: 'Community Governance',
        description: 'Community governance with limited scope voting rights',
        color: 'from-rose-400 to-rose-600'
    }
];

export default function Utility() {
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
                        What ${TOKEN_CONFIG.symbol} unlocks
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        {/* TODO: Replace with actual whitepaper content */}
                        The $NQY token serves as the foundation for Networkqy&apos;s decentralized ecosystem,
                        enabling users to access premium features, earn rewards, and participate in governance.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {utilityFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{
                                y: -8,
                                transition: { duration: 0.2 }
                            }}
                            className="group relative"
                        >
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300 hover:border-white/20">
                                {/* Glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300 blur-xl`} />

                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-10 h-10 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional utility info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            More Utility Coming Soon
                        </h3>
                        <p className="text-white/70 max-w-2xl mx-auto">
                            As the Networkqy ecosystem grows, ${TOKEN_CONFIG.symbol} will unlock additional features,
                            partnerships, and governance capabilities. Stay tuned for updates.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
