"use client";
export default function SponsorBoothTraffic() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Booth Traffic Overlay</h2>
            <div className="text-xs text-purple-500 mb-2">Live and cumulative booth visits for each sponsor</div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between"><span>Acme Corp Booth</span><span className="font-bold">120 visits</span></div>
                <div className="flex justify-between"><span>Beta Inc Booth</span><span className="font-bold">90 visits</span></div>
                <div className="flex justify-between"><span>Gamma LLC Booth</span><span className="font-bold">80 visits</span></div>
            </div>
        </section>
    );
} 