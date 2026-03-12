import { useEffect, useState, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer, type TimerMode } from "./hooks/useTimer";
import { useAudioMixer } from "./hooks/useAudioMixer";
import { useAudioReactivity } from "./hooks/useAudioReactivity";
import { useGarden, STREAK_UNLOCKS, DEEP_FOCUS_UNLOCKS } from "./hooks/useGarden";
import type { PlantStage, PlantType } from "./hooks/useGarden";
import { useDarkMode } from "./hooks/useDarkMode";
import { useNotification } from "./hooks/useNotification";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { useTimerSettings } from "./hooks/useTimerSettings";
import { useTodos } from "./hooks/useTodos";
import { usePlantParticles } from "./hooks/usePlantParticles";
import { useCategoryStore } from "./hooks/useCategories";
import { useWeather } from "./hooks/useWeather";
import { playCompletionSound } from "./lib/notification-sound";
import { ANIMATION } from "./lib/constants";
import {
  trackSessionStart,
  trackSessionComplete,
  trackSessionAbandon,
  trackPlantHarvested,
  trackPlantDied,
  trackSeedPlanted,
  trackShareCard,
  trackSyncResult,
  trackReloadPromptShown,
  trackRecoveryChoice,
} from "./lib/analytics";
import { generateShareCard, shareOrDownload } from "./lib/share-card";
import { getCategoryBreakdown } from "./lib/stats";
import { getToday } from "./lib/date-utils";
import { syncWithCloud, type SyncResult } from "./lib/sync";
import { useTranslation, type TranslationKey } from "./lib/i18n";
import { getMilestoneById } from "./lib/milestones";
import { TimerDisplay } from "./components/TimerDisplay";
import { Toast } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { CategoryChips } from "./components/CategoryChips";
import { Confetti } from "./components/Confetti";
import { Fireflies } from "./components/Fireflies";
import { AuroraBlob } from "./components/AuroraBlob";
import { AppHeader } from "./components/AppHeader";
import { PlantGarden } from "./components/PlantGarden";
import { BreathingGuide } from "./components/BreathingGuide";
import { AuthModal } from "./components/AuthModal";
import { UpgradeModal } from "./components/UpgradeModal";
import { InstallBanner } from "./components/InstallBanner";
import { TourGuide } from "./components/TourGuide";
import { SessionRecoveryDialog } from "./components/SessionRecoveryDialog";
import { HelpButton } from "./components/HelpButton";
import { WeeklySummaryPopup } from "./components/WeeklySummaryPopup";
import { useWeeklySummary } from "./hooks/useWeeklySummary";
import { LandingScreen } from "./components/LandingScreen";
import { useLanding } from "./hooks/useLanding";
import { useAuth } from "./hooks/useAuth";
import { useSubscription } from "./hooks/useSubscription";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useSyncFeedback } from "./hooks/useSyncFeedback";
import { useTour } from "./hooks/useTour";
import { Volume2, ChevronDown, ChevronUp, Wind, BookOpen, Navigation, Share2, X } from "lucide-react";
import type { TodoState } from "./hooks/useTodos";

const AudioMixer = lazy(() =>
  import("./components/AudioMixer").then((m) => ({ default: m.AudioMixer }))
);
const HistoryPanel = lazy(() =>
  import("./components/HistoryPanel").then((m) => ({ default: m.HistoryPanel }))
);
const GardenCollection = lazy(() =>
  import("./components/GardenCollection").then((m) => ({ default: m.GardenCollection }))
);
const TimerSettings = lazy(() =>
  import("./components/TimerSettings").then((m) => ({ default: m.TimerSettings }))
);
const TodoPanel = lazy(() =>
  import("./components/TodoPanel").then((m) => ({ default: m.TodoPanel }))
);
const ShortcutGuide = lazy(() =>
  import("./components/ShortcutGuide").then((m) => ({ default: m.ShortcutGuide }))
);

// Module-level Zustand selectors — stable reference across renders
const selectActiveCategoryId = (s: { activeCategoryId: string }) => s.activeCategoryId;

