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
const TIMER_STATE_VERSION = 1;

type PersistedTimerState = {
    version: number;
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
        const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
        if (
            (parsed.version ?? TIMER_STATE_VERSION) !== TIMER_STATE_VERSION
            || (parsed.mode !== "FOCUS" && parsed.mode !== "SHORT_BREAK" && parsed.mode !== "LONG_BREAK")
            || typeof parsed.isRunning !== "boolean"
            || typeof parsed.focusCount !== "number"
            || typeof parsed.startedAt !== "number"
            || typeof parsed.pausedTimeLeft !== "number"
        ) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return {
            version: TIMER_STATE_VERSION,
            mode: parsed.mode,
            isRunning: parsed.isRunning,
            focusCount: parsed.focusCount,
            startedAt: parsed.startedAt,
            pausedTimeLeft: parsed.pausedTimeLeft,
        };
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

function clearTimerState() {
    localStorage.removeItem(STORAGE_KEY);
}

export function resolveInitialState(
    saved: PersistedTimerState | null,
    focusMinutes: number,
): { mode: TimerMode; timeLeft: number; isRunning: boolean; isCompleted: boolean; focusCount: number; shouldStartWorker: boolean; needsRecoveryPrompt: boolean } {
    if (!saved) {
        return { mode: "FOCUS", timeLeft: focusMinutes * 60, isRunning: false, isCompleted: false, focusCount: 0, shouldStartWorker: false, needsRecoveryPrompt: false };
    }

    if (saved.isRunning) {
        const elapsed = (Date.now() - saved.startedAt) / 1000;
        const remaining = saved.pausedTimeLeft - elapsed;
        if (remaining > 0) {
            // Don't auto-resume — show recovery prompt instead
            return { mode: saved.mode, timeLeft: Math.ceil(remaining), isRunning: false, isCompleted: false, focusCount: saved.focusCount, shouldStartWorker: false, needsRecoveryPrompt: true };
        }
        // Timer expired while away
        return { mode: saved.mode, timeLeft: 0, isRunning: false, isCompleted: true, focusCount: saved.focusCount, shouldStartWorker: false, needsRecoveryPrompt: false };
    }

    // Was paused
    return { mode: saved.mode, timeLeft: saved.pausedTimeLeft, isRunning: false, isCompleted: false, focusCount: saved.focusCount, shouldStartWorker: false, needsRecoveryPrompt: false };
}

export function reconcileTimeLeft(deadline: number | null, isRunning: boolean, now = Date.now()) {
    if (!isRunning || deadline === null) return null;
    return Math.max(0, Math.ceil((deadline - now) / 1000));
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
    const [needsRecoveryPrompt, setNeedsRecoveryPrompt] = useState(init.needsRecoveryPrompt);

    const deadlineRef = useRef<number | null>(null);
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
            saveTimerState({ version: TIMER_STATE_VERSION, mode, isRunning: true, focusCount, startedAt: Date.now(), pausedTimeLeft: timeLeft });
        } else if (isCompleted || timeLeft !== getDuration(mode, focus, shortBreak, longBreak)) {
            // Save paused/completed state only if it differs from default idle
            saveTimerState({ version: TIMER_STATE_VERSION, mode, isRunning: false, focusCount, startedAt: 0, pausedTimeLeft: timeLeft });
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

    // Keep a wall-clock deadline so we can recover from hidden-tab stalls
    useEffect(() => {
        if (!isRunning) {
            deadlineRef.current = null;
            return;
        }

        deadlineRef.current = Date.now() + timeLeft * 1000;
    }, [isRunning, timeLeft]);

    // Page Visibility API: reconcile time when tab becomes visible again
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState !== "visible" || !isRunning || deadlineRef.current === null) {
                return;
            }

            const remaining = reconcileTimeLeft(deadlineRef.current, isRunning);
            if (remaining === null) return;
            if (remaining <= 0) {
                setTimeLeft(0);
                setIsRunning(false);
                setIsCompleted(true);
                workerRef.current?.postMessage({ command: "STOP" });
                return;
            }

            setTimeLeft((prev) => (prev === remaining ? prev : remaining));
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [isRunning]);

    const confirmResume = useCallback(() => {
        setNeedsRecoveryPrompt(false);
        setIsRunning(true);
        setIsCompleted(false);
        deadlineRef.current = Date.now() + timeLeft * 1000;
        workerRef.current?.postMessage({ command: "START" });
    }, [timeLeft]);

    const discardRecovery = useCallback(() => {
        setNeedsRecoveryPrompt(false);
        setIsRunning(false);
        setIsCompleted(false);
        deadlineRef.current = null;
        workerRef.current?.postMessage({ command: "STOP" });
        setTimeLeft(getDuration(mode, focus, shortBreak, longBreak));
        clearTimerState();
    }, [mode, focus, shortBreak, longBreak]);

    const start = useCallback(() => {
        if (timeLeft === 0) return;
        setIsRunning(true);
        setIsCompleted(false);
        deadlineRef.current = Date.now() + timeLeft * 1000;
        workerRef.current?.postMessage({ command: "START" });
    }, [timeLeft]);

    const pause = useCallback(() => {
        setIsRunning(false);
        deadlineRef.current = null;
        workerRef.current?.postMessage({ command: "PAUSE" });
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setIsCompleted(false);
        deadlineRef.current = null;
        workerRef.current?.postMessage({ command: "STOP" });
        setTimeLeft(getDuration(mode, focus, shortBreak, longBreak));
        clearTimerState();
    }, [mode, focus, shortBreak, longBreak]);

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setIsCompleted(false);
        deadlineRef.current = null;
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
        needsRecoveryPrompt,
        start,
        pause,
        reset,
        switchMode,
        advanceToNextMode,
        confirmResume,
        discardRecovery,
    };
}
