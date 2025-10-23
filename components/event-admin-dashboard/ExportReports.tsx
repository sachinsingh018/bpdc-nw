"use client";
export default function ExportReports() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Export & Auto Reports</h2>
            <div className="flex gap-2 mb-2">
                <button type="button" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs">Export Attendees</button>
                <button type="button" className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs">Export Smart Matches</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded p-3 flex flex-col gap-1">
                    <span className="font-medium text-purple-800">Event Summary</span>
                    <span className="text-xs text-purple-700">Auto-generated after event ends</span>
                </div>
                <div className="bg-purple-50 rounded p-3 flex flex-col gap-1">
                    <span className="font-medium text-purple-800">Sponsor Report</span>
                    <span className="text-xs text-purple-700">Auto-generated for sponsors</span>
                </div>
                <div className="bg-purple-50 rounded p-3 flex flex-col gap-1">
                    <span className="font-medium text-purple-800">Post-Event AI Insights</span>
                    <span className="text-xs text-purple-400">[Placeholder]</span>
                </div>
            </div>
        </section>
    );
} 