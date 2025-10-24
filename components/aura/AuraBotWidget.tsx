"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AuraBotPanel } from "./AuraBotPanel";

export function AuraBotWidget() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <button
                aria-label="Open AuraBot"
                onClick={() => setOpen(true)}
                className="fixed bottom-4 right-4 z-[10000] p-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl hover:scale-105 transition-transform duration-200 focus:outline-none border-4 border-white dark:border-slate-900"
                style={{ boxShadow: "0 8px 32px rgba(80,0,180,0.18)" }}
            >
                <MessageCircle className="size-7" />
                {/* Pulse animation for new recs (optional) */}
                {/* <span className="absolute top-0 right-0 size-3 bg-pink-500 rounded-full animate-pulse" /> */}
            </button>
            {/* Side Panel */}
            {open && <AuraBotPanel onClose={() => setOpen(false)} />}
        </>
    );
} 