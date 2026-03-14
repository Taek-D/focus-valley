import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useSyncFeedback } from "@/hooks/useSyncFeedback";
import { trackReloadPromptShown, trackSyncResult } from "@/lib/analytics";
import type { SyncResult } from "@/lib/sync";
import type { TranslationKey } from "@/lib/i18n";

type Translate = (key: TranslationKey) => string;

type SyncIndicatorState = "idle" | "syncing" | "ok" | "warning" | "error";

type AuthStore = (typeof import("@/hooks/useAuth"))["useAuth"];
type SubscriptionStore = (typeof import("@/hooks/useSubscription"))["useSubscription"];
type SyncModule = typeof import("@/lib/sync");

type SyncBootstrapModules = {
    authStore: AuthStore;
    subscriptionStore: SubscriptionStore;
    syncModule: SyncModule;
};

export function getSyncIndicatorState(syncFeedback: SyncResult | null, syncInFlight: boolean): SyncIndicatorState {
    if (syncInFlight) return "syncing";
    if (syncFeedback?.outcome === "error") return "error";
    if (syncFeedback?.requiresReload) return "warning";
    if (syncFeedback) return "ok";
    return "idle";
}

export function getSyncIndicatorLabelKey(syncFeedback: SyncResult | null, syncInFlight: boolean): TranslationKey | undefined {
    if (syncInFlight) return "sync.syncing";
    if (!syncFeedback) return undefined;
    if (syncFeedback.outcome === "error") return "sync.failed";
    if (syncFeedback.requiresReload) return "sync.reloadRequired";
    if (syncFeedback.outcome === "noop") return "sync.upToDate";
    return syncFeedback.outcome === "merged"
        ? "sync.merged"
        : syncFeedback.outcome === "pulled"
          ? "sync.pulled"
          : "sync.pushed";
}

export function useAppSyncFlow(t: Translate) {
    const [user, setUser] = useState<User | null>(null);
    const beginSyncFeedback = useSyncFeedback((state) => state.begin);
    const finishSyncFeedback = useSyncFeedback((state) => state.finish);
    const clearSyncFeedback = useSyncFeedback((state) => state.clear);
    const syncFeedback = useSyncFeedback((state) => state.lastResult);
    const syncInFlight = useSyncFeedback((state) => state.syncing);
    const autoSyncUserRef = useRef<string | null>(null);
    const modulesRef = useRef<SyncBootstrapModules | null>(null);
    const bootstrapPromiseRef = useRef<Promise<SyncBootstrapModules> | null>(null);
    const authUnsubscribeRef = useRef<(() => void) | null>(null);
    const userRef = useRef<User | null>(null);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const handleSyncResult = useCallback((result: SyncResult) => {
        finishSyncFeedback(result);
        trackSyncResult(result.outcome, result.requiresReload);
        if (result.requiresReload) {
            trackReloadPromptShown();
        }
    }, [finishSyncFeedback]);

    const loadModules = useCallback(async () => {
        if (modulesRef.current) return modulesRef.current;
        if (!bootstrapPromiseRef.current) {
            bootstrapPromiseRef.current = Promise.all([
                import("@/hooks/useAuth"),
                import("@/hooks/useSubscription"),
                import("@/lib/sync"),
            ]).then(([authModule, subscriptionModule, syncModule]) => {
                const modules = {
                    authStore: authModule.useAuth,
                    subscriptionStore: subscriptionModule.useSubscription,
                    syncModule,
                };
                modulesRef.current = modules;
                return modules;
            });
        }
        return bootstrapPromiseRef.current;
    }, []);

    const syncCurrentUser = useCallback(async (targetUser: User | null = userRef.current) => {
        if (!targetUser) return;
        const modules = await loadModules();
        beginSyncFeedback();
        const result = await modules.syncModule.syncWithCloud(targetUser);
        handleSyncResult(result);
    }, [loadModules, beginSyncFeedback, handleSyncResult]);

    const refreshSubscription = useCallback(async (nextUser: User | null) => {
        const modules = modulesRef.current;
        if (!modules) return;
        await modules.subscriptionStore.getState().refresh(nextUser);
    }, []);

    const autoSyncUser = useCallback((nextUser: User | null) => {
        if (!nextUser) {
            autoSyncUserRef.current = null;
            return;
        }
        if (autoSyncUserRef.current === nextUser.id) return;
        autoSyncUserRef.current = nextUser.id;
        void syncCurrentUser(nextUser);
    }, [syncCurrentUser]);

    const applyAuthState = useCallback((nextUser: User | null) => {
        setUser(nextUser);
        void refreshSubscription(nextUser);
        autoSyncUser(nextUser);
    }, [refreshSubscription, autoSyncUser]);

    const ensureBootstrapped = useCallback(async () => {
        const modules = await loadModules();
        if (!authUnsubscribeRef.current) {
            authUnsubscribeRef.current = modules.authStore.subscribe((state) => {
                applyAuthState(state.user);
            });
        }
        modules.authStore.getState().initialize();
        applyAuthState(modules.authStore.getState().user);
        return modules;
    }, [loadModules, applyAuthState]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let timeoutId: number | null = null;
        let idleId: number | null = null;

        const bootstrap = () => {
            void ensureBootstrapped();
        };

        if ("requestIdleCallback" in window) {
            idleId = window.requestIdleCallback(bootstrap, { timeout: 1200 });
        } else {
            timeoutId = globalThis.setTimeout(bootstrap, 200);
        }

        return () => {
            if (idleId !== null && "cancelIdleCallback" in window) {
                window.cancelIdleCallback(idleId);
            }
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
            authUnsubscribeRef.current?.();
            authUnsubscribeRef.current = null;
        };
    }, [ensureBootstrapped]);

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

    const syncIndicatorState = useMemo(
        () => getSyncIndicatorState(syncFeedback, syncInFlight),
        [syncFeedback, syncInFlight],
    );

    const syncIndicatorLabel = useMemo(() => {
        const key = getSyncIndicatorLabelKey(syncFeedback, syncInFlight);
        return key ? t(key) : undefined;
    }, [syncFeedback, syncInFlight, t]);

    return {
        user,
        syncFeedback,
        syncIndicatorState,
        syncIndicatorLabel,
        clearSyncFeedback,
        syncCurrentUser,
        ensureBootstrapped,
    };
}

export type AppSyncFlow = ReturnType<typeof useAppSyncFlow>;
