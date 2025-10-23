'use client';

import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const overviewCards = [
    { title: 'Active Users', value: '1,234', description: 'students/alumni/recruiters' },
    { title: 'AI Intros Made', value: '567', description: 'Total AI introductions' },
    { title: 'Mentorship Connections', value: '89', description: 'Active mentorships' },
    { title: 'Event Matches', value: '42', description: 'Matches via events' },
];

const departments = ['All', 'Engineering', 'Business', 'Arts', 'Science'];
const studentData = [
    { name: 'Alice', department: 'Engineering', goal: 'Software Engineer', matches: 12, lastActive: '2024-06-10' },
    { name: 'Bob', department: 'Business', goal: 'Consultant', matches: 8, lastActive: '2024-06-09' },
    { name: 'Carol', department: 'Arts', goal: 'Designer', matches: 5, lastActive: '2024-06-08' },
];
const alumniData = [
    { name: 'Dave', company: 'TechCorp', role: 'Manager', industry: 'Tech', hiring: true, mentorship: 3 },
    { name: 'Eve', company: 'BizInc', role: 'Analyst', industry: 'Business', hiring: false, mentorship: 1 },
];
const events = [
    { name: 'Career Fair', date: '2024-06-15', matches: 30, feedback: 4.5 },
    { name: 'Alumni Meetup', date: '2024-06-01', matches: 12, feedback: 4.8 },
];
const assistantLogs = [
    { query: 'Find mentors for AI', matches: 5, rating: 4.7 },
    { query: 'Upcoming events', matches: 2, rating: 4.5 },
];

// Chart Data
const lineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
        {
            label: 'AI Intros',
            data: [12, 19, 15, 22, 17],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            tension: 0.4,
            fill: true,
        },
    ],
};
const pieData = {
    labels: ['Students', 'Alumni', 'Recruiters'],
    datasets: [
        {
            label: 'User Types',
            data: [60, 30, 10],
            backgroundColor: [
                'hsl(240, 100%, 70%)',
                'hsl(280, 100%, 70%)',
                'hsl(160, 100%, 70%)',
            ],
            borderWidth: 1,
        },
    ],
};
const barData = {
    labels: ['Engineering', 'Business', 'Arts', 'Science'],
    datasets: [
        {
            label: 'Engagement',
            data: [120, 90, 60, 80],
            backgroundColor: [
                'hsl(240, 100%, 70%)',
                'hsl(280, 100%, 70%)',
                'hsl(160, 100%, 70%)',
                'hsl(43, 74%, 66%)',
            ],
            borderRadius: 8,
        },
    ],
};

