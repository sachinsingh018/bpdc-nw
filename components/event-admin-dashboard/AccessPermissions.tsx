"use client";
const roles = [
    { name: 'Host', members: ['Sana Patel'] },
    { name: 'Moderator', members: ['Arjun Mehta', 'Lina Xu'] },
    { name: 'Volunteer', members: ['Tom Lee'] },
];
const sessions = ['Opening Keynote', 'AI Panel', 'Networking'];
const booths = ['Booth A', 'Booth B', 'Booth C'];

export default function AccessPermissions() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Access & Permissions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs mb-2">
                    <thead>
                        <tr className="bg-purple-50">
                            <th className="px-2 py-1 text-left">Role</th>
                            <th className="px-2 py-1 text-left">Members</th>
                            <th className="px-2 py-1 text-left">Assign Session</th>
                            <th className="px-2 py-1 text-left">Assign Booth</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r) => (
                            <tr key={r.name} className="border-b last:border-0">
                                <td className="px-2 py-1">{r.name}</td>
                                <td className="px-2 py-1">{r.members.join(', ')}</td>
                                <td className="px-2 py-1">
                                    <select className="border rounded p-1 text-xs">
                                        <option value="">--</option>
                                        {sessions.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-2 py-1">
                                    <select className="border rounded p-1 text-xs">
                                        <option value="">--</option>
                                        {booths.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
} 