'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface TimeBlock {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isBlocked: boolean;
}

interface ViewCalendarReadonlyProps {
    userEmail: string;
    userName: string;
    timezone: string;
    workingHours: string;
    onScheduleMeeting: () => void;
    onClose: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
});

export function ViewCalendarReadonly({ userEmail, userName, timezone, workingHours, onScheduleMeeting, onClose }: ViewCalendarReadonlyProps) {
    const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [loading, setLoading] = useState(true);

    const [startHour, endHour] = workingHours.split('-').map((t: string) => parseInt(t.split(':')[0]));

    useEffect(() => {
        loadCalendarBlocks();
    }, [currentWeek, userEmail]);

    const loadCalendarBlocks = async () => {
        setLoading(true);
        try {
            const weekStart = format(currentWeek, 'yyyy-MM-dd');
            const response = await fetch(`/api/calendar-blocks?weekStart=${weekStart}&userEmail=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
                const data = await response.json();
                setBlocks(data.blocks || []);
            }
        } catch (error) {
            console.error('Error loading calendar blocks:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const visibleTimeSlots = TIME_SLOTS.filter((time) => {
        const hour = parseInt(time);
        return hour >= startHour && hour < endHour;
    });

    const getAvailabilityPercentage = (day: number): number => {
        const dayBlocks = blocks.filter((b) => b.dayOfWeek === day && b.isBlocked);
        if (dayBlocks.length === 0) return 100;
        const totalMinutes = (endHour - startHour) * 60;
        const blockedMinutes = dayBlocks.reduce((sum, block) => {
            const [startH, startM] = block.startTime.split(':').map(Number);
            const [endH, endM] = block.endTime.split(':').map(Number);
            const start = startH * 60 + startM;
            const end = endH * 60 + endM;
            return sum + (end - start);
        }, 0);
        return Math.round(((totalMinutes - blockedMinutes) / totalMinutes) * 100);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <h3 className="text-base font-semibold text-black dark:text-black">
                        {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
                    </h3>
                    <button
                        onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                    <button
                        onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Today
                    </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Timezone: {timezone}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="size-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading calendar...</p>
                </div>
            ) : (
                <>
                    {/* Day Summary */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {DAYS.map((day, idx) => {
                            const availability = getAvailabilityPercentage(idx);
                            return (
                                <div
                                    key={day}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center"
                                >
                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {day.substring(0, 3)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        {format(addDays(currentWeek, idx), 'MMM d')}
                                    </div>
                                    <div className={`text-xs font-semibold ${availability >= 70 ? 'text-green-600 dark:text-green-400' :
                                            availability >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                        }`}>
                                        {availability}% free
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Calendar Grid */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 max-h-96 overflow-y-auto">
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
                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.substring(0, 3)}</div>
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
                                                className={`h-6 ${isBlocked
                                                        ? 'bg-red-200 dark:bg-red-900/40'
                                                        : 'bg-green-50 dark:bg-green-900/10'
                                                    } border-r border-b border-gray-200 dark:border-gray-700`}
                                                title={`${DAYS[dayIdx]} ${time} - ${isBlocked ? 'Blocked' : 'Available'}`}
                                            />
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="size-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded"></div>
                                <span className="text-gray-700 dark:text-gray-300">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 bg-red-200 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded"></div>
                                <span className="text-gray-700 dark:text-gray-300">Blocked</span>
                            </div>
                        </div>
                        <button
                            onClick={onScheduleMeeting}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition"
                        >
                            Schedule Meeting
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

