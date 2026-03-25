import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";

type NotificationPermissionState = "default" | "denied" | "granted";

function getWebPermission(): NotificationPermissionState {
    if (typeof Notification === "undefined") return "denied";
    return Notification.permission;
}

export function useNotification() {
    const [permission, setPermission] = useState<NotificationPermissionState>(
        Capacitor.isNativePlatform() ? "default" : getWebPermission
    );
    const isAppActiveRef = useRef(true); // track foreground state; starts true

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Create notification channel once on mount (Android 8+ requirement)
        void LocalNotifications.createChannel({
            id: "focus-valley-timer",
            name: "Timer Notifications",
            description: "Focus and break session completion alerts",
            importance: 4, // HIGH — causes heads-up notification
            visibility: 1, // PUBLIC
            vibration: true,
        });

        // Track app foreground/background state for foreground suppression
        const sub = App.addListener("appStateChange", ({ isActive }) => {
            isAppActiveRef.current = isActive;
        });

        return () => {
            void sub.then((h) => h.remove());
        };
    }, []);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!Capacitor.isNativePlatform()) {
            // Web fallback
            if (typeof Notification === "undefined") return false;
            if (Notification.permission === "granted") {
                setPermission("granted");
                return true;
            }
            if (Notification.permission === "denied") return false;
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === "granted";
        }

        // Native path
        const { display } = await LocalNotifications.checkPermissions();
        if (display === "granted") {
            setPermission("granted");
            return true;
        }
        if (display === "denied") {
            setPermission("denied");
            return false;
        }
        const result = await LocalNotifications.requestPermissions();
        const granted = result.display === "granted";
        setPermission(granted ? "granted" : "denied");
        return granted;
    }, []);

    const notify = useCallback((title: string, body?: string) => {
        if (!Capacitor.isNativePlatform()) {
            // Web fallback (existing behavior)
            if (typeof Notification === "undefined") return;
            if (Notification.permission !== "granted") return;
            if (document.visibilityState === "visible") return;
            new Notification(title, {
                body,
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                silent: false,
            });
            return;
        }

        // Native: suppress if app is in foreground
        if (isAppActiveRef.current) return;

        void LocalNotifications.schedule({
            notifications: [
                {
                    id: Date.now() % 2147483647,
                    title,
                    body: body ?? "",
                    channelId: "focus-valley-timer",
                    schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
                },
            ],
        });
    }, []);

    return {
        permission,
        requestPermission,
        notify,
    };
}
