import TopNavBar from '@/components/event-admin-dashboard/TopNavBar';
import StatsPanel from '@/components/event-admin-dashboard/StatsPanel';
import ActivityGraph from '@/components/event-admin-dashboard/ActivityGraph';
import AttendeeIntelligence from '@/components/event-admin-dashboard/AttendeeIntelligence';
import AIConnectionsPanel from '@/components/event-admin-dashboard/AIConnectionsPanel';
import SessionBoothAnalytics from '@/components/event-admin-dashboard/SessionBoothAnalytics';
import ConciergeChatLogs from '@/components/event-admin-dashboard/ConciergeChatLogs';
import ContentAnnouncements from '@/components/event-admin-dashboard/ContentAnnouncements';
import AccessPermissions from '@/components/event-admin-dashboard/AccessPermissions';
import ExportReports from '@/components/event-admin-dashboard/ExportReports';
import PulseBar from '@/components/event-admin-dashboard/PulseBar';

export default function EventAdminDashboard() {
    return (
        <div className="min-h-screen bg-white text-purple-900 flex flex-col">
            <TopNavBar />
            <main className="flex-1 p-4 md:p-8 space-y-6">
                <StatsPanel />
                <ActivityGraph />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AttendeeIntelligence />
                    <AIConnectionsPanel />
                </div>
                <SessionBoothAnalytics />
                <ConciergeChatLogs />
                <ContentAnnouncements />
                <AccessPermissions />
                <ExportReports />
            </main>
            <PulseBar />
        </div>
    );
} 