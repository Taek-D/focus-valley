import { useCallback, useState } from "react";

type NotificationPermissionState = "default" | "denied" | "granted";

function getPermission(): NotificationPermissionState {
    if (typeof Notification === "undefined") return "denied";
    return Notification.permission;
}

export function useNotification() {
    const [permission, setPermission] = useState<NotificationPermissionState>(getPermission);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (typeof Notification === "undefined") return false;
        if (Notification.permission === "granted") {
            setPermission("granted");
            return true;
        }
        if (Notification.permission === "denied") return false;

        const result = await Notification.requestPermission();
        setPermission(result);
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
        permission,
        requestPermission,
        notify,
    };
}
