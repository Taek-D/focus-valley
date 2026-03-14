import { getToday, getYesterday } from "@/lib/date-utils";
import { isRecord } from "@/lib/persist";
import type {
    SyncCategory,
    SyncDomainMeta,
    SyncHistoryEntry,
    SyncSession,
    SyncTodo,
} from "@/lib/sync-contract";

function normalizeSession(value: unknown, fallbackIndex: number): SyncSession | null {
    if (!isRecord(value)) return null;
    if (typeof value.date !== "string" || typeof value.minutes !== "number") return null;
    const base = `${value.date}:${value.minutes}:${typeof value.categoryId === "string" ? value.categoryId : ""}`;
    return {
        id: typeof value.id === "string" ? value.id : `legacy:${base}:${fallbackIndex}`,
        date: value.date,
        minutes: value.minutes,
        categoryId: typeof value.categoryId === "string" ? value.categoryId : undefined,
    };
}

export function normalizeSessions(values: unknown): SyncSession[] {
    if (!Array.isArray(values)) return [];
    return values
        .map((value, index) => normalizeSession(value, index + 1))
        .filter((value): value is SyncSession => value !== null);
}

export function normalizeHistory(values: unknown): SyncHistoryEntry[] {
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is SyncHistoryEntry =>
        isRecord(value) && typeof value.type === "string" && typeof value.date === "string");
}

export function normalizeCategories(values: unknown): SyncCategory[] {
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is SyncCategory =>
        isRecord(value)
        && typeof value.id === "string"
        && typeof value.label === "string"
        && typeof value.emoji === "string"
        && typeof value.color === "string");
}

export function normalizeTodos(values: unknown): SyncTodo[] {
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is SyncTodo =>
        isRecord(value)
        && typeof value.id === "string"
        && typeof value.text === "string"
        && typeof value.completed === "boolean"
        && typeof value.createdAt === "string");
}

export function chooseNewer<T extends SyncDomainMeta>(local: T, cloud: T): T {
    return Date.parse(local.updatedAt) >= Date.parse(cloud.updatedAt) ? local : cloud;
}

function addDays(dateKey: string, delta: number): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + delta);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function deriveStreaks(sessions: SyncSession[]) {
    const uniqueDates = [...new Set(sessions.map((session) => session.date))].sort();
    if (uniqueDates.length === 0) {
        return { currentStreak: 0, bestStreak: 0, lastFocusDate: null as string | null };
    }

    let bestStreak = 1;
    let currentRun = 1;
    for (let index = 1; index < uniqueDates.length; index += 1) {
        if (uniqueDates[index] === addDays(uniqueDates[index - 1], 1)) {
            currentRun += 1;
            bestStreak = Math.max(bestStreak, currentRun);
        } else {
            currentRun = 1;
        }
    }

    const lastFocusDate = uniqueDates[uniqueDates.length - 1];
    const today = getToday();
    const yesterday = getYesterday();

    if (lastFocusDate !== today && lastFocusDate !== yesterday) {
        return { currentStreak: 0, bestStreak, lastFocusDate };
    }

    let currentStreak = 1;
    for (let index = uniqueDates.length - 1; index > 0; index -= 1) {
        if (uniqueDates[index] === addDays(uniqueDates[index - 1], 1)) {
            currentStreak += 1;
        } else {
            break;
        }
    }

    return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak), lastFocusDate };
}
