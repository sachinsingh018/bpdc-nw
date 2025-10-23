'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export function SocketDebug() {
    const { isConnected, socket } = useSocket();
    const [debugInfo, setDebugInfo] = useState<any>({});

    useEffect(() => {
        if (socket) {
            const updateDebugInfo = () => {
                setDebugInfo({
                    connected: socket.connected,
                    id: socket.id,
                    transport: socket.io?.engine?.transport?.name,
                });
            };

            updateDebugInfo();
            socket.on('connect', updateDebugInfo);
            socket.on('disconnect', updateDebugInfo);

            return () => {
                socket.off('connect', updateDebugInfo);
                socket.off('disconnect', updateDebugInfo);
            };
        }
    }, [socket]);

    if (process.env.NODE_ENV === 'production') {
        return null; // Don't show in production
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
            <div className="font-bold mb-2">Socket.IO Debug</div>
            <div className="space-y-1">
                <div>Status: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span></div>
                <div>ID: {debugInfo.id || 'N/A'}</div>
                <div>Transport: {debugInfo.transport || 'N/A'}</div>
            </div>
        </div>
    );
} 