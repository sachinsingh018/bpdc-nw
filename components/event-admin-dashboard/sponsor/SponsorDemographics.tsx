"use client";
export default function SponsorDemographics() {
    return (
        <section className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-purple-900 mb-2">Visitor Demographics & Interests</h2>
            <div className="text-xs text-purple-500 mb-2">Breakdown of booth visitors by attendee type</div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="bg-purple-50">
                            <th className="px-2 py-1 text-left">Sponsor Booth</th>
                            <th className="px-2 py-1 text-left">Job Seekers</th>
                            <th className="px-2 py-1 text-left">Decision Makers</th>
                            <th className="px-2 py-1 text-left">Students</th>
                            <th className="px-2 py-1 text-left">Other</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-2 py-1">Acme Corp</td>
                            <td className="px-2 py-1">40%</td>
                            <td className="px-2 py-1">30%</td>
                            <td className="px-2 py-1">20%</td>
                            <td className="px-2 py-1">10%</td>
                        </tr>
                        <tr>
                            <td className="px-2 py-1">Beta Inc</td>
                            <td className="px-2 py-1">35%</td>
                            <td className="px-2 py-1">25%</td>
                            <td className="px-2 py-1">30%</td>
                            <td className="px-2 py-1">10%</td>
                        </tr>
                        <tr>
                            <td className="px-2 py-1">Gamma LLC</td>
                            <td className="px-2 py-1">50%</td>
                            <td className="px-2 py-1">20%</td>
                            <td className="px-2 py-1">20%</td>
                            <td className="px-2 py-1">10%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
} 