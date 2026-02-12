import React from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "../lib/utils";
import type { TimerMode } from "../hooks/useTimer";

type TimerDisplayProps = {
    timeLeft: number;
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

const MODE_CONFIG: Record<TimerMode, { label: string; color: string }> = {
    FOCUS: { label: "FOCUS", color: "text-primary" },
    SHORT_BREAK: { label: "SHORT", color: "text-accent" },
    LONG_BREAK: { label: "LONG", color: "text-accent" },
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    timeLeft, isRunning, isCompleted, mode, focusCount,
    onStart, onPause, onReset, onSwitchMode, onSkip,
}) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const pad = (d: number) => d.toString().padStart(2, "0");

    return (
        <div className="flex flex-col items-center justify-center gap-5">
            {/* Mode Tabs */}
            <div className="flex border-2 border-border overflow-hidden">
                {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => !isRunning && onSwitchMode(m)}
                        disabled={isRunning}
                        aria-pressed={mode === m}
                        aria-label={`Switch to ${MODE_CONFIG[m].label} mode`}
                        className={cn(
                            "px-5 py-2.5 font-pixel text-[10px] tracking-wider transition-all relative",
                            mode === m
                                ? "bg-primary text-primary-foreground shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.2)]"
                                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40",
                            m !== "FOCUS" && "border-l-2 border-border"
                        )}
                    >
                        {MODE_CONFIG[m].label}
                    </button>
                ))}
            </div>

            {/* Focus Counter - pixel tomatoes */}
            <div className="flex gap-2 items-center">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-2.5 h-2.5 border-2 transition-all duration-300",
                            i < (focusCount % 4)
                                ? "bg-primary border-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                                : "bg-transparent border-muted-foreground/30"
                        )}
                    />
                ))}
                <span className="font-retro text-sm text-muted-foreground ml-1">
                    #{focusCount}
                </span>
            </div>

            {/* Timer Display */}
            <div
                className="relative"
                role="timer"
                aria-live="polite"
                aria-label={`${pad(minutes)} minutes ${pad(seconds)} seconds remaining`}
            >
                {/* Glow backdrop */}
                <div className={cn(
                    "absolute -inset-8 blur-3xl rounded-full transition-opacity duration-1000",
                    isRunning ? "opacity-40" : "opacity-0",
                    mode === "FOCUS" ? "bg-primary/30" : "bg-accent/30"
                )} />

                <motion.div
                    className={cn(
                        "relative font-pixel text-7xl md:text-[7rem] leading-none tracking-tight select-none transition-colors duration-500",
                        isCompleted
                            ? "text-accent animate-glow-pulse"
                            : isRunning
                            ? "text-primary animate-glow-pulse"
                            : "text-foreground/40"
                    )}
                    animate={isCompleted ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    {pad(minutes)}
                    <span className={cn(
                        "inline-block mx-1",
                        isRunning && "animate-pulse"
                    )}>:</span>
                    {pad(seconds)}
                </motion.div>
            </div>

            {/* Mode Label */}
            <div className={cn(
                "font-retro text-xl tracking-[0.3em] uppercase",
                MODE_CONFIG[mode].color,
                "opacity-60"
            )}>
                {mode.replaceAll("_", " ")} MODE
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-2">
                {isCompleted ? (
                    <motion.button
                        onClick={onSkip}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 2, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                        className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-pixel text-[10px] tracking-wider border-2 border-accent shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-shadow"
                    >
                        <SkipForward size={14} /> NEXT
                    </motion.button>
                ) : !isRunning ? (
                    <motion.button
                        onClick={onStart}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 2, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
                        aria-label="Start timer"
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-pixel text-[10px] tracking-wider border-2 border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-shadow"
                    >
                        <Play size={14} /> START
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={onPause}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 2 }}
                        aria-label="Pause timer"
                        className="flex items-center gap-2 px-8 py-3 bg-card text-foreground font-pixel text-[10px] tracking-wider border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] transition-shadow"
                    >
                        <Pause size={14} /> PAUSE
                    </motion.button>
                )}

                <motion.button
                    onClick={onReset}
                    whileHover={{ rotate: -90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Reset timer"
                    className="p-3 text-muted-foreground hover:text-destructive border-2 border-transparent hover:border-destructive/30 transition-all"
                >
                    <RotateCcw size={18} />
                </motion.button>
            </div>
        </div>
    );
};
