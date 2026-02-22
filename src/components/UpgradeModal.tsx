import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Crown, Palette, BarChart3, Headphones, Infinity as InfinityIcon } from "lucide-react";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useTranslation } from "@/lib/i18n";

const PRO_FEATURES = [
    { icon: Crown, key: "pro.featurePlants" as const },
    { icon: Headphones, key: "pro.featureSounds" as const },
    { icon: InfinityIcon, key: "pro.featureCategories" as const },
    { icon: BarChart3, key: "pro.featureStats" as const },
    { icon: Palette, key: "pro.featureThemes" as const },
];

export function UpgradeModal() {
    const { isOpen, close } = useUpgradeModal();
    const { t } = useTranslation();

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
                            <p className="font-body text-[11px] text-muted-foreground/40 mt-1.5">
                                {t("pro.comingSoon")}
                            </p>
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

                        {/* Price preview */}
                        <div className="text-center mb-4 py-3 rounded-xl border border-foreground/5">
                            <div className="font-display text-xl text-foreground" style={{ fontWeight: 300 }}>
                                ₩19,900
                            </div>
                            <div className="font-body text-[10px] text-muted-foreground/30 mt-0.5">
                                {t("pro.oneTimePurchase")}
                            </div>
                        </div>

                        {/* CTA */}
                        <a
                            href="/landing.html#waitlist"
                            className="block w-full py-3 rounded-xl bg-foreground/8 text-center font-body text-[12px] font-medium text-foreground hover:bg-foreground/12 transition-all"
                        >
                            {t("pro.joinWaitlist")}
                        </a>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
