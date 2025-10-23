"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStatus("success");
                setMessage(
                    "If an account with that email exists, a password reset link will be sent. Please check your inbox."
                );
            } else {
                setStatus("error");
                setMessage("There was a problem. Please try again later.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("There was a problem. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-gray-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-white/20">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Forgot Password</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                        disabled={status === "loading"}
                    >
                        {status === "loading" ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>
                {message && (
                    <div className={`mt-4 text-center text-sm ${status === "success" ? "text-green-600" : "text-red-500"}`}>
                        {message}
                    </div>
                )}
                <div className="mt-6 text-center">
                    <a href="/login" className="text-sm text-purple-600 hover:underline">Back to Sign In</a>
                </div>
            </div>
        </div>
    );
} 