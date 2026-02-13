import type { FocusSession } from "../hooks/useGarden";

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday = start
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekDays(weekStart: Date): string[] {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type WeekDayData = { date: string; minutes: number };

type WeeklyStats = {
    thisWeek: WeekDayData[];
    lastWeek: WeekDayData[];
    totalMinutes: number;
    avgMinutes: number;
    bestDay: string;
    changePercent: number;
};

export function getWeeklyStats(sessions: FocusSession[]): WeeklyStats {
    const now = new Date();
    const thisWeekStart = getWeekStart(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekDays = getWeekDays(thisWeekStart);
    const lastWeekDays = getWeekDays(lastWeekStart);

    const minutesByDay: Record<string, number> = {};
    for (const session of sessions) {
        minutesByDay[session.date] = (minutesByDay[session.date] || 0) + session.minutes;
    }

    const thisWeek = thisWeekDays.map((d) => ({ date: d, minutes: minutesByDay[d] || 0 }));
    const lastWeek = lastWeekDays.map((d) => ({ date: d, minutes: minutesByDay[d] || 0 }));

    const totalMinutes = thisWeek.reduce((sum, d) => sum + d.minutes, 0);
    const daysWithData = thisWeek.filter((d) => d.minutes > 0).length;
    const avgMinutes = daysWithData > 0 ? Math.round(totalMinutes / daysWithData) : 0;

    let bestDayIndex = 0;
    let bestMinutes = 0;
    thisWeek.forEach((d, i) => {
        if (d.minutes > bestMinutes) {
            bestMinutes = d.minutes;
            bestDayIndex = i;
        }
    });
    const bestDay = bestMinutes > 0 ? DAY_NAMES[bestDayIndex] : "-";

    const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.minutes, 0);
    const changePercent =
        lastWeekTotal > 0
            ? Math.round(((totalMinutes - lastWeekTotal) / lastWeekTotal) * 100)
            : totalMinutes > 0
            ? 100
            : 0;

    return { thisWeek, lastWeek, totalMinutes, avgMinutes, bestDay, changePercent };
}
