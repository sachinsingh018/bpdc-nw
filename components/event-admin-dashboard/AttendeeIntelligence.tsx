"use client";
const attendees = [
    { name: 'Sana Patel', company: 'Acme Corp', role: 'Engineer', score: 4.5, connections: 12, bookmarked: true },
    { name: 'Arjun Mehta', company: 'Beta Inc', role: 'Product', score: 3.9, connections: 8, bookmarked: false },
    { name: 'Lina Xu', company: 'Gamma LLC', role: 'Designer', score: 4.8, connections: 15, bookmarked: true },
];

export default function AttendeeIntelligence() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <h2 className="text-lg font-semibold text-purple-900">Attendee Intelligence</h2>
                <div className="flex gap-2">
                    <button type="button" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs">Export CSV</button>
                    <button type="button" className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 text-xs">Filter by Trust Score</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="bg-purple-50">
                            <th className="px-2 py-1 text-left">Name</th>
                            <th className="px-2 py-1 text-left">Company</th>
                            <th className="px-2 py-1 text-left">Role</th>
                            <th className="px-2 py-1 text-left">AuraQY Score</th>
                            <th className="px-2 py-1 text-left">Connections</th>
                            <th className="px-2 py-1 text-left">Bookmarked</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendees.map((a) => (
                            <tr key={a.name} className="border-b last:border-0">
                                <td className="px-2 py-1">{a.name}</td>
                                <td className="px-2 py-1">{a.company}</td>
                                <td className="px-2 py-1">{a.role}</td>
                                <td className="px-2 py-1">{a.score}</td>
                                <td className="px-2 py-1">{a.connections}</td>
                                <td className="px-2 py-1">{a.bookmarked ? '\u2605' : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
} 