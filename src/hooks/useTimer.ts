import { useState, useEffect, useRef, useCallback } from "react";
import TimerWorker from "../workers/timer.worker?worker";
import { useTimerSettings } from "./useTimerSettings";

export type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

function getDuration(mode: TimerMode, focus: number, shortBreak: number, longBreak: number) {
    if (mode === "FOCUS") return focus * 60;
    if (mode === "SHORT_BREAK") return shortBreak * 60;
    return longBreak * 60;
}

export function useTimer() {
    const { focus, shortBreak, longBreak } = useTimerSettings();
    const [mode, setMode] = useState<TimerMode>("FOCUS");
    const [timeLeft, setTimeLeft] = useState(focus * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [focusCount, setFocusCount] = useState(0);

    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = new TimerWorker();

        workerRef.current.onmessage = (e) => {
            if (e.data.type === "TICK") {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        workerRef.current?.postMessage({ command: "STOP" });
                        setIsCompleted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const start = useCallback(() => {
        if (timeLeft === 0) return;
        setIsRunning(true);
        setIsCompleted(false);
        workerRef.current?.postMessage({ command: "START" });
    }, [timeLeft]);

    const pause = useCallback(() => {
        setIsRunning(false);
        workerRef.current?.postMessage({ command: "PAUSE" });
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setIsCompleted(false);
        workerRef.current?.postMessage({ command: "STOP" });
        setTimeLeft(getDuration(mode, focus, shortBreak, longBreak));
    }, [mode, focus, shortBreak, longBreak]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setIsCompleted(false);
        workerRef.current?.postMessage({ command: "STOP" });
        setTimeLeft(getDuration(newMode, focus, shortBreak, longBreak));
    }, [focus, shortBreak, longBreak]);

    const advanceToNextMode = useCallback(() => {
        if (mode === "FOCUS") {
            const newCount = focusCount + 1;
            setFocusCount(newCount);
            const nextMode: TimerMode = newCount % 4 === 0 ? "LONG_BREAK" : "SHORT_BREAK";
            switchMode(nextMode);
        } else {
            switchMode("FOCUS");
        }
        setIsCompleted(false);
    }, [mode, focusCount, switchMode]);

    const totalDuration = getDuration(mode, focus, shortBreak, longBreak);

    return {
        mode,
        timeLeft,
        totalDuration,
        isRunning,
        isCompleted,
        focusCount,
        focusDuration: focus,
        start,
        pause,
        reset,
        switchMode,
        advanceToNextMode,
    };
}
