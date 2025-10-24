"use client";
import React, { useState, useEffect } from "react";
import { FaRobot } from "react-icons/fa6";
import { FaBriefcase } from "react-icons/fa6";
import { FaUserGraduate } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa6";
import { FaCalendar } from "react-icons/fa6";
import { FaCircleCheck } from "react-icons/fa6";
import { FaBolt } from "react-icons/fa6";
import { FaSchool } from "react-icons/fa6";
import CountUp from "react-countup";

const stats = [
    { label: "Avg. 60% students miss campus updates", value: 60, suffix: "%", icon: <FaBolt className="text-blue-500 text-2xl" /> },
    { label: "90% alumni disengaged post-graduation", value: 90, suffix: "%", icon: <FaUserGraduate className="text-blue-500 text-2xl" /> },
    { label: "70% jobs never reach students", value: 70, suffix: "%", icon: <FaBriefcase className="text-blue-500 text-2xl" /> },
    { label: "Communities scattered across platforms", value: null, icon: <FaUsers className="text-blue-500 text-2xl" /> },
];

const features = [
    { name: "AI Chatbot", icon: <FaRobot className="text-blue-500 text-2xl" />, desc: "24/7 answers for students, staff, and alumni" },
    { name: "Job Board", icon: <FaBriefcase className="text-blue-500 text-2xl" />, desc: "Curated jobs, internships, and campus placements" },
    { name: "Alumni Search", icon: <FaUserGraduate className="text-blue-500 text-2xl" />, desc: "Find and connect with alumni by batch, company, or location" },
    { name: "Communities", icon: <FaUsers className="text-blue-500 text-2xl" />, desc: "Interest-based groups, clubs, and societies" },
    { name: "Event Feed", icon: <FaCalendar className="text-blue-500 text-2xl" />, desc: "All campus events in one place" },
];

const pricing = [
    {
        title: "Free Pilot",
        price: "$0",
        features: ["Up to 200 users", "Basic chatbot", "Limited job board", "Email support"],
        accent: "border-blue-400",
    },
    {
        title: "Monthly License",
        price: "$299/mo",
        features: ["Unlimited users", "Full feature access", "Custom branding", "Priority support"],
        accent: "border-blue-600",
    },
    {
        title: "Add-ons",
        price: "Custom",
        features: ["Advanced analytics", "API integrations", "Dedicated CSM"],
        accent: "border-blue-300",
    },
];

const testimonials = [
    {
        name: "Ayesha, 2023 Graduate",
        text: "Before NetworkQY, I missed out on campus events and job opportunities. Now, I get instant updates, connect with alumni, and feel part of the community again.",
        role: "Student",
    },
    {
        name: "Rahul, Alumni Relations Officer",
        text: "NetworkQY has made it so much easier to keep our alumni engaged and informed. The AI assistant saves us hours every week!",
        role: "Admin",
    },
    {
        name: "Priya, Final Year Student",
        text: "The job board helped me land my first internship. I love how everything is in one place!",
        role: "Student",
    },
];

