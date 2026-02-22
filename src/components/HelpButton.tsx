import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type HelpButtonProps = {
    visible: boolean;
    onClick: () => void;
};

export function HelpButton({ visible, onClick }: HelpButtonProps) {
    const { t } = useTranslation();

    if (!visible) return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClick}
            aria-label={t("help.button")}
            className="fixed bottom-4 right-4 z-30 p-2.5 rounded-full glass-strong shadow-cozy text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        >
            <HelpCircle size={16} />
        </motion.button>
    );
}
