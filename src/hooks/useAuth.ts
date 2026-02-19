import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { appLogin } from "@apps-in-toss/web-framework";
import type { User } from "@supabase/supabase-js";

type AuthState = {
    user: User | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;

    initialize: () => void;
    signInWithToss: () => Promise<boolean>;
    signOut: () => Promise<void>;
    clearError: () => void;
};

let authUnsubscribe: (() => void) | null = null;

export const useAuth = create<AuthState>((set) => ({
    user: null,
    loading: false,
    error: null,
    initialized: false,

    initialize: () => {
        if (useAuth.getState().initialized) return;
        set({ initialized: true });

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

    signInWithToss: async () => {
        set({ loading: true, error: null });
        try {
            // 1. 토스 인증 → 인가 코드 획득
            const { authorizationCode, referrer } = await appLogin();

            // 2. Supabase Edge Function으로 인가 코드 교환
            const { data, error } = await supabase.functions.invoke("toss-auth", {
                body: { authorizationCode, referrer },
            });

            if (error) {
                set({ loading: false, error: "로그인에 실패했어요. 다시 시도해 주세요." });
                return false;
            }

            // 3. 반환된 세션으로 Supabase 로그인
            const { access_token, refresh_token } = data as {
                access_token: string;
                refresh_token: string;
            };

            const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
            });

            if (sessionError) {
                set({ loading: false, error: "세션 설정에 실패했어요." });
                return false;
            }

            set({ loading: false });
            return true;
        } catch (err) {
            // 사용자가 로그인 취소한 경우
            const message = err instanceof Error ? err.message : "로그인 중 오류가 발생했어요.";
            set({ loading: false, error: message });
            return false;
        }
    },

    signOut: async () => {
        set({ loading: true, error: null });
        await supabase.auth.signOut();
        set({ user: null, loading: false });
    },

    clearError: () => set({ error: null }),
}));
