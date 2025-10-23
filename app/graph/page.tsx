'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
// import dynamic from 'next/dynamic';

const defaultZoom = 13;

export default function NearbyEventsPage() {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
    const [isLoadingGraph, setIsLoadingGraph] = useState(true);

    const handleLocationAccess = async () => {
        setIsLocating(true);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition({ lat: latitude, lng: longitude });
                    setIsLocating(false);
                },
                async () => {
                    console.warn('Geolocation denied, using IP fallback');

                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        const data = await res.json();
                        if (data && data.latitude && data.longitude) {
                            setPosition({ lat: data.latitude, lng: data.longitude });
                        } else {
                            alert('Unable to detect location via IP.');
                        }
                    } catch (err) {
                        alert('IP-based location failed.');
                        console.error(err);
                    }

                    setIsLocating(false);
                }
            );
        } else {
            // If geolocation is not supported, fallback immediately
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                    setPosition({ lat: data.latitude, lng: data.longitude });
                } else {
                    alert('Unable to detect location via IP.');
                }
            } catch (err) {
                alert('IP-based location failed.');
                console.error(err);
            }

            setIsLocating(false);
        }
    };

    // Fetch user data
    useEffect(() => {
        const emaili = getCookie('userEmail') || 'sachintest@gmail.com';

        const fetchData = async () => {
            try {
                const res = await fetch('/profile/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emaili })
                });
                const data = await res.json();
                const { name, email } = data;
                if (name) setUserName(name);
                if (email) setUserEmail(email);
            } catch (err) {
                console.error('Failed to fetch user data', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch graph data
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setIsLoadingGraph(true);
                const response = await fetch('/api/graph?layers=8');
                if (response.ok) {
                    const data = await response.json();
                    setGraphData(data);
                } else {
                    console.error('Failed to fetch graph data');
                }
            } catch (error) {
                console.error('Error fetching graph data:', error);
            } finally {
                setIsLoadingGraph(false);
            }
        };

        fetchGraphData();
    }, []);

    const ForceGraph = dynamic(() => import('react-force-graph-2d'), {
        ssr: false,
    });
    //Up to date
    const user = {
        name: userName,
        email: userEmail,
        phone: '+1 555 123 4567',
        profilePicture: 'https://i.pravatar.cc/150?img=1',
    };
    //Trialmoreasasmkmmk
    // Get direct connections (layer 1) for the connections list
    const directConnections = useMemo(() => {
        return graphData.nodes
            .filter((node: any) => node.layer === 1)
            .slice(0, 3) // Limit to 3 for display
            .map((node: any) => ({
                name: node.name,
                title: `Connection (Layer ${node.layer})`,
                bio: `Connected through your network`,
                image: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 50)}`,
            }));
    }, [graphData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white flex flex-col items-center justify-center px-4">
                <Image
                    src="/img.jpg"
                    alt="Networkqy Logo"
                    width={240}
                    height={120}
                    className="rounded-md mb-6 shadow-lg hover:scale-105 transition-transform duration-300"
                />
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 text-center animate-pulse">
                    Loading Networkqy...
                </h1>
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    Please wait while we fetch your data
                </p>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar user={user} />
            <SidebarInset>
                <div className="relative min-h-screen w-full text-white">
                    <div className="absolute top-4 left-4 z-50">
                        <SidebarToggle />
                    </div>

                    {position ? (
                        <div className="flex flex-col items-center justify-center px-4 py-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 font-mono uppercase tracking-wider text-center">
                                Your Networkqy Graph
                            </h2>

                            <div className="mb-4 text-center">
                                <p className="text-gray-300 mb-2">
                                    {graphData.nodes.length} connections across {Math.max(...graphData.nodes.map((n: any) => n.layer))} layers
                                </p>
                                {isLoadingGraph && (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-gray-400">Loading network...</span>
                                    </div>
                                )}
                            </div>

                            <div
                                className="w-full max-w-6xl rounded-2xl overflow-hidden mb-12"
                                style={{ height: '650px' }}
                            >
                                <ForceGraph
                                    graphData={graphData}
                                    nodeLabel="name"
                                    nodeAutoColorBy="group"
                                    width={1200}
                                    height={600}
                                    backgroundColor="#0E0B1E"
                                    linkDirectionalParticles={2}
                                    linkDirectionalParticleSpeed={0.005}
                                    linkColor={() => "#8884d8"}
                                    nodeCanvasObjectMode={() => 'before'}
                                    nodeCanvasObject={(node, ctx, globalScale) => {
                                        const label = node.name || node.id;
                                        const fontSize = 12 / globalScale;
                                        ctx.font = `${fontSize}px Inter`;
                                        ctx.fillStyle = 'white';
                                        ctx.textAlign = 'center';
                                        ctx.textBaseline = 'middle';
                                        ctx.fillText(String(label), node.x!, node.y! + 10);
                                    }}
                                />
                            </div>

                            {/* Connections Header */}
                            <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center font-mono uppercase tracking-wide text-gray-200">
                                Your Direct Connections
                            </h3>

                            {/* Connections Cards */}
                            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
                                {directConnections.length > 0 ? (
                                    directConnections.map((person: any, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-purple-700/40 transition"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-800 flex items-center justify-center text-white font-bold text-sm">
                                                    {person.name.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-purple-400">{person.name}</h3>
                                                    <p className="text-sm text-gray-300">{person.title}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm">{person.bio}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8">
                                        <p className="text-gray-400">No connections found. Start connecting with people!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center px-4">
                            <h1 className="text-3xl md:text-5xl font-bold mb-4">
                                Find Networking Events Near You
                            </h1>
                            <p className="text-gray-300 mb-6 max-w-md">
                                Allow location access to discover relevant events in your area.
                            </p>
                            <button
                                onClick={handleLocationAccess}
                                disabled={isLocating}
                                className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg ${isLocating ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLocating ? 'Loading...' : '📍 Enable Location'}
                            </button>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
