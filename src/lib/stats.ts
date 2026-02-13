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

export type HeatmapDay = { date: string; minutes: number; level: 0 | 1 | 2 | 3 | 4 };

export function getMonthlyHeatmap(sessions: FocusSession[], dailyGoal: number): (HeatmapDay | null)[][] {
    const minutesByDay: Record<string, number> = {};
    for (const session of sessions) {
        minutesByDay[session.date] = (minutesByDay[session.date] || 0) + session.minutes;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDow = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const thisMonday = new Date(today);
    thisMonday.setDate(thisMonday.getDate() - todayDow);

    const startMonday = new Date(thisMonday);
    startMonday.setDate(startMonday.getDate() - 12 * 7);

    const weeks: (HeatmapDay | null)[][] = [];
    const current = new Date(startMonday);

    for (let w = 0; w < 13; w++) {
        const week: (HeatmapDay | null)[] = [];
        for (let d = 0; d < 7; d++) {
            if (current > today) {
                week.push(null);
            } else {
                const dateStr = current.toISOString().slice(0, 10);
                const minutes = minutesByDay[dateStr] || 0;

                let level: 0 | 1 | 2 | 3 | 4 = 0;
                if (minutes > 0) {
                    const ratio = minutes / dailyGoal;
                    if (ratio >= 1) level = 4;
                    else if (ratio >= 0.75) level = 3;
                    else if (ratio >= 0.5) level = 2;
                    else level = 1;
                }

                week.push({ date: dateStr, minutes, level });
            }
            current.setDate(current.getDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
}

export function exportSessionsCSV(sessions: FocusSession[]): string {
    const header = "Date,Minutes\n";
    const byDate: Record<string, number> = {};
    for (const s of sessions) {
        byDate[s.date] = (byDate[s.date] || 0) + s.minutes;
    }
    const rows = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, minutes]) => `${date},${minutes}`)
        .join("\n");
    return header + rows;
}

export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
