import React from "react";
import { Lock } from "lucide-react";
import { useIsPro } from "@/hooks/useSubscription";
import { useTranslation } from "@/lib/i18n";

type ProGateProps = {
    children: React.ReactNode;
    featureName: string;
};

export const ProGate: React.FC<ProGateProps> = ({ children, featureName }) => {
    const isPro = useIsPro();
    const { t } = useTranslation();

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            <div className="opacity-40 pointer-events-none select-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong">
                    <Lock size={10} className="text-muted-foreground/60" />
                    <span className="font-body text-[10px] font-medium text-muted-foreground/70">
                        {featureName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-foreground/8 font-body text-[8px] font-medium tracking-wider uppercase text-foreground/50">
                        {t("pro.badge")}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const ProBadge: React.FC = () => {
    const { t } = useTranslation();
    return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-foreground/8 font-body text-[8px] font-medium tracking-wider uppercase text-foreground/50">
            {t("pro.badge")}
        </span>
    );
};
