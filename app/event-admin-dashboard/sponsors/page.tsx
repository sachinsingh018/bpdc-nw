"use client";
import SponsorBoothTraffic from '@/components/event-admin-dashboard/sponsor/SponsorBoothTraffic';
import SponsorLeaderboard from '@/components/event-admin-dashboard/sponsor/SponsorLeaderboard';
import SponsorLogoImpressions from '@/components/event-admin-dashboard/sponsor/SponsorLogoImpressions';
import SponsorLeads from '@/components/event-admin-dashboard/sponsor/SponsorLeads';
import SponsorContentEngagement from '@/components/event-admin-dashboard/sponsor/SponsorContentEngagement';
import SponsorAnnouncementsReach from '@/components/event-admin-dashboard/sponsor/SponsorAnnouncementsReach';
import SponsorDemographics from '@/components/event-admin-dashboard/sponsor/SponsorDemographics';

export default function SponsorDashboard() {
    return (
        <div className="min-h-screen bg-white text-purple-900 flex flex-col">
            <header className="p-4 border-b border-purple-100 mb-4">
                <h1 className="text-2xl font-bold text-purple-800">Sponsor Analytics Dashboard</h1>
                <p className="text-sm text-purple-500 mt-1">Real-time insights and ROI metrics for event sponsors</p>
            </header>
            <main className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SponsorBoothTraffic />
                    <SponsorLeaderboard />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SponsorLogoImpressions />
                    <SponsorLeads />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SponsorContentEngagement />
                    <SponsorAnnouncementsReach />
                </div>
                <SponsorDemographics />
            </main>
        </div>
    );
} 