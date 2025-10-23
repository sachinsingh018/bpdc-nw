"use client";
const logs = [
    { question: 'Where is Booth A?', tags: ['Location'] },
    { question: 'Who is the keynote speaker?', tags: ['Speaker', 'Agenda'] },
    { question: 'What time is lunch?', tags: ['Agenda'] },
];
const missed = [
    { question: 'Is there a vegan option for lunch?' },
];
const tagFrequency = [
    { tag: 'Location', count: 12 },
    { tag: 'Agenda', count: 8 },
    { tag: 'Speaker', count: 5 },
];

export default function ConciergeChatLogs() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg font-semibold text-purple-900">Concierge Chat Logs</h2>
                <div className="flex gap-2 text-xs">
                    {tagFrequency.map((t) => (
                        <span key={t.tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {t.tag}: {t.count}
                        </span>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs mb-2">
                    <thead>
                        <tr className="bg-purple-50">
                            <th className="px-2 py-1 text-left">Question</th>
                            <th className="px-2 py-1 text-left">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((l) => (
                            <tr key={l.question} className="border-b last:border-0">
                                <td className="px-2 py-1">{l.question}</td>
                                <td className="px-2 py-1">{l.tags.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-red-100 text-red-700 rounded p-2 text-xs">
                <strong>Missed Questions:</strong>
                <ul className="list-disc ml-4">
                    {missed.map((m) => (
                        <li key={m.question}>{m.question}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
} 