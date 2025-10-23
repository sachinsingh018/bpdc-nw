"use client";
import { useEffect, useRef, useState } from 'react';

const pulse = [
    'Sana met Arjun',
    'Booth A hit 100+ visitors',
    'AI Panel started',
    'Concierge answered 50th question',
    'Networking session trending',
    'Maya bookmarked Tom',
];

export default function PulseBar() {
    const [ticker, setTicker] = useState(pulse);
    const tickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setTicker((prev) => {
                const [first, ...rest] = prev;
                return [...rest, first];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-purple-700 text-white rounded-full shadow-lg px-6 py-2 flex gap-6 items-center z-50 text-xs overflow-hidden min-w-[300px] max-w-[90vw]">
            <div
                ref={tickerRef}
                className="flex gap-8 animate-none transition-transform duration-700"
                style={{ willChange: 'transform' }}
            >
                {ticker.map((p) => (
                    <span key={p} className="whitespace-nowrap">{p}</span>
                ))}
            </div>
        </div>
    );
} 