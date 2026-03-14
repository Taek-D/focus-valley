export type SyncSession = {
    id: string;
    date: string;
    minutes: number;
    categoryId?: string;
};

export type SyncHistoryEntry = {
    type: string;
    date: string;
};

export type SyncCategory = {
    id: string;
    label: string;
    emoji: string;
    color: string;
};

export type SyncTodo = {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
};

export type SyncDomainMeta = {
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

export type LegacySyncableData = {
    garden?: Partial<SyncableDataV2["garden"]>;
    settings?: Partial<SyncableDataV2["settings"]>;
    categories?: Partial<SyncableDataV2["categories"]>;
    todos?: Partial<SyncableDataV2["todos"]>;
};

export const STORE_KEYS = {
    garden: "focus-valley-garden",
    settings: "focus-valley-timer-settings",
    categories: "focus-valley-categories",
    todos: "focus-valley-todos",
} as const;

export const STORE_VERSIONS = {
    garden: 2,
    settings: 2,
    categories: 1,
    todos: 1,
} as const;

export const LAST_SYNC_KEY = "focus-valley-last-sync";
export const SYNC_SCHEMA_VERSION = 2;

export type SyncOutcome = "pushed" | "pulled" | "merged" | "noop" | "error";

export type SyncResult = {
    outcome: SyncOutcome;
    requiresReload: boolean;
    syncedAt: string | null;
};
