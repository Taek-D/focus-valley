import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Pure function: determines what action the back button should take.
 * Extracted for testability — no Capacitor mocks required.
 */
export function resolveBackAction(
    hasOpenPanels: boolean,
    isRunning: boolean,
): "close-panel" | "session-giveup" | "exit-confirm" {
    if (hasOpenPanels) return "close-panel";
    if (isRunning) return "session-giveup";
    return "exit-confirm";
}

/**
 * Handles Android back button with panel-aware LIFO navigation and confirmation dialogs.
 *
 * Priority order:
 * 1. Close topmost open panel (LIFO)
 * 2. Show session give-up confirmation when timer is running
 * 3. Show exit confirmation on main screen
 */
export function useBackButton(
    isRunning: boolean,
    panels: { openStack: string[]; closeTopPanel: () => boolean },
    onShowExitConfirm: () => void,
    onShowSessionGiveUpConfirm: () => void,
): void {
    const latestStateRef = useRef({
        isRunning,
        hasOpenPanels: panels.openStack.length > 0,
        closeTopPanel: panels.closeTopPanel,
        onShowExitConfirm,
        onShowSessionGiveUpConfirm,
    });

    useEffect(() => {
        latestStateRef.current = {
            isRunning,
            hasOpenPanels: panels.openStack.length > 0,
            closeTopPanel: panels.closeTopPanel,
            onShowExitConfirm,
            onShowSessionGiveUpConfirm,
        };
    }, [isRunning, panels.openStack, panels.closeTopPanel, onShowExitConfirm, onShowSessionGiveUpConfirm]);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const subscription = App.addListener("backButton", () => {
            const {
                hasOpenPanels,
                isRunning: currentIsRunning,
                closeTopPanel,
                onShowExitConfirm: showExitConfirm,
                onShowSessionGiveUpConfirm: showSessionGiveUpConfirm,
            } = latestStateRef.current;
            const action = resolveBackAction(hasOpenPanels, currentIsRunning);

            if (action === "close-panel") {
                closeTopPanel();
            } else if (action === "session-giveup") {
                showSessionGiveUpConfirm();
            } else {
                showExitConfirm();
            }
        });

        return () => {
            subscription.then((handle) => handle.remove());
        };
    }, []);
}
