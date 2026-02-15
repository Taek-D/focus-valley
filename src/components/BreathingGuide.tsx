import { memo, useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const INHALE_SEC = 4;
const HOLD_SEC = 4;
const EXHALE_SEC = 6;
const TOTAL_CYCLE = INHALE_SEC + HOLD_SEC + EXHALE_SEC;

type Phase = "inhale" | "hold" | "exhale";

type BreathingGuideProps = {
    isOpen: boolean;
    onClose: () => void;
};

function getPhase(time: number): Phase {
    if (time < INHALE_SEC) return "inhale";
    if (time < INHALE_SEC + HOLD_SEC) return "hold";
    return "exhale";
}

function getScale(time: number): number {
    const phase = getPhase(time);
    if (phase === "inhale") {
        const progress = time / INHALE_SEC;
        return 0.6 + progress * 0.4;
    }
    if (phase === "hold") return 1.0;
    const exhaleProgress = (time - INHALE_SEC - HOLD_SEC) / EXHALE_SEC;
    return 1.0 - exhaleProgress * 0.4;
}

export const BreathingGuide = memo(function BreathingGuide({ isOpen, onClose }: BreathingGuideProps) {
    const { t } = useTranslation();
    const [cycleTime, setCycleTime] = useState(0);

    const needsResetRef = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            needsResetRef.current = true;
            return;
        }

        const interval = setInterval(() => {
            setCycleTime((prev) => {
                if (needsResetRef.current) {
                    needsResetRef.current = false;
                    return 0;
                }
                return (prev + 0.1) % TOTAL_CYCLE;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen]);

    const phase = useMemo(() => getPhase(cycleTime), [cycleTime]);
    const scale = useMemo(() => getScale(cycleTime), [cycleTime]);

    const phaseLabel = phase === "inhale"
        ? t("breathing.inhale")
        : phase === "hold"
        ? t("breathing.hold")
        : t("breathing.exhale");

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative flex flex-col items-center gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 rounded-full text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                            aria-label="Close breathing guide"
                        >
                            <X size={16} />
                        </button>

                        {/* Breathing circle */}
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Outer glow ring */}
                            <motion.div
                                animate={{ scale }}
                                transition={{ duration: 0.1, ease: "linear" }}
                                className="absolute w-48 h-48 rounded-full"
                                style={{
                                    background: `radial-gradient(circle, hsl(var(--aurora-1) / 0.15), hsl(var(--aurora-3) / 0.08), transparent 70%)`,
                                }}
                            />

                            {/* Main circle */}
                            <motion.div
                                animate={{ scale }}
                                transition={{ duration: 0.1, ease: "linear" }}
                                className="w-36 h-36 rounded-full glass-strong shadow-cozy-lg"
                                style={{
                                    border: "1px solid hsl(var(--aurora-2) / 0.3)",
                                    background: `radial-gradient(circle at 40% 35%, hsl(var(--aurora-1) / 0.12), hsl(var(--aurora-3) / 0.08), hsl(var(--card) / 0.6))`,
                                }}
                            />

                            {/* Phase label */}
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute font-body text-sm font-light tracking-wider text-foreground/50"
                            >
                                {phaseLabel}
                            </motion.div>
                        </div>

                        {/* Timing hint */}
                        <div className="font-body text-[9px] text-muted-foreground/25 tracking-[0.15em] uppercase">
                            {INHALE_SEC}s · {HOLD_SEC}s · {EXHALE_SEC}s
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
