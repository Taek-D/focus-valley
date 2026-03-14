import { useEffect } from "react";
import type { TimerMode } from "./useTimer";
import { useTranslation } from "@/lib/i18n";

type DocumentTitleOptions = {
    timeLeft: number;
    totalDuration: number;
    isRunning: boolean;
    isCompleted: boolean;
    mode: TimerMode;
};

export function useDocumentTitle({ timeLeft, totalDuration, isRunning, isCompleted, mode }: DocumentTitleOptions) {
    const { t } = useTranslation();

    useEffect(() => {
        const pad = (value: number) => value.toString().padStart(2, "0");
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeStr = `${pad(minutes)}:${pad(seconds)}`;
        const modeLabel = mode === "FOCUS"
            ? t("timer.focus")
            : mode === "SHORT_BREAK"
              ? t("timer.shortBreak")
              : t("timer.longBreak");
        const appName = t("app.name");

        if (isCompleted) {
            document.title = `\u2713 ${t("document.done")} \u2014 ${modeLabel} | ${appName}`;
        } else if (isRunning) {
            document.title = `${timeStr} \u2014 ${modeLabel} | ${appName}`;
        } else if (timeLeft < totalDuration) {
            document.title = `\u23F8 ${t("document.pausedPrefix")} ${timeStr} \u2014 ${modeLabel} | ${appName}`;
        } else {
            document.title = appName;
        }
    }, [timeLeft, totalDuration, isRunning, isCompleted, mode, t]);
}
