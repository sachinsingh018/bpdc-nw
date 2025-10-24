'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCookie } from 'cookies-next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Home,
    Users,
    MessageSquare,
    MessageCircle,
    User,
    Menu,
    Sparkles,
    Send,
    ArrowLeft,
    Search,
    Briefcase
} from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommonNavbar } from '@/components/common-navbar';
import { SocketDebug } from '@/components/socket-debug';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import { useSocket } from '@/hooks/useSocket';
import { format, parse, parseISO } from 'date-fns';
// biome-ignore lint/correctness/noUnusedImports: <explanation>
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface Conversation {
    other_user_id: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
    otherUser: {
        id: string;
        name: string;
        email: string;
    } | null;
}

const TIMEZONES = [
    'America/New_York',
    'Europe/London',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Europe/Berlin',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Africa/Johannesburg',
    'America/Sao_Paulo',
];

interface ScheduleMeetingButtonProps {
    name: string;
    email: string;
    sendMessage: (msg: string | { text: string; calendarInvite?: { icsUrl: string; label: string } }) => void;
}

function ScheduleMeetingButton({ name, email, sendMessage }: ScheduleMeetingButtonProps) {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [timezone, setTimezone] = useState('America/New_York');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [selectedDate, setSelectedDate] = useState(() => {
        // Default to today's date in YYYY-MM-DD format
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [scheduling, setScheduling] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
    const [showSlotsModal, setShowSlotsModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [userBTimeZone, setUserBTimeZone] = useState('');
    const [userBName, setUserBName] = useState('');
    const [userAName, setUserAName] = useState('');
    const [slotFilter, setSlotFilter] = useState('');
    const [showManualScheduling, setShowManualScheduling] = useState(false);

    // Get current user's name
    useEffect(() => {
        const fetchCurrentUserName = async () => {
            const userEmail = getCookie('userEmail') as string;
            if (userEmail) {
                try {
                    const response = await fetch('/profile/api', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail }),
                    });
                    const data = await response.json();
                    setUserAName(data?.name || 'You');
                } catch (error) {
                    console.error('Error fetching current user name:', error);
                    setUserAName('You');
                }
            }
        };
        fetchCurrentUserName();
    }, []);

    // Step 1: User submits working hours, fetch slots
    const handleFindSlots = async (e: React.FormEvent) => {
        e.preventDefault();
        setScheduling(true);
        setAvailableSlots([]);
        setSelectedSlot(null);
        try {
            const res = await fetch('/api/meeting-scheduler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userA: {
                        timeZone: timezone,
                        workingHours: `${startTime}-${endTime}`,
                    },
                    userBEmail: email,
                    date: selectedDate,
                }),
            });

            const data = await res.json();

            console.log("🎯 Slot response:", data);

            if (res.ok && data.slots) {
                setAvailableSlots(data.slots);
                setSlotFilter(''); // Reset filter when showing new slots
                setShowSlotsModal(true);
                setShowScheduleModal(false); // hide the input modal
                // or send this in chat using `sendMessage(localTime)`
                setUserBTimeZone(data.userB.timeZone);
                setUserBName(data.userB.name || '');

            } else {
                // Show manual scheduling option instead of just an error
                setShowManualScheduling(true);
                setShowScheduleModal(false);
            }

        } catch (err) {
            toast.error('Failed to fetch slots.');
        } finally {
            setScheduling(false);
        }
    };

    // Step 2: User selects a slot and confirms
    const handleConfirmSlot = () => {
        if (!selectedSlot) return;

        const startUtc = parseISO(selectedSlot.start);
        const endUtc = parseISO(selectedSlot.end);

        console.log('🔍 Selected Slot Details:');
        console.log('Raw start UTC:', selectedSlot.start);
        console.log('Parsed start UTC:', startUtc.toISOString());
        console.log('Raw end UTC:', selectedSlot.end);
        console.log('Parsed end UTC:', endUtc.toISOString());

        const formattedUserA = formatInTimeZone(startUtc, timezone, 'MMMM d, h:mm aaaa zzz');
        const formattedUserB = formatInTimeZone(startUtc, userBTimeZone, 'MMMM d, h:mm aaaa zzz');

        console.log(`User A Local Time (${timezone}):`, formattedUserA);
        console.log(`User B Local Time (${userBTimeZone}):`, formattedUserB);

        // Fix: Use UTC formatting to prevent timezone shift
        const formatICS = (date: Date) => {
            console.log('🔧 ICS Formatting Debug:');
            console.log('Input date:', date.toISOString());
            console.log('Input date (local):', date.toString());

            // Extract UTC components directly to avoid timezone conversion
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');

            const utcString = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;

            console.log('Output ICS string:', utcString);
            return utcString;
        };

        // Get current user email and user B email
        const userAEmail = getCookie('userEmail') as string;
        const userBEmail = email;

        // Google Calendar URL with both users as guests
        const title = encodeURIComponent(`Meeting with ${name}`);
        const dates = `${formatICS(startUtc)}/${formatICS(endUtc)}`;
        const details = encodeURIComponent('Confirmed via Networkqy');
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&add=${encodeURIComponent(userAEmail)},${encodeURIComponent(userBEmail)}`;

        console.log('📅 Google Calendar Details:');
        console.log('ICS dates string:', dates);
        console.log('User A Email:', userAEmail);
        console.log('User B Email:', userBEmail);
        console.log('Full Google Calendar URL:', googleCalendarUrl);

        // Markdown formatted message with line breaks
        const messageContent = {
            text: `✅ Meeting confirmed!  \n${userAName}'s time: ${formattedUserA}  \n${userBName}'s time: ${formattedUserB}`,
            googleCalendarUrl,
            googleCalendarLabel: '📅 Add to Google Calendar',
        };

        sendMessage(messageContent);

        setShowSlotsModal(false);
        setSelectedSlot(null);
    };

    // Handle manual scheduling when no overlapping slots are found
    const handleManualScheduling = () => {
        // Create a default 1-hour slot for next day at 10:00 AM in userA's timezone
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        // Convert to UTC for Google Calendar
        const startUtc = new Date(tomorrow.toLocaleString("en-US", { timeZone: timezone }));
        const endUtc = new Date(startUtc.getTime() + 60 * 60 * 1000); // Add 1 hour

        // Format times for display
        const formattedUserA = formatInTimeZone(startUtc, timezone, 'MMMM d, h:mm aaaa zzz');
        const formattedUserB = formatInTimeZone(startUtc, userBTimeZone || 'UTC', 'MMMM d, h:mm aaaa zzz');

        // Format ICS dates
        const formatICS = (date: Date) => {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
        };

        // Get user emails
        const userAEmail = getCookie('userEmail') as string;
        const userBEmail = email;

        // Create Google Calendar URL
        const title = encodeURIComponent(`Meeting with ${name}`);
        const dates = `${formatICS(startUtc)}/${formatICS(endUtc)}`;
        const details = encodeURIComponent('No overlapping time found — scheduled manually.');
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&add=${encodeURIComponent(userAEmail)},${encodeURIComponent(userBEmail)}`;

        // Send manual scheduling message
        const messageContent = {
            text: `Manual meeting scheduled!  \n${userAName}'s time: ${formattedUserA}  \n${userBName}'s time: ${formattedUserB}  \n\n *Note: No overlapping time found — please coordinate with each other.*`,
            googleCalendarUrl,
            googleCalendarLabel: '📅 Add to Google Calendar',
        };

        sendMessage(messageContent);
        setShowManualScheduling(false);
        setShowScheduleModal(false);
    };

    return (
        <>
            <button
                className="ml-3 bg-red-500 text-white rounded px-3 py-1 text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                onClick={() => {
                    // Reset date to today when opening modal
                    const today = new Date();
                    setSelectedDate(today.toISOString().split('T')[0]);
                    setShowScheduleModal(true);
                }}
                disabled={scheduling}
                type="button"
            >
                {scheduling ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
            {/* Step 1: Collect timezone/working hours */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => setShowScheduleModal(false)}
                            aria-label="Close"
                            type="button"
                        >
                            &times;
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Schedule Meeting with {name}</h2>
                        <form onSubmit={handleFindSlots} className="space-y-4">
                            <div>
                                <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Meeting Date</label>
                                <input
                                    id="meeting-date"
                                    type="date"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Your Time Zone</label>
                                <select
                                    id="timezone"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    value={timezone}
                                    onChange={e => setTimezone(e.target.value)}
                                    required
                                >
                                    {TIMEZONES.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Working Start</label>
                                    <input
                                        id="start-time"
                                        type="time"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Working End</label>
                                    <input
                                        id="end-time"
                                        type="time"
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg shadow hover:from-purple-600 hover:to-blue-600"
                                    disabled={scheduling}
                                >
                                    {scheduling ? 'Finding slots...' : 'Find Available Slots'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Step 2: Show slots and confirm */}
            {showSlotsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => setShowSlotsModal(false)}
                            aria-label="Close"
                            type="button"
                        >
                            &times;
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Select a Time Slot ({availableSlots.length} available)
                        </h2>
                        {availableSlots.length > 5 && (
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Filter slots by date or time..."
                                    value={slotFilter}
                                    onChange={(e) => setSlotFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        )}
                        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-slate-700">
                            {(() => {
                                const filteredSlots = availableSlots.filter((slot: { start: string; end: string }) => {
                                    if (!slotFilter) return true;
                                    const formatted = formatInTimeZone(parseISO(slot.start), timezone, 'MMMM d, h:mm aaaa zzz');
                                    return formatted.toLowerCase().includes(slotFilter.toLowerCase());
                                });

                                if (filteredSlots.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>{availableSlots.length === 0 ? 'No available slots found' : 'No slots match your filter'}</p>
                                        </div>
                                    );
                                }

                                return filteredSlots.map((slot: { start: string; end: string }, idx: number) => {
                                    const formatted = formatInTimeZone(parseISO(slot.start), timezone, 'MMMM d, h:mm aaaa zzz');
                                    return (
                                        <label
                                            key={slot.start}
                                            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-colors hover:bg-white dark:hover:bg-slate-600 ${selectedSlot?.start === slot.start
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
                                                : 'bg-white dark:bg-slate-800 border border-transparent'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="slot"
                                                value={slot.start}
                                                checked={selectedSlot?.start === slot.start}
                                                onChange={() => setSelectedSlot(slot)}
                                                className="form-radio text-purple-600 focus:ring-purple-500 focus:ring-2"
                                            />
                                            <div className="flex-1">
                                                <span className="text-gray-900 dark:text-white font-medium">{formatted}</span>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatInTimeZone(parseISO(slot.end), timezone, 'h:mm aaaa')} - 1 hour meeting
                                                </div>
                                            </div>
                                        </label>
                                    );
                                });
                            })()}
                        </div>
                        <div className="flex justify-end mt-6 gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => setShowSlotsModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                                disabled={!selectedSlot}
                                onClick={handleConfirmSlot}
                            >
                                Confirm
                            </button>
                        </div>
                        {/* Add to Calendar button, only show after slot is confirmed */}
                        {selectedSlot && (
                            (() => {
                                const startUtc = parseISO(selectedSlot.start);
                                const endUtc = parseISO(selectedSlot.end);

                                // Use the same UTC formatting logic as in handleConfirmSlot
                                const formatICS = (date: Date) => {
                                    const year = date.getUTCFullYear();
                                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                                    const day = String(date.getUTCDate()).padStart(2, '0');
                                    const hours = String(date.getUTCHours()).padStart(2, '0');
                                    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                                    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

                                    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
                                };

                                // Get current user email and user B email for ICS file
                                const userAEmail = getCookie('userEmail') as string;
                                const userBEmail = email;

                                const calendarString = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Meeting with ${name}\nDTSTART:${formatICS(startUtc)}\nDTEND:${formatICS(endUtc)}\nDESCRIPTION:Confirmed via Networkqy\nATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${userAEmail}\nATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${userBEmail}\nEND:VEVENT\nEND:VCALENDAR`;
                                const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(calendarString)}`;
                                return (
                                    <a
                                        href={icsUrl}
                                        download="meeting.ics"
                                        className="mt-4 inline-block px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                                    >
                                        Add to Calendar
                                    </a>
                                );
                            })()
                        )}
                    </div>
                </div>
            )}
            {/* Manual Scheduling Modal */}
            {showManualScheduling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            onClick={() => setShowManualScheduling(false)}
                            aria-label="Close"
                            type="button"
                        >
                            &times;
                        </button>
                        <div className="text-center">
                            <div className="size-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="size-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No Overlapping Time Found</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                We couldn&apos;t find a time that works for both of you. Would you like to schedule a meeting manually for tomorrow at 10:00 AM in your timezone?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    onClick={() => setShowManualScheduling(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow hover:from-yellow-600 hover:to-orange-600"
                                    onClick={handleManualScheduling}
                                >
                                    Schedule Manually
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function MessagesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<(Message | { text: string; calendarInvite?: { icsUrl: string; label: string } })[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<any>(null);

    const {
        socket,
        isConnected,
        sendMessage: socketSendMessage,
        startTyping,
        stopTyping,
        markAsRead,
        onNewMessage,
        onTypingStatus,
        onMessageSent,
        onMessagesRead,
    } = useSocket();

    const targetEmail = searchParams?.get('email');

    useEffect(() => {
        const initializeData = async () => {
            const userEmail = getCookie('userEmail') as string;
            setCurrentUserEmail(userEmail);
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
            await fetchConversations();
        };
        initializeData();
    }, []);

    useEffect(() => {
        if (!socket) return;

        onNewMessage((message) => {
            console.log('New message received:', message);
            if (selectedConversation?.otherUser?.id === message.senderId) {
                const newMessageObj: Message = {
                    id: message.messageId,
                    sender_id: message.senderId,
                    receiver_id: currentUserId || '',
                    message: message.message,
                    is_read: false,
                    created_at: message.timestamp,
                };
                setMessages((prev) => [...prev, newMessageObj]);

                setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
                    conv.otherUser?.id === message.senderId
                        ? { ...conv, last_message: message.message, last_message_time: message.timestamp }
                        : conv
                ));
            }
        });

        onTypingStatus((status) => {
            if (status.userId === selectedConversation?.otherUser?.id) {
                if (status.isTyping) {
                    setTypingUsers((prev: Set<string>) => new Set(prev).add(status.userId));
                } else {
                    setTypingUsers((prev: Set<string>) => {
                        const newSet = new Set(prev);
                        newSet.delete(status.userId);
                        return newSet;
                    });
                }
            }
        });

        onMessageSent((data) => {
            console.log('Message sent confirmation:', data);
            setSendingMessage(false);
        });

        onMessagesRead((data) => {
            console.log('Messages read:', data);
            setMessages((prev) => prev.map((msg) =>
                isPlainMessage(msg) && data.messageIds.includes(msg.id)
                    ? { ...msg, is_read: true }
                    : msg
            ));
        });

        return () => {
            socket.off('new_message');
            socket.off('user_typing');
            socket.off('message_sent');
            socket.off('messages_read');
        };
    }, [socket, selectedConversation, currentUserId, onNewMessage, onTypingStatus, onMessageSent, onMessagesRead]);

    useEffect(() => {
        console.log('Messages page - targetEmail:', targetEmail, 'conversations:', conversations);
        if (targetEmail) {
            if (conversations.length > 0) {
                const conversation = conversations.find((conv: Conversation) => conv.otherUser?.email === targetEmail);
                console.log('Found conversation:', conversation);
                if (conversation) {
                    setSelectedConversation(conversation);
                    if (conversation.otherUser?.email) {
                        fetchMessages(conversation.otherUser.email);
                    }
                } else {
                    console.log('No existing conversation found for email:', targetEmail);
                    createNewConversationForUser(targetEmail);
                }
            } else {
                console.log('No conversations loaded yet, creating new conversation for:', targetEmail);
                createNewConversationForUser(targetEmail);
            }
        }
    }, [targetEmail, conversations]);

    const createNewConversationForUser = async (email: string) => {
        try {
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const userData = await response.json();

            if (userData) {
                const newConversation: Conversation = {
                    other_user_id: userData.id,
                    last_message: '',
                    last_message_time: '',
                    unread_count: 0,
                    otherUser: {
                        id: userData.id,
                        name: userData.name || 'Networkqy User',
                        email: email
                    }
                };
                setSelectedConversation(newConversation);
                setMessages([]);
            } else {
                console.error('User not found for email:', email);
                toast.error('User not found');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Error loading user details');
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getCurrentUserId = async () => {
        const userEmail = getCookie('userEmail');
        if (!userEmail) return null;

        try {
            const response = await fetch('/profile/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            return data?.id;
        } catch (error) {
            console.error('Error getting current user ID:', error);
            return null;
        }
    };

    const fetchConversations = async () => {
        try {
            console.log('Fetching conversations...');
            const response = await fetch('/api/messages/conversations');
            console.log('Conversations response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Conversations data:', data);
                setConversations(data.conversations || []);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch conversations:', errorData);
                toast.error('Failed to load conversations');
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserEmail: string) => {
        try {
            const response = await fetch(`/api/messages/conversation?email=${encodeURIComponent(otherUserEmail)}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const sendMessage = async () => {
        console.log('Sending message:', { newMessage, selectedConversation });
        if (!newMessage.trim() || !selectedConversation?.otherUser?.email) {
            console.log('Cannot send message - missing message or user email');
            return;
        }

        const messageText = newMessage.trim();
        setNewMessage('');

        const optimisticMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const optimisticMessage: Message = {
            id: optimisticMessageId,
            sender_id: currentUserId || '',
            receiver_id: selectedConversation.otherUser.id,
            message: messageText,
            is_read: false,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
            conv.other_user_id === selectedConversation.otherUser?.id
                ? { ...conv, last_message: messageText, last_message_time: new Date().toISOString() }
                : conv
        ));

        setTimeout(() => scrollToBottom(), 100);

        setSendingMessage(true);

        const stopSpinningTimeout = setTimeout(() => {
            setMessages((prev) => prev.map((msg) =>
                isPlainMessage(msg) && msg.id === optimisticMessageId
                    ? { ...msg, id: msg.id.replace('temp_', '') }
                    : msg
            ));
        }, 1000);

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverEmail: selectedConversation.otherUser.email,
                    message: messageText,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Message saved to database successfully');

                clearTimeout(stopSpinningTimeout);

                if (data.message) {
                    setMessages((prev) => prev.map((msg) =>
                        isPlainMessage(msg) && msg.id === optimisticMessageId
                            ? { ...data.message, id: data.message.id }
                            : msg
                    ));
                } else {
                    setMessages((prev) => prev.map((msg) =>
                        isPlainMessage(msg) && msg.id === optimisticMessageId
                            ? { ...msg, id: msg.id.replace('temp_', '') }
                            : msg
                    ));
                }

                if (isConnected && selectedConversation.otherUser?.id) {
                    try {
                        socketSendMessage(selectedConversation.otherUser.id, messageText);
                        console.log('Message sent via Socket.io for real-time delivery');
                    } catch (socketError) {
                        console.log('Socket.io delivery failed, but message is saved:', socketError);
                    }
                } else {
                    console.log('Socket.io not available, but message is saved to database');
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to save message to database:', errorData);

                clearTimeout(stopSpinningTimeout);

                setMessages((prev) => prev.filter((msg) => isPlainMessage(msg) && msg.id !== optimisticMessageId));

                setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
                    conv.other_user_id === selectedConversation.otherUser?.id
                        ? { ...conv, last_message: conv.last_message, last_message_time: conv.last_message_time }
                        : conv
                ));

                toast.error(errorData.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);

            clearTimeout(stopSpinningTimeout);

            setMessages((prev) => prev.filter((msg) => isPlainMessage(msg) && msg.id !== optimisticMessageId));

            setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
                conv.other_user_id === selectedConversation.otherUser?.id
                    ? { ...conv, last_message: conv.last_message, last_message_time: conv.last_message_time }
                    : conv
            ));

            toast.error('Error sending message');
        } finally {
            setSendingMessage(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Helper to send a custom message (e.g., meeting confirmation)
    type StructuredMessage = { text: string; calendarInvite?: { icsUrl: string; label: string } };
    const sendMeetingMessage = async (msg: string | StructuredMessage) => {
        // Accepts either a string or a structured message
        let messageText: string;
        if (typeof msg === 'string') {
            messageText = msg.trim();
        } else {
            messageText = msg.text;
        }
        if (!messageText || !selectedConversation?.otherUser?.email) {
            console.log('Cannot send message - missing message or user email');
            return;
        }
        setNewMessage('');

        // For UI: keep the structured message in state for rendering
        const optimisticMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const optimisticMessage =
            typeof msg === 'string'
                ? {
                    id: optimisticMessageId,
                    sender_id: currentUserId || '',
                    receiver_id: selectedConversation.otherUser.id,
                    message: messageText,
                    is_read: false,
                    created_at: new Date().toISOString(),
                }
                : { ...msg, id: optimisticMessageId, sender_id: currentUserId || '', receiver_id: selectedConversation.otherUser.id, is_read: false, created_at: new Date().toISOString() };

        setMessages((prev) => [...prev, optimisticMessage]);

        setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
            conv.other_user_id === selectedConversation.otherUser?.id
                ? { ...conv, last_message: messageText, last_message_time: new Date().toISOString() }
                : conv
        ));

        setTimeout(() => scrollToBottom(), 100);

        setSendingMessage(true);

        const stopSpinningTimeout = setTimeout(() => {
            setMessages((prev) => prev.map((msg) =>
                isPlainMessage(msg) && msg.id === optimisticMessageId
                    ? { ...msg, id: msg.id.replace('temp_', '') }
                    : msg
            ));
        }, 1000);

        try {
            // For backend: always send as string
            const backendMessage = typeof msg === 'string' ? msg : msg.text;
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverEmail: selectedConversation.otherUser.email,
                    message: backendMessage,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Message saved to database successfully');

                clearTimeout(stopSpinningTimeout);

                if (data.message) {
                    setMessages((prev) => prev.map((msg) =>
                        isPlainMessage(msg) && msg.id === optimisticMessageId
                            ? { ...data.message, id: data.message.id }
                            : msg
                    ));
                } else {
                    setMessages((prev) => prev.map((msg) =>
                        isPlainMessage(msg) && msg.id === optimisticMessageId
                            ? { ...msg, id: msg.id.replace('temp_', '') }
                            : msg
                    ));
                }

                if (isConnected && selectedConversation.otherUser?.id) {
                    try {
                        socketSendMessage(selectedConversation.otherUser.id, backendMessage);
                        console.log('Message sent via Socket.io for real-time delivery');
                    } catch (socketError) {
                        console.log('Socket.io delivery failed, but message is saved:', socketError);
                    }
                } else {
                    console.log('Socket.io not available, but message is saved to database');
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to save message to database:', errorData);

                clearTimeout(stopSpinningTimeout);

                setMessages((prev) => prev.filter((msg) => isPlainMessage(msg) && msg.id !== optimisticMessageId));

                setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
                    conv.other_user_id === selectedConversation.otherUser?.id
                        ? { ...conv, last_message: conv.last_message, last_message_time: conv.last_message_time }
                        : conv
                ));

                toast.error(errorData.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);

            clearTimeout(stopSpinningTimeout);

            setMessages((prev) => prev.filter((msg) => isPlainMessage(msg) && msg.id !== optimisticMessageId));

            setConversations((prev: Conversation[]) => prev.map((conv: Conversation) =>
                conv.other_user_id === selectedConversation.otherUser?.id
                    ? { ...conv, last_message: conv.last_message, last_message_time: conv.last_message_time }
                    : conv
            ));

            toast.error('Error sending message');
        } finally {
            setSendingMessage(false);
        }
    };

    const handleConversationSelect = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        if (conversation.otherUser?.email) {
            fetchMessages(conversation.otherUser.email);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);

        if (selectedConversation?.otherUser?.id) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            startTyping(selectedConversation.otherUser.id);

            typingTimeoutRef.current = setTimeout(() => {
                if (selectedConversation.otherUser) stopTyping(selectedConversation.otherUser.id);
            }, 2000);
        }
    };

    useEffect(() => {
        if (selectedConversation && messages.length > 0) {
            const unreadMessages = messages.filter((msg: Message | string | { text: string; googleCalendarUrl?: string; googleCalendarLabel?: string }) => isPlainMessage(msg) && msg.sender_id !== currentUserId && !msg.is_read);

            if (unreadMessages.length > 0) {
                const messageIds = unreadMessages.map((msg: Message | string | { text: string; googleCalendarUrl?: string; googleCalendarLabel?: string }) => (isPlainMessage(msg) ? msg.id : undefined)).filter(Boolean) as string[];
                if (selectedConversation.otherUser?.id) {
                    markAsRead(selectedConversation.otherUser.id, messageIds);
                }

                setMessages((prev) => prev.map((msg) =>
                    unreadMessages.some((unread) => isPlainMessage(unread) && isPlainMessage(msg) && unread.id === msg.id)
                        ? { ...msg, is_read: true }
                        : msg
                ));
            }
        }
    }, [selectedConversation, messages, currentUserId, markAsRead]);

    if (loading) {
        return (
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{
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
            }}>
                <div className="text-center">
                    <div className="size-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{
                        borderColor: 'rgba(255, 215, 0, 0.8)',
                        borderTopColor: 'transparent'
                    }} />
                    <h2 className="text-xl font-bold text-black mb-2">Loading messages...</h2>
                    <p className="text-black font-medium">Fetching your conversations</p>
                </div>
            </div>
        );
    }

    // Type guard for Message
    function isPlainMessage(msg: any): msg is Message {
        return typeof msg === 'object' && msg !== null && 'id' in msg && typeof msg.id === 'string';
    }

    // ChatMessage component for rendering
    function ChatMessage({ message }: { message: Message | string | { text: string; googleCalendarUrl?: string; googleCalendarLabel?: string } }) {
        // ✅ First: handle meeting confirmation object
        if (typeof message === 'object' && message !== null && 'text' in message && 'googleCalendarUrl' in message) {
            return (
                <div className="flex flex-col gap-2">
                    <span>{message.text}</span>
                    <a
                        href={message.googleCalendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm inline-block mt-1"
                    >
                        {message.googleCalendarLabel || '📅 Add to Google Calendar'}
                    </a>
                </div>
            );
        }

        // 🧪 Then: check for plain text string messages
        if (typeof message === 'string') {
            return <span>{message}</span>;
        }

        // ✅ Then: handle legacy plain message object
        if (isPlainMessage(message)) {
            return <span>{message.message}</span>;
        }

        // fallback
        return null;
    }



    return (
        <div className="min-h-screen relative overflow-hidden" style={{
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
        }}>
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

            {/* Common Navbar */}
            <CommonNavbar currentPage="/messages" />

            <div className="max-w-7xl mx-auto p-3 md:p-6 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 h-full">
                    <div className={`${selectedConversation ? 'hidden lg:block lg:col-span-1' : 'lg:col-span-1'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/20 shadow-lg overflow-hidden flex flex-col h-full`}>
                        <div className="p-3 md:p-4 border-b border-gray-200 dark:border-white/20 shrink-0 flex items-center justify-between">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Messages</h2>
                            <Button
                                type="button"
                                onClick={fetchConversations}
                                disabled={loading}
                                className="ml-2"
                            >
                                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </Button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {conversations.length === 0 ? (
                                <div className="p-4 md:p-6 text-center">
                                    <span className="md:size-12 text-gray-400 mx-auto mb-3 md:mb-4 flex items-center justify-center"><FaEnvelope size={32} /></span>
                                    <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {loading ? 'Loading conversations...' : 'No conversations yet'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                                        {loading
                                            ? 'Please wait while we fetch your conversations...'
                                            : 'Start messaging your connections to begin conversations.'
                                        }
                                    </p>
                                    {!loading && (
                                        <button type="button"
                                            onClick={() => router.push('/connections')}
                                            className="px-4 md:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                                        >
                                            View Connections
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-white/20">
                                    {conversations.map((conversation: Conversation) => (
                                        <motion.div
                                            key={conversation.other_user_id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => handleConversationSelect(conversation)}
                                            className={`p-3 md:p-4 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/10 dark:hover:to-blue-900/10 transition-all duration-200 ${selectedConversation?.other_user_id === conversation.other_user_id
                                                ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border-r-4 border-purple-500'
                                                : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="relative">
                                                    <div className="size-10 md:size-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <span className="text-white md:size-[18px] flex items-center justify-center"><FaUser size={16} /></span>
                                                    </div>
                                                    {conversation.unread_count > 0 && (
                                                        <div className="absolute -top-1 -right-1 size-4 md:size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">
                                                            {conversation.otherUser?.name || 'Unknown User'}
                                                        </h3>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(conversation.last_message_time).toLocaleDateString() === new Date().toLocaleDateString()
                                                                ? new Date(conversation.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                : new Date(conversation.last_message_time).toLocaleDateString()
                                                            }
                                                        </span>
                                                    </div>
                                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate leading-relaxed">
                                                        {conversation.last_message || 'No messages yet'}
                                                    </p>
                                                    {conversation.unread_count > 0 && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className="size-1.5 md:size-2 bg-purple-500 rounded-full" />                                                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                                {conversation.unread_count} new message{conversation.unread_count > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="lg:hidden text-gray-400">
                                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`${selectedConversation ? 'lg:col-span-2' : 'hidden lg:block lg:col-span-2'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/20 shadow-lg overflow-hidden flex flex-col h-full`}>
                        {selectedConversation ? (
                            <>
                                <div className="p-3 md:p-4 border-b border-gray-200 dark:border-white/20 flex items-center gap-2 md:gap-3 shrink-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
                                    <button type="button"
                                        onClick={() => setSelectedConversation(null)}
                                        className="lg:hidden p-1.5 md:p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors"
                                        aria-label="Back to conversations"
                                    >
                                        <ArrowLeft className="size-4 md:size-5" />
                                    </button>
                                    <div className="size-10 md:size-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white md:size-[18px] flex items-center justify-center"><FaUser size={16} /></span>
                                    </div>
                                    <div className="flex-1 flex items-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-base md:text-lg">
                                            {selectedConversation.otherUser?.name || 'Unknown User'}
                                        </h3>
                                        <ScheduleMeetingButton
                                            name={selectedConversation.otherUser?.name || 'Unknown User'}
                                            email={selectedConversation.otherUser?.email || ''}
                                            sendMessage={(text) => {
                                                console.log("Send this in chat:", text);
                                                sendMeetingMessage(text);
                                            }}
                                        />

                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2 ml-4">
                                        <div className={`size-1.5 md:size-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                            {selectedConversation.otherUser?.email}
                                        </p>
                                        <span className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                            {isConnected ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {messages.map((message: Message | string | { text: string; googleCalendarUrl?: string; googleCalendarLabel?: string }, index: number) => (
                                                (isPlainMessage(message) || typeof message === 'string') ? (
                                                    <motion.div
                                                        key={isPlainMessage(message) ? message.id : `meeting-invite-${index}`}
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                                        className={`flex ${isPlainMessage(message) && message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} group`}
                                                    >
                                                        <div className="flex flex-col max-w-xs lg:max-w-md">
                                                            <div
                                                                className={`relative px-4 py-3 rounded-2xl shadow-sm ${isPlainMessage(message) && message.sender_id === currentUserId
                                                                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-br-md'
                                                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                                                                    } ${isPlainMessage(message) && message.id.startsWith('temp_') ? 'opacity-80 animate-pulse' : ''}`}
                                                            >
                                                                <ChatMessage message={message} />
                                                                <div className={`flex items-center justify-end gap-1 mt-2 ${isPlainMessage(message) && message.sender_id === currentUserId
                                                                    ? 'text-purple-100'
                                                                    : 'text-gray-500 dark:text-gray-400'
                                                                    }`}>
                                                                    <span className="text-xs">
                                                                        {isPlainMessage(message) ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                    </span>
                                                                    {isPlainMessage(message) && message.sender_id === currentUserId && (
                                                                        <div className="flex items-center gap-1">
                                                                            {message.id.startsWith('temp_') ? (
                                                                                <div className="size-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                                            ) : message.is_read ? (
                                                                                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {index === 0 ||
                                                                (isPlainMessage(message) && isPlainMessage(messages[index - 1]) && new Date(message.created_at).toDateString() !==
                                                                    new Date((messages[index - 1] as Message).created_at).toDateString()) ? (
                                                                <div className="flex justify-center my-4">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                                                        {isPlainMessage(message)
                                                                            ? new Date(message.created_at).toLocaleDateString('en-US', {
                                                                                weekday: 'long',
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric'
                                                                            })
                                                                            : ''}
                                                                    </span>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </motion.div>
                                                ) : null
                                            ))}

                                            {typingUsers.has(selectedConversation.otherUser?.id || '') && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="flex flex-col max-w-xs lg:max-w-md">
                                                        <div className="relative px-4 py-3 rounded-2xl shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white rounded-bl-md">
                                                            <div className="flex items-center gap-1">
                                                                <div className="flex space-x-1">
                                                                    <div className="size-2 bg-gray-500 rounded-full animate-bounce" />
                                                                    <div className="size-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                                    <div className="size-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                                </div>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">typing...</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                <div className="p-3 md:p-4 border-t border-gray-200 dark:border-white/20 shrink-0 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/10">
                                    <div className="flex items-end gap-2 md:gap-3">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={newMessage}
                                                onChange={handleTyping}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your message..."
                                                className="w-full p-3 md:p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl md:rounded-2xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-sm"
                                                rows={1}
                                                style={{ minHeight: '40px', maxHeight: '100px' }}
                                            />
                                            <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                                <button type="button" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                                    <svg className="size-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button type="button" className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                                                    <svg className="size-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => sendMessage()}
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl md:rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                        >
                                            {sendingMessage ? (
                                                <div className="size-4 md:size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send className="size-4 md:size-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/10">
                                <div className="text-center max-w-md mx-auto p-4 md:p-8">
                                    <div className="size-16 md:size-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                                        <span className="md:size-8 text-gray-400 flex items-center justify-center"><FaEnvelope size={24} /></span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">Select a conversation</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                                        Choose a conversation from the list to start messaging with your connections.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        <div className="size-1.5 md:size-2 bg-purple-500 rounded-full animate-pulse" />
                                        <span>Messages are end-to-end encrypted</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MessagesContent />
        </Suspense>
    );
} 