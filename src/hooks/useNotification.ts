import { useCallback, useRef } from "react";

type NotificationPermission = "default" | "denied" | "granted";

function getPermission(): NotificationPermission {
    if (typeof Notification === "undefined") return "denied";
    return Notification.permission;
}

export function useNotification() {
    const permissionRef = useRef<NotificationPermission>(getPermission());

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (typeof Notification === "undefined") return false;
        if (Notification.permission === "granted") {
            permissionRef.current = "granted";
            return true;
        }
        if (Notification.permission === "denied") return false;

        const result = await Notification.requestPermission();
        permissionRef.current = result;
        return result === "granted";
    }, []);

    const notify = useCallback((title: string, body?: string) => {
        if (typeof Notification === "undefined") return;
        if (Notification.permission !== "granted") return;
        if (document.visibilityState === "visible") return;

        new Notification(title, {
            body,
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
            silent: false,
        });
    }, []);

    return {
        permission: permissionRef.current,
        requestPermission,
        notify,
    };
}
