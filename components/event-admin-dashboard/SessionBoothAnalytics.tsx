"use client";
const sessions = [
    { name: 'Opening Keynote', attendance: 120, engagement: 'High', feedback: 4.7 },
    { name: 'AI Panel', attendance: 90, engagement: 'Medium', feedback: 4.2 },
    { name: 'Networking', attendance: 150, engagement: 'High', feedback: 4.8 },
];
const booths = [
    { name: 'Booth A', visits: 100, avgTime: '5m', leads: 12 },
    { name: 'Booth B', visits: 80, avgTime: '3m', leads: 7 },
    { name: 'Booth C', visits: 120, avgTime: '6m', leads: 15 },
];

export default function SessionBoothAnalytics() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col gap-6">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-purple-900">Session Analytics</h2>
                    <button type="button" className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 text-xs">Sort by Popularity</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sessions.map((s) => (
                        <div key={s.name} className="bg-purple-50 rounded p-3 flex flex-col gap-1">
                            <span className="font-medium text-purple-800">{s.name}</span>
                            <span className="text-xs">Attendance: {s.attendance}</span>
                            <span className="text-xs">Engagement: {s.engagement}</span>
                            <span className="text-xs">Feedback: {s.feedback}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-purple-900">Booth Analytics</h2>
                    <button type="button" className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 text-xs">Sort by Popularity</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {booths.map((b) => (
                        <div key={b.name} className="bg-purple-50 rounded p-3 flex flex-col gap-1">
                            <span className="font-medium text-purple-800">{b.name}</span>
                            <span className="text-xs">Visits: {b.visits}</span>
                            <span className="text-xs">Avg Time: {b.avgTime}</span>
                            <span className="text-xs">Lead Form Clicks: {b.leads}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 