"use client";
export default function SponsorContentEngagement() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Content Engagement</h2>
            <div className="text-xs text-purple-500 mb-2">Downloads, video plays, deck views, and engagement over time</div>
            <ul className="divide-y divide-purple-100 mb-2">
                <li className="flex justify-between py-1"><span>Acme Corp</span><span className="font-bold">56 clicks</span></li>
                <li className="flex justify-between py-1"><span>Beta Inc</span><span className="font-bold">42 clicks</span></li>
                <li className="flex justify-between py-1"><span>Gamma LLC</span><span className="font-bold">37 clicks</span></li>
            </ul>
            <div className="w-full h-20 bg-purple-100 rounded flex items-center justify-center text-purple-400 mt-2">[Engagement Chart Placeholder]</div>
        </section>
    );
} 