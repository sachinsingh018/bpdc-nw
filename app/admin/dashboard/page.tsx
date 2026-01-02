'use client';

import { useEffect, useState, useCallback } from 'react';
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
    Upload,
    Building2,
    AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
// eslint-disable-next-line import/no-named-as-default
import autoTable from 'jspdf-autotable';
// eslint-disable-next-line import/no-named-as-default
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { adminCreateUser, type AdminCreateUserActionState } from '@/app/(auth)/actions';
import { useActionState } from 'react';
import Form from 'next/form';

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
    id: string;
    email: string;
    name: string;
    batch_year: string;
    profile: string;
    headline?: string;
    avatarUrl?: string;
    createdAt?: string;
}

export default function AdminDashboard() {
    const router = useRouter();
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
    const [uploadingCompanies, setUploadingCompanies] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [companyFiles, setCompanyFiles] = useState<Array<{ key: string; fileName: string; fileUrl: string; size: number; lastModified: string }>>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [userRole, setUserRole] = useState<string>('');
    const [roleLoading, setRoleLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

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

    // Enable smooth scrolling globally and optimize for all devices
    useEffect(() => {
        // Set smooth scrolling on html element
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.style.scrollBehavior = 'smooth';

        // Optimize for touch devices (Surface, tablets, etc.)
        document.documentElement.style.touchAction = 'pan-y';
        document.body.style.touchAction = 'pan-y';

        // Prevent scroll chaining issues
        document.documentElement.style.overscrollBehavior = 'auto';
        document.body.style.overscrollBehavior = 'auto';

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';
            document.documentElement.style.touchAction = '';
            document.body.style.touchAction = '';
            document.documentElement.style.overscrollBehavior = '';
            document.body.style.overscrollBehavior = '';
        };
    }, []);

    // Check user role and permissions
    const checkUserRole = async () => {
        setRoleLoading(true);
        try {
            console.log('=== ADMIN DASHBOARD ROLE CHECK DEBUG ===');
            console.log('Fetching user profile...');

            const response = await fetch('/api/user/profile');
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const userData = await response.json();
                console.log('User data received:', userData);

                const role = userData.role;
                console.log('Extracted role:', role);
                console.log('Role type:', typeof role);
                console.log('Role is admin?', role === 'admin');

                setUserRole(role);

                // Check if user has admin role
                if (!role || role !== 'admin') {
                    console.log('Access denied - role is not admin. Role:', role);
                    setAccessDenied(true);
                    toast.error('Access denied. Admin role required.');
                    // Redirect to home page after 2 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 2000);
                    return false;
                }
                console.log('Access granted - role is admin:', role);
                return true;
            } else {
                const errorData = await response.json();
                console.log('API Error:', errorData);
                setAccessDenied(true);
                toast.error('Unable to verify user permissions.');
                return false;
            }
        } catch (error) {
            console.error('Error checking user role:', error);
            setAccessDenied(true);
            toast.error('Error verifying user permissions.');
            return false;
        } finally {
            setRoleLoading(false);
        }
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            const hasAccess = await checkUserRole();
            if (hasAccess) {
                loadDashboardData();
                loadCompanyFiles();
            }
        };
        initializeDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    useEffect(() => {
        if (!roleLoading && !accessDenied) {
            loadDashboardData();
            loadCompanyFiles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]); // Only reload when dateRange changes

    // Reload users when filters or page changes
    useEffect(() => {
        if (!roleLoading && !accessDenied) {
            loadStudentData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, userListSearchTerm, selectedBatchYear, selectedProfile]); // Only reload when filters change

    const loadCompanyFiles = async () => {
        setLoadingFiles(true);
        try {
            const response = await fetch('/api/admin/upload-companies');
            if (response.ok) {
                const data = await response.json();
                setCompanyFiles(data.files || []);
            }
        } catch (error) {
            console.error('Error loading company files:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

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

            // Load user data from database
            await loadStudentData();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentData = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: USERS_PER_PAGE.toString(),
            });

            if (userListSearchTerm) {
                params.append('search', userListSearchTerm);
            }
            if (selectedBatchYear && selectedBatchYear !== 'all') {
                params.append('batchYear', selectedBatchYear);
            }
            if (selectedProfile && selectedProfile !== 'all') {
                params.append('profile', selectedProfile);
            }

            const response = await fetch(`/api/admin/users?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            const studentData: Student[] = (data.users || []).map((u: any) => ({
                id: u.id,
                email: u.email || '',
                name: u.name || '',
                batch_year: u.batch_year || '',
                profile: u.profile || 'student',
                headline: u.headline,
                avatarUrl: u.avatarUrl,
                createdAt: u.createdAt,
            }));

            console.log(`Loaded ${studentData.length} users from database`);
            setStudents(studentData);
            setTotalUsers(data.total || 0);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error loading user data:', error);
            toast.error('Failed to load user directory data');
        }
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

    // Users are already filtered and paginated by the API
    const filteredStudents = students;
    const paginatedStudents = students;

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

    // Show loading state while checking role
    if (roleLoading) {
        return (
            <div
                className="min-h-screen relative overflow-x-hidden flex items-center justify-center"
                style={{
                    touchAction: 'pan-y',
                    overscrollBehavior: 'auto'
                }}
            >
                {/* Blurred Background - matching admin dashboard */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'scroll',
                        filter: 'blur(4px)',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                />
                <div className="text-center relative z-10">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">Verifying permissions...</h2>
                    <p className="text-black font-medium">Checking user access</p>
                </div>
            </div>
        );
    }

    // Show access denied if user doesn't have required role
    if (accessDenied) {
        return (
            <div
                className="min-h-screen relative overflow-x-hidden flex items-center justify-center"
                style={{
                    touchAction: 'pan-y',
                    overscrollBehavior: 'auto'
                }}
            >
                {/* Blurred Background - matching admin dashboard */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'scroll',
                        filter: 'blur(4px)',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                />
                <Card className="w-full max-w-md backdrop-blur-sm border-2 shadow-xl relative z-10" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.1) 30%, rgba(138, 43, 226, 0.1) 70%, rgba(255, 255, 255, 0.95) 100%)',
                    borderColor: 'rgba(255, 215, 0, 0.6)',
                    boxShadow: '0 25px 50px rgba(25, 25, 112, 0.2), 0 0 30px rgba(255, 215, 0, 0.1)'
                }}>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <Shield className="size-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-2xl">Access Denied</CardTitle>
                        <CardDescription>
                            You need admin privileges to access this dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-sm text-black">
                                <AlertTriangle className="size-4" />
                                <span>Current role: {userRole || 'Unknown'}</span>
                            </div>
                            <Button
                                onClick={() => router.push('/')}
                                className="w-full"
                            >
                                Go to Homepage
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className="min-h-screen relative overflow-x-hidden flex items-center justify-center"
                style={{
                    touchAction: 'pan-y',
                    overscrollBehavior: 'auto'
                }}
            >
                {/* Blurred Background */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/bpdcbg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'scroll',
                        filter: 'blur(4px)',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                />
                <div className="text-center relative z-10">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">Loading dashboard...</h2>
                    <p className="text-black font-medium">Fetching dashboard data</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-x-hidden"
            style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'auto',
                touchAction: 'pan-y',
                willChange: 'scroll-position'
            }}
        >
            {/* Blurred Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: 'url(/bpdcbg.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'scroll',
                    filter: 'blur(4px)',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                }}
            />

            <div
                className="container mx-auto px-4 py-8 relative z-10 pb-20"
                style={{
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    willChange: 'scroll-position',
                    minHeight: 'calc(100vh - 80px)'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => window.history.back()}
                            variant="ghost"
                            size="sm"
                            className="text-black hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-white/20 backdrop-blur-md bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Shield className="size-6 text-black" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
                                <p className="text-black">Monitor user activity and platform usage</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-black">
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
                            className="bg-transparent border-white/20 hover:bg-white/10"
                        >
                            <RefreshCw className="size-4 text-white" />
                        </Button>
                        <Button
                            onClick={handleGeneratePdf}
                            variant="default"
                            size="sm"
                            className="text-black bg-gradient-to-r from-purple-500 to-pink-500 border-white/20 hover:from-pink-500 hover:to-purple-500 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60"
                            disabled={generatingPdf}
                        >
                            <Download className="size-4 mr-1" />
                            Generate PDF Report
                        </Button>
                        <Button
                            onClick={() => setIsCreateUserModalOpen(true)}
                            variant="default"
                            size="sm"
                            className="text-black bg-gradient-to-r from-green-500 to-emerald-500 border-white/20 hover:from-emerald-500 hover:to-green-500 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-60 font-semibold"
                        >
                            <UserPlus className="size-4 mr-1" />
                            Create User
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
                            className="text-black bg-gradient-to-r from-blue-500 to-purple-500 border-white/20 hover:from-purple-500 hover:to-blue-500 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-60 font-semibold"
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
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">New Users</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <UserPlus className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.newUsers?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">
                                Registered in last {dateRange}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Users (Selected Range) */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Active Users</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                <Activity className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.activeUsers?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">In last {dateRange}</p>
                        </CardContent>
                    </Card>

                    {/* Total Actions */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Total Actions</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                                <Zap className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.totalActions?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">In last {dateRange}</p>
                        </CardContent>
                    </Card>

                    {/* Active Sessions */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Active Sessions</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Monitor className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.totalSessions?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">In last {dateRange}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">New Job Postings</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                                <Briefcase className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.newJobs?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">Posted in last {dateRange}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Job Applications (Users)</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                                <FileText className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.userApplications?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">in last {dateRange}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Job Applications (Aura Bot)</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-move-500 rounded-lg">
                                <Bot className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{summaryStats.auraBotApplications?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-black">in last {dateRange}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-black">Page Views</CardTitle>
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <Eye className="size-4 text-black" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">{((summaryStats.totalActions || 0) * 2.5).toLocaleString()}</div>
                            <p className="text-xs text-black">
                                Estimated from actions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="activity" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-md border-white/20">
                        <TabsTrigger value="activity" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">Recent Activity</TabsTrigger>
                        <TabsTrigger value="users" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">User Engagement</TabsTrigger>
                        <TabsTrigger value="trends" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">Daily Trends</TabsTrigger>
                        <TabsTrigger value="features" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">Feature Usage</TabsTrigger>
                        <TabsTrigger value="userlist" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">User List</TabsTrigger>
                        <TabsTrigger value="companies" className="text-black data-[state=active]:bg-white/20 data-[state=active]:text-black">Companies</TabsTrigger>
                    </TabsList>

                    {/* Recent Activity Tab */}
                    <TabsContent value="activity" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center gap-2">
                                    <Database className="size-5" />
                                    Recent User Activity
                                </CardTitle>
                                <CardDescription className="text-black">Latest actions across the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Search by user, action, or content..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="max-w-sm bg-white/10 border-white/20 text-black placeholder:text-black"
                                        />
                                    </div>
                                    <Select value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-40 bg-white/10 border-white/20 text-black">
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
                                                    <span className="text-xs font-medium text-black">
                                                        {log.name?.charAt(0) || log.email?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-black">
                                                            {log.name || log.email || 'Unknown User'}
                                                        </span>
                                                        <Badge className={`${getActionCategoryColor(log.action_category)} bg-white/20 backdrop-blur-md border-white/20`}>
                                                            {log.action_category}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-black">
                                                        {log.action_type.replace(/_/g, ' ')}
                                                        {log.resource_type && ` • ${log.resource_type}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-black">
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
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center gap-2">
                                    <Users className="size-5" />
                                    User Engagement
                                </CardTitle>
                                <CardDescription className="text-black">Most active users and their activity patterns</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.isArray(userEngagement) ? userEngagement.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-black">
                                                        {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-black">{user.name || user.email}</div>
                                                    <div className="text-sm text-black">
                                                        Joined {formatDate(user.registered_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-black">{user.total_actions} actions</div>
                                                <div className="text-sm text-black">
                                                    {user.total_sessions} sessions • {user.total_page_views} page views
                                                </div>
                                                <div className="text-xs text-purple-300">
                                                    Last active: {formatRelativeTime(user.last_activity)}
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="text-black">No data available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Daily Trends Tab */}
                    <TabsContent value="trends" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center gap-2">
                                    <ChartBar className="size-5" />
                                    Daily Activity Trends
                                </CardTitle>
                                <CardDescription className="text-black">Platform usage over the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.isArray(dailyTrends) ? dailyTrends.slice(0, 10).map((trend) => (
                                        <div key={trend.activity_date} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div>
                                                <div className="font-medium text-black">{new Date(trend.activity_date).toLocaleDateString()}</div>
                                                <div className="text-sm text-black">
                                                    {trend.active_users} active users
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-black">{trend.total_actions} total actions</div>
                                                <div className="text-sm text-black">
                                                    Auth: {trend.auth_actions} • Social: {trend.social_actions} • Content: {trend.content_actions}
                                                </div>
                                            </div>
                                        </div>
                                    )) : <div className="text-black">No data available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Feature Usage Tab */}
                    <TabsContent value="features" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black">
                            <CardHeader>
                                <CardTitle className="text-black flex items-center gap-2">
                                    <TrendingUp className="size-5" />
                                    Feature Usage
                                </CardTitle>
                                <CardDescription className="text-black">Most used features in the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.isArray(featureUsage) ? featureUsage.map((feature) => (
                                        <div key={feature.feature_name} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                            <div>
                                                <div className="font-medium capitalize text-black">
                                                    {feature.feature_name.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-black">{feature.usage_count.toLocaleString()} uses</div>
                                            </div>
                                        </div>
                                    )) : <div className="text-black">No data available</div>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* User List Tab */}
                    <TabsContent value="userlist" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-black flex items-center gap-2 text-xl">
                                            <Users className="size-5" />
                                            User Directory
                                        </CardTitle>
                                        <CardDescription className="text-black/80 mt-1">Complete list of all registered users</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-white/10 border-white/20 text-black">
                                        {filteredStudents.length} {filteredStudents.length === 1 ? 'user' : 'users'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-white/10">
                                    <div className="flex-1 min-w-[280px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/50" />
                                            <Input
                                                placeholder="Search by name or email..."
                                                value={userListSearchTerm}
                                                onChange={(e) => setUserListSearchTerm(e.target.value)}
                                                className="pl-9 bg-white/10 border-white/20 text-black placeholder:text-black/50 focus:bg-white/15 focus:border-white/30 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <Select value={selectedBatchYear || 'all'} onValueChange={setSelectedBatchYear}>
                                        <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-black hover:bg-white/15 transition-colors">
                                            <Calendar className="size-4 mr-2" />
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
                                        <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-black hover:bg-white/15 transition-colors">
                                            <Filter className="size-4 mr-2" />
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
                                    <div className="mb-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setUserListSearchTerm('');
                                                setSelectedBatchYear('');
                                                setSelectedProfile('');
                                            }}
                                            className="bg-white/10 border-white/20 text-black hover:bg-white/20 transition-colors"
                                        >
                                            <RefreshCw className="size-3 mr-2" />
                                            Clear All Filters
                                        </Button>
                                    </div>
                                )}

                                {/* Student Statistics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                                        <div className="text-xs text-black/60 mb-1">Total Users</div>
                                        <div className="text-xl font-bold text-black">{totalUsers || students.length}</div>
                                    </div>
                                    <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                                        <div className="text-xs text-black/60 mb-1">Alumni</div>
                                        <div className="text-xl font-bold text-green-600">{students.filter(s => s.profile === 'alumni').length}</div>
                                    </div>
                                    <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                                        <div className="text-xs text-black/60 mb-1">Current Students</div>
                                        <div className="text-xl font-bold text-blue-600">{students.filter(s => s.profile === 'student').length}</div>
                                    </div>
                                    <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                                        <div className="text-xs text-black/60 mb-1">Showing</div>
                                        <div className="text-xl font-bold text-purple-600">{filteredStudents.length}</div>
                                    </div>
                                </div>

                                {/* Student Grid */}
                                {paginatedStudents.length === 0 ? (
                                    <div className="text-center py-16 text-black/60">
                                        <Users className="size-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-base font-medium mb-2">No users found</p>
                                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                                    </div>
                                ) : (
                                    <div
                                        className="overflow-y-auto overflow-x-hidden mb-6"
                                        style={{
                                            maxHeight: 'calc(100vh - 600px)',
                                            minHeight: '400px',
                                            scrollBehavior: 'smooth',
                                            WebkitOverflowScrolling: 'touch',
                                            overscrollBehavior: 'contain',
                                            touchAction: 'pan-y',
                                            willChange: 'scroll-position'
                                        }}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pr-2">
                                            {paginatedStudents.map((student, index) => (
                                                <div
                                                    key={student.id || index}
                                                    className="group p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 hover:border-white/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                                    onClick={() => {
                                                        if (student.email) {
                                                            router.push(`/friendprof?email=${encodeURIComponent(student.email)}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className="relative shrink-0">
                                                            <div className="size-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                                                                <span className="text-base font-semibold text-black">
                                                                    {student.name?.charAt(0) || student.email?.charAt(0) || '?'}
                                                                </span>
                                                            </div>
                                                            {student.profile === 'alumni' && (
                                                                <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center">
                                                                    <span className="text-[8px] text-white font-bold">A</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-base text-black truncate mb-1">
                                                                {student.name || 'Unknown'}
                                                            </div>
                                                            <div className="text-xs text-black/70 truncate" title={student.email}>
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2.5 pt-3 border-t border-white/10">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-black/60">Profile</span>
                                                            <Badge className={`${student.profile === 'alumni'
                                                                ? 'bg-green-100/80 text-green-800 border-green-200'
                                                                : 'bg-yellow-100/80 text-yellow-800 border-yellow-200'
                                                                } text-xs font-medium px-2 py-0.5 capitalize`}>
                                                                {student.profile}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-white/10">
                                        <div className="text-sm text-black/80 font-medium">
                                            Showing <span className="font-semibold text-black">{(currentPage - 1) * USERS_PER_PAGE + 1}</span> to <span className="font-semibold text-black">{Math.min(currentPage * USERS_PER_PAGE, totalUsers)}</span> of <span className="font-semibold text-black">{totalUsers}</span> users
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                variant="outline"
                                                size="sm"
                                                className="text-black border-white/20 hover:bg-white/15 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                                                            className={`${currentPage === pageNum
                                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md'
                                                                : 'text-black border-white/20 hover:bg-white/15 hover:border-white/30'
                                                                } transition-all min-w-[40px]`}
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
                                                className="text-black border-white/20 hover:bg-white/15 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {totalPages === 1 && filteredStudents.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/10 text-sm text-black/80 font-medium text-center">
                                        Showing all <span className="font-semibold text-black">{filteredStudents.length}</span> of <span className="font-semibold text-black">{totalUsers}</span> users
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Companies Upload Tab */}
                    <TabsContent value="companies" className="space-y-4">
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black shadow-lg">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-black flex items-center gap-2 text-xl">
                                            <Building2 className="size-5" />
                                            Upload Companies
                                        </CardTitle>
                                        <CardDescription className="text-black/80 mt-1">
                                            Upload an Excel (.xlsx, .xls) or CSV file with company information
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* File Upload Section */}
                                    <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center bg-white/5">
                                        <Upload className="size-12 text-black/50 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-black mb-2">Upload Company File</h3>
                                        <p className="text-sm text-black/70 mb-4">
                                            Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
                                        </p>
                                        <p className="text-xs text-black/60 mb-6">
                                            Expected columns: Company Name (required), Industry (optional), Location (optional), Website (optional), Description (optional)
                                        </p>
                                        <div className="flex flex-col items-center gap-4">
                                            <input
                                                type="file"
                                                id="company-file-upload"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setUploadedFile(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="company-file-upload"
                                                className="cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                            >
                                                <Upload className="size-4 inline mr-2" />
                                                Select File
                                            </label>
                                            {uploadedFile && (
                                                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="size-5 text-black" />
                                                        <div className="text-left">
                                                            <p className="font-semibold text-black">{uploadedFile.name}</p>
                                                            <p className="text-sm text-black/70">
                                                                {(uploadedFile.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setUploadedFile(null);
                                                            }}
                                                            className="text-black hover:text-red-500"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Button */}
                                    {uploadedFile && (
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={async () => {
                                                    if (!uploadedFile) return;

                                                    setUploadingCompanies(true);

                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('file', uploadedFile);

                                                        const response = await fetch('/api/admin/upload-companies', {
                                                            method: 'POST',
                                                            body: formData,
                                                        });

                                                        const result = await response.json();

                                                        if (response.ok) {
                                                            toast.success(result.message || 'File uploaded successfully!');
                                                            setUploadedFile(null);
                                                            // Reload the file list
                                                            loadCompanyFiles();
                                                        } else {
                                                            toast.error(result.error || 'Failed to upload file');
                                                        }
                                                    } catch (error) {
                                                        console.error('Error uploading companies:', error);
                                                        toast.error('An error occurred while uploading the file');
                                                    } finally {
                                                        setUploadingCompanies(false);
                                                    }
                                                }}
                                                disabled={uploadingCompanies || !uploadedFile}
                                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {uploadingCompanies ? (
                                                    <>
                                                        <RefreshCw className="size-4 inline mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="size-4 inline mr-2" />
                                                        Upload Companies
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Uploaded Files List */}
                                    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-black shadow-lg">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-black flex items-center gap-2 text-xl">
                                                        <FileText className="size-5" />
                                                        Uploaded Company Files
                                                    </CardTitle>
                                                    <CardDescription className="text-black/80 mt-1">
                                                        {companyFiles.length} {companyFiles.length === 1 ? 'file' : 'files'} available for download
                                                    </CardDescription>
                                                </div>
                                                <Button
                                                    onClick={loadCompanyFiles}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-black border-white/20 hover:bg-white/10"
                                                    disabled={loadingFiles}
                                                >
                                                    <RefreshCw className={`size-4 ${loadingFiles ? 'animate-spin' : ''}`} />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {loadingFiles ? (
                                                <div className="text-center py-8">
                                                    <RefreshCw className="size-8 animate-spin mx-auto mb-2 text-black/50" />
                                                    <p className="text-black/70">Loading files...</p>
                                                </div>
                                            ) : companyFiles.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <FileText className="size-12 mx-auto mb-4 text-black/30" />
                                                    <p className="text-black/70">No files uploaded yet</p>
                                                    <p className="text-sm text-black/50 mt-1">Upload a file to get started</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {companyFiles.map((file, index) => (
                                                        <div
                                                            key={file.key}
                                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                                                    <FileText className="size-5 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-black truncate">{file.fileName}</p>
                                                                    <div className="flex items-center gap-4 mt-1 text-xs text-black/60">
                                                                        <span>{(file.size / 1024).toFixed(2)} KB</span>
                                                                        <span>•</span>
                                                                        <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={() => window.open(file.fileUrl, '_blank')}
                                                                variant="outline"
                                                                size="sm"
                                                                className="ml-4 text-black border-white/20 hover:bg-white/10"
                                                            >
                                                                <Download className="size-4 mr-2" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                open={isCreateUserModalOpen}
                onClose={() => setIsCreateUserModalOpen(false)}
                onSuccess={() => {
                    setIsCreateUserModalOpen(false);
                    loadStudentData(); // Refresh the user list
                }}
            />
        </div>
    );
}

// Create User Modal Component
function CreateUserModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
    const [studentStatus, setStudentStatus] = useState<string>('');
    const [state, formAction] = useActionState<AdminCreateUserActionState, FormData>(
        adminCreateUser,
        {
            status: 'idle',
        },
    );

    useEffect(() => {
        if (state.status === 'failed') {
            toast.error('Failed to create user. Please try again!');
        } else if (state.status === 'invalid_data') {
            toast.error('Failed validating your submission!');
        } else if (state.status === 'user_exists') {
            toast.error('An account with this email already exists!');
        } else if (state.status === 'success') {
            toast.success('User created successfully!');
            setStudentStatus(''); // Reset form
            onSuccess();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status]); // Only depend on state.status, not onSuccess to avoid infinite loops

    const handleSubmit = (formData: FormData) => {
        // Add student_status to formData
        if (studentStatus) {
            formData.append('student_status', studentStatus);
        }
        formAction(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white/95 backdrop-blur-md border-white/20 text-black max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-black">Create New User</DialogTitle>
                    <DialogDescription className="text-black/70">
                        Create a new user account with role &quot;user&quot;. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <Form action={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name" className="text-black font-medium">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            className="bg-white/50 text-black border-black/20"
                            type="text"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email" className="text-black font-medium">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            className="bg-white/50 text-black border-black/20"
                            type="email"
                            placeholder="john@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password" className="text-black font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            className="bg-white/50 text-black border-black/20"
                            type="password"
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="student_status" className="text-black font-medium">
                            Student Status
                        </Label>
                        <Select value={studentStatus} onValueChange={setStudentStatus} required>
                            <SelectTrigger className="bg-white/50 text-black border-black/20">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-black">
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="alumni">Alumni</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-black/20 hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={state.status === 'in_progress' || !studentStatus}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white"
                        >
                            {state.status === 'in_progress' ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 