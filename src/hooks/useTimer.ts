import { useState, useEffect, useRef, useCallback } from "react";
import TimerWorker from "../workers/timer.worker?worker";

export type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

const MODES = {
    FOCUS: 25 * 60,
    SHORT_BREAK: 5 * 60,
    LONG_BREAK: 15 * 60,
};

export function useTimer() {
    const [mode, setMode] = useState<TimerMode>("FOCUS");
    const [timeLeft, setTimeLeft] = useState(MODES.FOCUS);
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
        setTimeLeft(MODES[mode]);
    }, [mode]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setIsCompleted(false);
        workerRef.current?.postMessage({ command: "STOP" });
        setTimeLeft(MODES[newMode]);
    }, []);

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

    return {
        mode,
        timeLeft,
        isRunning,
        isCompleted,
        focusCount,
        start,
        pause,
        reset,
        switchMode,
        advanceToNextMode,
    };
}
