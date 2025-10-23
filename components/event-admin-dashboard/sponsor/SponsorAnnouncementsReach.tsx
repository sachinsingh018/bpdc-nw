"use client";
export default function SponsorAnnouncementsReach() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Announcements Reach</h2>
            <div className="text-xs text-purple-500 mb-2">How many attendees received or interacted with sponsor announcements</div>
            <ul className="divide-y divide-purple-100">
                <li className="flex justify-between py-1"><span>Acme Corp</span><span className="font-bold">1,200 reached</span></li>
                <li className="flex justify-between py-1"><span>Beta Inc</span><span className="font-bold">950 reached</span></li>
                <li className="flex justify-between py-1"><span>Gamma LLC</span><span className="font-bold">800 reached</span></li>
            </ul>
        </section>
    );
} 