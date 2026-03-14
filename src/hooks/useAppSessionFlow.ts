import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playCompletionSound } from "@/lib/notification-sound";
import { ANIMATION, type Category } from "@/lib/constants";
import {
    trackPlantDied,
    trackPlantHarvested,
    trackSeedPlanted,
    trackSessionAbandon,
    trackSessionComplete,
    trackSessionStart,
    trackShareCard,
} from "@/lib/analytics";
import { getToday } from "@/lib/date-utils";
import { getCategoryBreakdown } from "@/lib/stats";
import { getMilestoneById } from "@/lib/milestones";
import { DEEP_FOCUS_UNLOCKS, STREAK_UNLOCKS, useGarden } from "@/hooks/useGarden";
import type { PlantStage, PlantType } from "@/hooks/useGarden";
import { useTimer, type TimerMode } from "@/hooks/useTimer";
import { useTimerSettings } from "@/hooks/useTimerSettings";
import { useNotification } from "@/hooks/useNotification";
import type { TranslationKey } from "@/lib/i18n";

type Translate = (key: TranslationKey) => string;

type ToastAction = {
    label: string;
    onClick: () => void;
};

type ToastState = {
    message: string;
    visible: boolean;
    action?: ToastAction;
};

type UseAppSessionFlowArgs = {
    timer: ReturnType<typeof useTimer>;
    garden: ReturnType<typeof useGarden>;
    activeCategoryId: string;
    autoAdvance: boolean;
    notification: ReturnType<typeof useNotification>;
    categories: Category[];
    locale: string;
    t: Translate;
    syncCurrentUser: () => void | Promise<void>;
};

export function getBreathCycle(isPlantBreathing: boolean, timeLeft: number, focusDuration: number) {
    if (!isPlantBreathing) return 4;
    const totalTime = focusDuration * 60;
    const elapsed = totalTime - timeLeft;
    const progress = Math.min(elapsed / totalTime, 1);
    return 4 + progress * 4;
}

export function getGrowthPercent(isRunning: boolean, mode: TimerMode, timeLeft: number, focusDuration: number) {
    if (!isRunning || mode !== "FOCUS") return undefined;
    const totalTime = focusDuration * 60;
    const elapsed = totalTime - timeLeft;
    return (elapsed / totalTime) * 100;
}

export function getIsBreakActive(isRunning: boolean, mode: TimerMode) {
    return isRunning && (mode === "SHORT_BREAK" || mode === "LONG_BREAK");
}

