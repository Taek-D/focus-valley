import { describe, expect, it } from "vitest";
import { reconcileTimeLeft, resolveInitialState, type PersistedTimerState } from "@/lib/timer-state";

describe("timer-state", () => {
    it("returns a clean default state when nothing was saved", () => {
        expect(resolveInitialState(null, 25, Date.UTC(2026, 2, 12, 0, 0, 0))).toEqual({
            mode: "FOCUS",
            timeLeft: 1500,
            isRunning: false,
            isCompleted: false,
            focusCount: 0,
            shouldStartWorker: false,
            needsRecoveryPrompt: false,
        });
    });

    it("restores an interrupted running session as a recovery prompt", () => {
        const startedAt = Date.UTC(2026, 2, 12, 9, 0, 0);
        const saved: PersistedTimerState = {
            version: 1,
            mode: "FOCUS",
            isRunning: true,
            focusCount: 2,
            startedAt,
            pausedTimeLeft: 600,
        };

        const restored = resolveInitialState(saved, 25, startedAt + 120_000);

        expect(restored).toMatchObject({
            mode: "FOCUS",
            timeLeft: 480,
            isRunning: false,
            isCompleted: false,
            focusCount: 2,
            needsRecoveryPrompt: true,
        });
    });

    it("marks expired running sessions as completed instead of reviving them", () => {
        const startedAt = Date.UTC(2026, 2, 12, 9, 0, 0);
        const saved: PersistedTimerState = {
            version: 1,
            mode: "SHORT_BREAK",
            isRunning: true,
            focusCount: 3,
            startedAt,
            pausedTimeLeft: 60,
        };

        expect(resolveInitialState(saved, 25, startedAt + 120_000)).toMatchObject({
            mode: "SHORT_BREAK",
            timeLeft: 0,
            isRunning: false,
            isCompleted: true,
            focusCount: 3,
            needsRecoveryPrompt: false,
        });
    });

    it("reconciles time left from a wall-clock deadline", () => {
        const now = Date.UTC(2026, 2, 12, 10, 0, 0);
        expect(reconcileTimeLeft(now + 8_200, true, now)).toBe(9);
        expect(reconcileTimeLeft(now - 500, true, now)).toBe(0);
        expect(reconcileTimeLeft(now + 8_200, false, now)).toBeNull();
    });
});
