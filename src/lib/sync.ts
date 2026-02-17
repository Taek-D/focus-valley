import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────

type SyncableData = {
    garden: {
        stage: string;
        type: string;
        history: { type: string; date: string }[];
        totalFocusMinutes: number;
        focusSessions: { id?: string; date: string; minutes: number; categoryId?: string }[];
        currentStreak: number;
        bestStreak: number;
        lastFocusDate: string | null;
        unlockedPlants: string[];
    };
    settings: {
        focus: number;
        shortBreak: number;
        longBreak: number;
        dailyGoal: number;
        autoAdvance: boolean;
    };
    categories: {
        categories: { id: string; label: string; emoji: string; color: string }[];
        activeCategoryId: string;
    };
    todos: {
        todos: { id: string; text: string; completed: boolean; createdAt: string }[];
        activeTodoId: string | null;
    };
};

type CloudRow = {
    user_id: string;
    data: SyncableData;
    updated_at: string;
};

// ─── Local storage keys ───────────────────────────────────

const STORE_KEYS = {
    garden: "focus-valley-garden",
    settings: "focus-valley-timer-settings",
    categories: "focus-valley-categories",
    todos: "focus-valley-todos",
} as const;

const LAST_SYNC_KEY = "focus-valley-last-sync";

export type SyncResult = "pushed" | "pulled" | "merged" | "noop" | "error";

// ─── Helpers ──────────────────────────────────────────────

function getLocalData(): SyncableData {
    const parse = (key: string) => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed?.state ?? parsed;
        } catch {
            return null;
        }
    };

    return {
        garden: parse(STORE_KEYS.garden) ?? {},
        settings: parse(STORE_KEYS.settings) ?? {},
        categories: parse(STORE_KEYS.categories) ?? {},
        todos: parse(STORE_KEYS.todos) ?? {},
    };
}

function setLocalData(data: SyncableData) {
    const wrap = (key: string, state: unknown) => {
        // Zustand persist stores data as { state: ..., version: 0 }
        const existing = localStorage.getItem(key);
        if (existing) {
            try {
                const parsed = JSON.parse(existing);
                if (parsed && typeof parsed === "object" && "state" in parsed) {
                    parsed.state = { ...parsed.state, ...state as Record<string, unknown> };
                    localStorage.setItem(key, JSON.stringify(parsed));
                    return;
                }
            } catch { /* fall through */ }
        }
        localStorage.setItem(key, JSON.stringify({ state, version: 0 }));
    };

    wrap(STORE_KEYS.garden, data.garden);
    wrap(STORE_KEYS.settings, data.settings);
    wrap(STORE_KEYS.categories, data.categories);
    wrap(STORE_KEYS.todos, data.todos);
}

