import type { User } from "@supabase/supabase-js";
import type { LegacySyncableData, SyncableDataV2 } from "@/lib/sync-contract";
import { supabase } from "./supabase";
import { isSameData, mergeSyncData, migrateSyncData } from "./sync-engine";
import {
    applyLocalSyncSnapshot,
    getLocalSyncSnapshot,
    getNow,
    setLastSyncTime,
} from "./sync-storage";

type CloudRow = {
    user_id: string;
    data: SyncableDataV2 | LegacySyncableData | null;
    updated_at: string;
};

export type {
    LegacySyncableData,
    SyncOutcome,
    SyncResult,
    SyncableDataV2,
} from "./sync-contract";

export {
    mergeSyncData,
    migrateSyncData,
} from "./sync-engine";
export {
    applyLocalSyncSnapshot,
    getLastSyncTime,
    getLocalSyncSnapshot,
} from "./sync-storage";

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

    setLastSyncTime(now);
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
    setLastSyncTime(row.updated_at);
    return true;
}

export async function syncWithCloud(user: User): Promise<import("./sync-contract").SyncResult> {
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
        setLastSyncTime(row.updated_at);
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

    setLastSyncTime(now);
    return {
        outcome: localChanged ? "merged" : "pushed",
        requiresReload: localChanged,
        syncedAt: now,
    };
}
