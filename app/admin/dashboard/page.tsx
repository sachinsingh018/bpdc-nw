'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Activity,
    Eye,
    Clock,
    TrendingUp,
    BarChart3,
    Calendar,
    Search,
    Filter,
    Download,
    RefreshCw,
    ArrowLeft,
    Shield,
    Database,
    ChartBar,
    Sparkles,
    Bot,
    FileText,
    Briefcase,
    Monitor,
    Zap,
    UserPlus,

} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

interface ActivityLog {
    id: string;
    user_id: string;
    email: string;
    name: string;
    action_type: string;
    action_category: string;
    resource_type?: string;
    resource_id?: string;
    metadata: any;
    created_at: string;
}

interface UserEngagement {
    id: string;
    email: string;
    name: string;
    registered_at: string;
    total_actions: number;
    total_sessions: number;
    total_page_views: number;
    last_activity: string;
    social_actions: number;
    content_actions: number;
    job_actions: number;
}

interface DailyTrends {
    activity_date: string;
    active_users: number;
    total_actions: number;
    auth_actions: number;
    social_actions: number;
    content_actions: number;
    job_actions: number;
    community_actions: number;
}

interface FeatureUsage {
    feature_name: string;
    usage_count: number;
}

interface Student {
    email: string;
    name: string;
    batch_year: string;
    profile: string;
}

