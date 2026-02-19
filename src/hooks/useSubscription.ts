import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { IAP } from "@apps-in-toss/web-framework";
import type { User } from "@supabase/supabase-js";

type Plan = "free" | "pro";
type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete";

type SubscriptionRow = {
    plan: Plan;
    status: SubscriptionStatus;
    current_period_end: string | null;
};

const ACTIVE_STATUSES: ReadonlySet<SubscriptionStatus> = new Set(["trialing", "active"]);

// IAP SKU → 유효 기간(일)
const SKU_DURATION_DAYS: Record<string, number> = {
    "focus_valley_pro_1m": 30,
    "focus_valley_pro_3m": 90,
    "focus_valley_pro_1y": 365,
};

type SubscriptionState = {
    plan: Plan;
    expiresAt: string | null;
    loading: boolean;
    initialized: boolean;
    refresh: (user: User | null) => Promise<void>;
    reset: () => void;
};

/** IAP 주문 내역에서 현재 유효한 pro 구독이 있는지 확인 */
async function checkIapStatus(): Promise<{ isPro: boolean; expiresAt: string | null }> {
    try {
        const result = await IAP.getCompletedOrRefundedOrders();
        if (!result?.orders?.length) return { isPro: false, expiresAt: null };

        // COMPLETED 주문만 필터, 최신순 정렬
        const completed = result.orders
            .filter((o) => o.status === "COMPLETED")
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        for (const order of completed) {
            const durationDays = SKU_DURATION_DAYS[order.sku];
            if (!durationDays) continue;

            const purchaseDate = new Date(order.date);
            const expiresAt = new Date(purchaseDate.getTime() + durationDays * 86400000);

            if (expiresAt > new Date()) {
                return { isPro: true, expiresAt: expiresAt.toISOString() };
            }
        }

        return { isPro: false, expiresAt: null };
    } catch {
        // IAP 미지원 환경 (브라우저 등) — 무시
        return { isPro: false, expiresAt: null };
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
        const [dbResult, iapResult] = await Promise.all([
            supabase
                .from("user_subscriptions")
                .select("plan, status, current_period_end")
                .eq("user_id", user.id)
                .maybeSingle<SubscriptionRow>()
                .then(({ data, error }) => {
                    if (error) return { isPro: false, expiresAt: null as string | null };
                    const isActive = data ? ACTIVE_STATUSES.has(data.status) : false;
                    const notExpired = !data?.current_period_end || new Date(data.current_period_end) > new Date();
                    return {
                        isPro: data?.plan === "pro" && isActive && notExpired,
                        expiresAt: data?.current_period_end ?? null,
                    };
                }),
            checkIapStatus(),
        ]);

        // 둘 중 하나라도 pro면 pro
        const isPro = dbResult.isPro || iapResult.isPro;
        const expiresAt = iapResult.expiresAt ?? dbResult.expiresAt;

        set({
            plan: isPro ? "pro" : "free",
            expiresAt,
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
