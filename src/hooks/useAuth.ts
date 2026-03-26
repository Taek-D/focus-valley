import { create } from "zustand";
import { supabase, SUPABASE_CONFIG_ERROR } from "@/lib/supabase";
import type { User, AuthError } from "@supabase/supabase-js";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

type AuthState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    initialize: () => void;
    signUpWithEmail: (email: string, password: string) => Promise<boolean>;
    signInWithEmail: (email: string, password: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
};

function friendlyError(err: AuthError): string {
    const msg = err.message.toLowerCase();
    if (msg.includes("invalid login")) return "Invalid email or password";
    if (msg.includes("already registered")) return "This email is already registered";
    if (msg.includes("password")) return "Password must be at least 6 characters";
    if (msg.includes("rate limit")) return "Too many attempts. Please try again later";
    if (msg.includes("email not confirmed")) return "Please check your email to confirm your account";
    return err.message;
}

let authUnsubscribe: (() => void) | null = null;

export const useAuth = create<AuthState>((set) => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,

    initialize: () => {
        if (useAuth.getState().initialized) return;
        set({ initialized: true });
        if (!supabase) return;

        // Get initial session
        supabase.auth.getSession().then(({ data }) => {
            set({ user: data.session?.user ?? null });
        });

        // Listen for auth changes
        authUnsubscribe?.();
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null });
        });
        authUnsubscribe = () => data.subscription.unsubscribe();
    },

    signUpWithEmail: async (email, password) => {
        if (!supabase) {
            set({ loading: false, error: SUPABASE_CONFIG_ERROR });
            return false;
        }
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            set({ loading: false, error: friendlyError(error) });
            return false;
        }
        set({ loading: false });
        return true;
    },

    signInWithEmail: async (email, password) => {
        if (!supabase) {
            set({ loading: false, error: SUPABASE_CONFIG_ERROR });
            return false;
        }
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            set({ loading: false, error: friendlyError(error) });
            return false;
        }
        set({ loading: false });
        return true;
    },

    signInWithGoogle: async () => {
        if (!supabase) {
            set({ loading: false, error: SUPABASE_CONFIG_ERROR });
            return;
        }
        set({ loading: true, error: null });

        if (Capacitor.isNativePlatform()) {
            // Native path: use Chrome Custom Tab to avoid WebView 403 error
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: "focusvalley://auth/callback",
                    skipBrowserRedirect: true,
                },
            });
            if (error) {
                set({ loading: false, error: friendlyError(error) });
                return;
            }
            if (!data.url) {
                set({ loading: false, error: "Unable to start sign-in. Please try again." });
                return;
            }
            // Register browserFinished handler BEFORE Browser.open() to catch user cancellations
            const browserHandle = Browser.addListener("browserFinished", () => {
                if (useAuth.getState().loading) {
                    useAuth.setState({ loading: false, error: null });
                }
                void browserHandle.then((h) => h.remove());
            });
            await Browser.open({ url: data.url });
            // Loading stays true — appUrlOpen listener or browserFinished will resolve it
        } else {
            // Web path: keep existing behavior unchanged
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin },
            });
            if (error) {
                set({ loading: false, error: friendlyError(error) });
            }
            // Loading stays true — redirect will happen
        }
    },

    signOut: async () => {
        if (!supabase) {
            set({ user: null, loading: false, error: null });
            return;
        }
        set({ loading: true, error: null });
        await supabase.auth.signOut();
        set({ user: null, loading: false });
    },

    clearError: () => set({ error: null }),
}));

/**
 * Handles the OAuth callback deep link URL.
 * Extracts the authorization code from focusvalley://auth/callback?code=X
 * and exchanges it for a session via PKCE.
 * Called from App.tsx's appUrlOpen listener.
 */
export async function handleAuthCallback(url: string): Promise<void> {
    const parsed = new URL(url);

    if (parsed.host === "auth" && parsed.pathname === "/callback") {
        const code = parsed.searchParams.get("code");
        if (code && supabase) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                useAuth.setState({ loading: false, error: "Sign-in failed. Please try again." });
            } else {
                // onAuthStateChange fires automatically and updates user state
                useAuth.setState({ loading: false });
            }
        } else {
            // No code param — user cancelled or error in OAuth flow
            useAuth.setState({ loading: false, error: null });
        }
        return;
    }

    // Any other focusvalley:// URL is a share link — no routing needed per user decision
    // Main screen is already shown, so this is a no-op
}
