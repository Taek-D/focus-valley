import { create } from "zustand";
import type { SyncResult } from "@/lib/sync";

type SyncFeedbackState = {
    syncing: boolean;
    lastResult: SyncResult | null;
    begin: () => void;
    finish: (result: SyncResult) => void;
    clear: () => void;
};

export const useSyncFeedback = create<SyncFeedbackState>((set) => ({
    syncing: false,
    lastResult: null,
    begin: () => set({ syncing: true }),
    finish: (result) => set({ syncing: false, lastResult: result }),
    clear: () => set({ lastResult: null }),
}));
