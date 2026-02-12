import React from "react";
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

const MODE_LABELS: Record<TimerMode, string> = {
    FOCUS: "FOCUS",
    SHORT_BREAK: "SHORT",
    LONG_BREAK: "LONG",
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    timeLeft, isRunning, isCompleted, mode, focusCount,
    onStart, onPause, onReset, onSwitchMode, onSkip,
}) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatTime = (digit: number) => digit.toString().padStart(2, "0");

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            {/* Mode Tabs */}
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-none">
                {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => !isRunning && onSwitchMode(m)}
                        disabled={isRunning}
                        aria-pressed={mode === m}
                        aria-label={`Switch to ${MODE_LABELS[m]} mode`}
                        className={cn(
                            "px-4 py-2 font-pixel text-xs transition-all",
                            mode === m
                                ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                : "text-muted-foreground hover:text-foreground disabled:opacity-50"
                        )}
                    >
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>

            {/* Focus Counter */}
            <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            i < (focusCount % 4) ? "bg-primary" : "bg-border"
                        )}
                    />
                ))}
            </div>

            {/* Timer Display */}
            <div className="relative group" role="timer" aria-live="polite" aria-label={`${formatTime(minutes)} minutes ${formatTime(seconds)} seconds remaining`}>
                <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />
                <div className={cn(
                    "relative font-pixel text-6xl md:text-8xl tracking-tight transition-colors duration-300 select-none",
                    isCompleted ? "text-green-500 animate-pulse" :
                    isRunning ? "text-primary animate-pulse-slow" : "text-muted-foreground"
                )}>
                    {formatTime(minutes)}:{formatTime(seconds)}
                </div>
            </div>

            {/* Mode Label */}
            <div className="text-sm font-mono tracking-widest text-muted-foreground uppercase">
                {mode.replaceAll("_", " ")} MODE
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                {isCompleted ? (
                    <button
                        onClick={onSkip}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all font-pixel text-sm"
                    >
                        <SkipForward size={16} /> NEXT
                    </button>
                ) : !isRunning ? (
                    <button
                        onClick={onStart}
                        aria-label="Start timer"
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all font-pixel text-sm"
                    >
                        <Play size={16} /> START
                    </button>
                ) : (
                    <button
                        onClick={onPause}
                        aria-label="Pause timer"
                        className="flex items-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all font-pixel text-sm"
                    >
                        <Pause size={16} /> PAUSE
                    </button>
                )}

                <button
                    onClick={onReset}
                    aria-label="Reset timer"
                    className="p-3 text-muted-foreground hover:text-destructive transition-colors"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
};
