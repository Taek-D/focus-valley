import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

type InstallBannerProps = {
    canInstall: boolean;
    onInstall: () => void;
    onDismiss: () => void;
};

export const InstallBanner = memo(function InstallBanner({
    canInstall,
    onInstall,
    onDismiss,
}: InstallBannerProps) {
    return (
        <AnimatePresence>
            {canInstall && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 pt-3 pb-2"
                >
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-foreground/[0.06] backdrop-blur-xl border border-foreground/[0.06] shadow-lg max-w-sm w-full">
                        <Download size={14} className="text-foreground/50 shrink-0" />
                        <span className="font-body text-[11px] text-foreground/60 flex-1">
                            Install Focus Valley for quick access
                        </span>
                        <button
                            onClick={onInstall}
                            className="px-3 py-1.5 rounded-lg bg-foreground/10 text-foreground font-body text-[10px] font-medium tracking-wide uppercase hover:bg-foreground/15 transition-colors shrink-0"
                        >
                            Install
                        </button>
                        <button
                            onClick={onDismiss}
                            className="p-1 rounded-lg text-foreground/25 hover:text-foreground/50 transition-colors shrink-0"
                            aria-label="Dismiss"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
