import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Timer, Music, Sprout, ChevronRight, X } from "lucide-react";
import { useTranslation, type TranslationKey } from "../lib/i18n";

const STORAGE_KEY = "focus-valley-onboarding-done";

const STEPS: { icon: React.ReactNode; titleKey: TranslationKey; descKey: TranslationKey; accent: string }[] = [
    {
        icon: <Leaf size={28} />,
        titleKey: "onboarding.welcome",
        descKey: "onboarding.welcomeDesc",
        accent: "text-emerald-400",
    },
    {
        icon: <Timer size={28} />,
        titleKey: "onboarding.focusGrow",
        descKey: "onboarding.focusGrowDesc",
        accent: "text-cyan-400",
    },
    {
        icon: <Music size={28} />,
        titleKey: "onboarding.sounds",
        descKey: "onboarding.soundsDesc",
        accent: "text-violet-400",
    },
    {
        icon: <Sprout size={28} />,
        titleKey: "onboarding.buildGarden",
        descKey: "onboarding.buildGardenDesc",
        accent: "text-amber-400",
    },
];

type OnboardingProps = {
    isOpen: boolean;
    onComplete: () => void;
};

export function Onboarding({ isOpen, onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const { t } = useTranslation();

    const handleNext = useCallback(() => {
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
        } else {
            localStorage.setItem(STORAGE_KEY, "1");
            onComplete();
        }
    }, [step, onComplete]);

    const handleSkip = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, "1");
        onComplete();
    }, [onComplete]);

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center px-6"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm rounded-3xl border border-foreground/[0.06] bg-background/90 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        {/* Skip */}
                        {!isLast && (
                            <button
                                onClick={handleSkip}
                                className="absolute top-4 right-4 p-2 rounded-xl text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors z-10"
                                aria-label="Skip onboarding"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Content */}
                        <div className="px-8 pt-10 pb-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col items-center text-center"
                                >
                                    {/* Icon */}
                                    <div className={`mb-6 p-4 rounded-2xl bg-foreground/[0.04] ${current.accent}`}>
                                        {current.icon}
                                    </div>

                                    {/* Title */}
                                    <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-3">
                                        {t(current.titleKey)}
                                    </h2>

                                    {/* Description */}
                                    <p className="font-body text-[13px] text-muted-foreground/50 leading-relaxed max-w-[280px]">
                                        {t(current.descKey)}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress dots */}
                            <div className="flex items-center justify-center gap-1.5 mt-8 mb-6">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-300 ${
                                            i === step
                                                ? "w-6 bg-foreground/40"
                                                : i < step
                                                  ? "w-1.5 bg-foreground/20"
                                                  : "w-1.5 bg-foreground/8"
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Action */}
                            <button
                                onClick={handleNext}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground/8 text-foreground font-body text-[12px] font-medium tracking-wide uppercase hover:bg-foreground/12 transition-all"
                            >
                                {isLast ? t("onboarding.getStarted") : t("onboarding.next")}
                                {!isLast && <ChevronRight size={14} />}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function useOnboarding() {
    const [show, setShow] = useState(() => {
        return !localStorage.getItem(STORAGE_KEY);
    });

    const complete = useCallback(() => {
        setShow(false);
    }, []);

    return { showOnboarding: show, completeOnboarding: complete };
}
