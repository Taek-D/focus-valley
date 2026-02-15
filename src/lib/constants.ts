import type { PlantType } from "@/hooks/useGarden";
import type { TimerMode } from "@/hooks/useTimer";

export const ANIMATION = {
    SCREEN_FLASH_MS: 600,
    AUTO_ADVANCE_DELAY_MS: 2000,
    INPUT_FOCUS_DELAY_MS: 300,
    TOAST_DURATION_MS: 3000,
} as const;

export const GESTURE = {
    DRAG_DISMISS_OFFSET: 100,
    DRAG_DISMISS_VELOCITY: 500,
} as const;

export const PLANT_LABELS: Record<PlantType, string> = {
    DEFAULT: "Fern",
    CACTUS: "Cactus",
    SUNFLOWER: "Sunflower",
    PINE: "Bonsai",
    ROSE: "Rose",
    ORCHID: "Orchid",
    LOTUS: "Lotus",
    CRYSTAL: "Crystal",
};

export const PLANT_ICONS: Record<PlantType, string> = {
    DEFAULT: "\u{1F333}",
    CACTUS: "\u{1F335}",
    SUNFLOWER: "\u{1F33B}",
    PINE: "\u{1F332}",
    ROSE: "\u{1F339}",
    ORCHID: "\u{1F33A}",
    LOTUS: "\u{1F33C}",
    CRYSTAL: "\u{1F48E}",
};

export const MODE_CONFIG: Record<TimerMode, { label: string; short: string }> = {
    FOCUS: { label: "Focus", short: "Focus" },
    SHORT_BREAK: { label: "Short Break", short: "Short" },
    LONG_BREAK: { label: "Long Break", short: "Long" },
};

export type Category = {
    id: string;
    label: string;
    emoji: string;
    color: string; // HSL value
};

export const FREE_TIER = {
    CUSTOM_CATEGORY_LIMIT: 1,
    EXPORT_DAYS: 7,
} as const;

export const DEFAULT_CATEGORIES: Category[] = [
    { id: "study", label: "Study", emoji: "\u{1F4DA}", color: "220 70% 55%" },
    { id: "code", label: "Code", emoji: "\u{1F4BB}", color: "160 70% 45%" },
    { id: "read", label: "Read", emoji: "\u{1F4D6}", color: "35 70% 55%" },
    { id: "work", label: "Work", emoji: "\u{1F4BC}", color: "270 60% 55%" },
    { id: "design", label: "Design", emoji: "\u{1F3A8}", color: "330 70% 55%" },
    { id: "exercise", label: "Exercise", emoji: "\u{1F3C3}", color: "140 65% 45%" },
];
