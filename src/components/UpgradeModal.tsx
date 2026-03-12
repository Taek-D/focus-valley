import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, X, Crown, Palette, BarChart3, Headphones, Infinity as InfinityIcon } from "lucide-react";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useTranslation } from "@/lib/i18n";
import { useDialogA11y } from "@/hooks/useDialogA11y";

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
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useDialogA11y({
        isOpen,
        onClose: close,
        containerRef: dialogRef,
        initialFocusRef: closeRef,
    });

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/60 will-change-[opacity]"
                        onClick={close}
                    />
                    <motion.div
                        ref={dialogRef}
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
                        transition={shouldReduceMotion ? { duration: 0 } : undefined}
                        tabIndex={-1}
                        data-testid="upgrade-modal"
                        className="fixed left-1/2 top-1/2 z-50 w-[min(360px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-foreground/[0.06] bg-card p-6 shadow-cozy-lg will-change-transform"
                    >
                        <button
                            ref={closeRef}
                            onClick={close}
                            data-testid="upgrade-close"
                            className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground/30 transition-colors hover:text-foreground/50"
                            aria-label="Close pro preview"
                        >
                            <X size={14} />
                        </button>

                        <div className="mb-5 text-center">
                            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground/[0.04]">
                                <Sparkles size={18} className="text-foreground/40" />
                            </div>
                            <h3 className="font-display text-lg text-foreground" style={{ fontWeight: 400 }}>
                                Focus Valley <span className="ml-1 rounded-full bg-foreground/8 px-2 py-0.5 font-body text-[9px] font-medium uppercase tracking-wider text-foreground/50">PRO</span>
                            </h3>
                            <p className="mt-1.5 font-body text-[11px] text-muted-foreground/40">
                                {t("pro.previewMessage")}
                            </p>
                        </div>

                        <div className="mb-5 space-y-2.5">
                            {PRO_FEATURES.map(({ icon: Icon, key }) => (
                                <div key={key} className="flex items-center gap-3 rounded-xl bg-foreground/[0.02] px-3 py-2">
                                    <Icon size={14} className="shrink-0 text-foreground/30" />
                                    <span className="font-body text-[11px] text-foreground/60">{t(key)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4 rounded-xl border border-foreground/5 py-3 text-center">
                            <div className="font-body text-[11px] text-foreground/55">
                                {t("pro.comingSoon")}
                            </div>
                            <div className="mt-1 font-body text-[10px] text-muted-foreground/35">
                                {t("pro.previewOnly")}
                            </div>
                        </div>

                        <button
                            onClick={close}
                            className="block w-full rounded-xl bg-foreground/8 py-3 text-center font-body text-[12px] font-medium text-foreground transition-all hover:bg-foreground/12"
                        >
                            {t("pro.dismissPreview")}
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
