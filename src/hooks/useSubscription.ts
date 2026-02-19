import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { IAP } from "@apps-in-toss/web-framework";
import type { User } from "@supabase/supabase-js";

type Plan = "free" | "pro";
type SubscriptionStatus = "inactive" | "active";

type SubscriptionRow = {
    plan: Plan;
    status: SubscriptionStatus;
    current_period_end: string | null;
};

type SubscriptionState = {
    plan: Plan;
    expiresAt: string | null;
    loading: boolean;
    initialized: boolean;
    refresh: (user: User | null) => Promise<void>;
    reset: () => void;
};

/** IAP 주문 내역에서 pro 구매 완료 여부 확인 (1회 영구 결제) */
async function checkIapStatus(): Promise<boolean> {
    try {
        const result = await IAP.getCompletedOrRefundedOrders();
        if (!result?.orders?.length) return false;

        return result.orders.some((o) => o.status === "COMPLETED" && o.sku === "focus_valley_pro");
    } catch {
        // IAP 미지원 환경 (브라우저 등) — 무시
        return false;
    }
}

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

        // Supabase DB와 IAP 상태를 병렬 조회
        const [dbIsPro, iapIsPro] = await Promise.all([
            supabase
                .from("user_subscriptions")
                .select("plan, status, current_period_end")
                .eq("user_id", user.id)
                .maybeSingle<SubscriptionRow>()
                .then(({ data, error }) => {
                    if (error) return false;
                    return data?.plan === "pro" && data?.status === "active";
                }),
            checkIapStatus(),
        ]);

        // 둘 중 하나라도 pro면 pro
        const isPro = dbIsPro || iapIsPro;

        set({
            plan: isPro ? "pro" : "free",
            expiresAt: null,
            loading: false,
            initialized: true,
        });
    },

    reset: () => set({ plan: "free", expiresAt: null, loading: false, initialized: true }),
}));

export const useIsPro = () => useSubscription((s) => s.plan === "pro");
