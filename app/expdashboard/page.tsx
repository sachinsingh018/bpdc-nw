'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHouse,
    FaUsers,
    FaChartLine,
    FaBrain,
    FaCalendar,
    FaGear,
    FaBars,
    FaXmark,
    FaMagnifyingGlass,
    FaBell,
    FaUser,
    FaEye,
    FaHeart,
    FaArrowUp,
    FaArrowDown,
    FaChevronRight,
    FaVideo,
    FaMessage,
    FaGlobe,
    FaStar,
    FaFilter,

} from 'react-icons/fa6';

// Import your custom Footer component (Header is no longer imported here)
import { Footer } from '../../components/Footer';

// Define static data outside the component to prevent re-creation on re-renders
const sidebarItems = [
    { icon: <FaHouse />, label: 'Dashboard', active: true },
    { icon: <FaUsers />, label: 'Connections' },
    { icon: <FaChartLine />, label: 'Analytics' },
    { icon: <FaBrain />, label: 'AI Insights' },
    { icon: <FaCalendar />, label: 'Schedule' },
    { icon: <FaUsers />, label: 'Network' },
    { icon: <FaGear />, label: 'Settings' },
    // Adding the global navigation links here for a consolidated experience
    { icon: <FaUser />, label: 'About' }, // Placeholder icon
    { icon: <FaMessage />, label: 'FAQs' }, // Placeholder icon
    { icon: <FaBrain />, label: 'Chatbot' }, // Placeholder icon
];

const statsCards = [
    {
        title: 'Total Connections',
        value: '2,847',
        change: '+12.5%',
        trend: 'up',
        icon: <FaUsers />,
        color: 'purple'
    },
    {
        title: 'Profile Views',
        value: '18,432',
        change: '+8.2%',
        trend: 'up',
        icon: <FaEye />,
        color: 'violet'
    },
    {
        title: 'Network Score',
        value: '94.8',
        change: '+2.1%',
        trend: 'up',
        icon: <FaChartLine />,
        color: 'fuchsia'
    },
    {
        title: 'Engagement Rate',
        value: '87.3%',
        change: '-1.4%',
        trend: 'down',
        icon: <FaHeart />,
        color: 'pink'
    },
];

const quickActions = [
    {
        title: 'Start Video Call',
        description: 'Connect with your network instantly',
        icon: <FaVideo />,
        color: 'from-purple-600 to-purple-800'
    },
    {
        title: 'Schedule Meeting',
        description: 'Book time with connections',
        icon: <FaCalendar />,
        color: 'from-violet-600 to-violet-800'
    },
    {
        title: 'Send Message',
        description: 'Reach out to your contacts',
        icon: <FaMessage />,
        color: 'from-fuchsia-600 to-fuchsia-800'
    },
    {
        title: 'Explore Network',
        description: 'Discover new opportunities',
        icon: <FaGlobe />,
        color: 'from-pink-600 to-pink-800'
    },
];

const recentActivity = [
    {
        user: 'Sarah Chen',
        action: 'viewed your profile',
        time: '2 minutes ago',
        avatar: 'SC',
        type: 'view'
    },
    {
        user: 'Marcus Rodriguez',
        action: 'sent a connection request',
        time: '15 minutes ago',
        avatar: 'MR',
        type: 'connection'
    },
    {
        user: 'Dr. Emily Watson',
        action: 'liked your recent post',
        time: '1 hour ago',
        avatar: 'EW',
        type: 'engagement'
    },
    {
        user: 'Alex Thompson',
        action: 'scheduled a meeting',
        time: '2 hours ago',
        avatar: 'AT',
        type: 'meeting'
    },
    {
        user: 'Lisa Park',
        action: 'shared your content',
        time: '3 hours ago',
        avatar: 'LP',
        type: 'share'
    },
];