export default function AdminDashboard() {
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);
    const [dailyTrends, setDailyTrends] = useState<DailyTrends[]>([]);
    const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [dateRange, setDateRange] = useState('7d');
    const [searchTerm, setSearchTerm] = useState('');
    const [userListSearchTerm, setUserListSearchTerm] = useState('');
    const [selectedBatchYear, setSelectedBatchYear] = useState('');
    const [selectedProfile, setSelectedProfile] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Pagination constants
    const USERS_PER_PAGE = 50;

    // Summary stats
    const [summaryStats, setSummaryStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalActions: 0,
        totalSessions: 0,
        newUsers: 0,
        newJobs: 0,
        userApplications: 0,
        auraBotApplications: 0,
    });

    useEffect(() => {
        loadDashboardData();
    }, [dateRange]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load summary stats
            const statsResponse = await fetch(`/api/admin/summary-stats?range=${dateRange}`);
            const stats = await statsResponse.json();
            setSummaryStats(stats);

            // Load recent activity
            const activityResponse = await fetch(`/api/admin/recent-activity?limit=50`);
            const activity = await activityResponse.json();
            setActivityLogs(activity);

            // Load user engagement
            const engagementResponse = await fetch(`/api/admin/user-engagement?limit=20`);
            const engagement = await engagementResponse.json();
            setUserEngagement(engagement);

            // Load daily trends
            const trendsResponse = await fetch(`/api/admin/daily-trends?days=30`);
            const trends = await trendsResponse.json();
            setDailyTrends(trends);

            // Load feature usage
            const featureResponse = await fetch(`/api/admin/feature-usage?days=30`);
            const features = await featureResponse.json();
            setFeatureUsage(features);

            // Load student data from CSV
            await loadStudentData();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentData = async () => {
        try {
            const response = await fetch('/bits_dubai_directory.csv');
            const csvText = await response.text();
            const lines = csvText.split('\n');

            // Skip header line and filter out empty lines
            const dataLines = lines.slice(1).filter(line => line.trim());

            const studentData: Student[] = dataLines.map(line => {
                // Parse CSV line properly handling commas within quoted fields
                const values = parseCSVLine(line);
                return {
                    email: values[0]?.trim() || '',
                    name: values[1]?.trim() || '',
                    batch_year: values[2]?.trim() || '',
                    profile: values[3]?.trim() || ''
                };
            }).filter(student => student.email && student.name); // Filter out invalid entries

            console.log(`Loaded ${studentData.length} students from CSV`);
            setStudents(studentData);
        } catch (error) {
            console.error('Error loading student data:', error);
            toast.error('Failed to load student directory data');
        }
    };

    // Helper function to parse CSV line properly
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    };

    const filteredActivityLogs = activityLogs.filter(log => {
        const matchesUser = !selectedUser || log.user_id === selectedUser;
        const matchesCategory = selectedCategory === 'all' || !selectedCategory || log.action_category === selectedCategory;
        const matchesSearch = !searchTerm ||
            log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action_type.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesUser && matchesCategory && matchesSearch;
    });

    const filteredStudents = students.filter(student => {
        const matchesSearch = !userListSearchTerm ||
            student.name?.toLowerCase().includes(userListSearchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(userListSearchTerm.toLowerCase());
        const matchesBatch = !selectedBatchYear || selectedBatchYear === 'all' || student.batch_year === selectedBatchYear;
        const matchesProfile = !selectedProfile || selectedProfile === 'all' || student.profile === selectedProfile;
        return matchesSearch && matchesBatch && matchesProfile;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredStudents.length / USERS_PER_PAGE);
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [userListSearchTerm, selectedBatchYear, selectedProfile]);

    const getActionCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            authentication: 'bg-blue-100 text-blue-800',
            social: 'bg-green-100 text-green-800',
            content: 'bg-purple-100 text-purple-800',
            communities: 'bg-orange-100 text-orange-800',
            jobs: 'bg-indigo-100 text-indigo-800',
            skills: 'bg-pink-100 text-pink-800',
            messaging: 'bg-teal-100 text-teal-800',
            search: 'bg-gray-100 text-gray-800',
            navigation: 'bg-yellow-100 text-yellow-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const handleGeneratePdf = async () => {
        const safeActivityLogs = Array.isArray(activityLogs) ? activityLogs : [];
        const safeUserEngagement = Array.isArray(userEngagement) ? userEngagement : [];
        const safeDailyTrends = Array.isArray(dailyTrends) ? dailyTrends : [];
        const safeFeatureUsage = Array.isArray(featureUsage) ? featureUsage : [];
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 40;

        // --- Gen Z Gradient Background (for each page) ---
        const drawGenZBackground = () => {
            // Simulate a bold, glassy gradient background
            doc.setFillColor(124, 58, 237, 0.22 * 255); // purple
            doc.rect(0, 0, pageWidth, pageHeight * 0.45, 'F');
            doc.setFillColor(236, 72, 153, 0.13 * 255); // pink
            doc.rect(0, pageHeight * 0.25, pageWidth, pageHeight * 0.5, 'F');
            doc.setFillColor(59, 130, 246, 0.10 * 255); // blue
            doc.rect(0, pageHeight * 0.7, pageWidth, pageHeight * 0.3, 'F');
        };
        drawGenZBackground();

        // --- Header ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(38);
        doc.setTextColor(124, 58, 237);
        doc.text('NetworkQy', pageWidth / 2, y + 30, { align: 'center' });
        doc.setFontSize(20);
        doc.setTextColor(236, 72, 153);
        doc.text('Admin Dashboard Report', pageWidth / 2, y + 65, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text(`Range: ${dateRange}`, pageWidth / 2, y + 90, { align: 'center' });
        y += 110;

        // --- Summary Stats 2x2 Glassy Grid ---
        const statBoxW = 200, statBoxH = 100, statGapX = 50, statGapY = 40;
        const stats = [
            { label: 'Total Users', value: summaryStats.totalUsers ?? 0, color1: [124, 58, 237], color2: [59, 130, 246], subtext: `${summaryStats.newUsers?.toLocaleString() || '0'} new in last ${dateRange}`, },
            { label: 'Active Users', value: summaryStats.activeUsers ?? 0, color1: [236, 72, 153], color2: [168, 85, 247] },
            { label: 'Total Actions', value: summaryStats.totalActions ?? 0, color1: [16, 185, 129], color2: [59, 130, 246] },
            { label: 'Total Sessions', value: summaryStats.totalSessions ?? 0, color1: [236, 72, 153], color2: [139, 92, 246] },
        ];
        const gridStartX = (pageWidth - (statBoxW * 2 + statGapX)) / 2;
        let statY = y;
        stats.forEach((stat, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const statX = gridStartX + col * (statBoxW + statGapX);
            const statYBox = statY + row * (statBoxH + statGapY);
            // Glassy card with gradient border
            doc.setDrawColor(stat.color1[0], stat.color1[1], stat.color1[2]);
            doc.setLineWidth(3);
            doc.setFillColor(255, 255, 255, 0.85 * 255);
            doc.roundedRect(statX, statYBox, statBoxW, statBoxH, 22, 22, 'FD');
            // Gradient border simulation: draw a slightly larger rounded rect behind
            doc.setDrawColor(stat.color2[0], stat.color2[1], stat.color2[2]);
            doc.setLineWidth(7);
            doc.roundedRect(statX - 6, statYBox - 6, statBoxW + 12, statBoxH + 12, 28, 28, 'S');
            // Stat label
            doc.setFontSize(15);
            doc.setTextColor(stat.color1[0], stat.color1[1], stat.color1[2]);
            doc.text(stat.label, statX + 30, statYBox + 38);
            // Stat value
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(38);
            doc.setTextColor(stat.color2[0], stat.color2[1], stat.color2[2]);
            doc.text(String(stat.value ?? 0), statX + 30, statYBox + 80);
            doc.setFont('helvetica', 'normal');
        });
        y += (statBoxH + statGapY) * 2 + 20;

        // --- Section Header Helper ---
        const sectionHeader = (label: string, y: number, color1: number[], color2: number[]) => {
            // Gradient bar
            doc.setFillColor(color1[0], color1[1], color1[2], 0.85 * 255);
            doc.rect(50, y, pageWidth - 100, 36, 'F');
            doc.setFillColor(color2[0], color2[1], color2[2], 0.65 * 255);
            doc.rect(50, y + 18, pageWidth - 100, 18, 'F');
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text(label, 60, y + 26);
        };

        // --- Recent Activity Table ---
        sectionHeader('Recent Activity', y, [124, 58, 237], [236, 72, 153]);
        y += 50;
        autoTable(doc, {
            startY: y,
            head: [['User', 'Action', 'Category', 'Date']],
            body: safeActivityLogs.slice(0, 50).map(log => [
                String(log.name ?? log.email ?? ''),
                String(log.action_type ?? '0'),
                String(log.action_category ?? '0'),
                log.created_at ? new Date(log.created_at).toLocaleString() : '0',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 13 },
            bodyStyles: { textColor: [55, 65, 81], fontSize: 12 },
            alternateRowStyles: { fillColor: [243, 232, 255] },
            margin: { left: 50, right: 50 },
            styles: { font: 'helvetica', fontSize: 12, cellPadding: 6 },
            tableLineWidth: 0.5,
            tableLineColor: [236, 72, 153],
            didDrawPage: (data) => {
                // Drop shadow effect
                doc.setDrawColor(236, 72, 153, 0.18 * 255);
                doc.setLineWidth(8);
                const x = Number(data.settings.margin.left) - 6;
                const y = Number(data.settings.startY) - 6;
                // @ts-ignore
                const w = Number(data.table.width) + 12;
                // @ts-ignore
                const h = Number(data.table.height) + 12;
                if (isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h) && w > 0 && h > 0) {
                    doc.roundedRect(x, y, w, h, 18, 18, 'S');
                }
            },
        });
        // @ts-ignore
        y = doc.lastAutoTable.finalY + 40;

        // --- User Engagement Table ---
        sectionHeader('User Engagement', y, [236, 72, 153], [168, 85, 247]);
        y += 50;
        autoTable(doc, {
            startY: y,
            head: [['Name', 'Email', 'Registered', 'Actions', 'Sessions', 'Page Views', 'Last Activity']],
            body: safeUserEngagement.slice(0, 50).map(user => [
                String(user.name ?? user.email ?? ''),
                String(user.email ?? ''),
                user.registered_at ? new Date(user.registered_at).toLocaleDateString() : '0',
                String(user.total_actions ?? 0),
                String(user.total_sessions ?? 0),
                String(user.total_page_views ?? 0),
                user.last_activity ? new Date(user.last_activity).toLocaleString() : '0',
            ]),
            theme: 'striped',
            headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 13 },
            bodyStyles: { textColor: [55, 65, 81], fontSize: 12 },
            alternateRowStyles: { fillColor: [243, 232, 255] },
            margin: { left: 50, right: 50 },
            styles: { font: 'helvetica', fontSize: 12, cellPadding: 6 },
            tableLineWidth: 0.5,
            tableLineColor: [168, 85, 247],
            didDrawPage: (data) => {
                doc.setDrawColor(168, 85, 247, 0.18 * 255);
                doc.setLineWidth(8);
                const x = Number(data.settings.margin.left) - 6;
                const y = Number(data.settings.startY) - 6;
                // @ts-ignore
                const w = Number(data.table.width) + 12;
                // @ts-ignore
                const h = Number(data.table.height) + 12;
                if (isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h) && w > 0 && h > 0) {
                    doc.roundedRect(x, y, w, h, 18, 18, 'S');
                }
            },
        });
        // @ts-ignore
        y = doc.lastAutoTable.finalY + 40;

        // --- Daily Trends Table ---
        sectionHeader('Daily Trends', y, [59, 130, 246], [124, 58, 237]);
        y += 50;
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Active Users', 'Total Actions', 'Auth', 'Social', 'Content', 'Job', 'Community']],
            body: safeDailyTrends.slice(0, 50).map(trend => [
                trend.activity_date ? new Date(trend.activity_date).toLocaleDateString() : '0',
                String(trend.active_users ?? 0),
                String(trend.total_actions ?? 0),
                String(trend.auth_actions ?? 0),
                String(trend.social_actions ?? 0),
                String(trend.content_actions ?? 0),
                String(trend.job_actions ?? 0),
                String(trend.community_actions ?? 0),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 13 },
            bodyStyles: { textColor: [55, 65, 81], fontSize: 12 },
            alternateRowStyles: { fillColor: [243, 232, 255] },
            margin: { left: 50, right: 50 },
            styles: { font: 'helvetica', fontSize: 12, cellPadding: 6 },
            tableLineWidth: 0.5,
            tableLineColor: [124, 58, 237],
            didDrawPage: (data) => {
                doc.setDrawColor(124, 58, 237, 0.18 * 255);
                doc.setLineWidth(8);
                const x = Number(data.settings.margin.left) - 6;
                const y = Number(data.settings.startY) - 6;
                // @ts-ignore
                const w = Number(data.table.width) + 12;
                // @ts-ignore
                const h = Number(data.table.height) + 12;
                if (isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h) && w > 0 && h > 0) {
                    doc.roundedRect(x, y, w, h, 18, 18, 'S');
                }
            },
        });
        // @ts-ignore
        y = doc.lastAutoTable.finalY + 40;

        // --- Feature Usage Table ---
        sectionHeader('Feature Usage', y, [236, 72, 153], [59, 130, 246]);
        y += 50;
        autoTable(doc, {
            startY: y,
            head: [['Feature', 'Usage Count']],
            body: safeFeatureUsage.slice(0, 50).map(feature => [
                String(feature.feature_name ?? ''),
                String(feature.usage_count ?? 0),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 13 },
            bodyStyles: { textColor: [55, 65, 81], fontSize: 12 },
            alternateRowStyles: { fillColor: [243, 232, 255] },
            margin: { left: 50, right: 50 },
            styles: { font: 'helvetica', fontSize: 12, cellPadding: 6 },
            tableLineWidth: 0.5,
            tableLineColor: [59, 130, 246],
            didDrawPage: (data) => {
                doc.setDrawColor(59, 130, 246, 0.18 * 255);
                doc.setLineWidth(8);
                const x = Number(data.settings.margin.left) - 6;
                const y = Number(data.settings.startY) - 6;
                // @ts-ignore
                const w = Number(data.table.width) + 12;
                // @ts-ignore
                const h = Number(data.table.height) + 12;
                if (isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h) && w > 0 && h > 0) {
                    doc.roundedRect(x, y, w, h, 18, 18, 'S');
                }
            },
        });
        // @ts-ignore
        y = doc.lastAutoTable.finalY + 40;

        // --- Charts Section ---
        // Daily Trends Chart
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '600px';
        chartContainer.style.height = '300px';
        document.body.appendChild(chartContainer);
        const chartCanvas = document.createElement('canvas');
        chartContainer.appendChild(chartCanvas);
        const chart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: safeDailyTrends.map(trend => trend.activity_date ? new Date(trend.activity_date).toLocaleDateString() : ''),
                datasets: [
                    {
                        label: 'Active Users',
                        data: safeDailyTrends.map(trend => trend.active_users ?? 0),
                        borderColor: 'rgba(124,58,237,1)',
                        backgroundColor: 'rgba(124,58,237,0.2)',
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: 'Total Actions',
                        data: safeDailyTrends.map(trend => trend.total_actions ?? 0),
                        borderColor: 'rgba(236,72,153,1)',
                        backgroundColor: 'rgba(236,72,153,0.2)',
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                plugins: { legend: { labels: { color: '#333', font: { size: 14 } } } },
                scales: { x: { ticks: { color: '#333' } }, y: { ticks: { color: '#333' } } },
            },
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        const chartImage = await html2canvas(chartCanvas, { backgroundColor: null }).then(canvas => canvas.toDataURL('image/png'));
        doc.addPage();
        drawGenZBackground();
        doc.setFontSize(18);
        doc.setTextColor(124, 58, 237);
        doc.text('Daily Trends Chart', 50, 60);
        doc.addImage(chartImage, 'PNG', 50, 80, 500, 250);
        chart.destroy();
        chartContainer.remove();

        // Feature Usage Chart
        const chartContainer2 = document.createElement('div');
        chartContainer2.style.width = '600px';
        chartContainer2.style.height = '300px';
        document.body.appendChild(chartContainer2);
        const chartCanvas2 = document.createElement('canvas');
        chartContainer2.appendChild(chartCanvas2);
        const chart2 = new Chart(chartCanvas2, {
            type: 'bar',
            data: {
                labels: safeFeatureUsage.map(f => f.feature_name),
                datasets: [
                    {
                        label: 'Usage Count',
                        data: safeFeatureUsage.map(f => f.usage_count ?? 0),
                        backgroundColor: 'rgba(236,72,153,0.7)',
                        borderColor: 'rgba(236,72,153,1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { color: '#333' } }, y: { ticks: { color: '#333' } } },
            },
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        const chartImage2 = await html2canvas(chartCanvas2, { backgroundColor: null }).then(canvas => canvas.toDataURL('image/png'));
        doc.addPage();
        drawGenZBackground();
        doc.setFontSize(18);
        doc.setTextColor(124, 58, 237);
        doc.text('Feature Usage Chart', 50, 60);
        doc.addImage(chartImage2, 'PNG', 50, 80, 500, 250);
        chart2.destroy();
        chartContainer2.remove();

        // --- Footer ---
        doc.setFontSize(14);
        doc.setTextColor(236, 72, 153);
        doc.text('Stay curious. Stay bold. Stay Gen Z. ✨', pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: 'center' });
        doc.setFontSize(11);
        doc.setTextColor(180, 180, 180);
        doc.text('Generated by NetworkQy Admin Dashboard', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
        doc.text('Generated on: ' + new Date().toLocaleString(), pageWidth / 2, doc.internal.pageSize.getHeight() - 2, { align: 'center' });

        doc.save('dashboard-report.pdf');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <RefreshCw className="size-5 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                background: `
                  radial-gradient(circle at 20% 20%, rgba(25, 25, 112, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(220, 20, 60, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 60% 80%, rgba(47, 79, 79, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 10% 80%, rgba(128, 128, 128, 0.5) 0%, transparent 50%),
                  radial-gradient(circle at 90% 60%, rgba(70, 130, 180, 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 30% 40%, rgba(255, 223, 0, 0.8) 0%, transparent 50%),
                  radial-gradient(circle at 70% 40%, rgba(255, 0, 0, 0.7) 0%, transparent 50%),
                  radial-gradient(circle at 50% 10%, rgba(138, 43, 226, 0.6) 0%, transparent 50%),
                  linear-gradient(135deg, rgba(25, 25, 112, 0.3) 0%, rgba(47, 79, 79, 0.4) 50%, rgba(138, 43, 226, 0.3) 100%)
                `
            }}
        >
            {/* Dynamic Vibrant Background Elements */}
            <div className="fixed inset-0 z-0">
                {/* Deep Royal Blue */}
                <div className="absolute top-10 left-5 size-96 rounded-full blur-3xl opacity-70 animate-pulse" style={{ background: 'rgba(25, 25, 112, 0.6)' }}></div>
                <div className="absolute top-1/3 right-10 size-80 rounded-full blur-3xl opacity-60 animate-pulse delay-1000" style={{ background: 'rgba(25, 25, 112, 0.5)' }}></div>

                {/* Bright Golden Yellow */}
                <div className="absolute top-20 right-20 size-72 rounded-full blur-3xl opacity-80 animate-pulse delay-2000" style={{ background: 'rgba(255, 215, 0, 0.7)' }}></div>
                <div className="absolute bottom-1/4 left-1/4 size-88 rounded-full blur-3xl opacity-75 animate-pulse delay-1500" style={{ background: 'rgba(255, 215, 0, 0.6)' }}></div>

                {/* Crimson Red */}
                <div className="absolute bottom-20 left-1/3 size-64 rounded-full blur-3xl opacity-70 animate-pulse delay-500" style={{ background: 'rgba(220, 20, 60, 0.6)' }}></div>
                <div className="absolute top-1/2 right-1/3 size-56 rounded-full blur-3xl opacity-65 animate-pulse delay-3000" style={{ background: 'rgba(220, 20, 60, 0.5)' }}></div>

                {/* Charcoal Black */}
                <div className="absolute bottom-10 right-5 size-72 rounded-full blur-3xl opacity-50 animate-pulse delay-2500" style={{ background: 'rgba(47, 79, 79, 0.6)' }}></div>

                {/* Light Gray */}
                <div className="absolute top-1/4 left-1/2 size-60 rounded-full blur-3xl opacity-40 animate-pulse delay-4000" style={{ background: 'rgba(128, 128, 128, 0.4)' }}></div>

                {/* Mid-tone Blue */}
                <div className="absolute bottom-1/3 right-1/4 size-68 rounded-full blur-3xl opacity-55 animate-pulse delay-3500" style={{ background: 'rgba(70, 130, 180, 0.5)' }}></div>

                {/* Warm Golden Glow */}
                <div className="absolute top-1/2 left-1/5 size-76 rounded-full blur-3xl opacity-85 animate-pulse delay-1800" style={{ background: 'rgba(255, 223, 0, 0.7)' }}></div>

                {/* Vibrant Red */}
                <div className="absolute top-2/3 right-1/5 size-52 rounded-full blur-3xl opacity-75 animate-pulse delay-2200" style={{ background: 'rgba(255, 0, 0, 0.6)' }}></div>

                {/* Neon Purple */}
                <div className="absolute top-1/6 left-2/3 size-84 rounded-full blur-3xl opacity-60 animate-pulse delay-2800" style={{ background: 'rgba(138, 43, 226, 0.5)' }}></div>
                <div className="absolute bottom-1/6 left-1/6 size-48 rounded-full blur-3xl opacity-70 animate-pulse delay-1200" style={{ background: 'rgba(138, 43, 226, 0.6)' }}></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => window.history.back()}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-white/20 backdrop-blur-md bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Shield className="size-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-purple-200">Monitor user activity and platform usage</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                                <SelectItem value="1d">Last 24h</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={loadDashboardData}
                            variant="outline"
                            size="sm"
                            className="text-white border-white/20 hover:bg-white/10"
                        >
                            <RefreshCw className="size-4" />
                        </Button>
                        <Button
                            onClick={handleGeneratePdf}
                            variant="default"
                            size="sm"
                            className="text-white bg-gradient-to-r from-purple-500 to-pink-500 border-white/20 hover:from-pink-500 hover:to-purple-500 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60"
                            disabled={generatingPdf}
                        >
                            <Download className="size-4 mr-1" />
                            Generate PDF Report
                        </Button>
                        <Button
                            onClick={async () => {
                                const feedbackLink = 'https://networkqy.com/feedback-template';
                                const recipients = [
                                    'yathartkherwork@gmail.com',
                                    'sachinsingh018@gmail.com'
                                ];
                                const subject = '🌟 We Value Your Voice: Share Your Feedback with NetworkQy!';
                                const body = `
            <div style='font-family: Arial, sans-serif; color: #222;'>
                <h2 style='color: #7c3aed;'>Hi there!</h2>
                <p>We're always striving to make <b>NetworkQy</b> better for you. Your experience and ideas matter to us!</p>
                <p>Could you take a minute to share your thoughts? Your feedback helps us shape the future of our platform.</p>
                <p style='margin: 24px 0;'>
                    <a href='${feedbackLink}' style='background: linear-gradient(90deg, #7c3aed, #ec4899); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>
                        Give Feedback
                    </a>
                </p>
                <p>Thank you for being a part of our community!<br/>Stay curious. Stay bold. Stay Gen Z. ✨</p>
                <hr style='margin: 24px 0; border: none; border-top: 1px solid #eee;'>
                <p style='font-size: 12px; color: #888;'>If you have any questions, reply to this email or contact us at support@networkqy.com</p>
            </div>
        `;
                                let allSuccess = true;
                                for (const email of recipients) {
                                    try {
                                        const res = await fetch('/api/send-feedback-link', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ to: email, subject, body }),
                                        });
                                        if (!res.ok) allSuccess = false;
                                    } catch (err) {
                                        allSuccess = false;
                                    }
                                }
                                if (allSuccess) {
                                    toast.success('Feedback form link sent to users!');
                                } else {
                                    toast.error('Failed to send feedback form link to one or more users.');
                                }
                            }}
                            variant="default"
                            size="sm"
                            className="text-white bg-gradient-to-r from-blue-500 to-purple-500 border-white/20 hover:from-purple-500 hover:to-blue-500 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 font-semibold"
                        >
                            <Sparkles className="size-4 mr-1" />
                            Give Feedback
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users (All Time) */}
                    {/* New Users (Selected Range) */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">New Users</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <UserPlus className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.newUsers?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">
                                Registered in last {dateRange}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Users (Selected Range) */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                <Activity className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.activeUsers?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">In last {dateRange}</p>
                        </CardContent>
                    </Card>

                    {/* Total Actions */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Total Actions</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                                <Zap className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.totalActions?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">In last {dateRange}</p>
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Active Sessions</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Monitor className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.totalSessions?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">In last {dateRange}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">New Job Postings</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                <Briefcase className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.newJobs?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">Posted in last {dateRange}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Job Applications (Users)</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                                <FileText className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.userApplications?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">in last {dateRange}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Job Applications (Aura Bot)</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-move-500 rounded-lg">
                                <Bot className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{summaryStats.auraBotApplications?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-purple-200">in last {dateRange}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-white">Page Views</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <Eye className="size-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{((summaryStats.totalActions || 0) * 2.5).toLocaleString()}</div>
                            <p className="text-xs text-purple-200">
                                Estimated from actions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="activity" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-md border-white/20">
                        <TabsTrigger value="activity" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Recent Activity</TabsTrigger>
                        <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">User Engagement</TabsTrigger>
                        <TabsTrigger value="trends" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Daily Trends</TabsTrigger>
                        <TabsTrigger value="features" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">Feature Usage</TabsTrigger>
                        <TabsTrigger value="userlist" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white">User List</TabsTrigger>
                    </TabsList>

                    {/* Recent Activity Tab */}
                    <TabsContent value="activity" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Database className="size-5" />
                                    Recent User Activity
                                </CardTitle>
                                <CardDescription className="text-purple-200">Latest actions across the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by user, action, or content..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                        />
                                    </div>
                                    <Select value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="authentication">Authentication</SelectItem>
                                            <SelectItem value="social">Social</SelectItem>
                                            <SelectItem value="content">Content</SelectItem>
                                            <SelectItem value="communities">Communities</SelectItem>
                                            <SelectItem value="jobs">Jobs</SelectItem>
                                            <SelectItem value="skills">Skills</SelectItem>
                                            <SelectItem value="messaging">Messaging</SelectItem>
                                            <SelectItem value="search">Search</SelectItem>
                                            <SelectItem value="navigation">Navigation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Activity List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {(filteredActivityLogs || []).map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-white">
                                                        {log.name?.charAt(0) || log.email?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-white">
                                                            {log.name || log.email || 'Unknown User'}
                                                        </span>
                                                        <Badge className={`${getActionCategoryColor(log.action_category)} bg-white/20 backdrop-blur-md border-white/20`}>
                                                            {log.action_category}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-purple-200">
                                                        {log.action_type.replace(/_/g, ' ')}
                                                        {log.resource_type && ` • ${log.resource_type}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-purple-200">
                                                    {formatRelativeTime(log.created_at)}
                                                </div>
                                                <div className="text-xs text-purple-300">
                                                    {formatDate(log.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* User Engagement Tab */}
                    <TabsContent value="users" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="size-5" />
                                    User Engagement
                                </CardTitle>
                                <CardDescription className="text-purple-200">Most active users and their activity patterns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.isArray(userEngagement) ? userEngagement.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{user.name || user.email}</div>
                                                    <div className="text-sm text-purple-200">
                                                        Joined {formatDate(user.registered_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-white">{user.total_actions} actions</div>
                                                <div className="text-sm text-purple-200">
                                                    {user.total_sessions} sessions • {user.total_page_views} page views
                                                </div>
                                                <div className="text-xs text-purple-300">
                                                    Last active: {formatRelativeTime(user.last_activity)}
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="text-purple-200">No data available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Daily Trends Tab */}
                    <TabsContent value="trends" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ChartBar className="size-5" />
                                    Daily Activity Trends
                                </CardTitle>
                                <CardDescription className="text-purple-200">Platform usage over the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.isArray(dailyTrends) ? dailyTrends.slice(0, 10).map((trend) => (
                                        <div key={trend.activity_date} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div>
                                                <div className="font-medium text-white">{new Date(trend.activity_date).toLocaleDateString()}</div>
                                                <div className="text-sm text-purple-200">
                                                    {trend.active_users} active users
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-white">{trend.total_actions} total actions</div>
                                                <div className="text-sm text-purple-200">
                                                    Auth: {trend.auth_actions} • Social: {trend.social_actions} • Content: {trend.content_actions}
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="text-purple-200">No data available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Feature Usage Tab */}
                    <TabsContent value="features" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <TrendingUp className="size-5" />
                                    Feature Usage
                                </CardTitle>
                                <CardDescription className="text-purple-200">Most used features in the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.isArray(featureUsage) ? featureUsage.map((feature) => (
                                        <div key={feature.feature_name} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div>
                                                <div className="font-medium capitalize text-white">
                                                    {feature.feature_name.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-white">{feature.usage_count.toLocaleString()} uses</div>
                                            </div>
                                        </div>
                                    )) : <div className="text-purple-200">No data available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* User List Tab */}
                    <TabsContent value="userlist" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="size-5" />
                                    Student Directory
                                </CardTitle>
                                <CardDescription className="text-purple-200">Complete list of BITS Dubai students and alumni</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by name or email..."
                                            value={userListSearchTerm}
                                            onChange={(e) => setUserListSearchTerm(e.target.value)}
                                            className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                                        />
                                    </div>
                                    <Select value={selectedBatchYear || 'all'} onValueChange={setSelectedBatchYear}>
                                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="All Batches" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Batches</SelectItem>
                                            <SelectItem value="2016">2016</SelectItem>
                                            <SelectItem value="2017">2017</SelectItem>
                                            <SelectItem value="2018">2018</SelectItem>
                                            <SelectItem value="2019">2019</SelectItem>
                                            <SelectItem value="2020">2020</SelectItem>
                                            <SelectItem value="2021">2021</SelectItem>
                                            <SelectItem value="2022">2022</SelectItem>
                                            <SelectItem value="2023">2023</SelectItem>
                                            <SelectItem value="2024">2024</SelectItem>
                                            <SelectItem value="2025">2025</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedProfile || 'all'} onValueChange={setSelectedProfile}>
                                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                                            <SelectValue placeholder="All Profiles" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/20">
                                            <SelectItem value="all">All Profiles</SelectItem>
                                            <SelectItem value="student">Students</SelectItem>
                                            <SelectItem value="alumni">Alumni</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Clear Filters Button */}
                                {(userListSearchTerm || selectedBatchYear !== '' || selectedProfile !== '') && (
                                    <div className="mb-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setUserListSearchTerm('');
                                                setSelectedBatchYear('');
                                                setSelectedProfile('');
                                            }}
                                            className="bg-white/10 border-white/20 text-black hover:bg-white/20"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                )}

                                {/* Student Statistics */}
                                <div className="flex items-center gap-4 mb-4 text-sm text-purple-200">
                                    <span>Total: {students.length} students</span>
                                    <span>•</span>
                                    <span>Alumni: {students.filter(s => s.profile === 'alumni').length}</span>
                                    <span>•</span>
                                    <span>Current Students: {students.filter(s => s.profile === 'student').length}</span>
                                    <span>•</span>
                                    <span>Showing: {filteredStudents.length}</span>
                                </div>

                                {/* Student Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                                    {paginatedStudents.map((student, index) => (
                                        <div key={index} className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="size-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-white">
                                                        {student.name?.charAt(0) || student.email?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-white truncate">
                                                        {student.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-purple-200 truncate">
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-purple-200">Batch:</span>
                                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                        {student.batch_year}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-purple-200">Profile:</span>
                                                    <Badge className={`${student.profile === 'alumni' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs`}>
                                                        {student.profile}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {paginatedStudents.length === 0 && (
                                    <div className="text-center py-8 text-purple-200">
                                        No students found matching your criteria
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-purple-200">
                                            Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                variant="outline"
                                                size="sm"
                                                className="text-black border-white/20 hover:bg-white/10 disabled:opacity-50"
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <Button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            variant={currentPage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            className={`text-black border-white/20 hover:bg-white/10 ${currentPage === pageNum
                                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                                : ''
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                            <Button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                variant="outline"
                                                size="sm"
                                                className="text-black border-white/20 hover:bg-white/10 disabled:opacity-50"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {totalPages === 1 && (
                                    <div className="mt-4 text-sm text-purple-200">
                                        Showing {filteredStudents.length} of {students.length} students
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 