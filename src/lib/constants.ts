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
};

export const PLANT_ICONS: Record<PlantType, string> = {
    DEFAULT: "\u{1F333}",
    CACTUS: "\u{1F335}",
    SUNFLOWER: "\u{1F33B}",
    PINE: "\u{1F332}",
    ROSE: "\u{1F339}",
    ORCHID: "\u{1F33A}",
};

export const MODE_CONFIG: Record<TimerMode, { label: string; short: string }> = {
    FOCUS: { label: "Focus", short: "Focus" },
    SHORT_BREAK: { label: "Short Break", short: "Short" },
    LONG_BREAK: { label: "Long Break", short: "Long" },
};
