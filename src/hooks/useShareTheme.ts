import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShareCardTheme } from "@/lib/share-card";
import { createSafeStorage, isRecord } from "@/lib/persist";

export const PRO_THEMES: ReadonlySet<ShareCardTheme> = new Set(["sunset", "forest"]);

type ShareThemeState = {
    theme: ShareCardTheme;
    setTheme: (theme: ShareCardTheme, isPro: boolean) => void;
};

type PersistedShareThemeState = Pick<ShareThemeState, "theme">;

export const useShareTheme = create<ShareThemeState>()(
    persist(
        (set) => ({
            theme: "aurora",
            setTheme: (theme, isPro) => {
                if (PRO_THEMES.has(theme) && !isPro) return;
                set({ theme });
            },
        }),
        {
            name: "focus-valley-share-theme",
            version: 1,
            storage: createSafeStorage<PersistedShareThemeState>(),
            migrate: (persistedState) => {
                const state = isRecord(persistedState) ? persistedState : {};
                return { theme: typeof state.theme === "string" ? state.theme as ShareCardTheme : "aurora" };
            },
        }
    )
);
