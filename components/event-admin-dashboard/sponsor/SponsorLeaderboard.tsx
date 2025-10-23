"use client";
export default function SponsorLeaderboard() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Top Sponsor Booths (Live)</h2>
            <ul className="divide-y divide-purple-100">
                <li className="flex justify-between py-1"><span>Acme Corp Booth</span><span className="font-bold">120 visits</span></li>
                <li className="flex justify-between py-1"><span>Beta Inc Booth</span><span className="font-bold">90 visits</span></li>
                <li className="flex justify-between py-1"><span>Gamma LLC Booth</span><span className="font-bold">80 visits</span></li>
            </ul>
        </section>
    );
} 