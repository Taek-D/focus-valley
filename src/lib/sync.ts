import type { User } from "@supabase/supabase-js";
import { getToday, getYesterday } from "@/lib/date-utils";
import { isRecord, parseIsoTimestamp } from "@/lib/persist";
import { supabase } from "./supabase";

type SyncSession = {
    id: string;
    date: string;
    minutes: number;
    categoryId?: string;
};

type SyncHistoryEntry = {
    type: string;
    date: string;
};

type SyncCategory = {
    id: string;
    label: string;
    emoji: string;
    color: string;
};

type SyncTodo = {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
};

type SyncDomainMeta = {
    updatedAt: string;
};

export type SyncableDataV2 = {
    schemaVersion: 2;
    garden: SyncDomainMeta & {
        stage: string;
        type: string;
        history: SyncHistoryEntry[];
        totalFocusMinutes: number;
        focusSessions: SyncSession[];
        currentStreak: number;
        bestStreak: number;
        lastFocusDate: string | null;
        unlockedPlants: string[];
        deepFocusStreak: number;
        lastFocusTimestamp: number;
        earnedMilestones: string[];
    };
    settings: SyncDomainMeta & {
        focus: number;
        shortBreak: number;
        longBreak: number;
        dailyGoal: number;
        autoAdvance: boolean;
        presetId?: string;
        customPreset?: {
            focus: number;
            shortBreak: number;
            longBreak: number;
        };
    };
    categories: SyncDomainMeta & {
        categories: SyncCategory[];
        activeCategoryId: string;
    };
    todos: SyncDomainMeta & {
        todos: SyncTodo[];
        activeTodoId: string | null;
    };
};

type LegacySyncableData = {
    garden?: Partial<SyncableDataV2["garden"]>;
    settings?: Partial<SyncableDataV2["settings"]>;
    categories?: Partial<SyncableDataV2["categories"]>;
    todos?: Partial<SyncableDataV2["todos"]>;
};

type CloudRow = {
    user_id: string;
    data: SyncableDataV2 | LegacySyncableData | null;
    updated_at: string;
};

const STORE_KEYS = {
    garden: "focus-valley-garden",
    settings: "focus-valley-timer-settings",
    categories: "focus-valley-categories",
    todos: "focus-valley-todos",
} as const;

const STORE_VERSIONS = {
    garden: 2,
    settings: 2,
    categories: 1,
    todos: 1,
} as const;

const LAST_SYNC_KEY = "focus-valley-last-sync";
const SYNC_SCHEMA_VERSION = 2;

export type SyncOutcome = "pushed" | "pulled" | "merged" | "noop" | "error";

export type SyncResult = {
    outcome: SyncOutcome;
    requiresReload: boolean;
    syncedAt: string | null;
};

function getNow() {
    return new Date().toISOString();
}

function getRecordState(value: unknown): Record<string, unknown> {
    if (!isRecord(value)) return {};
    if (isRecord(value.state)) return value.state;
    return value;
}

function readPersistedState(key: string): Record<string, unknown> {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return {};
        return getRecordState(JSON.parse(raw));
    } catch {
        return {};
    }
}

function writePersistedState(key: string, state: Record<string, unknown>, version: number) {
    localStorage.setItem(key, JSON.stringify({ state, version }));
}

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

function normalizeSessions(values: unknown): SyncSession[] {
    if (!Array.isArray(values)) return [];
    return values
        .map((value, index) => normalizeSession(value, index + 1))
        .filter((value): value is SyncSession => value !== null);
}

function normalizeHistory(values: unknown): SyncHistoryEntry[] {
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is SyncHistoryEntry =>
        isRecord(value) && typeof value.type === "string" && typeof value.date === "string");
}

function normalizeCategories(values: unknown): SyncCategory[] {
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is SyncCategory =>
        isRecord(value)
        && typeof value.id === "string"
        && typeof value.label === "string"
        && typeof value.emoji === "string"
        && typeof value.color === "string");
}

function normalizeTodos(values: unknown): SyncTodo[] {
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is SyncTodo =>
        isRecord(value)
        && typeof value.id === "string"
        && typeof value.text === "string"
        && typeof value.completed === "boolean"
        && typeof value.createdAt === "string");
}

