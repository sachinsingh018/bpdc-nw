import { DateTime, Interval } from 'luxon';

/**
 * Finds multiple 1-hour overlapping slots for a specific date for two users given their time zones and working hours.
 * @param userA Object with { timeZone: string, workingHours: string } (e.g., '09:00-17:00')
 * @param userB Object with { timeZone: string, workingHours: string }
 * @param date ISO date string (e.g., '2024-01-15')
 * @returns Array of { start: string, end: string } ISO strings for Google Calendar, or null if no overlap found
 */
export async function findBestOverlapSlot(
    userA: { timeZone: string; workingHours: string },
    userB: { timeZone: string; workingHours: string },
    date: string
): Promise<{ start: string; end: string }[] | null> {
    // Helper to parse working hours string
    function parseHours(hours: string) {
        const [start, end] = hours.split('-');
        return { start, end };
    }

    const aHours = parseHours(userA.workingHours);
    const bHours = parseHours(userB.workingHours);
    const allSlots: { start: string; end: string }[] = [];

    const aDay = DateTime.fromISO(date, { zone: userA.timeZone });
    const bDay = DateTime.fromISO(date, { zone: userB.timeZone });

    const aStart = aDay.set({
        hour: Number(aHours.start.split(':')[0]),
        minute: Number(aHours.start.split(':')[1]),
        second: 0,
        millisecond: 0,
    });
    const aEnd = aDay.set({
        hour: Number(aHours.end.split(':')[0]),
        minute: Number(aHours.end.split(':')[1]),
        second: 0,
        millisecond: 0,
    });
    const bStart = bDay.set({
        hour: Number(bHours.start.split(':')[0]),
        minute: Number(bHours.start.split(':')[1]),
        second: 0,
        millisecond: 0,
    });
    const bEnd = bDay.set({
        hour: Number(bHours.end.split(':')[0]),
        minute: Number(bHours.end.split(':')[1]),
        second: 0,
        millisecond: 0,
    });

    const aInterval = Interval.fromDateTimes(aStart.toUTC(), aEnd.toUTC());
    const bInterval = Interval.fromDateTimes(bStart.toUTC(), bEnd.toUTC());
    const overlap = aInterval.intersection(bInterval);

    if (overlap?.start && overlap?.end && overlap.length('minutes') >= 60) {
        // Generate slots with 30-minute increments
        let currentSlotStart = overlap.start;

        while (currentSlotStart.plus({ hours: 1 }) <= overlap.end) {
            const slotEnd = currentSlotStart.plus({ hours: 1 });

            allSlots.push({
                start: currentSlotStart.toISO(),
                end: slotEnd.toISO(),
            });

            // Move to next slot with 30-minute increment
            currentSlotStart = currentSlotStart.plus({ minutes: 30 });
        }
    }

    return allSlots.length > 0 ? allSlots : null;
}

/**
 * Example Express/n8n handler usage:
 *
 * export default async function handler(req, res) {
 *   if (req.method !== 'POST') return res.status(405).end();
 *   const { userA, userB, date } = req.body;
 *   const slots = await findBestOverlapSlot(userA, userB, date);
 *   if (!slots) return res.status(404).json({ error: 'No overlap found' });
 *   res.json(slots);
 * }
 */ 