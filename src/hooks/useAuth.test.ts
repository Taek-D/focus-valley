// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mocks are available before vi.mock hoisting
const mocks = vi.hoisted(() => ({
    isNativePlatform: vi.fn(() => true),
    browserOpen: vi.fn(() => Promise.resolve()),
    browserAddListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
    signInWithOAuth: vi.fn(() =>
        Promise.resolve({
            data: { url: "https://accounts.google.com/o/oauth2/auth?code_challenge=abc" },
            error: null,
        })
    ),
    exchangeCodeForSession: vi.fn(() => Promise.resolve({ data: {}, error: null })),
}));

vi.mock("@capacitor/core", () => ({
    Capacitor: { isNativePlatform: mocks.isNativePlatform },
}));

vi.mock("@capacitor/browser", () => ({
    Browser: {
        open: mocks.browserOpen,
        addListener: mocks.browserAddListener,
    },
}));

vi.mock("@/lib/supabase", () => ({
    SUPABASE_CONFIG_ERROR: "Cloud sync is not configured for this build.",
    isSupabaseConfigured: true,
    supabase: {
        auth: {
            signInWithOAuth: mocks.signInWithOAuth,
            exchangeCodeForSession: mocks.exchangeCodeForSession,
        },
    },
}));

import { useAuth, handleAuthCallback } from "./useAuth";

describe("useAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.isNativePlatform.mockReturnValue(true);
        mocks.browserOpen.mockResolvedValue(undefined);
        mocks.browserAddListener.mockResolvedValue({ remove: vi.fn() });
        mocks.signInWithOAuth.mockResolvedValue({
            data: { url: "https://accounts.google.com/o/oauth2/auth?code_challenge=abc" },
            error: null,
        });
        mocks.exchangeCodeForSession.mockResolvedValue({ data: {}, error: null });
        // Reset Zustand store
        useAuth.setState({ user: null, loading: false, error: null, initialized: false });
    });

    describe("Test 1: signInWithGoogle() on native calls signInWithOAuth with skipBrowserRedirect and correct redirectTo", () => {
        it("calls supabase.auth.signInWithOAuth with skipBrowserRedirect: true and focusvalley:// redirectTo on native", async () => {
            await useAuth.getState().signInWithGoogle();

            expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
                provider: "google",
                options: expect.objectContaining({
                    skipBrowserRedirect: true,
                    redirectTo: "focusvalley://auth/callback",
                }),
            });
        });
    });

    describe("Test 2: signInWithGoogle() on native calls Browser.open() with the OAuth URL", () => {
        it("calls Browser.open() with the URL returned from signInWithOAuth on native", async () => {
            const oauthUrl = "https://accounts.google.com/o/oauth2/auth?code_challenge=abc";
            mocks.signInWithOAuth.mockResolvedValue({
                data: { url: oauthUrl },
                error: null,
            });

            await useAuth.getState().signInWithGoogle();

            expect(mocks.browserOpen).toHaveBeenCalledWith({ url: oauthUrl });
        });
    });

    describe("Test 3: signInWithGoogle() on web uses existing behavior — no Browser.open()", () => {
        it("does not call Browser.open() and calls signInWithOAuth with window.location.origin redirectTo on web", async () => {
            mocks.isNativePlatform.mockReturnValue(false);

            await useAuth.getState().signInWithGoogle();

            expect(mocks.browserOpen).not.toHaveBeenCalled();
            expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
                provider: "google",
                options: expect.objectContaining({
                    redirectTo: window.location.origin,
                }),
            });
        });
    });

    describe("Test 4: handleAuthCallback() with /auth/callback?code=X calls exchangeCodeForSession('X')", () => {
        it("extracts code from focusvalley://auth/callback and calls exchangeCodeForSession", async () => {
            await handleAuthCallback("focusvalley://auth/callback?code=abc123");

            expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("abc123");
        });
    });

    describe("Test 5: handleAuthCallback() with non-auth URL does NOT call exchangeCodeForSession", () => {
        it("ignores focusvalley://share/something URL", async () => {
            await handleAuthCallback("focusvalley://share/something");

            expect(mocks.exchangeCodeForSession).not.toHaveBeenCalled();
        });
    });

    describe("Test 6: browserFinished resets loading to false when loading is true", () => {
        it("sets loading to false when Browser.addListener fires browserFinished while loading", async () => {
            useAuth.setState({ loading: true });

            // Simulate browserFinished by finding and invoking the registered listener
            let browserFinishedCallback: (() => void) | null = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mocks.browserAddListener as any).mockImplementation(
                (event: string, callback: () => void) => {
                    if (event === "browserFinished") {
                        browserFinishedCallback = callback;
                    }
                    return Promise.resolve({ remove: vi.fn() });
                }
            );

            await useAuth.getState().signInWithGoogle();

            expect(browserFinishedCallback).not.toBeNull();
            browserFinishedCallback!();

            expect(useAuth.getState().loading).toBe(false);
        });
    });

    describe("Test 7: signInWithGoogle() on native sets loading to true before Browser.open()", () => {
        it("loading is true at the point Browser.open() is called", async () => {
            let loadingDuringOpen = false;
            mocks.browserOpen.mockImplementation(() => {
                loadingDuringOpen = useAuth.getState().loading;
                return Promise.resolve();
            });

            await useAuth.getState().signInWithGoogle();

            expect(loadingDuringOpen).toBe(true);
        });
    });

    describe("Test 8: signInWithGoogle() with supabase error sets error state and loading to false", () => {
        it("sets error message and loading: false when signInWithOAuth returns an error", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (mocks.signInWithOAuth as any).mockResolvedValue({
                data: { url: undefined },
                error: { message: "OAuth provider error", name: "AuthError" },
            });

            await useAuth.getState().signInWithGoogle();

            expect(useAuth.getState().loading).toBe(false);
            expect(useAuth.getState().error).not.toBeNull();
        });
    });
});
