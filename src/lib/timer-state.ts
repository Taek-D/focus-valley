export type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";

export type PersistedTimerState = {
    version: number;
    mode: TimerMode;
    isRunning: boolean;
    focusCount: number;
    startedAt: number;
    pausedTimeLeft: number;
};

export function resolveInitialState(
    saved: PersistedTimerState | null,
    focusMinutes: number,
    now = Date.now(),
) {
    if (!saved) {
        return {
            mode: "FOCUS" as const,
            timeLeft: focusMinutes * 60,
            isRunning: false,
            isCompleted: false,
            focusCount: 0,
            shouldStartWorker: false,
            needsRecoveryPrompt: false,
        };
    }

    if (saved.isRunning) {
        const elapsed = (now - saved.startedAt) / 1000;
        const remaining = saved.pausedTimeLeft - elapsed;
        if (remaining > 0) {
            return {
                mode: saved.mode,
                timeLeft: Math.ceil(remaining),
                isRunning: false,
                isCompleted: false,
                focusCount: saved.focusCount,
                shouldStartWorker: false,
                needsRecoveryPrompt: true,
            };
        }

        return {
            mode: saved.mode,
            timeLeft: 0,
            isRunning: false,
            isCompleted: true,
            focusCount: saved.focusCount,
            shouldStartWorker: false,
            needsRecoveryPrompt: false,
        };
    }

    return {
        mode: saved.mode,
        timeLeft: saved.pausedTimeLeft,
        isRunning: false,
        isCompleted: false,
        focusCount: saved.focusCount,
        shouldStartWorker: false,
        needsRecoveryPrompt: false,
    };
}

export function reconcileTimeLeft(deadline: number | null, isRunning: boolean, now = Date.now()) {
    if (!isRunning || deadline === null) return null;
    return Math.max(0, Math.ceil((deadline - now) / 1000));
}
