import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useTimerSettings } from "@/hooks/useTimerSettings";

export function useHaptic() {
    const hapticEnabled = useTimerSettings((s) => s.hapticEnabled);

    const fire = useCallback(
        async (style: ImpactStyle) => {
            if (!Capacitor.isNativePlatform() || !hapticEnabled) return;
            await Haptics.impact({ style });
        },
        [hapticEnabled]
    );

    return {
        light: useCallback(() => fire(ImpactStyle.Light), [fire]),
        medium: useCallback(() => fire(ImpactStyle.Medium), [fire]),
        strong: useCallback(() => fire(ImpactStyle.Heavy), [fire]),
    };
}
