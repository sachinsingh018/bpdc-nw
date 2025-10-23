'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle, Clock, Target, Rocket } from 'lucide-react';
import { TOKEN_CONFIG } from '../config';

const roadmapMilestones = [
    {
        phase: 'Phase 0',
        title: 'Platform Launch',
        description: 'Networkqy platform goes live with core networking features',
        status: 'completed',
        icon: CheckCircle,
        color: 'from-green-400 to-green-600'
    },
    {
        phase: 'Phase 1',
        title: 'Token Launch',
        description: '$NQY token generation event and initial distribution',
        status: 'current',
        icon: Rocket,
        color: 'from-purple-400 to-purple-600'
    },
    {
        phase: 'Phase 2',
        title: 'AuraQY Integration',
        description: 'Trust layer implementation and reputation system',
        status: 'upcoming',
        icon: Target,
        color: 'from-cyan-400 to-cyan-600'
    },
    {
        phase: 'Phase 3',
        title: 'Governance Launch',
        description: 'Community governance and DAO structure',
        status: 'upcoming',
        icon: Clock,
        color: 'from-amber-400 to-amber-600'
    }
];

export default function Roadmap() {
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
                        Development Roadmap
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        Our journey to building the future of professional networking
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-1/2 transform -translate-x-px w-0.5 h-full bg-gradient-to-b from-purple-400 via-cyan-400 to-amber-400" />

                    {/* Milestones */}
                    <div className="space-y-16">
                        {roadmapMilestones.map((milestone, index) => (
                            <motion.div
                                key={milestone.phase}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                                    }`}
                            >
                                {/* Timeline dot */}
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full border-4 border-[#0B0B10] z-10" />

                                {/* Content */}
                                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                                    >
                                        {/* Status badge */}
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${milestone.status === 'completed'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : milestone.status === 'current'
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            }`}>
                                            {milestone.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {milestone.status === 'current' && <Rocket className="w-3 h-3 mr-1" />}
                                            {milestone.status === 'upcoming' && <Clock className="w-3 h-3 mr-1" />}
                                            {milestone.status === 'completed' ? 'Completed' : milestone.status === 'current' ? 'In Progress' : 'Upcoming'}
                                        </div>

                                        {/* Phase and title */}
                                        <h3 className="text-lg font-semibold text-white/60 mb-1">
                                            {milestone.phase}
                                        </h3>
                                        <h4 className="text-2xl font-bold text-white mb-3">
                                            {milestone.title}
                                        </h4>

                                        {/* Description */}
                                        <p className="text-white/70 leading-relaxed">
                                            {milestone.description}
                                        </p>

                                        {/* Icon */}
                                        <div className={`w-12 h-12 bg-gradient-to-r ${milestone.color} rounded-xl flex items-center justify-center mt-4`}>
                                            <milestone.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Additional roadmap info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Community-Driven Development
                        </h3>
                        <p className="text-white/70 max-w-2xl mx-auto">
                            Our roadmap is flexible and adapts to community feedback and market conditions.
                            Join our community to help shape the future of Networkqy.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
