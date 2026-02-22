import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShareCardTheme } from "@/lib/share-card";

export const PRO_THEMES: ReadonlySet<ShareCardTheme> = new Set(["sunset", "forest"]);

type ShareThemeState = {
    theme: ShareCardTheme;
    setTheme: (theme: ShareCardTheme, isPro: boolean) => void;
};

export const useShareTheme = create<ShareThemeState>()(
    persist(
        (set) => ({
            theme: "aurora",
            setTheme: (theme, isPro) => {
                if (PRO_THEMES.has(theme) && !isPro) return;
                set({ theme });
            },
        }),
        { name: "focus-valley-share-theme" }
    )
);
