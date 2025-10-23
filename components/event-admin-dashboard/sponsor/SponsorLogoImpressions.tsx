"use client";
export default function SponsorLogoImpressions() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Logo Impressions</h2>
            <div className="text-xs text-purple-500 mb-2">How many times sponsor logos were seen on screens</div>
            <ul className="divide-y divide-purple-100">
                <li className="flex justify-between py-1"><span>Acme Corp</span><span className="font-bold">2,340</span></li>
                <li className="flex justify-between py-1"><span>Beta Inc</span><span className="font-bold">1,980</span></li>
                <li className="flex justify-between py-1"><span>Gamma LLC</span><span className="font-bold">1,450</span></li>
            </ul>
        </section>
    );
} 