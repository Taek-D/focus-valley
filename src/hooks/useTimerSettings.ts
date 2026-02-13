import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerDurations = {
    focus: number;
    shortBreak: number;
    longBreak: number;
};

const DEFAULTS: TimerDurations = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
};

export const LIMITS = {
    focus: { min: 1, max: 120 },
    shortBreak: { min: 1, max: 30 },
    longBreak: { min: 1, max: 60 },
} as const;

interface TimerSettingsState extends TimerDurations {
    setDuration: (key: keyof TimerDurations, value: number) => void;
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
            resetDefaults: () => set(DEFAULTS),
        }),
        { name: "focus-valley-timer-settings" }
    )
);
