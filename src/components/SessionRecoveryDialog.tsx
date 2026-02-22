import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { TimerMode } from "@/hooks/useTimer";

type SessionRecoveryDialogProps = {
    isOpen: boolean;
    onResume: () => void;
    onDiscard: () => void;
    remainingSeconds: number;
    mode: TimerMode;
};

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionRecoveryDialog({ isOpen, onResume, onDiscard, remainingSeconds, mode }: SessionRecoveryDialogProps) {
    const { t } = useTranslation();
    const resumeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) resumeRef.current?.focus();
    }, [isOpen]);

    const modeLabel = mode === "FOCUS" ? t("timer.focus") : mode === "SHORT_BREAK" ? t("timer.shortBreak") : t("timer.longBreak");

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="recovery-title"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="glass-strong rounded-2xl shadow-cozy-lg p-6 max-w-sm w-full mx-4 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <RotateCcw size={16} className="text-foreground/60" />
                            <h3 id="recovery-title" className="font-display text-sm font-medium text-foreground">
                                {t("recovery.title")}
                            </h3>
                        </div>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed">
                            {t("recovery.message")}
                        </p>
                        <div className="flex items-center gap-2 py-1">
                            <span className="font-display text-2xl text-foreground tabular-nums">{formatTime(remainingSeconds)}</span>
                            <span className="font-body text-[10px] text-muted-foreground/50 uppercase tracking-wider">{modeLabel}</span>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={onDiscard}
                                className="px-5 py-2 font-body text-xs font-medium text-muted-foreground/60 rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all inline-flex items-center gap-1.5"
                            >
                                <Trash2 size={12} />
                                {t("recovery.discard")}
                            </button>
                            <button
                                ref={resumeRef}
                                onClick={onResume}
                                className="px-5 py-2 font-body text-xs font-medium bg-foreground/8 text-foreground rounded-xl hover:bg-foreground/12 active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
                            >
                                <RotateCcw size={12} />
                                {t("recovery.resume")}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