export function useAppSessionFlow({
    timer,
    garden,
    activeCategoryId,
    autoAdvance,
    notification,
    categories,
    locale,
    t,
    syncCurrentUser,
}: UseAppSessionFlowArgs) {
    const [toast, setToast] = useState<ToastState>({ message: "", visible: false });
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [screenFlash, setScreenFlash] = useState(false);
    const [showSharePrompt, setShowSharePrompt] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [confettiTrigger, setConfettiTrigger] = useState(0);
    const [shouldStartDemoSession, setShouldStartDemoSession] = useState(false);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const undoInfoRef = useRef<{ stage: PlantStage; type: PlantType } | null>(null);
    const demoRestoreFocusRef = useRef<number | null>(null);

    const showToast = useCallback((message: string, action?: ToastAction) => {
        setToast({ message, visible: true, action });
    }, []);

    const closeToast = useCallback(() => {
        setToast((previous) => ({ ...previous, visible: false }));
    }, []);

    const restoreDemoFocusDuration = useCallback(() => {
        const previousFocusDuration = demoRestoreFocusRef.current;
        if (previousFocusDuration !== null) {
            useTimerSettings.getState().setDuration("focus", previousFocusDuration);
            demoRestoreFocusRef.current = null;
        }

        setIsDemoMode(false);
        setShouldStartDemoSession(false);
    }, []);

    const handleAdvanceToNextMode = useCallback(() => {
        timer.advanceToNextMode();
        restoreDemoFocusDuration();
    }, [timer, restoreDemoFocusDuration]);

    const handleSwitchMode = useCallback((newMode: TimerMode) => {
        timer.switchMode(newMode);
        if (newMode !== "FOCUS") {
            restoreDemoFocusDuration();
        }
    }, [timer, restoreDemoFocusDuration]);

    useEffect(() => {
        if (!timer.isRunning || timer.mode !== "FOCUS") return;

        const totalTime = timer.focusDuration * 60;
        const elapsed = totalTime - timer.timeLeft;
        const progress = (elapsed / totalTime) * 100;
        garden.grow(progress);
    }, [timer.timeLeft, timer.isRunning, timer.mode, timer.focusDuration, garden]);

    useEffect(() => {
        if (!timer.isCompleted) return;

        playCompletionSound();

        let flashTimeout: ReturnType<typeof setTimeout> | undefined;
        let shareTimeout: ReturnType<typeof setTimeout> | undefined;
        let syncTimeout: ReturnType<typeof setTimeout> | undefined;

        queueMicrotask(() => {
            setScreenFlash(true);
            flashTimeout = setTimeout(() => setScreenFlash(false), ANIMATION.SCREEN_FLASH_MS);

            if (timer.mode === "FOCUS") {
                garden.addFocusMinutes(timer.focusDuration, activeCategoryId);
                showToast(t("toast.focusComplete"));
                notification.notify("Focus Valley", t("notification.focusComplete"));
                setConfettiTrigger((value) => value + 1);
                trackSessionComplete("FOCUS", timer.focusDuration, activeCategoryId);
                restoreDemoFocusDuration();
                shareTimeout = setTimeout(() => setShowSharePrompt(true), 1500);
                syncTimeout = setTimeout(() => syncCurrentUser(), 1000);
                return;
            }

            showToast(t("toast.breakOver"));
            notification.notify("Focus Valley", t("notification.breakOver"));
            trackSessionComplete(timer.mode, 0);
        });

        return () => {
            if (flashTimeout) clearTimeout(flashTimeout);
            if (shareTimeout) clearTimeout(shareTimeout);
            if (syncTimeout) clearTimeout(syncTimeout);
        };
    }, [
        timer.isCompleted,
        timer.mode,
        timer.focusDuration,
        garden,
        activeCategoryId,
        showToast,
        notification,
        t,
        restoreDemoFocusDuration,
        syncCurrentUser,
    ]);

    useEffect(() => {
        if (!timer.isCompleted || !autoAdvance || showSharePrompt) return;

        const timeout = setTimeout(() => {
            handleAdvanceToNextMode();
        }, ANIMATION.AUTO_ADVANCE_DELAY_MS);

        return () => clearTimeout(timeout);
    }, [timer.isCompleted, autoAdvance, showSharePrompt, handleAdvanceToNextMode]);

    useEffect(() => {
        if (!garden.pendingUnlock) return;

        const unlock = STREAK_UNLOCKS.find((entry) => entry.plant === garden.pendingUnlock)
            ?? DEEP_FOCUS_UNLOCKS.find((entry) => entry.plant === garden.pendingUnlock);
        garden.clearPendingUnlock();

        if (unlock) {
            const name = t(`plantType.${unlock.plant}` as TranslationKey);
            queueMicrotask(() => showToast(`${t("toast.unlocked")} ${name}!`));
        }
    }, [garden, showToast, t]);

    useEffect(() => {
        if (!garden.pendingMilestone) return;

        const milestone = getMilestoneById(garden.pendingMilestone);
        garden.clearPendingMilestone();

        if (milestone) {
            const name = t(milestone.titleKey);
            queueMicrotask(() => showToast(`${milestone.icon} ${t("milestone.earned")} ${name}`));
        }
    }, [garden, showToast, t]);

    useEffect(() => {
        if (!showSharePrompt) return;

        const timeout = setTimeout(() => setShowSharePrompt(false), 8000);
        return () => clearTimeout(timeout);
    }, [showSharePrompt]);

    useEffect(() => {
        return () => {
            if (undoTimerRef.current) {
                clearTimeout(undoTimerRef.current);
            }
        };
    }, []);

    const handleStart = useCallback(() => {
        void notification.requestPermission();
        timer.start();
        setShowSharePrompt(false);
        trackSessionStart(timer.mode, timer.focusDuration, activeCategoryId);
    }, [notification, timer, activeCategoryId]);

    const handleReset = useCallback(() => {
        if (timer.isRunning && timer.mode === "FOCUS") {
            setConfirmModalOpen(true);
            return;
        }

        timer.reset();
        restoreDemoFocusDuration();
    }, [timer, restoreDemoFocusDuration]);

    const closeConfirmModal = useCallback(() => {
        setConfirmModalOpen(false);
    }, []);

    const confirmGiveUp = useCallback(() => {
        const elapsed = timer.totalDuration - timer.timeLeft;
        trackSessionAbandon(timer.mode, elapsed);
        trackPlantDied(garden.type);

        undoInfoRef.current = { stage: garden.stage, type: garden.type };

        garden.killPlant();
        timer.reset();
        restoreDemoFocusDuration();
        setConfirmModalOpen(false);

        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

        showToast(t("toast.plantDied"), {
            label: t("toast.undo"),
            onClick: () => {
                if (undoInfoRef.current) {
                    garden.setStage(undoInfoRef.current.stage);
                    garden.setType(undoInfoRef.current.type);
                    undoInfoRef.current = null;
                }

                if (undoTimerRef.current) {
                    clearTimeout(undoTimerRef.current);
                    undoTimerRef.current = null;
                }
            },
        });

        undoTimerRef.current = setTimeout(() => {
            undoInfoRef.current = null;
            undoTimerRef.current = null;
        }, 5000);
    }, [timer, garden, restoreDemoFocusDuration, showToast, t]);

    const handlePlantClick = useCallback(() => {
        if (garden.stage === "TREE") {
            trackPlantHarvested(garden.type);
            garden.harvest();
            timer.reset();
            restoreDemoFocusDuration();
            showToast(t("toast.harvested"));
            return;
        }

        if (garden.stage === "DEAD") {
            trackSeedPlanted(garden.type);
            garden.plantSeed();
            showToast(t("toast.newSeed"));
        }
    }, [garden, timer, restoreDemoFocusDuration, showToast, t]);

    const handleToggle = useCallback(() => {
        if (timer.isCompleted) return;
        if (timer.isRunning) {
            timer.pause();
            return;
        }
        handleStart();
    }, [timer, handleStart]);

    const startDemoMode = useCallback(() => {
        const settingsStore = useTimerSettings.getState();
        demoRestoreFocusRef.current = settingsStore.focus === 3 ? null : settingsStore.focus;
        settingsStore.setDuration("focus", 3);
        setIsDemoMode(true);
        setShouldStartDemoSession(true);
    }, []);

    const handleEndDemo = useCallback(() => {
        setShowSharePrompt(false);
        timer.reset();
        restoreDemoFocusDuration();
    }, [timer, restoreDemoFocusDuration]);

    useEffect(() => {
        if (!shouldStartDemoSession || timer.isRunning) return;

        if (timer.mode !== "FOCUS" || timer.timeLeft !== 180) {
            const timeout = window.setTimeout(() => {
                handleSwitchMode("FOCUS");
            }, 0);

            return () => window.clearTimeout(timeout);
        }

        const timeout = window.setTimeout(() => {
            handleStart();
            showToast(t("landing.demoToast"));
            setShouldStartDemoSession(false);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [shouldStartDemoSession, timer.isRunning, timer.mode, timer.timeLeft, handleSwitchMode, handleStart, showToast, t]);

    const handlePostSessionShare = useCallback(async () => {
        setShowSharePrompt(false);
        const today = new Intl.DateTimeFormat(locale, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date());
        const todayKey = getToday();
        const todaySessions = garden.focusSessions.filter((session) => session.date === todayKey);
        const todayMinutes = todaySessions.reduce((sum, session) => sum + session.minutes, 0);
        const todayBreakdown = getCategoryBreakdown(todaySessions, categories);
        const { generateShareCard, shareOrDownload } = await import("@/lib/share-card");

        const blob = await generateShareCard({
            date: today,
            totalMinutes: todayMinutes,
            streak: garden.currentStreak,
            categoryBreakdown: todayBreakdown,
            plantCount: garden.history.length,
        }, "aurora", {
            brand: t("app.name").toUpperCase(),
            focusedToday: t("share.cardFocusedToday"),
            streak: t("share.cardStreak"),
            grown: t("share.cardGrown"),
            watermark: t("share.cardWatermark"),
        });

        await shareOrDownload(blob, `focus-valley-${todayKey}.png`, {
            title: t("app.name"),
            text: t("share.shareText"),
        });
        trackShareCard();
    }, [garden.focusSessions, garden.currentStreak, garden.history.length, categories, locale, t]);

    const canInteract = garden.stage === "TREE" || garden.stage === "DEAD";
    const isPlantBreathing = timer.isRunning && timer.mode === "FOCUS";
    const breathCycle = useMemo(
        () => getBreathCycle(isPlantBreathing, timer.timeLeft, timer.focusDuration),
        [isPlantBreathing, timer.timeLeft, timer.focusDuration],
    );

    const growthPercent = useMemo(
        () => getGrowthPercent(timer.isRunning, timer.mode, timer.timeLeft, timer.focusDuration),
        [timer.isRunning, timer.mode, timer.timeLeft, timer.focusDuration],
    );

    const isBreakActive = getIsBreakActive(timer.isRunning, timer.mode);

    return {
        toast,
        closeToast,
        confirmModalOpen,
        closeConfirmModal,
        confirmGiveUp,
        screenFlash,
        showSharePrompt,
        handlePostSessionShare,
        confettiTrigger,
        isDemoMode,
        canInteract,
        isPlantBreathing,
        breathCycle,
        growthPercent,
        isBreakActive,
        handleAdvanceToNextMode,
        handleSwitchMode,
        handleStart,
        handleReset,
        handlePlantClick,
        handleToggle,
        startDemoMode,
        handleEndDemo,
    };
}

export type AppSessionFlow = ReturnType<typeof useAppSessionFlow>;
