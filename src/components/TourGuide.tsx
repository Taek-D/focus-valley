import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTour, TOUR_STEPS } from "@/hooks/useTour";
import { useTranslation, type TranslationKey } from "@/lib/i18n";

type Rect = { top: number; left: number; width: number; height: number };

export function TourGuide() {
    const { isActive, currentStepIndex, nextStep, prevStep, skipTour } = useTour();
    const { t } = useTranslation();
    const [targetRect, setTargetRect] = useState<Rect | null>(null);

    const step = TOUR_STEPS[currentStepIndex];

    const measure = useCallback(() => {
        if (!isActive || !step) return;
        const el = document.querySelector(`[data-tour="${step.target}"]`);
        if (!el) {
            // Abort tour gracefully if layout doesn't expose expected targets.
            skipTour();
            return;
        }
        const rect = el.getBoundingClientRect();
        setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, [isActive, step, skipTour]);

    useEffect(() => {
        if (!isActive) return;
        const id = requestAnimationFrame(measure);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure, true);
        };
    }, [isActive, currentStepIndex, measure]);

    // Escape key to close
    useEffect(() => {
        if (!isActive) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") skipTour();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isActive, skipTour]);

    if (!isActive || !step || !targetRect) return null;

    const padding = 8;
    const spotlightTop = targetRect.top - padding;
    const spotlightLeft = targetRect.left - padding;
    const spotlightWidth = targetRect.width + padding * 2;
    const spotlightHeight = targetRect.height + padding * 2;

    // Tooltip positioning
    const tooltipMaxWidth = Math.min(window.innerWidth * 0.85, 320);
    const isLast = currentStepIndex === TOUR_STEPS.length - 1;
    const isFirst = currentStepIndex === 0;

    // Calculate tooltip position
    let tooltipTop: number;
    const tooltipGap = 12;

    if (step.position === "bottom") {
        tooltipTop = spotlightTop + spotlightHeight + tooltipGap;
    } else {
        // Will be set after measuring, but estimate for now
        tooltipTop = spotlightTop - tooltipGap - 160;
    }

    // Clamp tooltip top to viewport
    tooltipTop = Math.max(8, Math.min(tooltipTop, window.innerHeight - 200));

    // Center tooltip horizontally on target, but clamp to viewport
    let tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipMaxWidth / 2;
    tooltipLeft = Math.max(8, Math.min(tooltipLeft, window.innerWidth - tooltipMaxWidth - 8));

    return createPortal(
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-[70]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Spotlight overlay */}
                    <div
                        className="absolute rounded-2xl"
                        style={{
                            top: spotlightTop,
                            left: spotlightLeft,
                            width: spotlightWidth,
                            height: spotlightHeight,
                            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                            pointerEvents: "none",
                        }}
                    />

                    {/* Clickable backdrop to skip */}
                    <div
                        className="absolute inset-0"
                        onClick={skipTour}
                        style={{ zIndex: -1 }}
                    />

                    {/* Tooltip card */}
                    <motion.div
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: step.position === "bottom" ? -8 : 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute glass-strong rounded-2xl shadow-cozy-lg p-5"
                        style={{
                            top: tooltipTop,
                            left: tooltipLeft,
                            width: tooltipMaxWidth,
                        }}
                    >
                        <h3 className="font-body text-sm font-medium text-foreground mb-1.5">
                            {t(step.titleKey as TranslationKey)}
                        </h3>
                        <p className="font-body text-xs text-muted-foreground/70 leading-relaxed mb-4">
                            {t(step.descKey as TranslationKey)}
                        </p>

                        {/* Progress dots */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {TOUR_STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                            i === currentStepIndex
                                                ? "bg-foreground/60 scale-125"
                                                : i < currentStepIndex
                                                  ? "bg-foreground/25"
                                                  : "bg-foreground/10"
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {!isFirst && (
                                    <button
                                        onClick={prevStep}
                                        className="px-3 py-1.5 rounded-xl font-body text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
                                    >
                                        &larr;
                                    </button>
                                )}
                                <button
                                    onClick={skipTour}
                                    className="px-3 py-1.5 rounded-xl font-body text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
                                >
                                    {t("tour.skip" as TranslationKey)}
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-1.5 rounded-xl font-body text-[11px] font-medium bg-foreground/8 text-foreground hover:bg-foreground/12 transition-all"
                                >
                                    {isLast
                                        ? t("tour.finish" as TranslationKey)
                                        : t("tour.next" as TranslationKey)}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
