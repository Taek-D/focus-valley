import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSafeStorage, isRecord, parseIsoTimestamp } from "@/lib/persist";

export type TimerDurations = {
    focus: number;
    shortBreak: number;
    longBreak: number;
};

export type TimerPresetId = "classic" | "deep" | "marathon" | "custom";

type TimerPreset = TimerDurations & { id: TimerPresetId; label: string };

export const TIMER_PRESETS: ReadonlyArray<TimerPreset> = [
    { id: "classic", label: "25/5", focus: 25, shortBreak: 5, longBreak: 15 },
    { id: "deep", label: "50/10", focus: 50, shortBreak: 10, longBreak: 20 },
    { id: "marathon", label: "90/20", focus: 90, shortBreak: 20, longBreak: 30 },
] as const;

const DEFAULT_CUSTOM_PRESET: TimerDurations = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
};

const DEFAULTS: TimerDurations & {
    dailyGoal: number;
    autoAdvance: boolean;
    presetId: TimerPresetId;
    customPreset: TimerDurations;
    updatedAt: string;
} = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    dailyGoal: 120,
    autoAdvance: false,
    presetId: "classic",
    customPreset: DEFAULT_CUSTOM_PRESET,
    updatedAt: new Date().toISOString(),
};

export const LIMITS = {
    focus: { min: 1, max: 120 },
    shortBreak: { min: 1, max: 30 },
    longBreak: { min: 1, max: 60 },
    dailyGoal: { min: 10, max: 480 },
} as const;

interface TimerSettingsState extends TimerDurations {
    dailyGoal: number;
    autoAdvance: boolean;
    presetId: TimerPresetId;
    customPreset: TimerDurations;
    updatedAt: string;
    setDuration: (key: keyof TimerDurations, value: number) => void;
    setDailyGoal: (value: number) => void;
    setAutoAdvance: (value: boolean) => void;
    applyPreset: (presetId: TimerPresetId) => void;
    saveCustomPreset: () => void;
    resetDefaults: () => void;
}

type PersistedTimerSettingsState = Pick<
    TimerSettingsState,
    "focus" | "shortBreak" | "longBreak" | "dailyGoal" | "autoAdvance" | "presetId" | "customPreset" | "updatedAt"
>;

const STORAGE_VERSION = 2;

function clampDuration(key: keyof TimerDurations, value: number) {
    const { min, max } = LIMITS[key];
    return Math.max(min, Math.min(max, value));
}

function normalizeDurations(value: unknown, fallback: TimerDurations): TimerDurations {
    const source = isRecord(value) ? value : {};

    return {
        focus: clampDuration("focus", typeof source.focus === "number" ? source.focus : fallback.focus),
        shortBreak: clampDuration("shortBreak", typeof source.shortBreak === "number" ? source.shortBreak : fallback.shortBreak),
        longBreak: clampDuration("longBreak", typeof source.longBreak === "number" ? source.longBreak : fallback.longBreak),
    };
}

export const useTimerSettings = create<TimerSettingsState>()(
    persist(
        (set) => ({
            ...DEFAULTS,
            setDuration: (key, value) => {
                const nextValue = clampDuration(key, value);
                set(() => ({
                    [key]: nextValue,
                    presetId: "custom",
                    updatedAt: new Date().toISOString(),
                }));
            },
            setDailyGoal: (value) => {
                const { min, max } = LIMITS.dailyGoal;
                set({
                    dailyGoal: Math.max(min, Math.min(max, value)),
                    updatedAt: new Date().toISOString(),
                });
            },
            setAutoAdvance: (value) => set({ autoAdvance: value, updatedAt: new Date().toISOString() }),
            applyPreset: (presetId) => set((state) => {
                const preset = presetId === "custom"
                    ? { id: "custom" as const, label: "Custom", ...state.customPreset }
                    : TIMER_PRESETS.find((entry) => entry.id === presetId) ?? TIMER_PRESETS[0];

                return {
                    focus: preset.focus,
                    shortBreak: preset.shortBreak,
                    longBreak: preset.longBreak,
                    presetId,
                    updatedAt: new Date().toISOString(),
                };
            }),
            saveCustomPreset: () => set((state) => ({
                customPreset: {
                    focus: state.focus,
                    shortBreak: state.shortBreak,
                    longBreak: state.longBreak,
                },
                presetId: "custom",
                updatedAt: new Date().toISOString(),
            })),
            resetDefaults: () => set({
                ...DEFAULTS,
                customPreset: { ...DEFAULT_CUSTOM_PRESET },
                updatedAt: new Date().toISOString(),
            }),
        }),
        {
            name: "focus-valley-timer-settings",
            version: STORAGE_VERSION,
            storage: createSafeStorage<PersistedTimerSettingsState>(),
            migrate: (persistedState) => {
                const state = isRecord(persistedState) ? persistedState : {};
                const durations = normalizeDurations(state, DEFAULTS);
                const customPreset = normalizeDurations(state.customPreset, durations);

                return {
                    ...DEFAULTS,
                    ...durations,
                    dailyGoal: typeof state.dailyGoal === "number"
                        ? Math.max(LIMITS.dailyGoal.min, Math.min(LIMITS.dailyGoal.max, state.dailyGoal))
                        : DEFAULTS.dailyGoal,
                    autoAdvance: typeof state.autoAdvance === "boolean" ? state.autoAdvance : DEFAULTS.autoAdvance,
                    presetId: typeof state.presetId === "string" && ["classic", "deep", "marathon", "custom"].includes(state.presetId)
                        ? state.presetId as TimerPresetId
                        : DEFAULTS.presetId,
                    customPreset,
                    updatedAt: parseIsoTimestamp(state.updatedAt, DEFAULTS.updatedAt),
                };
            },
        }
    )
);
