import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "./hooks/useTimer";
import { useAudioMixer } from "./hooks/useAudioMixer";
import { useGarden, STREAK_UNLOCKS } from "./hooks/useGarden";
import { useDarkMode } from "./hooks/useDarkMode";
import { useNotification } from "./hooks/useNotification";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { useTimerSettings } from "./hooks/useTimerSettings";
import { useTodos } from "./hooks/useTodos";
import { usePlantParticles } from "./hooks/usePlantParticles";
import { playCompletionSound } from "./lib/notification-sound";
import { ANIMATION } from "./lib/constants";
import { TimerDisplay } from "./components/TimerDisplay";
import { Toast } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { HistoryPanel } from "./components/HistoryPanel";
import { GardenCollection } from "./components/GardenCollection";
import { TimerSettings } from "./components/TimerSettings";
import { TodoPanel } from "./components/TodoPanel";
import { ShortcutGuide } from "./components/ShortcutGuide";
import { Confetti } from "./components/Confetti";
import { Fireflies } from "./components/Fireflies";
import { AuroraBlob } from "./components/AuroraBlob";
import { AppHeader } from "./components/AppHeader";
import { PlantGarden } from "./components/PlantGarden";
import { Volume2, ChevronDown, ChevronUp } from "lucide-react";
import type { TodoState } from "./hooks/useTodos";

const AudioMixer = lazy(() =>
  import("./components/AudioMixer").then((m) => ({ default: m.AudioMixer }))
);

// Module-level Zustand selector — stable reference across renders
const selectActiveTodo = (s: TodoState) => {
    if (!s.activeTodoId) return null;
    return s.todos.find((t) => t.id === s.activeTodoId && !t.completed) ?? null;
};

function App() {
  const timer = useTimer();
  const mixer = useAudioMixer();
  const garden = useGarden();
  const { grow, addFocusMinutes, clearPendingUnlock } = garden;
  const { isDark, toggle: toggleDark } = useDarkMode();
  const notification = useNotification();
  const { notify } = notification;
  const { autoAdvance } = useTimerSettings();
  const activeTodo = useTodos(selectActiveTodo);
  const { advanceToNextMode } = timer;

  const [showMixer, setShowMixer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTodo, setShowTodo] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [confirmModal, setConfirmModal] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  // Plant particles — extracted hook
  const { trigger: particleTrigger, type: particleType, stageTransition } = usePlantParticles(garden.stage);

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

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

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
        addFocusMinutes(timer.focusDuration);
        showToast("Focus complete! Your plant has grown.");
        notify("Focus Valley", "Focus session complete! Your plant has grown.");
        setConfettiTrigger((t) => t + 1);
      } else {
        showToast("Break is over! Ready to focus?");
        notify("Focus Valley", "Break is over! Time to focus.");
      }
    });
  }, [timer.isCompleted, timer.mode, timer.focusDuration, showToast, addFocusMinutes, notify]);

  // Auto-advance to next mode after completion
  useEffect(() => {
    if (!timer.isCompleted || !autoAdvance) return;
    const timeout = setTimeout(() => {
      advanceToNextMode();
    }, ANIMATION.AUTO_ADVANCE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [timer.isCompleted, autoAdvance, advanceToNextMode]);

  useEffect(() => {
    if (!garden.pendingUnlock) return;
    const unlock = STREAK_UNLOCKS.find((u) => u.plant === garden.pendingUnlock);
    clearPendingUnlock();
    if (unlock) {
      queueMicrotask(() => showToast(`New plant unlocked: ${unlock.label}!`));
    }
  }, [garden.pendingUnlock, clearPendingUnlock, showToast]);

  const handleStart = useCallback(() => {
    notification.requestPermission();
    timer.start();
  }, [notification, timer]);

  const handleReset = () => {
    if (timer.isRunning && timer.mode === "FOCUS") {
      setConfirmModal(true);
    } else {
      timer.reset();
    }
  };

  const confirmGiveUp = () => {
    garden.killPlant();
    timer.reset();
    setConfirmModal(false);
    showToast("Plant withered...");
  };

  const handlePlantClick = () => {
    if (garden.stage === "TREE" || garden.stage === "FLOWER") {
      garden.harvest();
      timer.reset();
      showToast("Harvested! +1 to your garden");
    } else if (garden.stage === "DEAD") {
      garden.plantSeed();
      showToast("New seed planted!");
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
    onSkip: timer.advanceToNextMode,
    onSwitchMode: timer.switchMode,
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

  const canInteract = garden.stage === "TREE" || garden.stage === "FLOWER" || garden.stage === "DEAD";

  // Stable callbacks for AppHeader
  const handleShowSettings = useCallback(() => setShowSettings(true), []);
  const handleShowTodo = useCallback(() => setShowTodo(true), []);
  const handleShowGarden = useCallback(() => setShowGarden(true), []);
  const handleShowHistory = useCallback(() => setShowHistory(true), []);

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden transition-colors duration-700 dot-grid">
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
        onToggleDark={toggleDark}
        onShowSettings={handleShowSettings}
        onShowTodo={handleShowTodo}
        onShowGarden={handleShowGarden}
        onShowHistory={handleShowHistory}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative z-10 px-4 sm:px-6">
        <AuroraBlob />

        <PlantGarden
          gardenType={garden.type}
          gardenStage={garden.stage}
          canInteract={canInteract}
          onPlantClick={handlePlantClick}
          activeTodo={activeTodo}
          stageTransition={stageTransition}
          particleTrigger={particleTrigger}
          particleType={particleType}
        />

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
            onSwitchMode={timer.switchMode}
            onSkip={timer.advanceToNextMode}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md z-10 px-4 sm:px-6 pb-6 pt-2">
        <motion.button
          onClick={() => setShowMixer(!showMixer)}
          aria-expanded={showMixer}
          aria-label={showMixer ? "Hide ambient sounds" : "Open ambient sounds"}
          className="w-full py-3 flex items-center justify-center gap-2 font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Volume2 size={11} className="opacity-50" />
          Sounds
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
                  <div className="h-48 w-full max-w-md flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-foreground/10 border-t-foreground/30 animate-spin" />
                      <span className="font-body text-[10px] tracking-[0.1em] uppercase text-muted-foreground/30">Loading sounds</span>
                    </div>
                  </div>
                }>
                  <AudioMixer mixer={mixer} />
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>

      {/* Overlays */}
      <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} />

      <ConfirmModal
        isOpen={confirmModal}
        title="Give up?"
        message="Your plant will wither and die. Are you sure?"
        confirmLabel="Give Up"
        cancelLabel="Keep Going"
        onConfirm={confirmGiveUp}
        onCancel={() => setConfirmModal(false)}
      />

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={garden.history}
        totalFocusMinutes={garden.totalFocusMinutes}
        focusSessions={garden.focusSessions}
        currentStreak={garden.currentStreak}
        bestStreak={garden.bestStreak}
      />

      <GardenCollection
        isOpen={showGarden}
        onClose={() => setShowGarden(false)}
        history={garden.history}
        unlockedPlants={garden.unlockedPlants}
        currentStreak={garden.currentStreak}
        bestStreak={garden.bestStreak}
      />

      <TimerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <TodoPanel
        isOpen={showTodo}
        onClose={() => setShowTodo(false)}
      />

      <ShortcutGuide
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      <Confetti trigger={confettiTrigger} />
    </div>
  );
}

export default App;
