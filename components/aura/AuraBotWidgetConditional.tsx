"use client";
import { usePathname } from 'next/navigation';
import { AuraBotWidget } from './AuraBotWidget';

export function AuraBotWidgetConditional() {
    const pathname = usePathname();
    if (pathname === '/' || pathname === '/landing-page' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
        return null;
    }
    return <AuraBotWidget />;
} 