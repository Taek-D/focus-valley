import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { useTimerSettings } from "@/hooks/useTimerSettings";

export function useHaptic() {
    const hapticEnabled = useTimerSettings((s) => s.hapticEnabled);

    const guard = useCallback(
        (): boolean => Capacitor.isNativePlatform() && hapticEnabled,
        [hapticEnabled]
    );

    return {
        light: useCallback(async () => {
            if (!guard()) return;
            await Haptics.impact({ style: ImpactStyle.Light });
        }, [guard]),
        medium: useCallback(async () => {
            if (!guard()) return;
            await Haptics.notification({ type: NotificationType.Warning });
        }, [guard]),
        strong: useCallback(async () => {
            if (!guard()) return;
            await Haptics.vibrate({ duration: 400 });
        }, [guard]),
    };
}
