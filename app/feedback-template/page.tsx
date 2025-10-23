"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function FeedbackTemplatePage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        rating: '5',
        comments: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 px-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-white/20 text-center">
                    <h1 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-300">Thank you for your feedback!</h1>
                    <p className="text-gray-700 dark:text-gray-200">We appreciate your input and will use it to improve our platform.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-white/20">
                <h1 className="text-2xl font-bold mb-6 text-center text-purple-700 dark:text-purple-300">Feedback Form</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                        <select
                            id="rating"
                            name="rating"
                            value={form.rating}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        >
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Good</option>
                            <option value="3">3 - Average</option>
                            <option value="2">2 - Poor</option>
                            <option value="1">1 - Very Poor</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comments</label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={form.comments}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Your feedback..."
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Submit Feedback</Button>
                </form>
            </div>
        </div>
    );
} 