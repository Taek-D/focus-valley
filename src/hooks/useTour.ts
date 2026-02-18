import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TourStep = {
    target: string;
    titleKey: string;
    descKey: string;
    position: "top" | "bottom";
};

export const TOUR_STEPS: TourStep[] = [
    { target: "plant-area", titleKey: "tour.step1Title", descKey: "tour.step1Desc", position: "bottom" },
    { target: "timer-display", titleKey: "tour.step2Title", descKey: "tour.step2Desc", position: "top" },
    { target: "mode-tabs", titleKey: "tour.step3Title", descKey: "tour.step3Desc", position: "top" },
    { target: "category-chips", titleKey: "tour.step4Title", descKey: "tour.step4Desc", position: "top" },
    { target: "sounds-button", titleKey: "tour.step5Title", descKey: "tour.step5Desc", position: "top" },
    { target: "header-icons", titleKey: "tour.step6Title", descKey: "tour.step6Desc", position: "bottom" },
    { target: "shortcuts-hint", titleKey: "tour.step7Title", descKey: "tour.step7Desc", position: "top" },
];

type TourState = {
    hasCompletedTour: boolean;
    isActive: boolean;
    currentStepIndex: number;
    startTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    completeTour: () => void;
};

export const useTour = create<TourState>()(
    persist(
        (set) => ({
            hasCompletedTour: false,
            isActive: false,
            currentStepIndex: 0,
            startTour: () => set({ isActive: true, currentStepIndex: 0 }),
            nextStep: () =>
                set((s) => {
                    const next = s.currentStepIndex + 1;
                    if (next >= TOUR_STEPS.length) {
                        return { isActive: false, currentStepIndex: 0, hasCompletedTour: true };
                    }
                    return { currentStepIndex: next };
                }),
            prevStep: () =>
                set((s) => ({
                    currentStepIndex: Math.max(0, s.currentStepIndex - 1),
                })),
            skipTour: () => set({ isActive: false, currentStepIndex: 0, hasCompletedTour: true }),
            completeTour: () => set({ isActive: false, currentStepIndex: 0, hasCompletedTour: true }),
        }),
        {
            name: "focus-valley-tour",
            partialize: (state) => ({ hasCompletedTour: state.hasCompletedTour }),
        }
    )
);
