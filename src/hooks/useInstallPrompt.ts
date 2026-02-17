import { useState, useEffect, useCallback } from "react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "focus-valley-install-dismissed";

export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(() =>
        window.matchMedia("(display-mode: standalone)").matches
    );
    const [isDismissed, setIsDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
    });

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const installedHandler = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", installedHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", installedHandler);
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredPrompt) return false;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        return outcome === "accepted";
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        setDeferredPrompt(null);
        setIsDismissed(true);
        try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* noop */ }
    }, []);

    return {
        canInstall: !!deferredPrompt && !isInstalled && !isDismissed,
        isInstalled,
        install,
        dismiss,
    };
}
