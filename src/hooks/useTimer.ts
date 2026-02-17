import { useState, useEffect, useRef, useCallback } from "react";
import TimerWorker from "../workers/timer.worker?worker";
import { useTimerSettings } from "./useTimerSettings";

export type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

function getDuration(mode: TimerMode, focus: number, shortBreak: number, longBreak: number) {
    if (mode === "FOCUS") return focus * 60;
    if (mode === "SHORT_BREAK") return shortBreak * 60;
    return longBreak * 60;
}

type SettingsSnapshot = { focus: number; shortBreak: number; longBreak: number; mode: TimerMode };

const STORAGE_KEY = "focus-valley-timer-state";

type PersistedTimerState = {
    mode: TimerMode;
    isRunning: boolean;
    focusCount: number;
    startedAt: number;       // Unix ms when the timer was last started/resumed
    pausedTimeLeft: number;  // seconds remaining when saved
};

function saveTimerState(state: PersistedTimerState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* quota exceeded — ignore */ }
}

function loadTimerState(): PersistedTimerState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as PersistedTimerState;
    } catch {
        return null;
    }
}

function clearTimerState() {
    localStorage.removeItem(STORAGE_KEY);
}

function resolveInitialState(
    saved: PersistedTimerState | null,
    focusMinutes: number,
): { mode: TimerMode; timeLeft: number; isRunning: boolean; isCompleted: boolean; focusCount: number; shouldStartWorker: boolean } {
    if (!saved) {
        return { mode: "FOCUS", timeLeft: focusMinutes * 60, isRunning: false, isCompleted: false, focusCount: 0, shouldStartWorker: false };
    }

    if (saved.isRunning) {
        const elapsed = (Date.now() - saved.startedAt) / 1000;
        const remaining = saved.pausedTimeLeft - elapsed;
        if (remaining > 0) {
            return { mode: saved.mode, timeLeft: Math.ceil(remaining), isRunning: true, isCompleted: false, focusCount: saved.focusCount, shouldStartWorker: true };
        }
        // Timer expired while away
        return { mode: saved.mode, timeLeft: 0, isRunning: false, isCompleted: true, focusCount: saved.focusCount, shouldStartWorker: false };
    }

    // Was paused
    return { mode: saved.mode, timeLeft: saved.pausedTimeLeft, isRunning: false, isCompleted: false, focusCount: saved.focusCount, shouldStartWorker: false };
}

export function useTimer() {
    const { focus, shortBreak, longBreak } = useTimerSettings();

    const savedRef = useRef(loadTimerState());
    const initialRef = useRef(resolveInitialState(savedRef.current, focus));
    const init = initialRef.current;

    const [mode, setMode] = useState<TimerMode>(init.mode);
    const [timeLeft, setTimeLeft] = useState(init.timeLeft);
    const [isRunning, setIsRunning] = useState(init.isRunning);
    const [isCompleted, setIsCompleted] = useState(init.isCompleted);
    const [focusCount, setFocusCount] = useState(init.focusCount);

    const workerRef = useRef<Worker | null>(null);
    const prevSettingsRef = useRef<SettingsSnapshot>({ focus, shortBreak, longBreak, mode });

    // Sync timeLeft when settings change while idle.
    useEffect(() => {
        const prev = prevSettingsRef.current;
        const changed =
            prev.focus !== focus
            || prev.shortBreak !== shortBreak
            || prev.longBreak !== longBreak
            || prev.mode !== mode;

        if (!isRunning && !isCompleted && changed) {
            setTimeLeft(getDuration(mode, focus, shortBreak, longBreak));
        }

        prevSettingsRef.current = { focus, shortBreak, longBreak, mode };
    }, [focus, shortBreak, longBreak, mode, isRunning, isCompleted]);

    // Persist timer state on every meaningful change
    useEffect(() => {
        if (isRunning) {
            saveTimerState({ mode, isRunning: true, focusCount, startedAt: Date.now(), pausedTimeLeft: timeLeft });
        } else if (isCompleted || timeLeft !== getDuration(mode, focus, shortBreak, longBreak)) {
            // Save paused/completed state only if it differs from default idle
            saveTimerState({ mode, isRunning: false, focusCount, startedAt: 0, pausedTimeLeft: timeLeft });
        } else {
            // Idle at full duration — no need to persist
            clearTimerState();
        }
    }, [mode, isRunning, isCompleted, timeLeft, focusCount, focus, shortBreak, longBreak]);

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

        // Resume worker if we restored a running timer
        if (init.shouldStartWorker) {
            workerRef.current.postMessage({ command: "START" });
        }

        return () => {
            workerRef.current?.terminate();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        clearTimerState();
    }, [mode, focus, shortBreak, longBreak]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setIsCompleted(false);
        workerRef.current?.postMessage({ command: "STOP" });
        setTimeLeft(getDuration(newMode, focus, shortBreak, longBreak));
        clearTimerState();
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
