import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User, AuthError } from "@supabase/supabase-js";

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

export const useAuth = create<AuthState>((set) => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,

    initialize: () => {
        // Get initial session
        supabase.auth.getSession().then(({ data }) => {
            set({ user: data.session?.user ?? null, initialized: true });
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null });
        });
    },

    signUpWithEmail: async (email, password) => {
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
        set({ loading: true, error: null });
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
        });
        if (error) {
            set({ loading: false, error: friendlyError(error) });
        }
        // Loading stays true — redirect will happen
    },

    signOut: async () => {
        set({ loading: true, error: null });
        await supabase.auth.signOut();
        set({ user: null, loading: false });
    },

    clearError: () => set({ error: null }),
}));
