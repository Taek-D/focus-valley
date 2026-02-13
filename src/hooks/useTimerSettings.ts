import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerDurations = {
    focus: number;
    shortBreak: number;
    longBreak: number;
};

const DEFAULTS: TimerDurations & { dailyGoal: number; autoAdvance: boolean } = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    dailyGoal: 120,
    autoAdvance: false,
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
    setDuration: (key: keyof TimerDurations, value: number) => void;
    setDailyGoal: (value: number) => void;
    setAutoAdvance: (value: boolean) => void;
    resetDefaults: () => void;
}

export const useTimerSettings = create<TimerSettingsState>()(
    persist(
        (set) => ({
            ...DEFAULTS,
            setDuration: (key, value) => {
                const { min, max } = LIMITS[key];
                set({ [key]: Math.max(min, Math.min(max, value)) });
            },
            setDailyGoal: (value) => {
                const { min, max } = LIMITS.dailyGoal;
                set({ dailyGoal: Math.max(min, Math.min(max, value)) });
            },
            setAutoAdvance: (value) => set({ autoAdvance: value }),
            resetDefaults: () => set(DEFAULTS),
        }),
        { name: "focus-valley-timer-settings" }
    )
);
