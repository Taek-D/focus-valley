// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Use vi.hoisted so mocks are available before vi.mock hoisting
const mocks = vi.hoisted(() => ({
    isNativePlatform: vi.fn(() => true),
    hapticsImpact: vi.fn(),
    hapticsNotification: vi.fn(),
    hapticsVibrate: vi.fn(),
    hapticEnabled: vi.fn(() => true),
}));

vi.mock("@capacitor/core", () => ({
    Capacitor: { isNativePlatform: mocks.isNativePlatform },
}));

vi.mock("@capacitor/haptics", () => ({
    Haptics: {
        impact: mocks.hapticsImpact,
        notification: mocks.hapticsNotification,
        vibrate: mocks.hapticsVibrate,
    },
    ImpactStyle: {
        Light: "LIGHT",
        Medium: "MEDIUM",
        Heavy: "HEAVY",
    },
    NotificationType: {
        Success: "SUCCESS",
        Warning: "WARNING",
        Error: "ERROR",
    },
}));

// Mock useTimerSettings to control hapticEnabled
vi.mock("@/hooks/useTimerSettings", () => ({
    useTimerSettings: (selector: (s: { hapticEnabled: boolean }) => boolean) =>
        selector({ hapticEnabled: mocks.hapticEnabled() }),
}));

import { useHaptic } from "./useHaptic";

describe("useHaptic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.isNativePlatform.mockReturnValue(true);
        mocks.hapticEnabled.mockReturnValue(true);
        mocks.hapticsImpact.mockResolvedValue(undefined);
    });

    describe("Test 1: light() calls Haptics.impact(ImpactStyle.Light) when native and enabled", () => {
        it("fires light haptic on native with hapticEnabled=true", async () => {
            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.light();
            });

            expect(mocks.hapticsImpact).toHaveBeenCalledTimes(1);
            expect(mocks.hapticsImpact).toHaveBeenCalledWith({ style: "LIGHT" });
        });
    });

    describe("Test 2: medium() calls Haptics.notification(Warning) when native and enabled", () => {
        it("fires medium haptic on native with hapticEnabled=true", async () => {
            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.medium();
            });

            expect(mocks.hapticsNotification).toHaveBeenCalledTimes(1);
            expect(mocks.hapticsNotification).toHaveBeenCalledWith({ type: "WARNING" });
        });
    });

    describe("Test 3: strong() calls Haptics.vibrate(400ms) when native and enabled", () => {
        it("fires strong haptic on native with hapticEnabled=true", async () => {
            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.strong();
            });

            expect(mocks.hapticsVibrate).toHaveBeenCalledTimes(1);
            expect(mocks.hapticsVibrate).toHaveBeenCalledWith({ duration: 400 });
        });
    });

    describe("Test 4: light/medium/strong() do NOT call Haptics.impact when enabled=false", () => {
        it("light() is a no-op when hapticEnabled=false", async () => {
            mocks.hapticEnabled.mockReturnValue(false);

            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.light();
            });

            expect(mocks.hapticsImpact).not.toHaveBeenCalled();
        });

        it("medium() is a no-op when hapticEnabled=false", async () => {
            mocks.hapticEnabled.mockReturnValue(false);

            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.medium();
            });

            expect(mocks.hapticsNotification).not.toHaveBeenCalled();
        });

        it("strong() is a no-op when hapticEnabled=false", async () => {
            mocks.hapticEnabled.mockReturnValue(false);

            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.strong();
            });

            expect(mocks.hapticsVibrate).not.toHaveBeenCalled();
        });
    });

    describe("Test 5: light/medium/strong() do NOT call Haptics when isNativePlatform()=false", () => {
        it("light() is a no-op on non-native platform", async () => {
            mocks.isNativePlatform.mockReturnValue(false);

            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.light();
            });

            expect(mocks.hapticsImpact).not.toHaveBeenCalled();
        });

        it("medium() is a no-op on non-native platform", async () => {
            mocks.isNativePlatform.mockReturnValue(false);

            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.medium();
            });

            expect(mocks.hapticsNotification).not.toHaveBeenCalled();
        });

        it("strong() is a no-op on non-native platform", async () => {
            mocks.isNativePlatform.mockReturnValue(false);

            const { result } = renderHook(() => useHaptic());

            await act(async () => {
                await result.current.strong();
            });

            expect(mocks.hapticsVibrate).not.toHaveBeenCalled();
        });
    });
});