function isSameData(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

type SyncSession = { id?: string; date: string; minutes: number; categoryId?: string };

function normalizeSessions(sessions: SyncSession[]): (SyncSession & { id: string })[] {
    const legacyCounts = new Map<string, number>();
    return sessions.map((session) => {
        if (session.id) return session as SyncSession & { id: string };
        const base = `${session.date}:${session.minutes}:${session.categoryId ?? ""}`;
        const occurrence = (legacyCounts.get(base) ?? 0) + 1;
        legacyCounts.set(base, occurrence);
        return { ...session, id: `legacy:${base}:${occurrence}` };
    });
}

function mergeData(local: SyncableData, cloud: SyncableData): SyncableData {
    // Merge strategy: prefer the one with more data / higher values
    const garden = { ...local.garden };

    // Keep higher stats
    if (cloud.garden.totalFocusMinutes > (garden.totalFocusMinutes ?? 0)) {
        garden.totalFocusMinutes = cloud.garden.totalFocusMinutes;
    }
    if (cloud.garden.bestStreak > (garden.bestStreak ?? 0)) {
        garden.bestStreak = cloud.garden.bestStreak;
    }
    if ((cloud.garden.currentStreak ?? 0) > (garden.currentStreak ?? 0)) {
        garden.currentStreak = cloud.garden.currentStreak;
        garden.lastFocusDate = cloud.garden.lastFocusDate;
    }

    // Merge focus sessions by stable id (legacy sessions receive deterministic synthetic ids)
    const localSessions = normalizeSessions(garden.focusSessions ?? []);
    const cloudSessions = normalizeSessions(cloud.garden.focusSessions ?? []);
    const mergedSessions = new Map(localSessions.map((s) => [s.id, s]));
    for (const session of cloudSessions) {
        if (!mergedSessions.has(session.id)) {
            mergedSessions.set(session.id, session);
        }
    }
    const mergedSessionList = [...mergedSessions.values()];
    garden.focusSessions = mergedSessionList;
    garden.totalFocusMinutes = mergedSessionList.reduce((sum: number, s) => sum + s.minutes, 0);

    // Merge history (harvest log)
    const localHistory = garden.history ?? [];
    const cloudHistory = cloud.garden.history ?? [];
    const historySet = new Set(localHistory.map((h: { type: string; date: string }) => `${h.type}:${h.date}`));
    for (const h of cloudHistory) {
        if (!historySet.has(`${h.type}:${h.date}`)) {
            localHistory.push(h);
        }
    }
    garden.history = localHistory;

    // Merge unlocked plants
    const unlockedSet = new Set([...(garden.unlockedPlants ?? []), ...(cloud.garden.unlockedPlants ?? [])]);
    garden.unlockedPlants = [...unlockedSet];

    // Settings: prefer cloud (last-write-wins for settings)
    const settings = cloud.settings?.focus ? cloud.settings : local.settings;

    // Categories: merge, prefer local active
    const localCats = local.categories?.categories ?? [];
    const cloudCats = cloud.categories?.categories ?? [];
    const catIds = new Set(localCats.map((c: { id: string }) => c.id));
    const mergedCats = [...localCats];
    for (const c of cloudCats) {
        if (!catIds.has(c.id)) {
            mergedCats.push(c);
        }
    }

    // Todos: merge by id
    type TodoItem = { id: string; text: string; completed: boolean; createdAt: string };
    const localTodos = local.todos?.todos ?? [];
    const cloudTodos = cloud.todos?.todos ?? [];
    const todoMap = new Map<string, TodoItem>(localTodos.map((t) => [t.id, t]));
    for (const t of cloudTodos) {
        if (!todoMap.has(t.id)) {
            todoMap.set(t.id, t);
        }
    }

    return {
        garden,
        settings,
        categories: {
            categories: mergedCats,
            activeCategoryId: local.categories?.activeCategoryId ?? mergedCats[0]?.id ?? "study",
        },
        todos: {
            todos: [...todoMap.values()],
            activeTodoId: local.todos?.activeTodoId ?? null,
        },
    };
}

// ─── Public API ───────────────────────────────────────────

export async function pushToCloud(user: User): Promise<boolean> {
    const data = getLocalData();
    const now = new Date().toISOString();

    const { error } = await supabase
        .from("user_sync")
        .upsert(
            { user_id: user.id, data, updated_at: now },
            { onConflict: "user_id" }
        );

    if (error) {
        console.warn("[sync] push failed:", error.message);
        return false;
    }

    localStorage.setItem(LAST_SYNC_KEY, now);
    return true;
}

export async function pullFromCloud(user: User): Promise<boolean> {
    const { data: row, error } = await supabase
        .from("user_sync")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .single<CloudRow>();

    if (error) {
        // No data in cloud yet — that's fine
        if (error.code === "PGRST116") return false;
        console.warn("[sync] pull failed:", error.message);
        return false;
    }

    if (!row?.data) return false;

    const local = getLocalData();
    const merged = mergeData(local, row.data);
    setLocalData(merged);
    localStorage.setItem(LAST_SYNC_KEY, row.updated_at);
    return true;
}

export async function syncWithCloud(user: User): Promise<SyncResult> {
    const { data: row, error } = await supabase
        .from("user_sync")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .single<CloudRow>();

    if (error && error.code !== "PGRST116") {
        console.warn("[sync] fetch failed:", error.message);
        return "error";
    }

    const local = getLocalData();

    // No cloud data — first sync, push everything
    if (!row?.data) {
        const ok = await pushToCloud(user);
        return ok ? "pushed" : "error";
    }

    // Cloud exists — merge and push
    const merged = mergeData(local, row.data);
    const localChanged = !isSameData(local, merged);
    const cloudChanged = !isSameData(row.data, merged);

    if (localChanged) {
        setLocalData(merged);
    }

    if (!cloudChanged) {
        localStorage.setItem(LAST_SYNC_KEY, row.updated_at);
        return localChanged ? "pulled" : "noop";
    }

    const now = new Date().toISOString();
    const { error: pushErr } = await supabase
        .from("user_sync")
        .upsert(
            { user_id: user.id, data: merged, updated_at: now },
            { onConflict: "user_id" }
        );

    if (pushErr) {
        console.warn("[sync] push after merge failed:", pushErr.message);
        return localChanged ? "pulled" : "error";
    }

    localStorage.setItem(LAST_SYNC_KEY, now);
    if (localChanged) return "merged";
    return "pushed";
}

export function getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
}
