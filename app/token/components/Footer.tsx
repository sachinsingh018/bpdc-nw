'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TOKEN_CONFIG } from '../config';
import { ExternalLink, Mail, Twitter, MessageCircle, FileText } from 'lucide-react';

const footerLinks = {
    company: [
        { name: 'About Networkqy', href: '/about' },
        { name: 'Team', href: '/team' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press Kit', href: '/press' }
    ],
    product: [
        { name: 'Platform', href: '/' },
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'API', href: '/api' }
    ],
    resources: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Help Center', href: '/help' },
        { name: 'Community', href: '/community' },
        { name: 'Blog', href: '/blog' }
    ],
    legal: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR', href: '/gdpr' }
    ]
};

const socialLinks = [
    {
        name: 'Twitter',
        href: TOKEN_CONFIG.socials.x,
        icon: Twitter,
        color: 'hover:text-blue-400'
    },
    {
        name: 'Telegram',
        href: TOKEN_CONFIG.socials.telegram,
        icon: MessageCircle,
        color: 'hover:text-blue-500'
    },
    {
        name: 'Email',
        href: 'mailto:hello@networkqy.com',
        icon: Mail,
        color: 'hover:text-purple-400'
    }
];

export default function Footer() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10">
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    {/* Main footer content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                        {/* Brand section */}
                        <div className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Networkqy
                                </h3>
                                <p className="text-white/70 mb-6 leading-relaxed">
                                    Building the future of professional networking with AI-powered connections,
                                    reputation systems, and decentralized governance.
                                </p>

                                {/* Social links */}
                                <div className="flex space-x-4">
                                    {socialLinks.map((social, index) => (
                                        <motion.a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                            whileHover={{ scale: 1.1 }}
                                            className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 transition-all duration-200 ${social.color}`}
                                        >
                                            <social.icon className="w-5 h-5" />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Footer links */}
                        {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                            <div key={category}>
                                <motion.h4
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 + categoryIndex * 0.1 }}
                                    className="text-white font-semibold mb-4 capitalize"
                                >
                                    {category}
                                </motion.h4>
                                <ul className="space-y-3">
                                    {links.map((link, linkIndex) => (
                                        <motion.li
                                            key={link.name}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ duration: 0.4, delay: 0.3 + categoryIndex * 0.1 + linkIndex * 0.05 }}
                                        >
                                            <a
                                                href={link.href}
                                                className="text-white/60 hover:text-white transition-colors duration-200 flex items-center group"
                                            >
                                                {link.name}
                                                <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                            </a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="pt-8 border-t border-white/10"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="text-white/60 text-sm">
                                © 2024 Networkqy. All rights reserved.
                            </div>

                            <div className="flex items-center space-x-6 text-sm">
                                <a href="/token/whitepaper.pdf" className="text-white/60 hover:text-white transition-colors duration-200 flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Whitepaper
                                </a>
                                <a href="/status" className="text-white/60 hover:text-white transition-colors duration-200">
                                    Status
                                </a>
                                <a href="/security" className="text-white/60 hover:text-white transition-colors duration-200">
                                    Security
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </footer>
    );
}
