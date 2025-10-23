"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface Mission {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

interface AuraContextType {
    onboardingComplete: boolean;
    setOnboardingComplete: (v: boolean) => void;
    userContext: any;
    setUserContext: (ctx: any) => void;
    auraScore: number;
    setAuraScore: (score: number) => void;
    missions: Mission[];
    setMissions: (missions: Mission[]) => void;
    // Add more context fields as needed
}

const AuraContext = createContext<AuraContextType | undefined>(undefined);

export function AuraProvider({ children }: { children: ReactNode }) {
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [userContext, setUserContext] = useState<any>(null);
    const [auraScore, setAuraScore] = useState(0);
    const [missions, setMissions] = useState<Mission[]>([]);

    useEffect(() => {
        // Try to fetch user context from backend
        fetch('/api/user/context')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && Object.keys(data).length > 0) {
                    setUserContext(data);
                    setOnboardingComplete(true);
                }
            });
        // Fetch AuraQY Score and missions
        fetch('/api/user/aura')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setAuraScore(data.auraScore || 0);
                    setMissions(data.missions || []);
                }
            });
    }, []);

    return (
        <AuraContext.Provider value={{ onboardingComplete, setOnboardingComplete, userContext, setUserContext, auraScore, setAuraScore, missions, setMissions }}>
            {children}
        </AuraContext.Provider>
    );
}

export function useAuraContext() {
    const ctx = useContext(AuraContext);
    if (!ctx) throw new Error("useAuraContext must be used within an AuraProvider");
    return ctx;
} 