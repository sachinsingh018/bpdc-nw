'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { TOKEN_CONFIG } from '../config';

const faqData = [
    {
        question: 'Is $NQY a security?',
        answer: 'No, $NQY is a utility token designed to provide access to Networkqy platform features. It is not intended as an investment vehicle and should not be considered financial advice.',
        category: 'Legal'
    },
    {
        question: 'Which chain does $NQY launch on?',
        answer: '$NQY will launch on Solana initially, with plans for multi-chain expansion in the future. Solana was chosen for its high performance, low fees, and growing DeFi ecosystem.',
        category: 'Technical'
    },
    {
        question: 'How does AuraQY relate to $NQY?',
        answer: 'AuraQY is the trust layer that determines user reputation and access levels. Higher AuraQY scores unlock increased $NQY rewards caps and priority access to premium features.',
        category: 'Platform'
    },
    {
        question: 'Will there be airdrops?',
        answer: 'Airdrop details will be announced closer to launch. Priority will be given to early Networkqy users, active contributors, and community members. Follow our official channels for updates.',
        category: 'Distribution'
    },
    {
        question: 'Where can I read the whitepaper?',
        answer: 'The whitepaper is available at /token/whitepaper.pdf and contains comprehensive details about tokenomics, utility, and technical specifications. It will be updated as the project evolves.',
        category: 'Documentation'
    },
    {
        question: 'What is the total supply of $NQY?',
        answer: 'The total supply will be determined at the Token Generation Event (TGE). Details will be published in the whitepaper and announced through official channels.',
        category: 'Tokenomics'
    },
    {
        question: 'How can I earn $NQY?',
        answer: 'Users can earn $NQY through active participation, helpful contributions, community engagement, and by building their AuraQY reputation score. Specific earning mechanisms will be detailed in the whitepaper.',
        category: 'Earning'
    },
    {
        question: 'When will $NQY be listed on exchanges?',
        answer: 'Initial DEX listing will occur shortly after the TGE. Centralized exchange listings will follow based on community demand and exchange requirements.',
        category: 'Trading'
    }
];

export default function FAQ() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        Get answers to common questions about ${TOKEN_CONFIG.symbol} and the Networkqy ecosystem
                    </p>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <div className="space-y-4">
                        {faqData.map((faq, index) => (
                            <motion.div
                                key={`faq-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="size-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0 mt-1">
                                            <HelpCircle className="size-4 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {faq.question}
                                            </h3>
                                            <span className="inline-block px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                                                {faq.category}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`size-5 text-white/60 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openIndex === index ? 'auto' : 0,
                                        opacity: openIndex === index ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-6 pb-6">
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-white/70 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Additional help section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Still Have Questions?
                        </h3>
                        <p className="text-white/70 mb-6">
                            Can&apos;t find what you&apos;re looking for? Join our community channels for direct support.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href={TOKEN_CONFIG.socials.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors duration-200"
                            >
                                Follow on X
                            </a>
                            <a
                                href={TOKEN_CONFIG.socials.telegram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors duration-200"
                            >
                                Join Telegram
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
