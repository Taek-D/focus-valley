import { memo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "../lib/utils";
import { ProgressRing } from "./ProgressRing";
import { useTranslation, type TranslationKey } from "../lib/i18n";
import type { TimerMode } from "../hooks/useTimer";

const MODE_KEYS: Record<TimerMode, { label: TranslationKey; short: TranslationKey }> = {
    FOCUS: { label: "timer.focus", short: "timer.focus" },
    SHORT_BREAK: { label: "timer.shortBreak", short: "timer.shortBreakShort" },
    LONG_BREAK: { label: "timer.longBreak", short: "timer.longBreakShort" },
};

type TimerDisplayProps = {
    timeLeft: number;
    totalDuration: number;
    isRunning: boolean;
    isCompleted: boolean;
    mode: TimerMode;
    focusCount: number;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onSwitchMode: (mode: TimerMode) => void;
    onSkip: () => void;
};

export const TimerDisplay = memo(function TimerDisplay({
    timeLeft, totalDuration, isRunning, isCompleted, mode, focusCount,
    onStart, onPause, onReset, onSwitchMode, onSkip,
}: TimerDisplayProps) {
    const { t } = useTranslation();
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const pad = (d: number) => d.toString().padStart(2, "0");
    const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Mode Tabs */}
            <div className="inline-flex items-center rounded-full bg-foreground/[0.03] p-1 mb-8">
                {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => !isRunning && onSwitchMode(m)}
                        disabled={isRunning}
                        aria-pressed={mode === m}
                        aria-label={`Switch to ${t(MODE_KEYS[m].label)} mode`}
                        className={cn(
                            "relative px-3 sm:px-5 py-2 font-body text-[10px] tracking-[0.08em] uppercase rounded-full transition-all",
                            mode === m
                                ? "text-foreground font-medium"
                                : "text-muted-foreground/40 hover:text-muted-foreground/60 disabled:opacity-30"
                        )}
                    >
                        {mode === m && (
                            <motion.div
                                layoutId="tab-pill"
                                className="absolute inset-0 rounded-full bg-foreground/8 shadow-[0_0_12px_hsl(var(--mode-accent)/0.08)]"
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                        )}
                        <span className="relative z-10 hidden sm:inline">{t(MODE_KEYS[m].label)}</span>
                        <span className="relative z-10 sm:hidden">{t(MODE_KEYS[m].short)}</span>
                    </button>
                ))}
            </div>

            {/* Timer Display with Progress Ring */}
            <div
                className="relative flex items-center justify-center mb-10"
                role="timer"
                aria-live="polite"
                aria-label={`${pad(minutes)} minutes ${pad(seconds)} seconds remaining`}
            >
                <ProgressRing progress={progress} />

                <div className="relative flex flex-col items-center py-8 px-6">
                    {/* Focus Counter dots */}
                    <div className="flex gap-2 items-center mb-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                    i < (focusCount % 4)
                                        ? "bg-foreground/25 scale-100"
                                        : "bg-foreground/6 scale-90"
                                )}
                            />
                        ))}
                    </div>

                    <div
                        className={cn(
                            "font-display text-[3.5rem] md:text-[4rem] leading-none tracking-tight select-none transition-colors duration-700 tabular-nums",
                            isCompleted
                                ? "text-foreground"
                                : isRunning
                                ? "text-foreground/80"
                                : "text-foreground/20"
                        )}
                        style={{ fontWeight: 200 }}
                    >
                        {pad(minutes)}
                        <span
                            className={cn(
                                "inline-block mx-0.5 text-[0.4em] transition-opacity duration-1000",
                                isRunning ? "opacity-40" : "opacity-15"
                            )}
                        >
                            :
                        </span>
                        {pad(seconds)}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                {isCompleted ? (
                    <motion.button
                        onClick={onSkip}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-center gap-2.5 w-44 py-3.5 bg-foreground text-background font-body text-[11px] font-medium tracking-[0.08em] uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        <SkipForward size={13} /> {t("timer.next")}
                    </motion.button>
                ) : !isRunning ? (
                    <button
                        onClick={onStart}
                        aria-label={t("timer.start")}
                        className="flex items-center justify-center gap-2.5 w-44 py-3.5 bg-foreground text-background font-body text-[11px] font-medium tracking-[0.08em] uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_2px_16px_hsl(var(--foreground)/0.08)]"
                    >
                        <Play size={13} fill="currentColor" /> {t("timer.start")}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onPause}
                            aria-label={t("timer.pause")}
                            className="flex items-center justify-center gap-2.5 w-36 py-3.5 border border-foreground/12 text-foreground font-body text-[11px] font-medium tracking-[0.08em] uppercase rounded-full hover:border-foreground/25 active:scale-[0.98] transition-all"
                        >
                            <Pause size={13} /> {t("timer.pause")}
                        </button>
                        <motion.button
                            onClick={onReset}
                            whileHover={{ rotate: -90 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Reset timer"
                            className="p-3 rounded-full border border-foreground/8 text-muted-foreground/30 hover:text-destructive hover:border-destructive/30 transition-all"
                        >
                            <RotateCcw size={13} />
                        </motion.button>
                    </>
                )}
            </div>
        </div>
    );
});
