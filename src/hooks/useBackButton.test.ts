// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const { isNativePlatformMock, removeListenerMock, addListenerMock } = vi.hoisted(() => ({
    isNativePlatformMock: vi.fn(() => false),
    removeListenerMock: vi.fn(),
    addListenerMock: vi.fn<(event: string, callback: () => void) => Promise<{ remove: () => void }>>(),
}));

// --- Mock Capacitor modules before importing hooks ---
vi.mock("@capacitor/core", () => ({
    Capacitor: {
        isNativePlatform: isNativePlatformMock,
    },
}));

vi.mock("@capacitor/app", () => ({
    App: {
        addListener: addListenerMock,
        exitApp: vi.fn(),
    },
}));

import { useBackButton, resolveBackAction } from "@/hooks/useBackButton";
import { useAppPanels } from "@/hooks/useAppPanels";

// ---- Pure function tests (no mocks needed) ----

describe("resolveBackAction", () => {
    it("returns 'close-panel' when there are open panels", () => {
        expect(resolveBackAction(true, false)).toBe("close-panel");
        expect(resolveBackAction(true, true)).toBe("close-panel");
    });

    it("returns 'session-giveup' when no panels and session is running", () => {
        expect(resolveBackAction(false, true)).toBe("session-giveup");
    });

    it("returns 'exit-confirm' when no panels and session is not running", () => {
        expect(resolveBackAction(false, false)).toBe("exit-confirm");
    });
});

beforeEach(() => {
    vi.clearAllMocks();
    isNativePlatformMock.mockReturnValue(false);
    addListenerMock.mockResolvedValue({ remove: removeListenerMock });
});

describe("useBackButton", () => {
    it("registers the native listener once and reads the latest state from refs", async () => {
        isNativePlatformMock.mockReturnValue(true);

        let listener: (() => void) | undefined;
        addListenerMock.mockImplementation((_event: string, callback: () => void) => {
            listener = callback;
            return Promise.resolve({ remove: removeListenerMock });
        });

        const firstCloseTopPanel = vi.fn(() => true);
        const latestCloseTopPanel = vi.fn(() => true);
        const firstExitConfirm = vi.fn();
        const latestExitConfirm = vi.fn();
        const firstGiveUpConfirm = vi.fn();
        const latestGiveUpConfirm = vi.fn();

        const { rerender, unmount } = renderHook(
            ({
                isRunning,
                openStack,
                closeTopPanel,
                onShowExitConfirm,
                onShowSessionGiveUpConfirm,
            }) => useBackButton(
                isRunning,
                { openStack, closeTopPanel },
                onShowExitConfirm,
                onShowSessionGiveUpConfirm,
            ),
            {
                initialProps: {
                    isRunning: false,
                    openStack: [] as string[],
                    closeTopPanel: firstCloseTopPanel,
                    onShowExitConfirm: firstExitConfirm,
                    onShowSessionGiveUpConfirm: firstGiveUpConfirm,
                },
            },
        );

        expect(addListenerMock).toHaveBeenCalledTimes(1);
        expect(listener).toBeTypeOf("function");

        rerender({
            isRunning: true,
            openStack: ["settings"],
            closeTopPanel: latestCloseTopPanel,
            onShowExitConfirm: latestExitConfirm,
            onShowSessionGiveUpConfirm: latestGiveUpConfirm,
        });
        expect(addListenerMock).toHaveBeenCalledTimes(1);

        act(() => {
            listener?.();
        });
        expect(latestCloseTopPanel).toHaveBeenCalledTimes(1);
        expect(firstCloseTopPanel).not.toHaveBeenCalled();

        rerender({
            isRunning: true,
            openStack: [],
            closeTopPanel: latestCloseTopPanel,
            onShowExitConfirm: latestExitConfirm,
            onShowSessionGiveUpConfirm: latestGiveUpConfirm,
        });

        act(() => {
            listener?.();
        });
        expect(latestGiveUpConfirm).toHaveBeenCalledTimes(1);
        expect(firstGiveUpConfirm).not.toHaveBeenCalled();

        rerender({
            isRunning: false,
            openStack: [],
            closeTopPanel: latestCloseTopPanel,
            onShowExitConfirm: latestExitConfirm,
            onShowSessionGiveUpConfirm: latestGiveUpConfirm,
        });

        act(() => {
            listener?.();
        });
        expect(latestExitConfirm).toHaveBeenCalledTimes(1);
        expect(firstExitConfirm).not.toHaveBeenCalled();

        unmount();
        await Promise.resolve();
        expect(removeListenerMock).toHaveBeenCalledTimes(1);
    });
});

// ---- useAppPanels open-stack tests ----

describe("useAppPanels open-stack", () => {
    it("closeTopPanel returns false when stack is empty", () => {
        const { result } = renderHook(() => useAppPanels());
        let closed: boolean = false;
        act(() => {
            closed = result.current.closeTopPanel();
        });
        expect(closed).toBe(false);
        expect(result.current.openStack).toHaveLength(0);
    });

    it("closeTopPanel closes the most recently opened panel (LIFO)", () => {
        const { result } = renderHook(() => useAppPanels());

        act(() => {
            result.current.openAuth();
        });
        act(() => {
            result.current.openHistory();
        });

        // Stack should be ['auth', 'history'] - history on top
        expect(result.current.openStack).toEqual(["auth", "history"]);

        act(() => {
            result.current.closeTopPanel();
        });

        // History closed first
        expect(result.current.showHistory).toBe(false);
        expect(result.current.showAuth).toBe(true);
        expect(result.current.openStack).toEqual(["auth"]);
    });

    it("opening panel A then B: closeTopPanel closes B first, then A on second call", () => {
        const { result } = renderHook(() => useAppPanels());

        act(() => {
            result.current.openSettings();
        });
        act(() => {
            result.current.openTodo();
        });

        act(() => {
            const closed = result.current.closeTopPanel();
            expect(closed).toBe(true);
        });
        expect(result.current.showTodo).toBe(false);
        expect(result.current.showSettings).toBe(true);

        act(() => {
            const closed = result.current.closeTopPanel();
            expect(closed).toBe(true);
        });
        expect(result.current.showSettings).toBe(false);
        expect(result.current.openStack).toHaveLength(0);
    });

    it("toggleMixer pushes 'mixer' to stack when opening, pops when closing", () => {
        const { result } = renderHook(() => useAppPanels());

        act(() => {
            result.current.toggleMixer();
        });
        expect(result.current.showMixer).toBe(true);
        expect(result.current.openStack).toContain("mixer");

        act(() => {
            result.current.toggleMixer();
        });
        expect(result.current.showMixer).toBe(false);
        expect(result.current.openStack).not.toContain("mixer");
    });

    it("toggleShortcuts pushes 'shortcuts' to stack when opening, pops when closing", () => {
        const { result } = renderHook(() => useAppPanels());

        act(() => {
            result.current.toggleShortcuts();
        });
        expect(result.current.showShortcuts).toBe(true);
        expect(result.current.openStack).toContain("shortcuts");

        act(() => {
            result.current.toggleShortcuts();
        });
        expect(result.current.showShortcuts).toBe(false);
        expect(result.current.openStack).not.toContain("shortcuts");
    });

    it("closeTopPanel returns true when a panel was closed", () => {
        const { result } = renderHook(() => useAppPanels());

        act(() => {
            result.current.openBreathing();
        });

        let returnValue: boolean = false;
        act(() => {
            returnValue = result.current.closeTopPanel();
        });
        expect(returnValue).toBe(true);
    });
});
