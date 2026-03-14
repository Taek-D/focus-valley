import { useCallback, useEffect, useMemo, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useSyncFeedback } from "@/hooks/useSyncFeedback";
import { trackReloadPromptShown, trackSyncResult } from "@/lib/analytics";
import { syncWithCloud, type SyncResult } from "@/lib/sync";
import type { TranslationKey } from "@/lib/i18n";

type Translate = (key: TranslationKey) => string;

type SyncIndicatorState = "idle" | "syncing" | "ok" | "warning" | "error";

export function useAppSyncFlow(t: Translate) {
    const { user, initialize: initAuth } = useAuth();
    const refreshSubscription = useSubscription((state) => state.refresh);
    const beginSyncFeedback = useSyncFeedback((state) => state.begin);
    const finishSyncFeedback = useSyncFeedback((state) => state.finish);
    const clearSyncFeedback = useSyncFeedback((state) => state.clear);
    const syncFeedback = useSyncFeedback((state) => state.lastResult);
    const syncInFlight = useSyncFeedback((state) => state.syncing);
    const autoSyncUserRef = useRef<string | null>(null);

    const handleSyncResult = useCallback((result: SyncResult) => {
        finishSyncFeedback(result);
        trackSyncResult(result.outcome, result.requiresReload);
        if (result.requiresReload) {
            trackReloadPromptShown();
        }
    }, [finishSyncFeedback]);

    const syncCurrentUser = useCallback((targetUser: User | null = user) => {
        if (!targetUser) return;
        beginSyncFeedback();
        void syncWithCloud(targetUser).then(handleSyncResult);
    }, [user, beginSyncFeedback, handleSyncResult]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (typeof window === "undefined" || !navigator.webdriver) return;

        const handleE2ESyncFeedback = (event: Event) => {
            const detail = (event as CustomEvent<SyncResult | null>).detail;
            if (detail) {
                finishSyncFeedback(detail);
                return;
            }
            clearSyncFeedback();
        };

        window.addEventListener("focus-valley:e2e-sync-feedback", handleE2ESyncFeedback as EventListener);
        return () => {
            window.removeEventListener("focus-valley:e2e-sync-feedback", handleE2ESyncFeedback as EventListener);
        };
    }, [finishSyncFeedback, clearSyncFeedback]);

    useEffect(() => {
        void refreshSubscription(user);
    }, [user, refreshSubscription]);

    useEffect(() => {
        if (!user) {
            autoSyncUserRef.current = null;
            return;
        }

        if (autoSyncUserRef.current === user.id) return;
        autoSyncUserRef.current = user.id;
        syncCurrentUser(user);
    }, [user, syncCurrentUser]);

    const syncIndicatorState = useMemo<SyncIndicatorState>(() => {
        if (syncInFlight) return "syncing";
        if (syncFeedback?.outcome === "error") return "error";
        if (syncFeedback?.requiresReload) return "warning";
        if (syncFeedback) return "ok";
        return "idle";
    }, [syncFeedback, syncInFlight]);

    const syncIndicatorLabel = useMemo(() => {
        if (syncInFlight) return t("sync.syncing");
        if (!syncFeedback) return undefined;
        if (syncFeedback.outcome === "error") return t("sync.failed");
        if (syncFeedback.requiresReload) return t("sync.reloadRequired");
        if (syncFeedback.outcome === "noop") return t("sync.upToDate");
        return syncFeedback.outcome === "merged"
            ? t("sync.merged")
            : syncFeedback.outcome === "pulled"
              ? t("sync.pulled")
              : t("sync.pushed");
    }, [syncFeedback, syncInFlight, t]);

    return {
        user,
        syncFeedback,
        syncIndicatorState,
        syncIndicatorLabel,
        clearSyncFeedback,
        syncCurrentUser,
    };
}

export type AppSyncFlow = ReturnType<typeof useAppSyncFlow>;