const topConnections = [
    { name: 'Jennifer Kim', title: 'VP of Engineering', company: 'TechCorp', avatar: 'JK', score: 98 },
    { name: 'Robert Chen', title: 'Product Director', company: 'InnovateLab', avatar: 'RC', score: 95 },
    { name: 'Maria Garcia', title: 'Design Lead', company: 'CreativeHub', avatar: 'MG', score: 92 },
    { name: 'David Kumar', title: 'Data Scientist', company: 'AI Solutions', avatar: 'DK', score: 89 },
];

export default function ProfessionalDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen transition-all duration-500 bg-black text-white">

            {/* Animated Background: Always Dark */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-900/20 via-violet-900/15 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-fuchsia-900/15 via-purple-900/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-800/10 to-purple-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="flex relative z-10"> {/* Removed pt-24 here */}
                {/* Sidebar */}
                <motion.aside
                    className={`fixed left-0 top-0 z-50 h-full w-80 lg:w-72 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } lg:translate-x-0 lg:static bg-black/90 border-purple-800/30 border-r backdrop-blur-xl`}
                >
                    <div className="flex flex-col h-full">
                        {/* --- NetworkQY Branding in Sidebar --- */}
                        <div className="p-6 border-b border-purple-800/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-xl font-bold text-white">N</span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                            Networkqy
                                        </h1>
                                        <p className="text-purple-300 text-sm">
                                            AI-Powered Networking
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="lg:hidden p-2 rounded-xl hover:bg-purple-900/30"
                                >
                                    <FaXmark className="text-purple-300" />
                                </button>
                            </div>
                        </div>
                        {/* --- End NetworkQY Branding --- */}

                        {/* User Profile */}
                        <div className="p-6 border-b border-purple-800/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-lg font-semibold text-white">AK</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-100">
                                        Aarav Kumar
                                    </h3>
                                    <p className="text-purple-300 text-sm">
                                        Senior Product Manager
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <FaStar className="text-yellow-400 text-xs" />
                                        <span className="text-purple-400 text-xs">
                                            4.9 Rating
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation (now includes global links) */}
                        <nav className="flex-1 p-4 space-y-2">
                            {sidebarItems.map((item, index) => (
                                <motion.button
                                    key={index}
                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${item.active
                                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg'
                                        : 'hover:bg-purple-900/30 text-purple-200 hover:text-white'
                                        }`}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </motion.button>
                            ))}
                        </nav>

                        {/* Upgrade Card */}
                        <div className="p-4">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/50 to-fuchsia-900/50 border border-purple-700/50">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                        <FaStar className="text-white text-lg" />
                                    </div>
                                    <h4 className="font-semibold mb-2 text-purple-100">
                                        Upgrade to Pro
                                    </h4>
                                    <p className="text-purple-300 text-xs mb-3">
                                        Unlock advanced networking features
                                    </p>
                                    <button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-medium py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                                        Upgrade Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.aside>

                {/* Main Content Area */}
                <div className="flex-1 min-h-screen">
                    {/* Dashboard specific Header (search, notifications, user profile circle) */}
                    <header className="sticky top-0 z-30 bg-black/80 border-purple-800/30 border-b backdrop-blur-xl">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-3 rounded-xl hover:bg-purple-900/30"
                                >
                                    <FaBars className="text-purple-300" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-purple-100">
                                        Dashboard
                                    </h1>
                                    <p className="text-purple-300">
                                        Welcome back, Aarav! 👋
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="relative hidden md:block">
                                    <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                                    <input
                                        type="text"
                                        placeholder="Search network..."
                                        className="pl-12 pr-4 py-3 w-80 rounded-xl border transition-all duration-200 bg-purple-950/50 border-purple-800/50 text-purple-100 placeholder-purple-400 focus:bg-purple-950/70 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        className="p-3 rounded-xl border transition-all duration-200 bg-purple-950/50 border-purple-800/50 hover:bg-purple-900/50 text-purple-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaFilter />
                                    </motion.button>

                                    <motion.button
                                        className="relative p-3 rounded-xl border transition-all duration-200 bg-purple-950/50 border-purple-800/50 hover:bg-purple-900/50 text-purple-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaBell />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full" />
                                    </motion.button>

                                    <motion.div
                                        className="w-12 h-12 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaUser className="text-white text-lg" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-6 space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {statsCards.map((card, index) => (
                                <motion.div
                                    key={index}
                                    className="p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 bg-purple-950/40 border-purple-800/50 hover:bg-purple-950/60"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br from-${card.color}-500/20 to-${card.color}-600/20`}>
                                            <div className={`text-${card.color}-500 text-xl`}>
                                                {card.icon}
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${card.trend === 'up'
                                            ? 'text-emerald-500 bg-emerald-500/10'
                                            : 'text-red-500 bg-red-500/10'
                                            }`}>
                                            {card.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                                            {card.change}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold mb-1 text-purple-100">
                                            {card.value}
                                        </div>
                                        <div className="text-sm text-purple-300">
                                            {card.title}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Quick Actions */}
                            <div className="xl:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-purple-100">
                                        Quick Actions
                                    </h2>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {quickActions.map((action, index) => (
                                        <motion.div
                                            key={index}
                                            className="group p-6 rounded-2xl border backdrop-blur-sm cursor-pointer transition-all duration-300 bg-purple-950/40 border-purple-800/50 hover:bg-purple-950/60"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (index + 4) * 0.1 }}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                                                    <div className="text-white text-xl">
                                                        {action.icon}
                                                    </div>
                                                </div>
                                                <FaChevronRight className="transition-all duration-300 group-hover:translate-x-1 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-2 text-purple-100">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-purple-300">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Network Insights */}
                                <div className="p-6 rounded-2xl border backdrop-blur-sm bg-purple-950/40 border-purple-800/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-purple-100">
                                            Network Growth
                                        </h3>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-600 text-white">
                                                7D
                                            </button>
                                            <button className="px-3 py-1 rounded-lg text-xs font-medium text-purple-300 hover:bg-purple-900/30">
                                                30D
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-purple-300">
                                                Connection Requests
                                            </span>
                                            <span className="font-semibold text-purple-100">
                                                +24 this week
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-purple-300">
                                                Profile Views
                                            </span>
                                            <span className="font-semibold text-purple-100">
                                                +1,247 this week
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-purple-300">
                                                Messages Sent
                                            </span>
                                            <span className="font-semibold text-purple-100">
                                                +89 this week
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Content */}
                            <div className="space-y-6">
                                {/* Recent Activity */}
                                <div className="p-6 rounded-2xl border backdrop-blur-sm bg-purple-950/40 border-purple-800/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-purple-100">
                                            Recent Activity
                                        </h3>
                                        <button className="text-xs text-purple-400">
                                            View All
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {recentActivity.map((activity, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center gap-3"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-semibold">
                                                        {activity.avatar}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-purple-200">
                                                        <span className="font-medium">{activity.user}</span>
                                                        {' '}
                                                        <span className="text-purple-300">
                                                            {activity.action}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-purple-400">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Connections */}
                                <div className="p-6 rounded-2xl border backdrop-blur-sm bg-purple-950/40 border-purple-800/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-purple-100">
                                            Top Connections
                                        </h3>
                                        <button className="text-xs text-purple-400">
                                            View All
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {topConnections.map((connection, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center gap-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-semibold">
                                                        {connection.avatar}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-purple-200">
                                                        {connection.name}
                                                    </h4>
                                                    <p className="text-xs text-purple-400">
                                                        {connection.title} at {connection.company}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FaStar className="text-yellow-400 text-sm" />
                                                    <span className="text-sm font-semibold text-purple-100">
                                                        {connection.score}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* === FOOTER COMPONENT === */}
            <Footer />
            {/* === END FOOTER COMPONENT === */}
        </div>
    );
}