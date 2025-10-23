"use client";

import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuraContext } from "./useAuraContext";
import { usePathname } from "next/navigation";

const AURA_BOT_PROMPT = `You are AuraBot, a persistent, friendly, and proactive AI networking assistant for NetworkQY. You help users with profile understanding, outreach, and networking strategies. Always be concise, actionable, and supportive.`;

export function AuraBotPanel({ onClose }: { onClose: () => void }) {
    // Remove onboarding logic: only use userContext
    const { userContext, auraScore, missions, setMissions } = useAuraContext();
    // Chat state
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: "Hi! I'm AuraBot. How can I help you with your networking today?" },
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isProfilePage = /^\/profile\//.test(pathname || "");
    const profileId = isProfilePage ? (pathname?.split("/profile/")[1]?.split("/")[0] || "") : "";
    const [profileContext, setProfileContext] = useState<{ name?: string; industry?: string }>({});
    const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
    const [outreachStatus, setOutreachStatus] = useState<string>("");
    const [outreachHistory, setOutreachHistory] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [sendingOutreach, setSendingOutreach] = useState(false);

    // Fetch profile context if on profile page
    useEffect(() => {
        if (isProfilePage && profileId) {
            fetch(`/api/profile/get?userId=${profileId}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data) setProfileContext({ name: data.name, industry: data.industry });
                });
        } else {
            setProfileContext({});
        }
    }, [isProfilePage, profileId]);

    // Compose system prompt with profile context if available
    const systemPromptWithContext = profileContext.name
        ? `${AURA_BOT_PROMPT}\nYou are currently helping the user with the profile of ${profileContext.name}${profileContext.industry ? `, who works in ${profileContext.industry}` : ""}. Use this context for all suggestions and outreach.`
        : AURA_BOT_PROMPT;

    return (
        <div className="fixed inset-0 z-[10001] flex justify-end bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <h2 className="text-lg font-bold">AuraBot</h2>
                    <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {/* AuraQY Score & Missions */}
                <div className="px-6 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold text-purple-700 dark:text-purple-200 text-sm">AuraQY Score</span>
                        <span className="text-lg font-bold text-purple-900 dark:text-purple-100 bg-purple-200 dark:bg-purple-800 rounded-full px-3 py-1 shadow">{auraScore}</span>
                        <div className="flex-1 h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${auraScore}%` }} />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Weekly Missions</span>
                        <ul className="mt-1 space-y-1">
                            {missions.map(mission => (
                                <li key={mission.id} className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={mission.completed}
                                        onChange={() => {
                                            // Toggle completion locally (for demo)
                                            setMissions(missions.map(m => m.id === mission.id ? { ...m, completed: !m.completed } : m));
                                        }}
                                        className="accent-purple-600 w-4 h-4 rounded"
                                    />
                                    <span className={mission.completed ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}>{mission.title}</span>
                                    <span className="text-xs text-gray-400 ml-2">{mission.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Outreach UI */}
                {isProfilePage && profileContext.name && (
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-purple-50 dark:bg-purple-900/20">
                        {!outreachMessage ? (
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 disabled:opacity-50"
                                disabled={generating}
                                onClick={async () => {
                                    setGenerating(true);
                                    setOutreachStatus("");
                                    try {
                                        const res = await fetch("/api/outreach/generate", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ profile: profileContext, userContext }),
                                        });
                                        const data = await res.json();
                                        setOutreachMessage(data.message);
                                    } catch {
                                        setOutreachStatus("Failed to generate message.");
                                    } finally {
                                        setGenerating(false);
                                    }
                                }}
                            >
                                {generating ? "Generating..." : `Generate Outreach Message for ${profileContext.name}`}
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white">
                                    {outreachMessage}
                                </div>
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 disabled:opacity-50"
                                    disabled={sendingOutreach}
                                    onClick={async () => {
                                        setSendingOutreach(true);
                                        setOutreachStatus("");
                                        try {
                                            // Mock send via DM
                                            await fetch("/api/outreach/send", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ message: outreachMessage, recipient: profileContext.name, method: "DM" }),
                                            });
                                            // Log outreach
                                            await fetch("/api/outreach/log", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ message: outreachMessage, recipient: profileContext.name, status: "sent" }),
                                            });
                                            setOutreachStatus("Message sent!");
                                            setOutreachHistory((h) => [
                                                { message: outreachMessage, recipient: profileContext.name, status: "sent", timestamp: Date.now() },
                                                ...h,
                                            ]);
                                            setOutreachMessage(null);
                                        } catch {
                                            setOutreachStatus("Failed to send message.");
                                        } finally {
                                            setSendingOutreach(false);
                                        }
                                    }}
                                >
                                    {sendingOutreach ? "Sending..." : "Send Message"}
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white text-xs ml-2"
                                    onClick={() => setOutreachMessage(null)}
                                >
                                    Cancel
                                </button>
                                {outreachStatus && <div className="text-xs text-green-600 dark:text-green-400 mt-1">{outreachStatus}</div>}
                            </div>
                        )}
                    </div>
                )}
                {/* Outreach History */}
                {isProfilePage && outreachHistory.length > 0 && (
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-200 mb-2">Outreach History</h4>
                        <ul className="space-y-1 text-xs">
                            {outreachHistory.map((log) => (
                                <li key={log.timestamp} className="flex items-center gap-2">
                                    <span className="font-semibold">{log.recipient}:</span>
                                    <span className="truncate">{log.message}</span>
                                    <span className="ml-auto text-green-600 dark:text-green-400">{log.status}</span>
                                    <span className="text-gray-400 ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* Context-aware prompts */}
                {isProfilePage && profileContext.name && (
                    <div className="p-4 flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-purple-50 dark:bg-purple-900/20">
                        <button type="button" className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow hover:bg-purple-700" onClick={() => setInput(`Generate an outreach message for ${profileContext.name}${profileContext.industry ? ` (${profileContext.industry})` : ""}.`)}>
                            Generate outreach message for {profileContext.name}
                        </button>
                        <button type="button" className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-700" onClick={() => setInput(`How can ${profileContext.name} help me professionally?`)}>
                            How can {profileContext.name} help me?
                        </button>
                        <button type="button" className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold shadow hover:bg-green-700" onClick={() => setInput(`Add ${profileContext.name} to a follow-up sequence.`)}>
                            Add {profileContext.name} to follow-up sequence
                        </button>
                    </div>
                )}
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-md ${msg.role === "user" ? "ml-auto bg-purple-100 dark:bg-purple-900/40 text-right" : "bg-blue-50 dark:bg-blue-900/30 text-left"}`}
                        >
                            {msg.content}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                {/* Input */}
                <form
                    className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-slate-800 flex gap-2"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!input.trim()) return;
                        setError("");
                        setSending(true);
                        setMessages((msgs) => [...msgs, { role: "user", content: input }]);
                        setInput("");
                        try {
                            const res = await fetch("/api/chat", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    messages: [
                                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                                        { role: "user", content: input },
                                    ],
                                    selectedChatModel: "gpt-3.5-turbo", // or your default
                                    systemPrompt: systemPromptWithContext,
                                }),
                                credentials: "include",
                            });
                            if (!res.ok) throw new Error("Failed to get response");
                            const data = await res.json();
                            setMessages((msgs) => [...msgs, { role: "assistant", content: data.reply || "(No response)" }]);
                            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                        } catch (err) {
                            setError("Something went wrong. Please try again.");
                        } finally {
                            setSending(false);
                        }
                    }}
                >
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 disabled:opacity-50"
                        disabled={sending || !input.trim()}
                    >
                        {sending ? "..." : "Send"}
                    </button>
                </form>
                {error && <div className="text-red-500 text-center text-sm pb-2">{error}</div>}
            </div>
            {/* Overlay click closes panel */}
            <div className="flex-1" onClick={onClose} />
        </div>
    );
} 