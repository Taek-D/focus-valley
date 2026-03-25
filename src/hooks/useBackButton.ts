import { useEffect } from "react";
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
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const subscription = App.addListener("backButton", () => {
            const action = resolveBackAction(panels.openStack.length > 0, isRunning);

            if (action === "close-panel") {
                panels.closeTopPanel();
            } else if (action === "session-giveup") {
                onShowSessionGiveUpConfirm();
            } else {
                onShowExitConfirm();
            }
        });

        return () => {
            subscription.then((handle) => handle.remove());
        };
    }, [isRunning, panels, onShowExitConfirm, onShowSessionGiveUpConfirm]);
}