export default function UniversityPage() {
    return (
        <main className="bg-gray-200 min-h-screen font-sans">
            {/* Hero Section */}
            <section className="relative bg-[#E5E7EB] py-16 px-4 text-center overflow-hidden">
                {/* SVG Background */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ zIndex: 0 }}>
                    <path fill="#3B82F6" fillOpacity="0.08" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
                </svg>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A8A] mb-4 flex justify-center items-center gap-2"><FaSchool className="inline text-blue-500" /> NetworkQY Campus Assistant</h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">Empower your campus with AI-driven engagement, jobs, and alumni connections—all in one place.</p>
                    <a href="#pricing" className="inline-block bg-[#3B82F6] text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Start a Free Pilot</a>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-12 px-4 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                            {stat.icon}
                            {stat.value !== null ? (
                                <span className="mt-3 text-3xl font-bold text-[#1E3A8A]">
                                    <CountUp end={stat.value} duration={2} />{stat.suffix}
                                </span>
                            ) : null}
                            <span className="mt-1 text-center text-gray-800 font-medium">{stat.label.replace(/^(Avg\. \d+%|\d+%|\d+% )/, "")}</span>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4">
                    <span className="text-xl md:text-2xl font-bold text-[#1E3A8A]">Campus engagement is broken. Let’s fix it together.</span>
                </div>
            </section>

            {/* Solution Section */}
            <section className="py-12 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">Meet the Campus Assistant</h2>
                    <p className="text-lg text-gray-700 mb-8">One platform for students, alumni, and staff. AI-powered, mobile-friendly, and built for your university’s needs.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div key={feature.name} className="bg-[#E5E7EB] rounded-xl p-6 flex flex-col items-center shadow hover:shadow-lg transition">
                                {feature.icon}
                                <h3 className="mt-3 text-lg font-semibold text-[#1E3A8A]">{feature.name}</h3>
                                <p className="text-gray-700 text-sm mt-2 text-center">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features List */}
            <section className="py-12 px-4 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Features at a Glance</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3 bg-white rounded-lg shadow p-4">
                            {feature.icon}
                            <span className="font-medium text-gray-800">{feature.name}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Case Study Section */}
            <section className="py-12 px-4 bg-[#E5E7EB]">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-[#1E3A8A] mb-4">Case Study: Ayesha’s Story</h2>
                    <p className="text-gray-700 mb-4">“Before NetworkQY, I missed out on campus events and job opportunities. Now, I get instant updates, connect with alumni, and feel part of the community again.”</p>
                    <span className="block text-sm text-gray-500">— Ayesha, 2023 Graduate</span>
                </div>
            </section>

            {/* Testimonials Carousel */}
            <TestimonialsCarousel />

            {/* Comparison Table */}
            <section className="py-12 px-4 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">AlmaConnect vs NetworkQY</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-xl shadow text-sm">
                        <thead>
                            <tr className="bg-[#1E3A8A] text-white">
                                <th className="py-3 px-4 text-left">Feature</th>
                                <th className="py-3 px-4 text-left">AlmaConnect</th>
                                <th className="py-3 px-4 text-left">NetworkQY</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-3 px-4">AI Chatbot</td>
                                <td className="py-3 px-4">No</td>
                                <td className="py-3 px-4 text-blue-600 font-bold">Yes</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4">Job Board</td>
                                <td className="py-3 px-4">Limited</td>
                                <td className="py-3 px-4 text-blue-600 font-bold">Curated + Campus</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4">Alumni Search</td>
                                <td className="py-3 px-4">Basic</td>
                                <td className="py-3 px-4 text-blue-600 font-bold">Advanced</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-4">Communities</td>
                                <td className="py-3 px-4">Clubs only</td>
                                <td className="py-3 px-4 text-blue-600 font-bold">Clubs + Interest Groups</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4">Event Feed</td>
                                <td className="py-3 px-4">No</td>
                                <td className="py-3 px-4 text-blue-600 font-bold">Yes</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Pricing Cards */}
            <section id="pricing" className="py-12 px-4 bg-white">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Pricing</h2>
                <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
                    {pricing.map((plan) => (
                        <div key={plan.title} className={`flex-1 bg-[#E5E7EB] border-2 ${plan.accent} rounded-xl p-8 shadow flex flex-col items-center mb-4 md:mb-0`}>
                            <h3 className="text-xl font-bold text-[#1E3A8A] mb-2">{plan.title}</h3>
                            <div className="text-3xl font-bold text-[#3B82F6] mb-4">{plan.price}</div>
                            <ul className="mb-6 space-y-2">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-gray-800"><FaCircleCheck className="text-blue-400" /> {f}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 px-4 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6 text-center">Frequently Asked Questions</h2>
                <FAQAccordion />
            </section>

            {/* Final CTA & Contact */}
            <section className="py-12 px-4 bg-[#E5E7EB] text-center">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-4">Ready to transform your campus?</h2>
                <a href="https://calendly.com/yatharthkher/15min" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#3B82F6] text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition mb-4">Schedule a Demo</a>
                <div className="mt-6 text-gray-700">
                    <div>Contact: <span className="font-semibold">Yatharth Kher</span></div>
                    <div>Email: <a href="mailto:yatharth.kher@networkqy.com" className="text-blue-600 underline">yatharth.kher@networkqy.com</a></div>
                    <div>Phone: <a href="tel:+971553927977" className="text-blue-600 underline">+971 55 392 7977</a></div>
                </div>
            </section>
        </main>
    );
}

function TestimonialsCarousel() {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
        return () => clearInterval(timer);
    }, []);
    const t = testimonials[index];
    return (
        <section className="py-12 px-4 bg-white">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-[#1E3A8A] mb-6">What Our Users Say</h2>
                <div className="relative">
                    <div className="transition-all duration-500 ease-in-out">
                        <p className="text-lg text-gray-700 italic mb-4">“{t.text}”</p>
                        <span className="block text-sm text-[#1E3A8A] font-semibold">{t.name}</span>
                        <span className="block text-xs text-gray-500">{t.role}</span>
                    </div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                    {testimonials.map((t, i) => (
                        <button
                            key={t.name}
                            type="button"
                            className={`size-3 rounded-full ${i === index ? "bg-blue-500" : "bg-gray-300"}`}
                            onClick={() => setIndex(i)}
                            aria-label={`Show testimonial ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

const faqs = [
    {
        q: "How long does it take to set up NetworkQY for our campus?",
        a: "Most universities are up and running in under a week. Our team will guide you through every step.",
    },
    {
        q: "Is student and alumni data secure?",
        a: "Absolutely. We use industry-standard encryption and never share your data with third parties.",
    },
    {
        q: "Can we customize the platform for our university’s branding?",
        a: "Yes! The monthly license includes custom branding and domain options.",
    },
    {
        q: "What support do you offer?",
        a: "We provide email and priority support, plus a dedicated customer success manager for enterprise clients.",
    },
    {
        q: "Can we try before committing?",
        a: "Yes, you can start with a free pilot for up to 200 users.",
    },
];

function FAQAccordion() {
    const [open, setOpen] = useState<number | null>(null);
    return (
        <div className="space-y-4">
            {faqs.map((faq, i) => (
                <div key={faq.q} className="border border-gray-300 rounded-lg bg-white">
                    <button
                        type="button"
                        className="w-full text-left px-6 py-4 font-semibold text-[#1E3A8A] flex justify-between items-center focus:outline-none"
                        onClick={() => setOpen(open === i ? null : i)}
                        aria-expanded={open === i}
                        aria-controls={`faq-${i}`}
                    >
                        {faq.q}
                        <span className={`ml-2 transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {open === i && (
                        <div id={`faq-${i}`} className="px-6 pb-4 text-gray-700 animate-fade-in">
                            {faq.a}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
} 