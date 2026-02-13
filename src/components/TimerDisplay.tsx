import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "../lib/utils";
import { ProgressRing } from "./ProgressRing";
import type { TimerMode } from "../hooks/useTimer";

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

const MODE_CONFIG: Record<TimerMode, { label: string; short: string }> = {
    FOCUS: { label: "Focus", short: "Focus" },
    SHORT_BREAK: { label: "Short Break", short: "Short" },
    LONG_BREAK: { label: "Long Break", short: "Long" },
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    timeLeft, totalDuration, isRunning, isCompleted, mode, focusCount,
    onStart, onPause, onReset, onSwitchMode, onSkip,
}) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const pad = (d: number) => d.toString().padStart(2, "0");
    const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Mode Tabs — pill segment control with equal-width tabs */}
            <div className="inline-flex items-center rounded-full border border-foreground/8 p-1 mb-10">
                {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => !isRunning && onSwitchMode(m)}
                        disabled={isRunning}
                        aria-pressed={mode === m}
                        aria-label={`Switch to ${MODE_CONFIG[m].label} mode`}
                        className={cn(
                            "relative px-5 py-2 font-body text-[10px] tracking-[0.08em] uppercase rounded-full transition-all",
                            mode === m
                                ? "text-foreground font-medium"
                                : "text-muted-foreground/40 hover:text-muted-foreground/60 disabled:opacity-30"
                        )}
                    >
                        {mode === m && (
                            <motion.div
                                layoutId="tab-pill"
                                className="absolute inset-0 rounded-full bg-foreground/6"
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                        )}
                        <span className="relative z-10">{MODE_CONFIG[m].label}</span>
                    </button>
                ))}
            </div>

            {/* Timer Display with Progress Ring */}
            <div
                className="relative flex items-center justify-center mb-12"
                role="timer"
                aria-live="polite"
                aria-label={`${pad(minutes)} minutes ${pad(seconds)} seconds remaining`}
            >
                <ProgressRing progress={progress} />

                <div className="relative flex flex-col items-center py-8 px-6">
                    {/* Focus Counter — subtle dots above timer */}
                    <div className="flex gap-2 items-center mb-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    i < (focusCount % 4)
                                        ? "bg-foreground/25"
                                        : "bg-foreground/8"
                                )}
                            />
                        ))}
                    </div>

                    <div
                        className={cn(
                            "font-display text-5xl md:text-6xl leading-none tracking-tight select-none transition-colors duration-700 tabular-nums",
                            isCompleted
                                ? "text-foreground"
                                : isRunning
                                ? "text-foreground/85"
                                : "text-foreground/25"
                        )}
                        style={{ fontWeight: 300 }}
                    >
                        {pad(minutes)}
                        <span className={cn(
                            "inline-block mx-1 text-[0.45em] opacity-20",
                            isRunning && "animate-pulse-slow"
                        )}>:</span>
                        {pad(seconds)}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                {isCompleted ? (
                    <button
                        onClick={onSkip}
                        className="flex items-center justify-center gap-2.5 w-48 py-3.5 bg-foreground text-background font-body text-[11px] font-medium tracking-[0.08em] uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        <SkipForward size={13} /> Next
                    </button>
                ) : !isRunning ? (
                    <button
                        onClick={onStart}
                        aria-label="Start timer"
                        className="flex items-center justify-center gap-2.5 w-48 py-3.5 bg-foreground text-background font-body text-[11px] font-medium tracking-[0.08em] uppercase rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-cozy"
                    >
                        <Play size={13} fill="currentColor" /> Start
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onPause}
                            aria-label="Pause timer"
                            className="flex items-center justify-center gap-2.5 w-40 py-3.5 border border-foreground/15 text-foreground font-body text-[11px] font-medium tracking-[0.08em] uppercase rounded-full hover:border-foreground/30 active:scale-[0.98] transition-all"
                        >
                            <Pause size={13} /> Pause
                        </button>
                        <motion.button
                            onClick={onReset}
                            whileHover={{ rotate: -90 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Reset timer"
                            className="p-3 rounded-full border border-foreground/10 text-muted-foreground/40 hover:text-destructive hover:border-destructive/30 transition-all"
                        >
                            <RotateCcw size={13} />
                        </motion.button>
                    </>
                )}
            </div>
        </div>
    );
};
