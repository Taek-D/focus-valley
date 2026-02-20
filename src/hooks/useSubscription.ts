import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Plan = "free" | "pro";
type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete";

type SubscriptionRow = {
    plan: Plan;
    status: SubscriptionStatus;
    current_period_end: string | null;
};

const ACTIVE_STATUSES: ReadonlySet<SubscriptionStatus> = new Set(["trialing", "active"]);

type SubscriptionState = {
    plan: Plan;
    expiresAt: string | null;
    loading: boolean;
    initialized: boolean;
    refresh: (user: User | null) => Promise<void>;
    reset: () => void;
};

export const useSubscription = create<SubscriptionState>((set) => ({
    plan: "free",
    expiresAt: null,
    loading: false,
    initialized: false,

    refresh: async (user) => {
        if (!user) {
            set({ plan: "free", expiresAt: null, loading: false, initialized: true });
            return;
        }

        set({ loading: true });
        const { data, error } = await supabase
            .from("user_subscriptions")
            .select("plan, status, current_period_end")
            .eq("user_id", user.id)
            .maybeSingle<SubscriptionRow>();

        if (error) {
            console.warn("[subscription] fetch failed:", error.message);
            set({ plan: "free", expiresAt: null, loading: false, initialized: true });
            return;
        }

        const isActiveStatus = data ? ACTIVE_STATUSES.has(data.status) : false;
        const notExpired = !data?.current_period_end || new Date(data.current_period_end) > new Date();
        const isPro = data?.plan === "pro" && isActiveStatus && notExpired;

        set({
            plan: isPro ? "pro" : "free",
            expiresAt: data?.current_period_end ?? null,
            loading: false,
            initialized: true,
        });
    },

    reset: () => set({ plan: "free", expiresAt: null, loading: false, initialized: true }),
}));

export const useIsPro = () =>
    useSubscription((s) =>
        s.plan === "pro" && (!s.expiresAt || new Date(s.expiresAt) > new Date())
    );
