import { useEffect } from "react";
import type { TimerMode } from "./useTimer";

type KeyboardShortcutOptions = {
    isRunning: boolean;
    isCompleted: boolean;
    onToggle: () => void;
    onReset: () => void;
    onSkip: () => void;
    onSwitchMode: (mode: TimerMode) => void;
    onToggleMixer: () => void;
};

export function useKeyboardShortcuts({
    isRunning,
    isCompleted,
    onToggle,
    onReset,
    onSkip,
    onSwitchMode,
    onToggleMixer,
}: KeyboardShortcutOptions) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;

            switch (e.key) {
                case " ":
                    e.preventDefault();
                    onToggle();
                    break;
                case "r":
                case "R":
                    if (!isRunning) onReset();
                    break;
                case "s":
                case "S":
                    if (isCompleted) onSkip();
                    break;
                case "1":
                    if (!isRunning) onSwitchMode("FOCUS");
                    break;
                case "2":
                    if (!isRunning) onSwitchMode("SHORT_BREAK");
                    break;
                case "3":
                    if (!isRunning) onSwitchMode("LONG_BREAK");
                    break;
                case "m":
                case "M":
                    onToggleMixer();
                    break;
            }
        };

        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isRunning, isCompleted, onToggle, onReset, onSkip, onSwitchMode, onToggleMixer]);
}
