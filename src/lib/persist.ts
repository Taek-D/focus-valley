import type { PersistStorage, StorageValue } from "zustand/middleware";

export function createSafeStorage<T>(): PersistStorage<T> {
    return {
        getItem: (name) => {
            if (typeof localStorage === "undefined") return null;
            const raw = localStorage.getItem(name);
            if (!raw) return null;

            try {
                return JSON.parse(raw) as StorageValue<T>;
            } catch {
                localStorage.removeItem(name);
                return null;
            }
        },
        setItem: (name, value) => {
            if (typeof localStorage === "undefined") return;
            localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
            if (typeof localStorage === "undefined") return;
            localStorage.removeItem(name);
        },
    };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function parseIsoTimestamp(value: unknown, fallback = new Date().toISOString()): string {
    if (typeof value !== "string") return fallback;
    return Number.isNaN(Date.parse(value)) ? fallback : value;
}
