'use client';

import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useEffect, useState } from 'react';
import L from 'leaflet';
// import '../app/globals.css';


interface LeafletMapProps {
    position: { lat: number; lng: number };
    zoom?: number;
}

const jitter = (value: number, scale = 0.002): number => {
    return value + (Math.random() - 0.5) * scale;
};
const userIcon = new L.Icon({
    iconUrl: '/avatar.png', // ✅ Your local image
    iconSize: [60, 60],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'rounded-full shadow-lg border-2 border-white',
});


const HeatmapLayer = ({ points }: { points: [number, number, number?][] }) => {
    const map = useMap();

    useEffect(() => {
        const jitteredPoints: [number, number, number][] = [];

        points.forEach(([lat, lng, intensity = 1.0]) => {
            jitteredPoints.push([lat, lng, intensity]);
            for (let i = 0; i < 8; i++) {
                jitteredPoints.push([
                    jitter(lat, 0.002),
                    jitter(lng, 0.002),
                    intensity,
                ]);
            }
        });

        const getRadiusByZoom = (zoom: number) => {
            if (zoom >= 12) return 65;
            if (zoom >= 9) return 50;
            if (zoom >= 6) return 35;
            return 25;
        };

        const getGradientByZoom = (zoom: number) => {
            return zoom >= 10
                ? { 0.4: 'yellow', 0.6: 'orange', 0.9: 'red' }
                : { 0.2: 'red', 0.4: 'darkred', 0.7: 'maroon', 1.0: 'black' };
        };

        // @ts-ignore
        let heatLayer = (window as any).L.heatLayer(jitteredPoints, {
            radius: getRadiusByZoom(map.getZoom()),
            blur: 20,
            minOpacity: 0.8,
            maxZoom: 17,
            gradient: getGradientByZoom(map.getZoom()),
        }).addTo(map);

        const updateHeat = () => {
            const zoom = map.getZoom();
            heatLayer.setOptions({
                radius: getRadiusByZoom(zoom),
                gradient: getGradientByZoom(zoom),
            });
        };

        map.on('zoomend', updateHeat);

        return () => {
            map.off('zoomend', updateHeat);
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
};

export default function LeafletMap({ position, zoom = 13 }: LeafletMapProps) {
    const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null);

    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;

                // Check if clicked near a known heat point
                const nearPoint = points.some(([pLat, pLng]) => {
                    const distance = Math.hypot(pLat - lat, pLng - lng);
                    return distance < 0.1; // ~11km threshold
                });

                if (nearPoint) {
                    setClickPosition({ lat, lng });
                } else {
                    setClickPosition(null); // Hide popup if not near
                }
            }

        });
        return null;
    };

    // Add at top or above LeafletMap component
    const eventList = [
        // 🇦🇪 UAE – Dubai
        {
            title: 'World AI Technology Expo',
            date: 'May 14–15, 2025',
            lat: 25.2170,
            lng: 55.3670,
            url: 'https://worldaiexpo.io',
            description: 'A global gathering of the brightest minds in AI, showcasing breakthroughs in machine learning, robotics, NLP, and AGI applications from startups to enterprises.'
        },
        {
            title: 'Dubai AI Festival',
            date: 'Apr 23–24, 2025',
            lat: 25.1995,
            lng: 55.2796,
            url: 'https://dubaiaifestival.com',
            description: 'Dubai’s flagship celebration of artificial intelligence featuring innovation showcases, policy discussions, and smart city integrations.'
        },
        {
            title: 'TOKEN2049 Dubai',
            date: 'Apr 30–May 1, 2025',
            lat: 25.1995,
            lng: 55.2796,
            url: 'https://token2049.com',
            description: 'The premier Web3 event spotlighting blockchain, crypto, DeFi, and NFT innovations with global founders and investors.'
        },
        {
            title: 'Dubai FinTech Summit',
            date: 'May 12–13, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://fintech-summit.ae',
            description: 'A strategic platform for financial services professionals exploring digital banking, payments, and regulatory innovation.'
        },
        {
            title: 'Seamless Middle East',
            date: 'May 20–22, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://www.fintechfutures.com/seamless-middle-east',
            description: 'The largest tech commerce event in the region for digital payments, e-commerce, banking, logistics, and retail transformation.'
        },
        {
            title: 'GISEC Global (Cybersecurity)',
            date: 'May 6–8, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://www.gisec.ae',
            description: 'The region’s most impactful cybersecurity event featuring ethical hackers, global cyber leaders, and national defense experts.'
        },
        {
            title: 'GETEX – Education & Training Expo',
            date: 'Apr 30–May 2, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://www.getex.ae',
            description: 'The UAE’s leading education fair connecting students with local and global universities, vocational institutes, and training programs.'
        },
        {
            title: 'GITEX GLOBAL',
            date: 'Oct 13–17, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://www.gitex.com',
            description: 'The world’s largest tech show, spanning AI, cybersecurity, blockchain, 5G, cloud, and future mobility.'
        },
        {
            title: 'Expand North Star (Startups)',
            date: 'Oct 13–16, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://expandnorthstar.com',
            description: 'One of the world’s largest startup events, hosted alongside GITEX, gathering global VCs, accelerators, and founders.'
        },
        {
            title: 'Dubai World Game Expo',
            date: 'Nov 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'http://www.gameexpo.ae',
            description: 'A massive gaming exhibition uniting developers, publishers, and gamers in the Middle East’s rising game market.'
        },
        {
            title: 'Dubai Airshow',
            date: 'Nov 17–21, 2025',
            lat: 24.9900,
            lng: 55.1140,
            url: 'https://dubaiairshow.aero',
            description: 'One of the world’s biggest aerospace events, showcasing aviation innovations, defense tech, and commercial aircraft.'
        },
        {
            title: 'UAE Innovation Summit (Sharjah)',
            date: 'Nov 2–4, 2025',
            lat: 25.3463,
            lng: 55.4209,
            url: 'https://uaeinnovationsummit.com',
            description: 'A platform for public and private sector innovators to present breakthrough technologies in sustainability, AI, and education.'
        },
        {
            title: 'Middle East Film & Comic Con',
            date: 'Apr 18–20, 2025',
            lat: 24.4667,
            lng: 54.3667,
            url: 'https://mefcc.com',
            description: 'The region’s largest pop culture festival with celebrity guests, cosplay, comics, gaming, and anime fanfare.'
        },
        {
            title: 'STEP Conference',
            date: 'TBD 2025',
            lat: 25.0998,
            lng: 55.1490,
            url: 'https://stepconference.com',
            description: 'A high-energy tech and startup festival blending talks, workshops, music, and networking under one ecosystem.'
        },

        // 🇸🇦 Saudi Arabia – Riyadh
        {
            title: 'LEAP 2025 – Saudi Tech Event',
            date: 'Feb 9–12, 2025',
            lat: 24.7136,
            lng: 46.6753,
            url: 'https://www.onegiantleap.com',
            description: 'Saudi Arabia’s biggest tech event showcasing mega-projects, AI, robotics, and future energy tech on a global scale.'
        },
        {
            title: 'Black Hat MEA (Cybersec)',
            date: 'Nov 24–26, 2025',
            lat: 24.7743,
            lng: 46.7386,
            url: 'https://blackhatmea.com',
            description: 'The Middle East’s edition of the global cybersecurity conference series — focused on ethical hacking and threat mitigation.'
        },
        {
            title: '2025 Esports World Cup',
            date: 'Jul 8–Aug 24, 2025',
            lat: 24.7136,
            lng: 46.6753,
            url: 'https://esportsworldcup.com',
            description: 'A six-week international esports championship featuring the world’s top teams in games like Valorant, Dota 2, and FIFA.'
        },
        {
            title: 'Riyadh VC World Summit',
            date: 'Oct 27, 2025',
            lat: 24.7743,
            lng: 46.7386,
            url: 'https://www.eventbrite.com',
            description: 'A one-day gathering of regional and global VCs, LPs, and startup founders exploring capital deployment in MENA.'
        },
        {
            title: 'Middle East Banking AI Summit',
            date: 'Aug 27, 2025',
            lat: 24.7743,
            lng: 46.7386,
            url: 'https://www.eventbrite.com',
            description: 'Executives and data leaders explore AI’s impact on banking — from fraud detection to personalization and smart underwriting.'
        },
        {
            title: 'Riyadh Investors Dinner',
            date: 'Jun 24, 2025',
            lat: 24.7743,
            lng: 46.7386,
            url: 'https://www.eventbrite.com',
            description: 'A private dinner for angel investors, founders, and VCs to network and discuss funding trends in MENA startups.'
        },
        {
            title: 'AI Implementation in Business – Riyadh',
            date: 'Jun 24, 2025',
            lat: 24.7743,
            lng: 46.7386,
            url: 'https://www.eventbrite.com',
            description: 'Focused talks and case studies on deploying AI in enterprise operations, marketing, and customer experience.'
        },
        {
            title: 'Investment Strategic Forum',
            date: 'Sep 21, 2025',
            lat: 24.7743,
            lng: 46.7386,
            url: 'https://www.eventbrite.com',
            description: 'Leaders and policymakers explore sovereign wealth trends, VC growth, and cross-border investment strategies.'
        },

        // 🇶🇦 Qatar – Doha
        {
            title: 'Web Summit Qatar',
            date: 'TBA 2025',
            lat: 25.2854,
            lng: 51.5310,
            url: 'https://websummit.com/qatar',
            description: 'The global Web Summit brand arrives in Doha, connecting the Gulf’s emerging tech scene with global innovation leaders.'
        },
        {
            title: 'Reuters NEXT Abu Dhabi',
            date: 'Oct 2025',
            lat: 24.4539,
            lng: 54.3773,
            url: 'https://www.reuters.com',
            description: 'A thought-leadership summit by Reuters, featuring heads of state, CEOs, and technologists discussing the global future.'
        },

        // 🇧🇭 Bahrain – Manama
        {
            title: 'Global Tech Summit Bahrain',
            date: 'Sep 22, 2025',
            lat: 26.2285,
            lng: 50.5860,
            url: 'https://www.eventbrite.com',
            description: 'A pan-regional event discussing smart cities, digital transformation, and blockchain in the Gulf economy.'
        },

        // 🇴🇲 Oman – Muscat
        {
            title: 'Oman Technology Conference 2025',
            date: 'TBA 2025',
            lat: 23.5880,
            lng: 58.3829,
            url: 'https://www.eventbrite.com',
            description: 'A national-level tech conference uniting policymakers, startups, and global vendors shaping Oman’s digital future.'
        },

        // Additional UAE 🇦🇪 Events
        {
            title: 'Gartner CIO & IT Executive Conf.',
            date: 'Oct 6–8, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://www.gartner.com',
            description: 'A high-level Gartner conference focused on IT leadership, AI strategy, and enterprise digital transformation.'
        },
        {
            title: 'Mobility Live ME',
            date: 'Jun 24–25, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://mobilitylive.ae',
            description: 'An influential event dedicated to smart mobility, public transport, autonomous vehicles, and green logistics.'
        },
        {
            title: 'Middle East Rail 2025',
            date: 'Jun 24–25, 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://www.middleeastrail.com',
            description: 'A transport infrastructure exhibition and conference focused on future rail projects and urban mobility.'
        },
        {
            title: 'Dubai FinTech Festival',
            date: 'TBA 2025',
            lat: 25.2048,
            lng: 55.2708,
            url: 'https://fintechfestival.ae',
            description: 'An immersive festival spotlighting FinTech innovation across digital banking, Web3, insurtech, and cross-border payments.'
        },

        // 🎮 Entertainment & creative across Gulf
        {
            title: 'MEFCC – Film & Comic Con Dubai',
            date: 'Apr 18–20, 2025',
            lat: 24.4667,
            lng: 54.3667,
            url: 'https://mefcc.com',
            description: 'The ultimate celebration of pop culture in the Middle East — packed with celebrities, cosplay, and entertainment fandoms.'
        },
    ];


    // const points: [number, number, number?][] = [
    //     [position.lat + 0.2, position.lng + 0.2, 1.0],
    //     [position.lat + 0.3, position.lng - 0.2, 1.0],
    //     [position.lat - 0.25, position.lng + 0.15, 1.0],
    //     [25.276987, 55.296249, 1.0],
    //     [24.453884, 54.3773438, 1.0],
    //     [24.713552, 46.675296, 1.0],
    //     [21.485811, 39.192505, 1.0],
    //     [25.276987, 51.520008, 1.0],
    //     [26.228516, 50.586049, 1.0],
    //     [23.58589, 58.405922, 1.0],
    //     [29.375859, 47.977405, 1.0],
    //     [28.6139, 77.2090, 1.0],
    //     [19.0760, 72.8777, 1.0],
    //     [13.0827, 80.2707, 1.0],
    //     [12.9716, 77.5946, 1.0],
    //     [22.5726, 88.3639, 1.0],
    //     [17.3850, 78.4867, 1.0],
    //     [26.9124, 75.7873, 1.0],
    //     [23.0225, 72.5714, 1.0],
    //     [21.1458, 79.0882, 1.0],
    //     [11.0168, 76.9558, 1.0],
    // ];
    const points: [number, number, number?][] = eventList.map((e) => [e.lat, e.lng, 1.0]);


    return (
        <>
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <HeatmapLayer points={points} />
                <MapClickHandler />
                <Marker position={[position.lat, position.lng]} icon={userIcon}>
                    <Popup>
                        <div className="text-sm font-medium text-center">📍 You are here!</div>
                    </Popup>
                </Marker>
                {clickPosition && (
                    <Popup position={clickPosition}>
                        {eventList
                            .filter(e => Math.hypot(e.lat - clickPosition.lat, e.lng - clickPosition.lng) < 0.02)
                            .map((e, i) => (
                                <div key={i} style={{ minWidth: '200px' }}>
                                    <h3 className="text-sm font-bold text-purple-600">{e.title}</h3>
                                    <p className="text-xs">{e.date}</p>
                                    <p className="text-xs">{e.description}</p>
                                    <button
                                        onClick={() => window.open(e.url, '_blank')}
                                        className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
                                    >
                                        View Event
                                    </button>
                                </div>
                            ))}
                    </Popup>
                )}

            </MapContainer>

            {/* 💅 Map filter styling */}
            <style jsx global>{`
  /* 🌞 Light Mode: white-grey-purple tint */
  .leaflet-tile {
    filter: grayscale(0.2) brightness(1.05) saturate(1.2) hue-rotate(260deg) contrast(1.05);
  }

  /* 🌙 Dark Mode: deep purple aesthetic (#0E0B1E) */
  .dark .leaflet-tile {
    filter: grayscale(0.7) brightness(0.5) saturate(1.6) hue-rotate(260deg) contrast(1.3);
  }

  /* ✅ Legal + subtle attribution styling */
  .leaflet-control-attribution {
    font-size: 10px;
    background: transparent;
    color: #888;
    text-align: right;
    padding: 2px 8px;
  }

  .dark .leaflet-control-attribution {
    color: #666;
  }
`}</style>






        </>
    );

}
