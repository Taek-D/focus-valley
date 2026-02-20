export function toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function getToday(): string {
    return toLocalDateKey(new Date());
}

export function getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toLocalDateKey(d);
}

export function isToday(dateStr: string): boolean {
    return dateStr === getToday();
}

export function getDayLabel(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short" });
}

export function getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(toLocalDateKey(d));
    }
    return days;
}

type Dateable = { date: string };

export function groupByDate<T extends Dateable>(items: T[]): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const item of items) {
        const parsed = new Date(item.date);
        const date = Number.isNaN(parsed.getTime())
            ? item.date.slice(0, 10)
            : toLocalDateKey(parsed);
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
    }
    return groups;
}
