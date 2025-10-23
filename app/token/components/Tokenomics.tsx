'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { PieChart, Coins, TrendingUp, Shield, Users } from 'lucide-react';

const tokenomicsData = [
    {
        category: 'Community Rewards',
        percentage: 40,
        color: '#7C3AED',
        description: 'Distributed to active users and contributors'
    },
    {
        category: 'Treasury',
        percentage: 25,
        color: '#22D3EE',
        description: 'Reserved for ecosystem development and partnerships'
    },
    {
        category: 'Team & Advisors',
        percentage: 15,
        color: '#F59E0B',
        description: 'Vested over time with performance milestones'
    },
    {
        category: 'Liquidity',
        percentage: 10,
        color: '#10B981',
        description: 'Initial liquidity and market making'
    },
    {
        category: 'Reserve',
        percentage: 10,
        color: '#EF4444',
        description: 'Emergency fund and future opportunities'
    }
];

export default function Tokenomics() {
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
                        Tokenomics
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        {/* TODO: Replace with actual whitepaper content */}
                        The $NQY token distribution is designed to incentivize community participation,
                        ensure long-term sustainability, and align all stakeholders&apos; interests.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Donut Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                            <PieChart className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-6">Token Distribution</h3>

                            {/* Simple donut chart visualization */}
                            <div className="relative w-64 h-64 mx-auto mb-6">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {tokenomicsData.map((item, index) => {
                                        const previousPercentages = tokenomicsData
                                            .slice(0, index)
                                            .reduce((acc, curr) => acc + curr.percentage, 0);
                                        const startAngle = (previousPercentages / 100) * 360;
                                        const endAngle = ((previousPercentages + item.percentage) / 100) * 360;

                                        const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                        const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                        const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                                        const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                                        const largeArcFlag = item.percentage > 50 ? 1 : 0;

                                        return (
                                            <path
                                                key={item.category}
                                                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                                fill={item.color}
                                                className="transition-all duration-300 hover:opacity-80"
                                            />
                                        );
                                    })}
                                    <circle cx="50" cy="50" r="25" fill="#0B0B10" />
                                </svg>

                                {/* Center text */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">100%</div>
                                        <div className="text-sm text-white/60">Total Supply</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Breakdown Table */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h3 className="text-3xl font-bold text-white mb-8">
                            Allocation Details
                        </h3>

                        <div className="space-y-4">
                            {tokenomicsData.map((item, index) => (
                                <motion.div
                                    key={item.category}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-white font-semibold">{item.category}</span>
                                        </div>
                                        <span className="text-white font-bold text-lg">{item.percentage}%</span>
                                    </div>
                                    <p className="text-white/60 text-sm">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Additional info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 1.0 }}
                            className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                        >
                            <div className="flex items-start space-x-3">
                                <Shield className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="text-amber-400 font-semibold mb-2">Important Note</h4>
                                    <p className="text-white/70 text-sm">
                                        Tokenomics are subject to change based on community feedback and market conditions.
                                        Final details will be published in the whitepaper.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Unlock Schedule */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-16"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h3 className="text-3xl font-bold text-white mb-8 text-center">
                            Unlock Schedule
                        </h3>
                        <p className="text-white/70 text-center mb-8 max-w-2xl mx-auto">
                            {/* TODO: Replace with actual whitepaper content */}
                            The token release schedule ensures sustainable growth while maintaining
                            long-term alignment between the team, investors, and community.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <Coins className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                                <h4 className="text-white font-semibold mb-2">Initial Release</h4>
                                <p className="text-white/60 text-sm">TBD at Token Generation Event</p>
                            </div>

                            <div className="text-center p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                                <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                                <h4 className="text-white font-semibold mb-2">Vesting Period</h4>
                                <p className="text-white/60 text-sm">Linear release over 12-24 months</p>
                            </div>

                            <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <h4 className="text-white font-semibold mb-2">Community</h4>
                                <p className="text-white/60 text-sm">Governance voting on future releases</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
