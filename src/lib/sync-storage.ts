import { isRecord, parseIsoTimestamp } from "@/lib/persist";
import {
    LAST_SYNC_KEY,
    STORE_KEYS,
    STORE_VERSIONS,
    SYNC_SCHEMA_VERSION,
    type SyncableDataV2,
} from "@/lib/sync-contract";
import {
    normalizeCategories,
    normalizeHistory,
    normalizeSessions,
    normalizeTodos,
} from "@/lib/sync-normalize";

export function getNow() {
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
            customPreset: isRecord(settings.customPreset)
                ? {
                    focus: typeof settings.customPreset.focus === "number" ? settings.customPreset.focus : 25,
                    shortBreak: typeof settings.customPreset.shortBreak === "number" ? settings.customPreset.shortBreak : 5,
                    longBreak: typeof settings.customPreset.longBreak === "number" ? settings.customPreset.longBreak : 15,
                }
                : undefined,
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

export function setLastSyncTime(value: string) {
    localStorage.setItem(LAST_SYNC_KEY, value);
}

export function getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
}
