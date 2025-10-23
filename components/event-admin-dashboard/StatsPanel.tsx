const stats = [
    { label: 'Total Attendees', value: 324 },
    { label: 'Smart Matches Made', value: 87 },
    { label: 'Concierge Interactions', value: 142 },
    { label: 'Chat Engagement', value: '78%' },
    { label: 'Avg AuraQY Trust Score', value: 4.2 },
    { label: 'Conversion Score', value: '56%' },
];

export default function StatsPanel() {
    return (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-purple-50 rounded-lg shadow p-4 flex flex-col items-center justify-center text-center"
                >
                    <span className="text-xs text-purple-700 font-medium mb-1">{stat.label}</span>
                    <span className="text-2xl font-bold text-purple-900">{stat.value}</span>
                </div>
            ))}
        </section>
    );
} 