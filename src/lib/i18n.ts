import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeStorage, isRecord } from "@/lib/persist";
import type { CoreShellTranslationKey } from "@/lib/i18n-packs/core-shell";
import type { FeaturePackTranslationKey } from "@/lib/i18n-packs/feature-pack";

export type Locale = "en" | "ko" | "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
    en: "English",
    ko: "한국어",
    ja: "日本語",
};

export type TranslationEntry = Record<Locale, string>;
export type TranslationPack = Record<string, TranslationEntry>;
type KnownTranslationKey = CoreShellTranslationKey | FeaturePackTranslationKey;
export type TranslationKey = KnownTranslationKey | (string & {});

const registry: Record<string, TranslationEntry> = {};
const loadedPacks = new Set<string>();

export function registerTranslations(packName: string, pack: TranslationPack) {
    if (loadedPacks.has(packName)) return;
    Object.assign(registry, pack);
    loadedPacks.add(packName);
}

type I18nState = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
};

type PersistedI18nState = {
    locale: string;
};

export const useI18n = create<I18nState>()(
    persist(
        (set) => ({
            locale: (() => {
                if (typeof navigator !== "undefined" && navigator.language?.startsWith("ko")) {
                    return "ko" as const;
                }
                if (typeof navigator !== "undefined" && navigator.language?.startsWith("ja")) {
                    return "ja" as const;
                }
                return "en" as const;
            })(),
            setLocale: (locale) => set({ locale }),
        }),
        {
            name: "focus-valley-locale",
            version: 1,
            storage: createSafeStorage<PersistedI18nState>(),
            migrate: (persistedState) => {
                const state = isRecord(persistedState) ? persistedState : {};
                return {
                    locale: state.locale === "ko" || state.locale === "ja" || state.locale === "en"
                        ? state.locale
                        : "en",
                };
            },
        },
    ),
);

export function useTranslation() {
    const locale = useI18n((state) => state.locale);

    const t = useCallback((key: TranslationKey): string => {
        const entry = registry[key];
        if (!entry) return key;
        return entry[locale] ?? entry.en;
    }, [locale]);

    return { t, locale };
}
