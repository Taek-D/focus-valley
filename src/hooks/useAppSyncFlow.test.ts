import { describe, expect, it } from "vitest";
import { getSyncIndicatorLabelKey, getSyncIndicatorState } from "@/hooks/useAppSyncFlow";
import type { SyncResult } from "@/lib/sync";

describe("useAppSyncFlow helpers", () => {
    it("prefers the syncing state over stale feedback", () => {
        const feedback: SyncResult = {
            outcome: "merged",
            requiresReload: false,
            syncedAt: "2026-03-14T00:00:00.000Z",
        };

        expect(getSyncIndicatorState(feedback, true)).toBe("syncing");
        expect(getSyncIndicatorLabelKey(feedback, true)).toBe("sync.syncing");
    });

    it("maps reload-required feedback to warning and reload text", () => {
        const feedback: SyncResult = {
            outcome: "pulled",
            requiresReload: true,
            syncedAt: "2026-03-14T00:00:00.000Z",
        };

        expect(getSyncIndicatorState(feedback, false)).toBe("warning");
        expect(getSyncIndicatorLabelKey(feedback, false)).toBe("sync.reloadRequired");
    });
});
