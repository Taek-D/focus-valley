import { useEffect } from "react";
import type { TimerMode } from "./useTimer";

const MODE_LABELS: Record<TimerMode, string> = {
    FOCUS: "Focus",
    SHORT_BREAK: "Short Break",
    LONG_BREAK: "Long Break",
};

type DocumentTitleOptions = {
    timeLeft: number;
    totalDuration: number;
    isRunning: boolean;
    isCompleted: boolean;
    mode: TimerMode;
};

export function useDocumentTitle({ timeLeft, totalDuration, isRunning, isCompleted, mode }: DocumentTitleOptions) {
    useEffect(() => {
        const pad = (n: number) => n.toString().padStart(2, "0");
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeStr = `${pad(minutes)}:${pad(seconds)}`;

        if (isCompleted) {
            document.title = `\u2713 Done \u2014 ${MODE_LABELS[mode]} | Focus Valley`;
        } else if (isRunning) {
            document.title = `${timeStr} \u2014 ${MODE_LABELS[mode]} | Focus Valley`;
        } else if (timeLeft < totalDuration) {
            // Paused mid-session
            document.title = `\u23F8 ${timeStr} \u2014 ${MODE_LABELS[mode]} | Focus Valley`;
        } else {
            document.title = "Focus Valley";
        }
    }, [timeLeft, totalDuration, isRunning, isCompleted, mode]);
}
