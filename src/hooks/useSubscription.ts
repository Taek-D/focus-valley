// NOTE: Client-side soft gate for UI preview only.
// For real monetization, verify subscription status server-side
// (e.g., Supabase `subscriptions` table + payment provider webhook).
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Plan = "free" | "pro";

type SubscriptionState = {
    plan: Plan;
    expiresAt: string | null;
    proSince: string | null;
    activatePro: (expiresAt?: string) => void;
    revertToFree: () => void;
};

export const useSubscription = create<SubscriptionState>()(
    persist(
        (set) => ({
            plan: "free" as Plan,
            expiresAt: null,
            proSince: null,

            activatePro: (expiresAt?: string) =>
                set({
                    plan: "pro",
                    expiresAt: expiresAt ?? null,
                    proSince: new Date().toISOString(),
                }),

            revertToFree: () =>
                set({
                    plan: "free",
                    expiresAt: null,
                }),
        }),
        {
            name: "focus-valley-subscription",
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                if (state.plan === "pro" && state.expiresAt) {
                    if (new Date(state.expiresAt) <= new Date()) {
                        // Use store's setState directly to avoid timing issues
                        useSubscription.setState({ plan: "free", expiresAt: null });
                    }
                }
            },
        }
    )
);

export const useIsPro = () =>
    useSubscription((s) =>
        s.plan === "pro" && (!s.expiresAt || new Date(s.expiresAt) > new Date())
    );
