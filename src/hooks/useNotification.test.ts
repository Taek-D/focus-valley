// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Use vi.hoisted so mocks are available before vi.mock hoisting
const mocks = vi.hoisted(() => ({
    isNativePlatform: vi.fn(() => true),
    addListener: vi.fn(),
    schedule: vi.fn(),
    createChannel: vi.fn(),
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
    Capacitor: { isNativePlatform: mocks.isNativePlatform },
}));

vi.mock("@capacitor/app", () => ({
    App: { addListener: mocks.addListener },
}));

vi.mock("@capacitor/local-notifications", () => ({
    LocalNotifications: {
        schedule: mocks.schedule,
        createChannel: mocks.createChannel,
        checkPermissions: mocks.checkPermissions,
        requestPermissions: mocks.requestPermissions,
    },
}));

import { useNotification } from "./useNotification";

describe("useNotification", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.isNativePlatform.mockReturnValue(true);
        mocks.addListener.mockResolvedValue({ remove: vi.fn() });
        mocks.createChannel.mockResolvedValue(undefined);
        mocks.checkPermissions.mockResolvedValue({ display: "granted" });
        mocks.requestPermissions.mockResolvedValue({ display: "granted" });
        mocks.schedule.mockResolvedValue(undefined);
    });

    describe("Test 1: On native platform with isAppActive=false, notify() calls LocalNotifications.schedule()", () => {
        it("schedules notification with correct params when app is in background", async () => {
            let appStateChangeCallback: ((state: { isActive: boolean }) => void) | null = null;
            mocks.addListener.mockImplementation((event: string, callback: (state: { isActive: boolean }) => void) => {
                if (event === "appStateChange") {
                    appStateChangeCallback = callback;
                }
                return Promise.resolve({ remove: vi.fn() });
            });

            const { result } = renderHook(() => useNotification());

            // Allow useEffect to run
            await act(async () => {
                await Promise.resolve();
            });

            // Simulate app going to background
            await act(async () => {
                appStateChangeCallback?.({ isActive: false });
            });

            // Call notify
            act(() => {
                result.current.notify("집중 완료!", "휴식 시간이에요!");
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(mocks.schedule).toHaveBeenCalledTimes(1);
            const [callArg] = mocks.schedule.mock.calls[0];
            const notif = callArg.notifications[0];
            expect(notif.title).toBe("집중 완료!");
            expect(notif.body).toBe("휴식 시간이에요!");
            expect(notif.channelId).toBe("focus-valley-timer");
            expect(notif.schedule.allowWhileIdle).toBe(true);
            expect(typeof notif.id).toBe("number");
        });
    });

    describe("Test 2: On native platform with isAppActive=true, notify() does NOT call schedule()", () => {
        it("suppresses notification when app is in foreground", async () => {
            let appStateChangeCallback: ((state: { isActive: boolean }) => void) | null = null;
            mocks.addListener.mockImplementation((event: string, callback: (state: { isActive: boolean }) => void) => {
                if (event === "appStateChange") {
                    appStateChangeCallback = callback;
                }
                return Promise.resolve({ remove: vi.fn() });
            });

            const { result } = renderHook(() => useNotification());

            await act(async () => {
                await Promise.resolve();
            });

            // Simulate app is active (foreground) — isAppActiveRef starts true, this confirms it
            await act(async () => {
                appStateChangeCallback?.({ isActive: true });
            });

            act(() => {
                result.current.notify("집중 완료!", "휴식 시간이에요!");
            });

            await act(async () => {
                await Promise.resolve();
            });

            expect(mocks.schedule).not.toHaveBeenCalled();
        });
    });

    describe("Test 3: On non-native platform, notify() uses Web Notification API", () => {
        it("falls back to Web Notification when not native", async () => {
            mocks.isNativePlatform.mockReturnValue(false);

            const mockNotificationConstructor = vi.fn();
            const originalNotification = (globalThis as typeof globalThis & { Notification?: unknown }).Notification;
            Object.defineProperty(globalThis, "Notification", {
                value: Object.assign(mockNotificationConstructor, {
                    permission: "granted",
                    requestPermission: vi.fn().mockResolvedValue("granted"),
                }),
                writable: true,
                configurable: true,
            });

            Object.defineProperty(document, "visibilityState", {
                value: "hidden",
                writable: true,
                configurable: true,
            });

            const { result } = renderHook(() => useNotification());

            act(() => {
                result.current.notify("Test Title", "Test Body");
            });

            expect(mockNotificationConstructor).toHaveBeenCalledWith(
                "Test Title",
                expect.objectContaining({ body: "Test Body" })
            );
            expect(mocks.schedule).not.toHaveBeenCalled();

            Object.defineProperty(globalThis, "Notification", { value: originalNotification, writable: true, configurable: true });
            Object.defineProperty(document, "visibilityState", { value: "visible", writable: true, configurable: true });
        });
    });

    describe("Test 4: On native, requestPermission() calls checkPermissions then requestPermissions if needed", () => {
        it("returns true immediately when already granted", async () => {
            mocks.checkPermissions.mockResolvedValue({ display: "granted" });

            const { result } = renderHook(() => useNotification());

            let granted: boolean | undefined;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted).toBe(true);
            expect(mocks.checkPermissions).toHaveBeenCalledTimes(1);
            expect(mocks.requestPermissions).not.toHaveBeenCalled();
        });

        it("calls requestPermissions when status is prompt", async () => {
            mocks.checkPermissions.mockResolvedValue({ display: "prompt" });
            mocks.requestPermissions.mockResolvedValue({ display: "granted" });

            const { result } = renderHook(() => useNotification());

            let granted: boolean | undefined;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted).toBe(true);
            expect(mocks.requestPermissions).toHaveBeenCalledTimes(1);
        });

        it("returns false when denied", async () => {
            mocks.checkPermissions.mockResolvedValue({ display: "denied" });

            const { result } = renderHook(() => useNotification());

            let granted: boolean | undefined;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted).toBe(false);
            expect(mocks.requestPermissions).not.toHaveBeenCalled();
        });
    });

    describe("Test 5: On non-native, requestPermission() calls Notification.requestPermission()", () => {
        it("uses Web Notification requestPermission on non-native", async () => {
            mocks.isNativePlatform.mockReturnValue(false);

            const mockWebRequestPermission = vi.fn().mockResolvedValue("granted");
            const originalNotification = (globalThis as typeof globalThis & { Notification?: unknown }).Notification;
            Object.defineProperty(globalThis, "Notification", {
                value: Object.assign(vi.fn(), {
                    permission: "default",
                    requestPermission: mockWebRequestPermission,
                }),
                writable: true,
                configurable: true,
            });

            const { result } = renderHook(() => useNotification());

            let granted: boolean | undefined;
            await act(async () => {
                granted = await result.current.requestPermission();
            });

            expect(granted).toBe(true);
            expect(mockWebRequestPermission).toHaveBeenCalledTimes(1);
            expect(mocks.checkPermissions).not.toHaveBeenCalled();

            Object.defineProperty(globalThis, "Notification", { value: originalNotification, writable: true, configurable: true });
        });
    });

    describe("Test 6: Channel creation runs once on mount when native", () => {
        it("calls createChannel once on mount with focus-valley-timer id", async () => {
            mocks.addListener.mockResolvedValue({ remove: vi.fn() });

            renderHook(() => useNotification());

            await act(async () => {
                await Promise.resolve();
            });

            expect(mocks.createChannel).toHaveBeenCalledTimes(1);
            expect(mocks.createChannel).toHaveBeenCalledWith(
                expect.objectContaining({ id: "focus-valley-timer" })
            );
        });
    });
});
