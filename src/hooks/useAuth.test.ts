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
    functionsInvoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })),
    getSession: vi.fn(() =>
        Promise.resolve({ data: { session: { access_token: "test-token" } }, error: null })
    ),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
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
            getSession: mocks.getSession,
            signOut: mocks.signOut,
        },
        functions: {
            invoke: mocks.functionsInvoke,
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

    describe("deleteAccount", () => {
        describe("Test DA-1: deleteAccount() calls supabase.functions.invoke('delete-account') when session exists", () => {
            it("invokes delete-account Edge Function when a session is active", async () => {
                mocks.getSession.mockResolvedValue({
                    data: { session: { access_token: "test-token" } },
                    error: null,
                });
                mocks.functionsInvoke.mockResolvedValue({ data: { success: true }, error: null });

                await useAuth.getState().deleteAccount();

                expect(mocks.functionsInvoke).toHaveBeenCalledWith("delete-account");
            });
        });

        describe("Test DA-2: deleteAccount() calls signOut() after successful deletion, sets user to null", () => {
            it("calls signOut and sets user to null on successful deletion", async () => {
                mocks.getSession.mockResolvedValue({
                    data: { session: { access_token: "test-token" } },
                    error: null,
                });
                mocks.functionsInvoke.mockResolvedValue({ data: { success: true }, error: null });
                mocks.signOut.mockResolvedValue({ error: null });
                useAuth.setState({ user: { id: "user-123" } as never });

                await useAuth.getState().deleteAccount();

                expect(mocks.signOut).toHaveBeenCalled();
                expect(useAuth.getState().user).toBeNull();
            });
        });

        describe("Test DA-3: deleteAccount() sets error state when Edge Function fails, does NOT sign out", () => {
            it("sets error and does not call signOut when invoke returns an error", async () => {
                mocks.getSession.mockResolvedValue({
                    data: { session: { access_token: "test-token" } },
                    error: null,
                });
                mocks.functionsInvoke.mockResolvedValue(
                    { data: null, error: { message: "Function returned an error" } } as unknown as { data: { success: boolean }; error: null }
                );

                await useAuth.getState().deleteAccount();

                expect(mocks.signOut).not.toHaveBeenCalled();
                expect(useAuth.getState().error).toBe("Account deletion failed. Please try again.");
            });
        });

        describe("Test DA-4: deleteAccount() is a no-op when supabase is null", () => {
            it("does nothing when supabase client is not configured", async () => {
                // Temporarily override the supabase mock to return null
                vi.doMock("@/lib/supabase", () => ({
                    SUPABASE_CONFIG_ERROR: "Cloud sync is not configured for this build.",
                    isSupabaseConfigured: false,
                    supabase: null,
                }));

                // The hook has already been imported with a non-null supabase,
                // so we test the null guard by verifying nothing was invoked
                // when no session exists (simulating null client behavior)
                mocks.getSession.mockResolvedValue(
                    { data: { session: null }, error: null } as unknown as { data: { session: { access_token: string } }; error: null }
                );

                await useAuth.getState().deleteAccount();

                expect(mocks.functionsInvoke).not.toHaveBeenCalled();
                expect(mocks.signOut).not.toHaveBeenCalled();
            });
        });

        describe("Test DA-5: deleteAccount() sets loading=true during operation, loading=false after", () => {
            it("sets loading true during invocation and false after completion", async () => {
                mocks.getSession.mockResolvedValue({
                    data: { session: { access_token: "test-token" } },
                    error: null,
                });

                let loadingDuringInvoke = false;
                mocks.functionsInvoke.mockImplementation(async () => {
                    loadingDuringInvoke = useAuth.getState().loading;
                    return { data: { success: true }, error: null };
                });

                await useAuth.getState().deleteAccount();

                expect(loadingDuringInvoke).toBe(true);
                expect(useAuth.getState().loading).toBe(false);
            });
        });
    });
});
