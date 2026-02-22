import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, Timer, Sprout, Trophy, Sparkles } from "lucide-react";
import { getPlantComponent } from "./ui/pixel-plants";
import { useTranslation } from "@/lib/i18n";
import type { PlantStage } from "@/hooks/useGarden";

type LandingScreenProps = {
    isOpen: boolean;
    onGetStarted: () => void;
    onTryDemo: () => void;
};

const GROWTH_STAGES: PlantStage[] = ["SEED", "SPROUT", "BUD", "FLOWER", "TREE"];

export function LandingScreen({ isOpen, onGetStarted, onTryDemo }: LandingScreenProps) {
    const { t } = useTranslation();
    const [stageIndex, setStageIndex] = useState(0);

    // Cycle through plant stages for the animation
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setStageIndex((i) => (i + 1) % GROWTH_STAGES.length);
        }, 1200);
        return () => clearInterval(interval);
    }, [isOpen]);

    const PlantComponent = useMemo(
        () => getPlantComponent("DEFAULT", GROWTH_STAGES[stageIndex]),
        [stageIndex],
    );

    const steps = [
        { icon: <Timer size={14} />, text: t("landing.step1") },
        { icon: <Sprout size={14} />, text: t("landing.step2") },
        { icon: <Trophy size={14} />, text: t("landing.step3") },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 bg-background"
                >
                    {/* Grain overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <svg className="w-full h-full" aria-hidden="true">
                            <filter id="landing-grain">
                                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#landing-grain)" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                        {/* Plant animation */}
                        <motion.div
                            className="mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stageIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* eslint-disable-next-line react-hooks/static-components -- lookup table returns stable refs */}
                                    <PlantComponent />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Stage dots */}
                        <div className="flex items-center gap-1.5 mb-8">
                            {GROWTH_STAGES.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        i === stageIndex
                                            ? "w-4 bg-foreground/40"
                                            : i < stageIndex
                                            ? "w-1.5 bg-foreground/20"
                                            : "w-1.5 bg-foreground/8"
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Title */}
                        <motion.h1
                            className="font-display text-2xl font-semibold tracking-tight text-foreground mb-2 text-center"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Focus Valley
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            className="font-body text-[13px] text-muted-foreground/50 text-center mb-8"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {t("landing.tagline")}
                        </motion.p>

                        {/* How it works */}
                        <motion.div
                            className="w-full rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 mb-8"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="font-body text-[10px] font-medium text-muted-foreground/40 tracking-[0.12em] uppercase mb-3">
                                {t("landing.howItWorks")}
                            </div>
                            <div className="space-y-3">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-foreground/5 text-muted-foreground/50">
                                            {step.icon}
                                        </div>
                                        <span className="font-body text-xs text-foreground/60">{step.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Pro pitch */}
                        <motion.div
                            className="flex items-center justify-center gap-1.5 mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                        >
                            <Sparkles size={10} className="text-muted-foreground/35 shrink-0" />
                            <span className="text-[10px] text-muted-foreground/35 font-body text-center">
                                {t("landing.proPitch")}
                            </span>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="w-full space-y-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <button
                                onClick={onGetStarted}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground/8 text-foreground font-body text-[12px] font-medium tracking-wide uppercase hover:bg-foreground/12 transition-all"
                            >
                                {t("landing.getStarted")}
                                <ArrowRight size={14} />
                            </button>
                            <button
                                onClick={onTryDemo}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-muted-foreground/50 font-body text-[11px] tracking-wide hover:text-muted-foreground/70 transition-all"
                            >
                                <Play size={12} />
                                {t("landing.tryDemo")}
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
