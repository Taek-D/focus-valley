import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Prevents Android back button from exiting the app during an active timer session.
 * Phase 1 scope: simply suppress exit when isRunning is true.
 * Phase 2 (NATIVE-03) will add BottomSheet closing + exit confirmation dialog.
 */
export function useBackButton(isRunning: boolean): void {
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const subscription = App.addListener("backButton", ({ canGoBack }) => {
            if (isRunning) {
                // During active session: suppress back button to prevent accidental exit
                // Phase 2 (NATIVE-03) will replace this with BottomSheet close + confirmation
                return;
            }
            // No active session: allow default behavior
            if (!canGoBack) {
                App.exitApp();
            }
            // If canGoBack is true, the WebView handles back navigation automatically
        });

        return () => {
            subscription.then((handle) => handle.remove());
        };
    }, [isRunning]);
}