export default function UniversityDashboard() {
    const [selectedDept, setSelectedDept] = useState('All');
    const [alumniFilter, setAlumniFilter] = useState('All');

    // Filtered data
    const filteredStudents = selectedDept === 'All' ? studentData : studentData.filter(s => s.department === selectedDept);
    const filteredAlumni = alumniFilter === 'All' ? alumniData : alumniData.filter(a => alumniFilter === 'Hiring' ? a.hiring : !a.hiring);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 text-white">
            {/* Top Section: Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {overviewCards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-gradient-to-tr from-blue-800 to-purple-700 rounded-2xl shadow-xl p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer border border-blue-500/30"
                    >
                        <div className="text-3xl font-bold mb-2">{card.value}</div>
                        <div className="text-lg font-semibold mb-1">{card.title}</div>
                        <div className="text-sm text-gray-300">{card.description}</div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Line Chart */}
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center hover:shadow-2xl transition-shadow w-full">
                    <div className="font-semibold mb-2">AI Intros Per Week</div>
                    <div className="w-full h-40 flex items-center justify-center">
                        <Line data={lineData} options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { x: { grid: { color: '#222' } }, y: { grid: { color: '#222' } } },
                        }} />
                    </div>
                </div>
                {/* Pie Chart */}
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center hover:shadow-2xl transition-shadow w-full">
                    <div className="font-semibold mb-2">User Types Breakdown</div>
                    <div className="w-full h-40 flex items-center justify-center">
                        <Pie data={pieData} options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } },
                        }} />
                    </div>
                </div>
                {/* Bar Chart */}
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center hover:shadow-2xl transition-shadow w-full">
                    <div className="font-semibold mb-2">Top Departments by Engagement</div>
                    <div className="w-full h-40 flex items-center justify-center">
                        <Bar data={barData} options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { x: { grid: { color: '#222' }, ticks: { color: '#fff' } }, y: { grid: { color: '#222' }, ticks: { color: '#fff' } } },
                        }} />
                    </div>
                </div>
            </div>

            {/* Student Insights Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Student Insights</h2>
                    <select
                        className="bg-gray-700 rounded px-3 py-1 text-white border border-gray-600"
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                    >
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto rounded-2xl shadow-lg">
                    <table className="min-w-full bg-gray-800">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Department</th>
                                <th className="px-4 py-2">Career Goal</th>
                                <th className="px-4 py-2">Matches Made</th>
                                <th className="px-4 py-2">Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((s) => (
                                <tr key={s.name + s.department} className="hover:bg-blue-900/40 transition-colors">
                                    <td className="px-4 py-2">{s.name}</td>
                                    <td className="px-4 py-2">{s.department}</td>
                                    <td className="px-4 py-2">{s.goal}</td>
                                    <td className="px-4 py-2">{s.matches}</td>
                                    <td className="px-4 py-2">{s.lastActive}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alumni Insights Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Alumni Insights</h2>
                    <select
                        className="bg-gray-700 rounded px-3 py-1 text-white border border-gray-600"
                        value={alumniFilter}
                        onChange={e => setAlumniFilter(e.target.value)}
                    >
                        <option value="All">All</option>
                        <option value="Hiring">Hiring</option>
                        <option value="NotHiring">Not hiring</option>
                    </select>
                </div>
                <div className="overflow-x-auto rounded-2xl shadow-lg">
                    <table className="min-w-full bg-gray-800">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Company</th>
                                <th className="px-4 py-2">Role</th>
                                <th className="px-4 py-2">Industry</th>
                                <th className="px-4 py-2">Mentorship Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAlumni.map((a) => (
                                <tr key={a.name + a.company} className="hover:bg-purple-900/40 transition-colors">
                                    <td className="px-4 py-2">{a.name}</td>
                                    <td className="px-4 py-2">{a.company}</td>
                                    <td className="px-4 py-2">{a.role}</td>
                                    <td className="px-4 py-2">{a.industry}</td>
                                    <td className="px-4 py-2">{a.mentorship}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Events Section */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.name + event.date} className="bg-gradient-to-tr from-green-800 to-blue-700 rounded-2xl p-5 shadow-lg hover:scale-105 transition-transform border border-green-500/30">
                            <div className="font-semibold text-lg mb-1">{event.name}</div>
                            <div className="text-gray-300 mb-1">Date: {event.date}</div>
                            <div className="mb-1">Matches: <span className="font-bold">{event.matches}</span></div>
                            <div>Feedback Score: <span className="font-bold">{event.feedback}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assistant Logs */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Assistant Logs</h2>
                <div className="overflow-x-auto rounded-2xl shadow-lg">
                    <table className="min-w-full bg-gray-800">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Query</th>
                                <th className="px-4 py-2">Successful Matches</th>
                                <th className="px-4 py-2">Feedback Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assistantLogs.map((log) => (
                                <tr key={log.query} className="hover:bg-cyan-900/40 transition-colors">
                                    <td className="px-4 py-2">{log.query}</td>
                                    <td className="px-4 py-2">{log.matches}</td>
                                    <td className="px-4 py-2">{log.rating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Tools */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
                <div className="flex flex-wrap gap-6">
                    <button type="button" className="bg-gradient-to-tr from-pink-700 to-red-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">Upload CSV</button>
                    <button type="button" className="bg-gradient-to-tr from-blue-700 to-green-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">Create Event</button>
                    <button type="button" className="bg-gradient-to-tr from-purple-700 to-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">Send Message to Group</button>
                </div>
            </div>
        </div>
    );
} 