const selectActiveTodo = (s: TodoState) => {
    if (!s.activeTodoId) return null;
    return s.todos.find((t) => t.id === s.activeTodoId && !t.completed) ?? null;
};

function App() {
  const timer = useTimer();
  const mixer = useAudioMixer();
  const audioIntensity = useAudioReactivity(mixer.analyserRef);
  const garden = useGarden();
  const { grow, addFocusMinutes, clearPendingUnlock, clearPendingMilestone } = garden;
  const weather = useWeather();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const notification = useNotification();
  const { notify } = notification;
  const { autoAdvance } = useTimerSettings();
  const activeTodo = useTodos(selectActiveTodo);
  const activeCategoryId = useCategoryStore(selectActiveCategoryId);
  const { user, initialize: initAuth } = useAuth();
  const beginSyncFeedback = useSyncFeedback((state) => state.begin);
  const finishSyncFeedback = useSyncFeedback((state) => state.finish);
  const clearSyncFeedback = useSyncFeedback((state) => state.clear);
  const syncFeedback = useSyncFeedback((state) => state.lastResult);
  const syncInFlight = useSyncFeedback((state) => state.syncing);
  const refreshSubscription = useSubscription((s) => s.refresh);
  const { canInstall, install: installPwa, dismiss: dismissInstall } = useInstallPrompt();
  const { showWeeklySummary, dismissWeeklySummary } = useWeeklySummary();
  const { showLanding, dismissLanding } = useLanding();
  const { startTour, isActive: isTourActive } = useTour();
  const { t } = useTranslation();

  const [showMixer, setShowMixer] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTodo, setShowTodo] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [toast, setToast] = useState<{ message: string; visible: boolean; action?: { label: string; onClick: () => void } }>({ message: "", visible: false });
  const [confirmModal, setConfirmModal] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Undo plant death
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoInfoRef = useRef<{ stage: PlantStage; type: PlantType } | null>(null);
  const demoRestoreFocusRef = useRef<number | null>(null);
  const [shouldStartDemoSession, setShouldStartDemoSession] = useState(false);
  const autoSyncUserRef = useRef<string | null>(null);

  // Plant particles — extracted hook
  const { trigger: particleTrigger, type: particleType, stageTransition } = usePlantParticles(garden.stage);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.webdriver) return;

    const handleE2ESyncFeedback = (event: Event) => {
      const detail = (event as CustomEvent<SyncResult | null>).detail;
      if (detail) {
        finishSyncFeedback(detail);
      } else {
        clearSyncFeedback();
      }
    };

    window.addEventListener("focus-valley:e2e-sync-feedback", handleE2ESyncFeedback as EventListener);
    return () => {
      window.removeEventListener("focus-valley:e2e-sync-feedback", handleE2ESyncFeedback as EventListener);
    };
  }, [finishSyncFeedback, clearSyncFeedback]);

  // Load subscription state from server-side source of truth
  useEffect(() => {
    void refreshSubscription(user);
  }, [user, refreshSubscription]);

  // Auto-sync on login, but never force a reload mid-session.
  useEffect(() => {
    if (!user) {
      autoSyncUserRef.current = null;
      return;
    }
    if (autoSyncUserRef.current === user.id) return;

    autoSyncUserRef.current = user.id;
    beginSyncFeedback();
    void syncWithCloud(user).then((result) => {
      finishSyncFeedback(result);
      trackSyncResult(result.outcome, result.requiresReload);
      if (result.requiresReload) {
        trackReloadPromptShown();
      }
    });
  }, [user, beginSyncFeedback, finishSyncFeedback]);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", timer.mode);
  }, [timer.mode]);

  // Set seasonal theme
  useEffect(() => {
    const month = new Date().getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = "spring";
    else if (month >= 5 && month <= 7) season = "summer";
    else if (month >= 8 && month <= 10) season = "autumn";
    else season = "winter";
    document.documentElement.setAttribute("data-season", season);
  }, []);

  // Set weather theme (only during FOCUS)
  useEffect(() => {
    if (weather.loaded && timer.mode === "FOCUS") {
      document.documentElement.setAttribute("data-weather", weather.mood);
    } else {
      document.documentElement.removeAttribute("data-weather");
    }
  }, [weather.loaded, weather.mood, timer.mode]);

  // Set deep focus tier
  useEffect(() => {
    const depth = garden.deepFocusStreak;
    if (depth >= 4) {
      document.documentElement.setAttribute("data-deep", "2");
    } else if (depth >= 2) {
      document.documentElement.setAttribute("data-deep", "1");
    } else {
      document.documentElement.removeAttribute("data-deep");
    }
  }, [garden.deepFocusStreak]);

  // Breathing guide auto-closes when break ends (derived from isBreakActive)

  const showToast = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    setToast({ message, visible: true, action });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
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
    if (timer.isRunning && timer.mode === "FOCUS") {
      const totalTime = timer.focusDuration * 60;
      const elapsed = totalTime - timer.timeLeft;
      const progress = (elapsed / totalTime) * 100;
      grow(progress);
    }
  }, [timer.timeLeft, timer.isRunning, timer.mode, timer.focusDuration, grow]);

  useEffect(() => {
    if (!timer.isCompleted) return;
    playCompletionSound();

    queueMicrotask(() => {
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), ANIMATION.SCREEN_FLASH_MS);

      if (timer.mode === "FOCUS") {
        addFocusMinutes(timer.focusDuration, activeCategoryId);
        showToast(t("toast.focusComplete"));
        notify("Focus Valley", t("notification.focusComplete"));
        setConfettiTrigger((c) => c + 1);
        trackSessionComplete("FOCUS", timer.focusDuration, activeCategoryId);
        restoreDemoFocusDuration();
        // Show share prompt after confetti settles
        setTimeout(() => setShowSharePrompt(true), 1500);
        // Background cloud sync after focus completion
        if (user) {
          setTimeout(() => {
            beginSyncFeedback();
            void syncWithCloud(user).then((result) => {
              finishSyncFeedback(result);
              trackSyncResult(result.outcome, result.requiresReload);
              if (result.requiresReload) {
                trackReloadPromptShown();
              }
            });
          }, 1000);
        }
      } else {
        showToast(t("toast.breakOver"));
        notify("Focus Valley", t("notification.breakOver"));
        trackSessionComplete(timer.mode, 0);
      }
    });
  }, [timer.isCompleted, timer.mode, timer.focusDuration, showToast, addFocusMinutes, notify, activeCategoryId, t, user, restoreDemoFocusDuration, beginSyncFeedback, finishSyncFeedback]);

  // Auto-advance to next mode after completion (wait for share prompt to dismiss)
  useEffect(() => {
    if (!timer.isCompleted || !autoAdvance || showSharePrompt) return;
    const timeout = setTimeout(() => {
      handleAdvanceToNextMode();
    }, ANIMATION.AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [timer.isCompleted, autoAdvance, handleAdvanceToNextMode, showSharePrompt]);

  useEffect(() => {
    if (!garden.pendingUnlock) return;
    const unlock = STREAK_UNLOCKS.find((u) => u.plant === garden.pendingUnlock)
      ?? DEEP_FOCUS_UNLOCKS.find((u) => u.plant === garden.pendingUnlock);
    clearPendingUnlock();
    if (unlock) {
      const name = t(`plantType.${unlock.plant}` as TranslationKey);
      queueMicrotask(() => showToast(`${t("toast.unlocked")} ${name}!`));
    }
  }, [garden.pendingUnlock, clearPendingUnlock, showToast, t]);

  useEffect(() => {
    if (!garden.pendingMilestone) return;
    const milestone = getMilestoneById(garden.pendingMilestone);
    clearPendingMilestone();
    if (milestone) {
      const name = t(milestone.titleKey);
      queueMicrotask(() => showToast(`${milestone.icon} ${t("milestone.earned")} ${name}`));
    }
  }, [garden.pendingMilestone, clearPendingMilestone, showToast, t]);

  const handleStart = useCallback(() => {
    notification.requestPermission();
    timer.start();
    setShowSharePrompt(false);
    trackSessionStart(timer.mode, timer.focusDuration, activeCategoryId);
  }, [notification, timer, activeCategoryId]);

  const handleReset = () => {
    if (timer.isRunning && timer.mode === "FOCUS") {
      setConfirmModal(true);
    } else {
      timer.reset();
      restoreDemoFocusDuration();
    }
  };

  const confirmGiveUp = () => {
    const elapsed = timer.totalDuration - timer.timeLeft;
    trackSessionAbandon(timer.mode, elapsed);
    trackPlantDied(garden.type);

    // Save current plant info for undo
    const savedStage = garden.stage;
    const savedType = garden.type;
    undoInfoRef.current = { stage: savedStage, type: savedType };

    garden.killPlant();
    timer.reset();
    restoreDemoFocusDuration();
    setConfirmModal(false);

    // Clear any previous undo timer
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

    // Auto-clear undo after 5 seconds
    undoTimerRef.current = setTimeout(() => {
      undoInfoRef.current = null;
      undoTimerRef.current = null;
    }, 5000);
  };

  const handlePlantClick = () => {
    if (garden.stage === "TREE") {
      trackPlantHarvested(garden.type);
      garden.harvest();
      timer.reset();
      restoreDemoFocusDuration();
      showToast(t("toast.harvested"));
    } else if (garden.stage === "DEAD") {
      trackSeedPlanted(garden.type);
      garden.plantSeed();
      showToast(t("toast.newSeed"));
    }
  };

  const handleToggle = useCallback(() => {
    if (timer.isCompleted) return;
    if (timer.isRunning) {
      timer.pause();
    } else {
      handleStart();
    }
  }, [timer, handleStart]);

  const handleLandingGetStarted = useCallback(() => {
    dismissLanding();
  }, [dismissLanding]);

  const handleLandingDemo = useCallback(() => {
    dismissLanding();
    const settingsStore = useTimerSettings.getState();
    demoRestoreFocusRef.current = settingsStore.focus === 3 ? null : settingsStore.focus;
    settingsStore.setDuration("focus", 3);
    setIsDemoMode(true);
    setShouldStartDemoSession(true);
  }, [dismissLanding]);

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

  // Share prompt: auto-dismiss after 8s
  useEffect(() => {
    if (!showSharePrompt) return;
    const timeout = setTimeout(() => setShowSharePrompt(false), 8000);
    return () => clearTimeout(timeout);
  }, [showSharePrompt]);

  const categories = useCategoryStore((s) => s.categories);

  const handlePostSessionShare = useCallback(async () => {
    setShowSharePrompt(false);
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    const todayKey = getToday();
    const todaySessions = garden.focusSessions.filter((s) => s.date === todayKey);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
    const todayBreakdown = getCategoryBreakdown(todaySessions, categories);

    const blob = await generateShareCard({
      date: today,
      totalMinutes: todayMinutes,
      streak: garden.currentStreak,
      categoryBreakdown: todayBreakdown,
      plantCount: garden.history.length,
    });

    await shareOrDownload(blob, `focus-valley-${todayKey}.png`);
    trackShareCard();
  }, [garden.focusSessions, garden.currentStreak, garden.history.length, categories]);

  const handleToggleMixer = useCallback(() => {
    setShowMixer((v) => !v);
  }, []);

  const handleToggleShortcutGuide = useCallback(() => {
    setShowShortcuts((v) => !v);
  }, []);

  useKeyboardShortcuts({
    isRunning: timer.isRunning,
    isCompleted: timer.isCompleted,
    onToggle: handleToggle,
    onReset: handleReset,
    onSkip: handleAdvanceToNextMode,
    onSwitchMode: handleSwitchMode,
    onToggleMixer: handleToggleMixer,
    onToggleShortcutGuide: handleToggleShortcutGuide,
  });

  useDocumentTitle({
    timeLeft: timer.timeLeft,
    totalDuration: timer.totalDuration,
    isRunning: timer.isRunning,
    isCompleted: timer.isCompleted,
    mode: timer.mode,
  });

  // Warn before unload during FOCUS sessions
  useEffect(() => {
    if (!timer.isRunning || timer.mode !== "FOCUS") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [timer.isRunning, timer.mode]);

  const canInteract = garden.stage === "TREE" || garden.stage === "DEAD";

  // Plant breathing: active during FOCUS + running, cycle slows as progress increases
  const isPlantBreathing = timer.isRunning && timer.mode === "FOCUS";
  const breathCycle = useMemo(() => {
    if (!isPlantBreathing) return 4;
    const totalTime = timer.focusDuration * 60;
    const elapsed = totalTime - timer.timeLeft;
    const progress = Math.min(elapsed / totalTime, 1);
    return 4 + progress * 4; // 4s → 8s
  }, [isPlantBreathing, timer.timeLeft, timer.focusDuration]);

  // Growth percentage for plant progress bar
  const growthPercent = useMemo(() => {
    if (!timer.isRunning || timer.mode !== "FOCUS") return undefined;
    const totalTime = timer.focusDuration * 60;
    const elapsed = totalTime - timer.timeLeft;
    return (elapsed / totalTime) * 100;
  }, [timer.isRunning, timer.mode, timer.timeLeft, timer.focusDuration]);

  // Is it break mode and timer running?
  const isBreakActive = timer.isRunning && (timer.mode === "SHORT_BREAK" || timer.mode === "LONG_BREAK");

  // Stable callbacks for AppHeader
  const handleShowSettings = useCallback(() => setShowSettings(true), []);
  const handleShowTodo = useCallback(() => setShowTodo(true), []);
  const handleShowGarden = useCallback(() => setShowGarden(true), []);
  const handleShowHistory = useCallback(() => setShowHistory(true), []);
  const handleShowAuth = useCallback(() => setShowAuth(true), []);

  const syncIndicatorState = useMemo(() => {
    if (syncInFlight) return "syncing" as const;
    if (syncFeedback?.outcome === "error") return "error" as const;
    if (syncFeedback?.requiresReload) return "warning" as const;
    if (syncFeedback) return "ok" as const;
    return "idle" as const;
  }, [syncFeedback, syncInFlight]);

  const syncIndicatorLabel = useMemo(() => {
    if (syncInFlight) return t("sync.syncing");
    if (!syncFeedback) return undefined;
    if (syncFeedback.outcome === "error") return t("sync.failed");
    if (syncFeedback.requiresReload) return t("sync.reloadRequired");
    if (syncFeedback.outcome === "noop") return t("sync.upToDate");
    return syncFeedback.outcome === "merged" ? t("sync.merged")
      : syncFeedback.outcome === "pulled" ? t("sync.pulled")
      : t("sync.pushed");
  }, [syncFeedback, syncInFlight, t]);

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden transition-colors duration-700 dot-grid">
      <InstallBanner canInstall={canInstall} onInstall={installPwa} onDismiss={dismissInstall} />

      {/* Grain */}
      <svg className="grain-overlay" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <Fireflies />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[4]"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 50%, hsl(var(--background) / 0.4) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Screen Flash */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.06 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-foreground z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AppHeader
        isDark={isDark}
        currentStreak={garden.currentStreak}
        user={user}
        syncState={syncIndicatorState}
        syncLabel={syncIndicatorLabel}
        onToggleDark={toggleDark}
        onShowSettings={handleShowSettings}
        onShowTodo={handleShowTodo}
        onShowGarden={handleShowGarden}
        onShowHistory={handleShowHistory}
        onShowAuth={handleShowAuth}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative z-10 px-4 sm:px-6">
        <AuroraBlob audioIntensity={audioIntensity} />

        <PlantGarden
          gardenType={garden.type}
          gardenStage={garden.stage}
          canInteract={canInteract}
          onPlantClick={handlePlantClick}
          activeTodo={activeTodo}
          stageTransition={stageTransition}
          particleTrigger={particleTrigger}
          particleType={particleType}
          breathCycle={breathCycle}
          isBreathing={isPlantBreathing}
          growthPercent={growthPercent}
        />

        {/* Category Chips */}
        <div className="z-10 w-full mb-2">
          <CategoryChips />
        </div>

        {/* Deep Focus Badge + Breathing Button */}
        <div className="z-10 flex items-center gap-3 mb-2">
          {isDemoMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              data-testid="demo-badge"
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1"
            >
              <span className="text-[10px] font-body font-medium uppercase tracking-[0.08em] text-sky-700/80 dark:text-sky-300/80">
                {t("demo.badge")}
              </span>
              <span className="text-[10px] font-body text-sky-700/60 dark:text-sky-300/60">
                {t("demo.restoreNote")}
              </span>
              <button
                onClick={handleEndDemo}
                data-testid="demo-end"
                className="rounded-full p-1 text-sky-700/70 transition-colors hover:text-sky-900 dark:text-sky-200/80 dark:hover:text-sky-100"
                aria-label={t("demo.end")}
              >
                <X size={10} />
              </button>
            </motion.div>
          )}
          {garden.deepFocusStreak >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20"
            >
              <span className="text-[10px] font-body font-medium tracking-[0.08em] uppercase text-amber-600/70 dark:text-amber-400/70">
                {t("deepFocus.badge")} x{garden.deepFocusStreak}
              </span>
            </motion.div>
          )}
          {isBreakActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowBreathing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/8 hover:border-foreground/15 transition-colors"
            >
              <Wind size={10} className="text-muted-foreground/40" />
              <span className="text-[10px] font-body font-medium tracking-[0.08em] uppercase text-muted-foreground/40">
                {t("breathing.start")}
              </span>
            </motion.button>
          )}
        </div>

        {/* Timer */}
        <motion.div
          className="z-10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TimerDisplay
            timeLeft={timer.timeLeft}
            totalDuration={timer.totalDuration}
            isRunning={timer.isRunning}
            isCompleted={timer.isCompleted}
            mode={timer.mode}
            focusCount={timer.focusCount}
            onStart={handleStart}
            onPause={timer.pause}
            onReset={handleReset}
            onSwitchMode={handleSwitchMode}
            onSkip={handleAdvanceToNextMode}
          />
        </motion.div>
      </main>

      {/* Post-session share prompt */}
      <AnimatePresence>
        {showSharePrompt && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={handlePostSessionShare}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground/8 border border-foreground/[0.06] backdrop-blur-sm hover:bg-foreground/12 transition-colors"
          >
            <Share2 size={14} className="text-foreground/60" />
            <span className="font-body text-[12px] font-medium text-foreground/70">
              {t("share.todayRecord")}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {syncFeedback?.requiresReload && !timer.isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            data-testid="sync-reload-banner"
            className="fixed bottom-6 left-1/2 z-30 flex w-[min(92vw,28rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-background/90 px-4 py-3 shadow-cozy-lg backdrop-blur-sm"
          >
            <div className="space-y-1">
              <p className="font-body text-[11px] font-medium text-foreground/70">{t("sync.reloadRequired")}</p>
              <p className="font-body text-[10px] text-muted-foreground/45">{t("sync.reloadHint")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => clearSyncFeedback()}
                className="font-body text-[10px] uppercase tracking-[0.08em] text-muted-foreground/45 transition-colors hover:text-foreground/60"
              >
                {t("category.dismissHint")}
              </button>
              <button
                onClick={() => window.location.reload()}
                data-testid="sync-reload-button"
                className="rounded-xl bg-foreground/8 px-3 py-2 font-body text-[10px] font-medium uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:bg-foreground/12"
              >
                {t("settings.reloadToApply")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full max-w-lg z-10 px-4 sm:px-6 pb-4 pt-2">
        <motion.button
          onClick={() => setShowMixer(!showMixer)}
          aria-expanded={showMixer}
          aria-label={showMixer ? t("footer.hideSounds") : t("footer.openSounds")}
          data-tour="sounds-button"
          data-testid="sound-toggle"
          className="w-full py-2.5 flex items-center justify-center gap-2 font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Volume2 size={11} className="opacity-50" />
          {t("footer.sounds")}
          {showMixer ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
        </motion.button>

        <AnimatePresence>
          {showMixer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pb-6 flex justify-center">
                <Suspense fallback={
                  <div className="h-48 w-full max-w-lg flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-foreground/10 border-t-foreground/30 animate-spin" />
                      <span className="font-body text-[10px] tracking-[0.1em] uppercase text-muted-foreground/30">{t("footer.loadingSounds")}</span>
                    </div>
                  </div>
                }>
                  <AudioMixer mixer={mixer} />
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3 py-2" data-tour="shortcuts-hint">
          <a href="/guide.html" target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors">
            <BookOpen size={8} />
            {t("footer.guide")}
          </a>
          <span className="text-muted-foreground/10 text-[9px]">&middot;</span>
          <button
            onClick={startTour}
            className="inline-flex items-center gap-1 font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors"
          >
            <Navigation size={8} />
            {t("footer.tour")}
          </button>
          <span className="text-muted-foreground/10 text-[9px]">&middot;</span>
          <a href="/privacy.html" target="_blank" rel="noopener" className="font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors">
            {t("footer.privacy")}
          </a>
          <span className="text-muted-foreground/10 text-[9px]">&middot;</span>
          <a href="/terms.html" target="_blank" rel="noopener" className="font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors">
            {t("footer.terms")}
          </a>
        </div>
      </footer>

      {/* Overlays */}
      <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} action={toast.action} duration={toast.action ? 5000 : 3000} />

      <ConfirmModal
        isOpen={confirmModal}
        title={t("confirm.giveUpTitle")}
        message={t("confirm.giveUpMessage")}
        confirmLabel={t("confirm.giveUp")}
        cancelLabel={t("confirm.keepGoing")}
        onConfirm={confirmGiveUp}
        onCancel={() => setConfirmModal(false)}
      />

      <Suspense>
        {showHistory && (
          <HistoryPanel
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            history={garden.history}
            totalFocusMinutes={garden.totalFocusMinutes}
            focusSessions={garden.focusSessions}
            currentStreak={garden.currentStreak}
            bestStreak={garden.bestStreak}
          />
        )}

        {showGarden && (
          <GardenCollection
            isOpen={showGarden}
            onClose={() => setShowGarden(false)}
            history={garden.history}
            unlockedPlants={garden.unlockedPlants}
            currentStreak={garden.currentStreak}
            bestStreak={garden.bestStreak}
            deepFocusStreak={garden.deepFocusStreak}
          />
        )}

        {showSettings && (
          <TimerSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showTodo && (
          <TodoPanel
            isOpen={showTodo}
            onClose={() => setShowTodo(false)}
          />
        )}

        {showShortcuts && (
          <ShortcutGuide
            isOpen={showShortcuts}
            onClose={() => setShowShortcuts(false)}
          />
        )}
      </Suspense>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />

      <BreathingGuide isOpen={isBreakActive && showBreathing} onClose={() => setShowBreathing(false)} />

      <Confetti trigger={confettiTrigger} />

      <SessionRecoveryDialog
        isOpen={timer.needsRecoveryPrompt}
        onResume={() => {
          trackRecoveryChoice("resume");
          timer.confirmResume();
        }}
        onDiscard={() => {
          trackRecoveryChoice("discard");
          timer.discardRecovery();
        }}
        remainingSeconds={timer.timeLeft}
        mode={timer.mode}
      />

      <WeeklySummaryPopup
        isOpen={showWeeklySummary && !showLanding}
        onDismiss={dismissWeeklySummary}
        focusSessions={garden.focusSessions}
      />

      <TourGuide />

      <LandingScreen
        isOpen={showLanding}
        onGetStarted={handleLandingGetStarted}
        onTryDemo={handleLandingDemo}
      />

      <UpgradeModal />

      <HelpButton
        visible={!showLanding && !isTourActive}
        onClick={startTour}
      />
    </div>
  );
}

export default App;
