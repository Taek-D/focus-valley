import React from "react";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { useTranslation } from "@/lib/i18n";

type ProBadgeProps = {
    source?: string;
    asSpan?: boolean;
};

export const ProBadge: React.FC<ProBadgeProps> = ({ source, asSpan = false }) => {
    const { t } = useTranslation();
    const openUpgrade = useUpgradeModal((s) => s.open);

    if (asSpan) {
        return (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-foreground/8 font-body text-[8px] font-medium tracking-wider uppercase text-foreground/50 pointer-events-none">
                {t("pro.badge")}
            </span>
        );
    }

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                openUpgrade(source);
            }}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-foreground/8 font-body text-[8px] font-medium tracking-wider uppercase text-foreground/50 hover:bg-foreground/12 transition-colors"
        >
            {t("pro.badge")}
        </button>
    );
};
