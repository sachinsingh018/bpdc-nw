"use client";
const matches = [
    { name1: 'Sana Patel', name2: 'Arjun Mehta', reason: 'Similar interests in AI', status: 'Accepted' },
    { name1: 'Lina Xu', name2: 'Ravi Singh', reason: 'Both in Product roles', status: 'Pending' },
    { name1: 'Maya Chen', name2: 'Tom Lee', reason: 'Requested intro by host', status: 'Missed' },
];

export default function AIConnectionsPanel() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <h2 className="text-lg font-semibold text-purple-900">AI-Powered Connections</h2>
                <button type="button" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs">Suggest Manual Intro</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="bg-purple-50">
                            <th className="px-2 py-1 text-left">Name 1</th>
                            <th className="px-2 py-1 text-left">Name 2</th>
                            <th className="px-2 py-1 text-left">Reason for Match</th>
                            <th className="px-2 py-1 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((m) => (
                            <tr key={`${m.name1}-${m.name2}`} className="border-b last:border-0">
                                <td className="px-2 py-1">{m.name1}</td>
                                <td className="px-2 py-1">{m.name2}</td>
                                <td className="px-2 py-1">{m.reason}</td>
                                <td className="px-2 py-1">
                                    <span className={
                                        m.status === 'Accepted'
                                            ? 'text-green-600'
                                            : m.status === 'Pending'
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                    }>
                                        {m.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
} 