"use client";
import { useEffect, useState } from 'react';

const sessionAttendance = [
    { name: 'Keynote', value: 120 },
    { name: 'AI Panel', value: 90 },
    { name: 'Networking', value: 150 },
    { name: 'Workshop', value: 80 },
];

// Simulated time points for the live area chart
const timeLabels = ["10:00", "10:15", "10:30", "10:45", "Now"];
const areaDataInit = [60, 90, 120, 80, 140];

export default function ActivityGraph() {
    // Bar chart dimensions
    const maxVal = Math.max(...sessionAttendance.map(s => s.value));
    const barHeight = 120;
    const barWidth = 40;
    const gap = 36;
    const svgWidth = (barWidth + gap) * sessionAttendance.length + gap;
    const svgHeight = barHeight + 70;

    // Bar chart interactivity
    const [barHover, setBarHover] = useState<string | null>(null);
    const [barTooltip, setBarTooltip] = useState<{ x: number; y: number; name: string; value: number } | null>(null);

    // Live area chart data and animation
    const areaWidth = 320;
    const areaHeight = 120;
    const yAxisMax = 160;
    const yTicks = 4;
    const [areaData, setAreaData] = useState(areaDataInit);
    const [dotIndex, setDotIndex] = useState(4); // Start at 'Now'
    const [dotPulse, setDotPulse] = useState(false);
    const [dotTooltip, setDotTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

    // Animate the dot and area data
    useEffect(() => {
        const interval = setInterval(() => {
            setDotPulse((p) => !p);
            setDotIndex((prev) => {
                const next = (prev + 1) % areaData.length;
                // Simulate new data for 'Now'
                if (next === areaData.length - 1) {
                    setAreaData((old) => [
                        ...old.slice(1),
                        Math.floor(60 + Math.random() * 100)
                    ]);
                }
                return next;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [areaData.length]);

    // Calculate area chart points
    const getAreaPoints = () => {
        return areaData.map((val, i) => {
            const x = (areaWidth / (areaData.length - 1)) * i;
            const y = areaHeight - (val / yAxisMax) * areaHeight;
            return `${x},${y}`;
        }).join(' ');
    };
    // For the area fill
    const getAreaFillPoints = () => {
        return getAreaPoints() + ` ${areaWidth},${areaHeight} 0,${areaHeight}`;
    };

    // Dot position
    const dotX = (areaWidth / (areaData.length - 1)) * dotIndex;
    const dotY = areaHeight - (areaData[dotIndex] / yAxisMax) * areaHeight;
    const dotTime = timeLabels[dotIndex];
    const dotValue = areaData[dotIndex];

    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col mb-4">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Live Activity Graph</h2>
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full">
                {/* Area chart with animated live dot */}
                <div className="flex-1 flex flex-col items-center justify-center min-w-[340px] max-w-[400px] w-full mb-6 lg:mb-0">
                    {/* Label above the area chart */}
                    <div className="text-xs text-purple-500 mb-2 mt-2">Peak check-in times and session activity (live)</div>
                    <div className="relative w-full flex items-center justify-center" style={{ minHeight: areaHeight + 40 }}>
                        <svg width={areaWidth + 50} height={areaHeight + 30} className="bg-purple-50 rounded" style={{ minWidth: areaWidth + 50 }}>
                            {/* Y-axis grid and labels */}
                            {[...Array(yTicks + 1)].map((_, i) => {
                                const y = 10 + (areaHeight / yTicks) * i;
                                const val = Math.round(yAxisMax - (yAxisMax / yTicks) * i);
                                return (
                                    <g key={`ygrid-${y}`}>
                                        <line
                                            x1={40}
                                            x2={areaWidth + 40}
                                            y1={y}
                                            y2={y}
                                            stroke="#ede9fe"
                                            strokeDasharray="4 2"
                                        />
                                        <text x={30} y={y + 4} textAnchor="end" className="fill-purple-400 text-xs">{val}</text>
                                    </g>
                                );
                            })}
                            {/* X-axis labels */}
                            {timeLabels.map((label, i) => {
                                const x = 40 + (areaWidth / (timeLabels.length - 1)) * i;
                                return (
                                    <text
                                        key={label}
                                        x={x}
                                        y={areaHeight + 22}
                                        textAnchor="middle"
                                        className="fill-purple-400 text-xs"
                                    >
                                        {label}
                                    </text>
                                );
                            })}
                            {/* Area fill */}
                            <polyline
                                fill="#ddd6fe"
                                stroke="none"
                                points={getAreaFillPoints()}
                                transform="translate(40,10)"
                            />
                            {/* Area line */}
                            <polyline
                                fill="none"
                                stroke="#a78bfa"
                                strokeWidth="3"
                                points={getAreaPoints()}
                                transform="translate(40,10)"
                            />
                            {/* Animated live dot with pulse */}
                            <circle
                                cx={dotX + 40}
                                cy={dotY + 10}
                                r={dotPulse ? 12 : 8}
                                fill="#7c3aed"
                                stroke="#4c1d95"
                                strokeWidth="2"
                                style={{ transition: 'r 0.2s' }}
                                onMouseEnter={e => setDotTooltip({ x: dotX + 40, y: dotY + 10, value: dotValue, label: dotTime })}
                                onMouseLeave={() => setDotTooltip(null)}
                            />
                            {/* 'Now' marker */}
                            <text x={areaWidth + 40} y={areaHeight + 22} textAnchor="middle" className="fill-purple-700 text-xs font-bold">Now</text>
                        </svg>
                        {/* Live dot tooltip */}
                        {dotTooltip && (
                            <div
                                className="absolute pointer-events-none bg-white border border-purple-200 rounded shadow-lg px-3 py-2 text-xs text-purple-900"
                                style={{
                                    left: dotTooltip.x + 20,
                                    top: dotTooltip.y - 10,
                                    zIndex: 10,
                                    minWidth: 110,
                                }}
                            >
                                <div className="font-semibold">Time: {dotTooltip.label}</div>
                                <div className="text-purple-700 font-bold">Check-ins: {dotTooltip.value}</div>
                            </div>
                        )}
                    </div>
                    {/* Subtitle for clarity */}
                    <div className="text-xs text-gray-500 mt-2 text-center max-w-xs">
                        Live attendee check-ins over the last hour. The dot shows the current time.
                    </div>
                </div>
                {/* Bar chart */}
                <div className="flex-1 flex flex-col items-center w-full max-w-full relative">
                    <h3 className="text-xs font-medium text-purple-700 mb-1 mt-2">Session Attendance Trends</h3>
                    <div className="w-full max-w-[500px] px-2 overflow-x-auto relative" style={{ paddingBottom: 32 }}>
                        <svg
                            width={svgWidth}
                            height={svgHeight}
                            className="block"
                            style={{ minWidth: svgWidth }}
                        >
                            {/* Grid lines */}
                            {[0.25, 0.5, 0.75, 1].map((f) => {
                                const y = barHeight * f + 20;
                                return (
                                    <line
                                        key={`grid-${y}`}
                                        x1={0}
                                        x2={svgWidth}
                                        y1={y}
                                        y2={y}
                                        stroke="#ede9fe"
                                        strokeDasharray="4 2"
                                    />
                                );
                            })}
                            {sessionAttendance.map((s, i) => {
                                const barX = gap / 2 + i * (barWidth + gap);
                                const barY = barHeight - (s.value / maxVal) * barHeight + 20;
                                const barValY = barY - 12;
                                const isHovered = barHover === s.name;
                                return (
                                    <g key={s.name}>
                                        {/* Value label above bar */}
                                        <text
                                            x={barX + barWidth / 2}
                                            y={barValY}
                                            textAnchor="middle"
                                            className="fill-purple-900 text-sm font-bold"
                                        >
                                            {s.value}
                                        </text>
                                        {/* Bar with hover effect */}
                                        <rect
                                            x={barX}
                                            y={barY}
                                            width={barWidth}
                                            height={(s.value / maxVal) * barHeight}
                                            fill={isHovered ? "#7c3aed" : "#a78bfa"}
                                            rx={12}
                                            style={{ cursor: 'pointer', filter: isHovered ? 'drop-shadow(0 2px 8px #a78bfa)' : undefined }}
                                            onMouseEnter={e => {
                                                setBarHover(s.name);
                                                setBarTooltip({ x: barX + barWidth / 2, y: barY, name: s.name, value: s.value });
                                            }}
                                            onMouseLeave={() => {
                                                setBarHover(null);
                                                setBarTooltip(null);
                                            }}
                                        />
                                        {/* Rotated session name */}
                                        <g transform={`translate(${barX + barWidth / 2},${barHeight + 50}) rotate(-30)`}>
                                            <text
                                                textAnchor="end"
                                                className="fill-purple-700 text-xs"
                                            >
                                                {s.name}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                        </svg>
                        {/* Bar chart tooltip absolutely positioned within the bar chart container */}
                        {barTooltip && (
                            <div
                                className="absolute pointer-events-none bg-white border border-purple-200 rounded shadow-lg px-3 py-2 text-xs text-purple-900"
                                style={{
                                    left: barTooltip.x + 30,
                                    top: barTooltip.y - 10,
                                    zIndex: 20,
                                    minWidth: 90,
                                }}
                            >
                                <div className="font-semibold">{barTooltip.name}</div>
                                <div className="text-purple-700 font-bold">{barTooltip.value} attendees</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
} 