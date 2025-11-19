'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
import { toast } from 'sonner';

interface TimeBlock {
    dayOfWeek: number; // 0=Monday, 6=Sunday
    startTime: string; // "HH:MM:SS"
    endTime: string; // "HH:MM:SS"
    isBlocked: boolean; // true = blocked, false = available
}

interface WeeklyCalendarProps {
    timezone: string;
    workingHours: string; // "09:00-17:00"
    onSave: (blocks: TimeBlock[], timezone: string, workingHours: string) => Promise<void>;
    onClose: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
});

export function WeeklyCalendar({ timezone, workingHours, onSave, onClose }: WeeklyCalendarProps) {
    const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [selectedTimezone, setSelectedTimezone] = useState(timezone);
    const [selectedWorkingHours, setSelectedWorkingHours] = useState(workingHours);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ day: number; time: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [startHour, endHour] = selectedWorkingHours.split('-').map((t: string) => parseInt(t.split(':')[0]));

    // Load calendar blocks for current week
    useEffect(() => {
        loadCalendarBlocks();
    }, [currentWeek]);

    const loadCalendarBlocks = async () => {
        setLoading(true);
        try {
            const weekStart = format(currentWeek, 'yyyy-MM-dd');
            const response = await fetch(`/api/calendar-blocks?weekStart=${weekStart}`);
            if (response.ok) {
                const data = await response.json();
                setBlocks(data.blocks || []);
                setSelectedTimezone(data.timeZone || timezone);
                setSelectedWorkingHours(data.workingHours || workingHours);
            }
        } catch (error) {
            console.error('Error loading calendar blocks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeekStartDate = () => format(currentWeek, 'yyyy-MM-dd');

    const isTimeBlocked = (day: number, time: string): boolean => {
        const timeStr = `${time}:00`;
        return blocks.some(
            (block) =>
                block.dayOfWeek === day &&
                block.startTime <= timeStr &&
                block.endTime > timeStr &&
                block.isBlocked
        );
    };

    const toggleTimeSlot = (day: number, time: string) => {
        const timeStr = `${time}:00`;
        const nextHour = (parseInt(time) + 1).toString().padStart(2, '0');
        const endTimeStr = `${nextHour}:00`;

        // Remove existing blocks for this slot
        const filtered = blocks.filter(
            (block) =>
                !(block.dayOfWeek === day && block.startTime === timeStr && block.endTime === endTimeStr)
        );

        // Add new block (toggle)
        const isBlocked = !isTimeBlocked(day, time);
        setBlocks([
            ...filtered,
            {
                dayOfWeek: day,
                startTime: timeStr,
                endTime: endTimeStr,
                isBlocked,
            },
        ]);
    };

    const handleMouseDown = (day: number, time: string) => {
        setIsDragging(true);
        setDragStart({ day, time });
        toggleTimeSlot(day, time);
    };

    const handleMouseEnter = (day: number, time: string) => {
        if (isDragging && dragStart) {
            if (dragStart.day === day) {
                toggleTimeSlot(day, time);
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(blocks, selectedTimezone, selectedWorkingHours);
            toast.success('Calendar updated successfully!');
        } catch (error) {
            toast.error('Failed to save calendar');
        } finally {
            setSaving(false);
        }
    };

    const clearDay = (day: number) => {
        setBlocks(blocks.filter((block) => block.dayOfWeek !== day));
    };

    const blockDay = (day: number) => {
        const dayBlocks = blocks.filter((block) => block.dayOfWeek !== day);
        const newBlocks = TIME_SLOTS.map((time) => {
            const hour = parseInt(time);
            if (hour >= startHour && hour < endHour) {
                return {
                    dayOfWeek: day,
                    startTime: `${time}:00`,
                    endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
                    isBlocked: true,
                };
            }
            return null;
        }).filter(Boolean) as TimeBlock[];
        setBlocks([...dayBlocks, ...newBlocks]);
    };

    const visibleTimeSlots = TIME_SLOTS.filter((time) => {
        const hour = parseInt(time);
        return hour >= startHour && hour < endHour;
    });

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <h3 className="text-lg font-semibold text-black dark:text-black">
                        {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
                    </h3>
                    <button
                        onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                    <button
                        onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Today
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-black dark:text-black text-sm"
                    >
                        {[
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
                        ].map((tz) => (
                            <option key={tz} value={tz}>
                                {tz}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Working Hours */}
            <div className="mb-4 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Hours:</label>
                <div className="flex items-center gap-2">
                    <input
                        type="time"
                        value={selectedWorkingHours.split('-')[0]}
                        onChange={(e) => {
                            const [start] = selectedWorkingHours.split('-');
                            setSelectedWorkingHours(`${e.target.value}-${selectedWorkingHours.split('-')[1]}`);
                        }}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-black dark:text-black text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="time"
                        value={selectedWorkingHours.split('-')[1]}
                        onChange={(e) => {
                            const [start] = selectedWorkingHours.split('-');
                            setSelectedWorkingHours(`${start}-${e.target.value}`);
                        }}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-black dark:text-black text-sm"
                    />
                </div>
            </div>

            {/* Calendar Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
                </div>
            ) : (
                <div
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800"
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700">
                        {/* Time column header */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 sticky left-0 z-10">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Time</div>
                        </div>

                        {/* Day headers */}
                        {DAYS.map((day, idx) => (
                            <div
                                key={day}
                                className="bg-gray-50 dark:bg-gray-800 p-2 text-center sticky top-0 z-10"
                            >
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{day}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {format(addDays(currentWeek, idx), 'MMM d')}
                                </div>
                                <div className="flex gap-1 mt-2 justify-center">
                                    <button
                                        onClick={() => blockDay(idx)}
                                        className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/30"
                                        title="Block entire day"
                                    >
                                        Block
                                    </button>
                                    <button
                                        onClick={() => clearDay(idx)}
                                        className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/30"
                                        title="Clear day"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Time slots */}
                        {visibleTimeSlots.map((time) => (
                            <React.Fragment key={time}>
                                <div className="bg-gray-50 dark:bg-gray-800 p-1 text-xs text-gray-500 dark:text-gray-400 sticky left-0 z-10 border-r border-gray-200 dark:border-gray-700">
                                    {time}
                                </div>
                                {DAYS.map((_, dayIdx) => {
                                    const isBlocked = isTimeBlocked(dayIdx, time);
                                    return (
                                        <div
                                            key={`${dayIdx}-${time}`}
                                            className={`h-8 cursor-pointer transition-colors ${isBlocked
                                                ? 'bg-red-200 dark:bg-red-900/40 hover:bg-red-300 dark:hover:bg-red-900/50'
                                                : 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20'
                                                } border-r border-b border-gray-200 dark:border-gray-700`}
                                            onMouseDown={() => handleMouseDown(dayIdx, time)}
                                            onMouseEnter={() => handleMouseEnter(dayIdx, time)}
                                            title={`${DAYS[dayIdx]} ${time} - ${isBlocked ? 'Blocked' : 'Available'}`}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend and Actions */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="size-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-4 bg-red-200 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded"></div>
                        <span className="text-gray-700 dark:text-gray-300">Blocked</span>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Click or drag to toggle time slots
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="size-4" />
                        {saving ? 'Saving...' : 'Save Calendar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

