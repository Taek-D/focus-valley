export function getToday(): string {
    return new Date().toISOString().slice(0, 10);
}

export function getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
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
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

type Dateable = { date: string };

export function groupByDate<T extends Dateable>(items: T[]): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const item of items) {
        const date = new Date(item.date).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
    }
    return groups;
}