function chooseNewer<T extends SyncDomainMeta>(local: T, cloud: T): T {
    return Date.parse(local.updatedAt) >= Date.parse(cloud.updatedAt) ? local : cloud;
}

function addDays(dateKey: string, delta: number): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + delta);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function deriveStreaks(sessions: SyncSession[]) {
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

export function getLocalSyncSnapshot(now = getNow()): SyncableDataV2 {
    const garden = readPersistedState(STORE_KEYS.garden);
    const settings = readPersistedState(STORE_KEYS.settings);
    const categories = readPersistedState(STORE_KEYS.categories);
    const todos = readPersistedState(STORE_KEYS.todos);

    return {
        schemaVersion: SYNC_SCHEMA_VERSION,
        garden: {
            stage: typeof garden.stage === "string" ? garden.stage : "SEED",
            type: typeof garden.type === "string" ? garden.type : "DEFAULT",
            history: normalizeHistory(garden.history),
            totalFocusMinutes: typeof garden.totalFocusMinutes === "number" ? garden.totalFocusMinutes : 0,
            focusSessions: normalizeSessions(garden.focusSessions),
            currentStreak: typeof garden.currentStreak === "number" ? garden.currentStreak : 0,
            bestStreak: typeof garden.bestStreak === "number" ? garden.bestStreak : 0,
            lastFocusDate: typeof garden.lastFocusDate === "string" ? garden.lastFocusDate : null,
            unlockedPlants: Array.isArray(garden.unlockedPlants)
                ? garden.unlockedPlants.filter((entry): entry is string => typeof entry === "string")
                : [],
            deepFocusStreak: typeof garden.deepFocusStreak === "number" ? garden.deepFocusStreak : 0,
            lastFocusTimestamp: typeof garden.lastFocusTimestamp === "number" ? garden.lastFocusTimestamp : 0,
            earnedMilestones: Array.isArray(garden.earnedMilestones)
                ? garden.earnedMilestones.filter((entry): entry is string => typeof entry === "string")
                : [],
            updatedAt: parseIsoTimestamp(garden.updatedAt, now),
        },
        settings: {
            focus: typeof settings.focus === "number" ? settings.focus : 25,
            shortBreak: typeof settings.shortBreak === "number" ? settings.shortBreak : 5,
            longBreak: typeof settings.longBreak === "number" ? settings.longBreak : 15,
            dailyGoal: typeof settings.dailyGoal === "number" ? settings.dailyGoal : 120,
            autoAdvance: typeof settings.autoAdvance === "boolean" ? settings.autoAdvance : false,
            presetId: typeof settings.presetId === "string" ? settings.presetId : "classic",
            customPreset: isRecord(settings.customPreset) ? {
                focus: typeof settings.customPreset.focus === "number" ? settings.customPreset.focus : 25,
                shortBreak: typeof settings.customPreset.shortBreak === "number" ? settings.customPreset.shortBreak : 5,
                longBreak: typeof settings.customPreset.longBreak === "number" ? settings.customPreset.longBreak : 15,
            } : undefined,
            updatedAt: parseIsoTimestamp(settings.updatedAt, now),
        },
        categories: {
            categories: normalizeCategories(categories.categories),
            activeCategoryId: typeof categories.activeCategoryId === "string" ? categories.activeCategoryId : "study",
            updatedAt: parseIsoTimestamp(categories.updatedAt, now),
        },
        todos: {
            todos: normalizeTodos(todos.todos),
            activeTodoId: typeof todos.activeTodoId === "string" ? todos.activeTodoId : null,
            updatedAt: parseIsoTimestamp(todos.updatedAt, now),
        },
    };
}

export function migrateSyncData(raw: unknown, fallbackUpdatedAt = getNow()): SyncableDataV2 {
    if (isRecord(raw) && raw.schemaVersion === SYNC_SCHEMA_VERSION) {
        const current = raw as SyncableDataV2;
        return {
            schemaVersion: SYNC_SCHEMA_VERSION,
            garden: {
                stage: typeof current.garden?.stage === "string" ? current.garden.stage : "SEED",
                type: typeof current.garden?.type === "string" ? current.garden.type : "DEFAULT",
                history: normalizeHistory(current.garden?.history),
                totalFocusMinutes: typeof current.garden?.totalFocusMinutes === "number" ? current.garden.totalFocusMinutes : 0,
                focusSessions: normalizeSessions(current.garden?.focusSessions),
                currentStreak: typeof current.garden?.currentStreak === "number" ? current.garden.currentStreak : 0,
                bestStreak: typeof current.garden?.bestStreak === "number" ? current.garden.bestStreak : 0,
                lastFocusDate: typeof current.garden?.lastFocusDate === "string" ? current.garden.lastFocusDate : null,
                unlockedPlants: Array.isArray(current.garden?.unlockedPlants) ? current.garden.unlockedPlants : [],
                deepFocusStreak: typeof current.garden?.deepFocusStreak === "number" ? current.garden.deepFocusStreak : 0,
                lastFocusTimestamp: typeof current.garden?.lastFocusTimestamp === "number" ? current.garden.lastFocusTimestamp : 0,
                earnedMilestones: Array.isArray(current.garden?.earnedMilestones) ? current.garden.earnedMilestones : [],
                updatedAt: parseIsoTimestamp(current.garden?.updatedAt, fallbackUpdatedAt),
            },
            settings: {
                focus: typeof current.settings?.focus === "number" ? current.settings.focus : 25,
                shortBreak: typeof current.settings?.shortBreak === "number" ? current.settings.shortBreak : 5,
                longBreak: typeof current.settings?.longBreak === "number" ? current.settings.longBreak : 15,
                dailyGoal: typeof current.settings?.dailyGoal === "number" ? current.settings.dailyGoal : 120,
                autoAdvance: typeof current.settings?.autoAdvance === "boolean" ? current.settings.autoAdvance : false,
                presetId: typeof current.settings?.presetId === "string" ? current.settings.presetId : "classic",
                customPreset: isRecord(current.settings?.customPreset) ? {
                    focus: typeof current.settings.customPreset.focus === "number" ? current.settings.customPreset.focus : 25,
                    shortBreak: typeof current.settings.customPreset.shortBreak === "number" ? current.settings.customPreset.shortBreak : 5,
                    longBreak: typeof current.settings.customPreset.longBreak === "number" ? current.settings.customPreset.longBreak : 15,
                } : undefined,
                updatedAt: parseIsoTimestamp(current.settings?.updatedAt, fallbackUpdatedAt),
            },
            categories: {
                categories: normalizeCategories(current.categories?.categories),
                activeCategoryId: typeof current.categories?.activeCategoryId === "string" ? current.categories.activeCategoryId : "study",
                updatedAt: parseIsoTimestamp(current.categories?.updatedAt, fallbackUpdatedAt),
            },
            todos: {
                todos: normalizeTodos(current.todos?.todos),
                activeTodoId: typeof current.todos?.activeTodoId === "string" ? current.todos.activeTodoId : null,
                updatedAt: parseIsoTimestamp(current.todos?.updatedAt, fallbackUpdatedAt),
            },
        };
    }

    const legacy = isRecord(raw) ? raw as LegacySyncableData : {};
    const migrated = getLocalSyncSnapshot(fallbackUpdatedAt);

    return {
        schemaVersion: SYNC_SCHEMA_VERSION,
        garden: {
            ...migrated.garden,
            stage: typeof legacy.garden?.stage === "string" ? legacy.garden.stage : migrated.garden.stage,
            type: typeof legacy.garden?.type === "string" ? legacy.garden.type : migrated.garden.type,
            history: normalizeHistory(legacy.garden?.history),
            totalFocusMinutes: typeof legacy.garden?.totalFocusMinutes === "number" ? legacy.garden.totalFocusMinutes : migrated.garden.totalFocusMinutes,
            focusSessions: normalizeSessions(legacy.garden?.focusSessions),
            currentStreak: typeof legacy.garden?.currentStreak === "number" ? legacy.garden.currentStreak : migrated.garden.currentStreak,
            bestStreak: typeof legacy.garden?.bestStreak === "number" ? legacy.garden.bestStreak : migrated.garden.bestStreak,
            lastFocusDate: typeof legacy.garden?.lastFocusDate === "string" ? legacy.garden.lastFocusDate : migrated.garden.lastFocusDate,
            unlockedPlants: Array.isArray(legacy.garden?.unlockedPlants) ? legacy.garden.unlockedPlants : migrated.garden.unlockedPlants,
            updatedAt: fallbackUpdatedAt,
        },
        settings: {
            ...migrated.settings,
            focus: typeof legacy.settings?.focus === "number" ? legacy.settings.focus : migrated.settings.focus,
            shortBreak: typeof legacy.settings?.shortBreak === "number" ? legacy.settings.shortBreak : migrated.settings.shortBreak,
            longBreak: typeof legacy.settings?.longBreak === "number" ? legacy.settings.longBreak : migrated.settings.longBreak,
            dailyGoal: typeof legacy.settings?.dailyGoal === "number" ? legacy.settings.dailyGoal : migrated.settings.dailyGoal,
            autoAdvance: typeof legacy.settings?.autoAdvance === "boolean" ? legacy.settings.autoAdvance : migrated.settings.autoAdvance,
            updatedAt: fallbackUpdatedAt,
        },
        categories: {
            ...migrated.categories,
            categories: normalizeCategories(legacy.categories?.categories),
            activeCategoryId: typeof legacy.categories?.activeCategoryId === "string" ? legacy.categories.activeCategoryId : migrated.categories.activeCategoryId,
            updatedAt: fallbackUpdatedAt,
        },
        todos: {
            ...migrated.todos,
            todos: normalizeTodos(legacy.todos?.todos),
            activeTodoId: typeof legacy.todos?.activeTodoId === "string" ? legacy.todos.activeTodoId : migrated.todos.activeTodoId,
            updatedAt: fallbackUpdatedAt,
        },
    };
}

function mergeById<T extends { id: string }>(local: T[], cloud: T[], preferCloud: boolean): T[] {
    const map = new Map<string, T>(local.map((entry) => [entry.id, entry]));
    for (const entry of cloud) {
        if (!map.has(entry.id) || preferCloud) {
            map.set(entry.id, entry);
        }
    }
    return [...map.values()];
}

export function mergeSyncData(local: SyncableDataV2, cloud: SyncableDataV2): SyncableDataV2 {
    const newerGarden = chooseNewer(local.garden, cloud.garden);
    const localSessions = normalizeSessions(local.garden.focusSessions);
    const cloudSessions = normalizeSessions(cloud.garden.focusSessions);
    const focusSessions = mergeById(localSessions, cloudSessions, false);

    const historyMap = new Map<string, SyncHistoryEntry>();
    [...local.garden.history, ...cloud.garden.history].forEach((entry) => {
        historyMap.set(`${entry.type}:${entry.date}`, entry);
    });
    const history = [...historyMap.values()];
    const unlockedPlants = [...new Set([...local.garden.unlockedPlants, ...cloud.garden.unlockedPlants])];
    const earnedMilestones = [...new Set([...local.garden.earnedMilestones, ...cloud.garden.earnedMilestones])];
    const streaks = deriveStreaks(focusSessions);

    const newerSettings = chooseNewer(local.settings, cloud.settings);
    const newerCategories = chooseNewer(local.categories, cloud.categories);
    const newerTodos = chooseNewer(local.todos, cloud.todos);

    const categories = mergeById(local.categories.categories, cloud.categories.categories, newerCategories === cloud.categories);
    const todos = mergeById(local.todos.todos, cloud.todos.todos, newerTodos === cloud.todos);

    return {
        schemaVersion: SYNC_SCHEMA_VERSION,
        garden: {
            ...newerGarden,
            history,
            focusSessions,
            totalFocusMinutes: focusSessions.reduce((sum, session) => sum + session.minutes, 0),
            currentStreak: Math.max(streaks.currentStreak, newerGarden.lastFocusDate === streaks.lastFocusDate ? newerGarden.currentStreak : 0),
            bestStreak: Math.max(streaks.bestStreak, local.garden.bestStreak, cloud.garden.bestStreak),
            lastFocusDate: streaks.lastFocusDate ?? newerGarden.lastFocusDate,
            unlockedPlants,
            earnedMilestones,
            deepFocusStreak: newerGarden.deepFocusStreak,
            lastFocusTimestamp: Math.max(local.garden.lastFocusTimestamp, cloud.garden.lastFocusTimestamp),
            updatedAt: newerGarden.updatedAt,
        },
        settings: {
            ...newerSettings,
            updatedAt: newerSettings.updatedAt,
        },
        categories: {
            categories,
            activeCategoryId: categories.some((entry) => entry.id === newerCategories.activeCategoryId)
                ? newerCategories.activeCategoryId
                : categories[0]?.id ?? "study",
            updatedAt: newerCategories.updatedAt,
        },
        todos: {
            todos,
            activeTodoId: todos.some((entry) => entry.id === newerTodos.activeTodoId)
                ? newerTodos.activeTodoId
                : null,
            updatedAt: newerTodos.updatedAt,
        },
    };
}

export function applyLocalSyncSnapshot(data: SyncableDataV2) {
    writePersistedState(STORE_KEYS.garden, {
        ...data.garden,
        pendingUnlock: null,
        pendingMilestone: null,
    }, STORE_VERSIONS.garden);
    writePersistedState(STORE_KEYS.settings, data.settings, STORE_VERSIONS.settings);
    writePersistedState(STORE_KEYS.categories, data.categories, STORE_VERSIONS.categories);
    writePersistedState(STORE_KEYS.todos, data.todos, STORE_VERSIONS.todos);
}

function isSameData(a: unknown, b: unknown) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export async function pushToCloud(user: User): Promise<boolean> {
    if (!supabase) return false;
    const now = getNow();
    const data = getLocalSyncSnapshot(now);

    const { error } = await supabase
        .from("user_sync")
        .upsert({ user_id: user.id, data, updated_at: now }, { onConflict: "user_id" });

    if (error) {
        console.warn("[sync] push failed:", error.message);
        return false;
    }

    localStorage.setItem(LAST_SYNC_KEY, now);
    return true;
}

export async function pullFromCloud(user: User): Promise<boolean> {
    if (!supabase) return false;
    const { data: row, error } = await supabase
        .from("user_sync")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .single<CloudRow>();

    if (error) {
        if (error.code === "PGRST116") return false;
        console.warn("[sync] pull failed:", error.message);
        return false;
    }

    if (!row?.data) return false;

    const local = getLocalSyncSnapshot();
    const cloud = migrateSyncData(row.data, row.updated_at);
    const merged = mergeSyncData(local, cloud);
    applyLocalSyncSnapshot(merged);
    localStorage.setItem(LAST_SYNC_KEY, row.updated_at);
    return true;
}

export async function syncWithCloud(user: User): Promise<SyncResult> {
    if (!supabase) {
        return { outcome: "error", requiresReload: false, syncedAt: null };
    }

    const { data: row, error } = await supabase
        .from("user_sync")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .single<CloudRow>();

    if (error && error.code !== "PGRST116") {
        console.warn("[sync] fetch failed:", error.message);
        return { outcome: "error", requiresReload: false, syncedAt: null };
    }

    const local = getLocalSyncSnapshot();

    if (!row?.data) {
        const now = getNow();
        const ok = await pushToCloud(user);
        return { outcome: ok ? "pushed" : "error", requiresReload: false, syncedAt: ok ? now : null };
    }

    const cloud = migrateSyncData(row.data, row.updated_at);
    const merged = mergeSyncData(local, cloud);
    const localChanged = !isSameData(local, merged);
    const cloudChanged = !isSameData(cloud, merged);

    if (localChanged) {
        applyLocalSyncSnapshot(merged);
    }

    if (!cloudChanged) {
        localStorage.setItem(LAST_SYNC_KEY, row.updated_at);
        return {
            outcome: localChanged ? "pulled" : "noop",
            requiresReload: localChanged,
            syncedAt: row.updated_at,
        };
    }

    const now = getNow();
    const { error: pushError } = await supabase
        .from("user_sync")
        .upsert({ user_id: user.id, data: merged, updated_at: now }, { onConflict: "user_id" });

    if (pushError) {
        console.warn("[sync] push after merge failed:", pushError.message);
        return {
            outcome: localChanged ? "pulled" : "error",
            requiresReload: localChanged,
            syncedAt: localChanged ? row.updated_at : null,
        };
    }

    localStorage.setItem(LAST_SYNC_KEY, now);
    return {
        outcome: localChanged ? "merged" : "pushed",
        requiresReload: localChanged,
        syncedAt: now,
    };
}

export function getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
}
