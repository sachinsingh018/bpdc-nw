"use client";
export default function SponsorLeads() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Leads Captured</h2>
            <div className="text-xs text-purple-500 mb-2">Form fills, QR scans, and live leads ticker</div>
            <ul className="divide-y divide-purple-100 mb-2">
                <li className="flex justify-between py-1"><span>Acme Corp Booth</span><span className="font-bold">34 leads</span></li>
                <li className="flex justify-between py-1"><span>Beta Inc Booth</span><span className="font-bold">21 leads</span></li>
                <li className="flex justify-between py-1"><span>Gamma LLC Booth</span><span className="font-bold">18 leads</span></li>
            </ul>
            <div className="bg-purple-50 rounded px-3 py-1 text-xs text-purple-700 font-semibold mt-2 animate-pulse">Live: Acme Corp just captured a new lead!</div>
        </section>
    );
} 