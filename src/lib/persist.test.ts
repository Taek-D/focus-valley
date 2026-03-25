// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock @capacitor/core before importing persist
vi.mock("@capacitor/core", () => ({
    Capacitor: {
        isNativePlatform: vi.fn(() => false),
    },
}));

// Mock @capacitor/preferences before importing persist
vi.mock("@capacitor/preferences", () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}));

import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { createSafeStorage } from "@/lib/persist";

const mockIsNative = vi.mocked(Capacitor.isNativePlatform);
const mockPreferencesGet = vi.mocked(Preferences.get);
const mockPreferencesSet = vi.mocked(Preferences.set);
const mockPreferencesRemove = vi.mocked(Preferences.remove);

describe("createSafeStorage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe("returns an adapter with required methods", () => {
        it("has getItem, setItem, and removeItem methods", () => {
            mockIsNative.mockReturnValue(false);
            const storage = createSafeStorage();
            expect(typeof storage.getItem).toBe("function");
            expect(typeof storage.setItem).toBe("function");
            expect(typeof storage.removeItem).toBe("function");
        });
    });

    describe("web path (Capacitor.isNativePlatform() returns false)", () => {
        beforeEach(() => {
            mockIsNative.mockReturnValue(false);
        });

        it("getItem reads from localStorage", () => {
            const value = { state: { count: 1 }, version: 0 };
            localStorage.setItem("test-key", JSON.stringify(value));
            const storage = createSafeStorage();
            expect(storage.getItem("test-key")).toEqual(value);
        });

        it("setItem writes to localStorage", () => {
            const storage = createSafeStorage();
            const value = { state: { count: 42 }, version: 0 };
            storage.setItem("test-key", value);
            expect(localStorage.getItem("test-key")).toBe(JSON.stringify(value));
        });

        it("getItem returns null for a missing key", () => {
            const storage = createSafeStorage();
            expect(storage.getItem("non-existent")).toBeNull();
        });

        it("getItem returns null and removes the key on invalid JSON", () => {
            localStorage.setItem("bad-key", "not-valid-json{{{");
            const storage = createSafeStorage();
            expect(storage.getItem("bad-key")).toBeNull();
            expect(localStorage.getItem("bad-key")).toBeNull();
        });
    });

    describe("native path (Capacitor.isNativePlatform() returns true)", () => {
        beforeEach(() => {
            mockIsNative.mockReturnValue(true);
        });

        it("getItem calls Preferences.get with the correct key", async () => {
            const value = { state: { count: 7 }, version: 0 };
            mockPreferencesGet.mockResolvedValue({ value: JSON.stringify(value) });
            const storage = createSafeStorage();
            const result = await storage.getItem("native-key");
            expect(mockPreferencesGet).toHaveBeenCalledWith({ key: "native-key" });
            expect(result).toEqual(value);
        });

        it("setItem calls Preferences.set with key and serialized value", async () => {
            mockPreferencesSet.mockResolvedValue();
            const storage = createSafeStorage();
            const value = { state: { count: 3 }, version: 0 };
            await storage.setItem("native-key", value);
            expect(mockPreferencesSet).toHaveBeenCalledWith({
                key: "native-key",
                value: JSON.stringify(value),
            });
        });

        it("getItem returns null when Preferences.get returns null value", async () => {
            mockPreferencesGet.mockResolvedValue({ value: null });
            const storage = createSafeStorage();
            const result = await storage.getItem("missing-key");
            expect(result).toBeNull();
        });

        it("getItem returns null and calls remove on invalid JSON", async () => {
            mockPreferencesGet.mockResolvedValue({ value: "bad-json{{" });
            mockPreferencesRemove.mockResolvedValue();
            const storage = createSafeStorage();
            const result = await storage.getItem("bad-native-key");
            expect(result).toBeNull();
            expect(mockPreferencesRemove).toHaveBeenCalledWith({ key: "bad-native-key" });
        });
    });
});
