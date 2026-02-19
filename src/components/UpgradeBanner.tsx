import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useIsPro } from "@/hooks/useSubscription";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useTranslation } from "@/lib/i18n";
import { ProBadge } from "./ProGate";

export function UpgradeBanner() {
    const isPro = useIsPro();
    const { open } = useUpgradeModal();
    const { t } = useTranslation();

    if (isPro) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-foreground/5 overflow-hidden"
        >
            {/* Gradient accent bar */}
            <div
                className="h-[2px]"
                style={{
                    background: "linear-gradient(90deg, hsl(var(--aurora-1)), hsl(var(--aurora-2)), hsl(var(--aurora-3)), hsl(var(--aurora-4)))",
                }}
            />

            <div className="flex items-center gap-3 p-4">
                <div className="p-2 rounded-xl bg-foreground/[0.04] shrink-0">
                    <Sparkles size={14} className="text-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-body text-[11px] font-medium text-foreground/70">
                            {t("pro.featurePlants")}
                        </span>
                        <ProBadge source="upgrade-banner" />
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground/40 truncate">
                        {t("pro.featureSounds")}
                    </p>
                </div>
                <button
                    onClick={() => open("upgrade-banner")}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-foreground/8 font-body text-[10px] font-medium text-foreground/60 hover:bg-foreground/12 transition-colors"
                >
                    {t("pro.upgrade")}
                </button>
            </div>
        </motion.div>
    );
}
