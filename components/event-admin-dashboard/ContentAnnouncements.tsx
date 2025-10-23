"use client";
export default function ContentAnnouncements() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Content & Announcements</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="agenda-upload" className="text-xs font-medium text-purple-700">Upload Agenda/Deck/Livestream</label>
                    <input id="agenda-upload" type="file" className="border rounded p-2 text-xs" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <label htmlFor="announcement-input" className="text-xs font-medium text-purple-700">Send Announcement</label>
                    <input id="announcement-input" type="text" className="hidden" tabIndex={-1} aria-hidden="true" />
                    <div className="flex gap-2">
                        <button type="button" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs">Push</button>
                        <button type="button" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-xs">WhatsApp</button>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-xs font-medium text-purple-700 mb-1">Poll Results</h3>
                <div className="w-full h-24 bg-purple-100 rounded flex items-center justify-center">
                    <span className="text-purple-400">[Poll Results Chart Placeholder]</span>
                </div>
            </div>
        </section>
    );
} 