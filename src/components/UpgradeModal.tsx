import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Crown, Palette, BarChart3, Headphones, Infinity as InfinityIcon } from "lucide-react";
import { IAP } from "@apps-in-toss/web-framework";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { trackProPurchase } from "@/lib/analytics";

const PRO_FEATURES = [
    { icon: Crown, key: "pro.featurePlants" as const },
    { icon: Headphones, key: "pro.featureSounds" as const },
    { icon: InfinityIcon, key: "pro.featureCategories" as const },
    { icon: BarChart3, key: "pro.featureStats" as const },
    { icon: Palette, key: "pro.featureThemes" as const },
];

const PRO_SKU = "focus_valley_pro";

type ProductInfo = {
    sku: string;
    displayAmount: string;
    displayName: string;
};

export function UpgradeModal() {
    const { isOpen, close } = useUpgradeModal();
    const { t } = useTranslation();
    const user = useAuth((s) => s.user);
    const refreshSubscription = useSubscription((s) => s.refresh);
    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 상품 정보 조회
    useEffect(() => {
        if (!isOpen) return;
        IAP.getProductItemList()
            .then((result) => {
                if (result?.products) {
                    const found = result.products.find((p) => p.sku === PRO_SKU);
                    if (found) {
                        setProduct({
                            sku: found.sku,
                            displayAmount: found.displayAmount,
                            displayName: found.displayName,
                        });
                    }
                }
            })
            .catch(() => {
                // sandbox 등에서 미지원 시 무시
            });
    }, [isOpen]);

    const handlePurchase = useCallback(() => {
        if (purchasing) return;
        setPurchasing(true);
        setError(null);

        const cleanup = IAP.createOneTimePurchaseOrder({
            options: {
                sku: PRO_SKU,
                processProductGrant: async ({ orderId }) => {
                    // Supabase에 구매 기록 저장
                    try {
                        const { data, error } = await supabase.functions.invoke<{ success?: boolean }>("iap-grant", {
                            body: { orderId, sku: PRO_SKU },
                        });
                        if (error) return false;
                        return data?.success === true;
                    } catch {
                        return false;
                    }
                },
            },
            onEvent: async (event) => {
                if (event.type === "success") {
                    setPurchasing(false);
                    trackProPurchase();
                    // 구독 상태 갱신
                    if (user) await refreshSubscription(user);
                    close();
                }
                cleanup();
            },
            onError: (err) => {
                setPurchasing(false);
                const code = (err as { code?: string })?.code;
                if (code === "USER_CANCELED") {
                    // 사용자 취소 — 에러 표시 안함
                } else {
                    setError("결제 중 오류가 발생했어요. 다시 시도해 주세요.");
                }
                cleanup();
            },
        });
    }, [purchasing, user, refreshSubscription, close]);

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/60 z-50 will-change-[opacity]"
                        onClick={close}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(360px,90vw)] bg-card border border-foreground/[0.06] rounded-3xl p-6 shadow-cozy-lg will-change-transform"
                    >
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground/30 hover:text-foreground/50 transition-colors"
                        >
                            <X size={14} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-5">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-foreground/[0.04] mb-3">
                                <Sparkles size={18} className="text-foreground/40" />
                            </div>
                            <h3 className="font-display text-lg text-foreground" style={{ fontWeight: 400 }}>
                                Focus Valley <span className="px-2 py-0.5 rounded-full bg-foreground/8 font-body text-[9px] font-medium tracking-wider uppercase text-foreground/50 ml-1">PRO</span>
                            </h3>
                        </div>

                        {/* Features */}
                        <div className="space-y-2.5 mb-5">
                            {PRO_FEATURES.map(({ icon: Icon, key }) => (
                                <div key={key} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-foreground/[0.02]">
                                    <Icon size={14} className="text-foreground/30 shrink-0" />
                                    <span className="font-body text-[11px] text-foreground/60">{t(key)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Price */}
                        <div className="text-center mb-4">
                            <div className="font-display text-2xl text-foreground" style={{ fontWeight: 400 }}>
                                {product?.displayAmount ?? "..."}
                            </div>
                            <p className="font-body text-[10px] text-muted-foreground/40 mt-1">
                                1회 결제 · 영구 이용
                            </p>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="font-body text-[10px] text-center text-red-400/80 mb-3"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* CTA */}
                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="block w-full py-3 rounded-xl bg-[#0064FF] text-center font-body text-[12px] font-medium text-white hover:bg-[#0050CC] transition-all disabled:opacity-30"
                        >
                            {purchasing ? (
                                <div className="w-4 h-4 mx-auto rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                            ) : (
                                t("pro.upgrade")
                            )}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
