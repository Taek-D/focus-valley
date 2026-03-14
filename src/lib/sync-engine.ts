import { isRecord, parseIsoTimestamp } from "@/lib/persist";
import type {
    LegacySyncableData,
    SyncHistoryEntry,
    SyncableDataV2,
} from "@/lib/sync-contract";
import { SYNC_SCHEMA_VERSION } from "@/lib/sync-contract";
import {
    chooseNewer,
    deriveStreaks,
    normalizeCategories,
    normalizeHistory,
    normalizeSessions,
    normalizeTodos,
} from "@/lib/sync-normalize";
import { getLocalSyncSnapshot, getNow } from "@/lib/sync-storage";

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
                customPreset: isRecord(current.settings?.customPreset)
                    ? {
                        focus: typeof current.settings.customPreset.focus === "number" ? current.settings.customPreset.focus : 25,
                        shortBreak: typeof current.settings.customPreset.shortBreak === "number" ? current.settings.customPreset.shortBreak : 5,
                        longBreak: typeof current.settings.customPreset.longBreak === "number" ? current.settings.customPreset.longBreak : 15,
                    }
                    : undefined,
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

export function isSameData(left: unknown, right: unknown) {
    return JSON.stringify(left) === JSON.stringify(right);
}
