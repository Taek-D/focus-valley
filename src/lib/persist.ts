import type { PersistStorage, StorageValue } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

function createLocalStorage<T>(): PersistStorage<T> {
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

function createCapacitorStorage<T>(): PersistStorage<T> {
    return {
        getItem: async (name) => {
            try {
                const { value } = await Preferences.get({ key: name });
                if (value === null) return null;
                try {
                    return JSON.parse(value) as StorageValue<T>;
                } catch {
                    await Preferences.remove({ key: name });
                    return null;
                }
            } catch {
                return null;
            }
        },
        setItem: async (name, value) => {
            try {
                await Preferences.set({ key: name, value: JSON.stringify(value) });
            } catch { /* storage unavailable — ignore */ }
        },
        removeItem: async (name) => {
            try {
                await Preferences.remove({ key: name });
            } catch { /* storage unavailable — ignore */ }
        },
    };
}

export function createSafeStorage<T>(): PersistStorage<T> {
    if (Capacitor.isNativePlatform()) {
        return createCapacitorStorage<T>();
    }
    return createLocalStorage<T>();
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function parseIsoTimestamp(value: unknown, fallback = new Date().toISOString()): string {
    if (typeof value !== "string") return fallback;
    return Number.isNaN(Date.parse(value)) ? fallback : value;
}
