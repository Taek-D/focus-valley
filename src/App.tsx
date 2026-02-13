import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "./hooks/useTimer";
import { useAudioMixer } from "./hooks/useAudioMixer";
import { useGarden, STREAK_UNLOCKS } from "./hooks/useGarden";
import { useDarkMode } from "./hooks/useDarkMode";
import { useNotification } from "./hooks/useNotification";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { cn } from "./lib/utils";
import { playCompletionSound } from "./lib/notification-sound";
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
import { PlantParticles } from "./components/PlantParticles";
import { getPlantComponent } from "./components/ui/pixel-plants";
import { useTimerSettings } from "./hooks/useTimerSettings";
import { useTodos } from "./hooks/useTodos";
import { ScrollText, Moon, Sun, Leaf, ChevronDown, ChevronUp, Settings, Volume2, Sprout, Flame, ListTodo, Pin } from "lucide-react";
import type { PlantStage } from "./hooks/useGarden";
import type { TargetAndTransition } from "framer-motion";

const AudioMixer = lazy(() =>
  import("./components/AudioMixer").then((m) => ({ default: m.AudioMixer }))
);

type StageTransition = { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition };

// Stage-specific animation variants for plant transitions
const stageVariants: Record<string, StageTransition> = {
    "SEED-SPROUT": {
        initial: { scale: 0.3, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
    "SPROUT-BUD": {
        initial: { scale: 0.8, opacity: 0, rotate: -5 },
        animate: { scale: 1, opacity: 1, rotate: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
    "BUD-FLOWER": {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: [0.9, 1.1, 1], opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
    },
    "FLOWER-TREE": {
        initial: { scale: 0.95, opacity: 0, y: 10 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
    "DEAD": {
        initial: { rotate: 0, opacity: 1 },
        animate: { rotate: 5, opacity: 0.6 },
        exit: { scale: 0.5, opacity: 0 },
    },
    "default": {
        initial: { scale: 0.5, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
};

function getStageTransition(prev: PlantStage | null, current: PlantStage): StageTransition {
    if (current === "DEAD") return stageVariants["DEAD"];
    if (prev) {
        const key = `${prev}-${current}`;
        if (key in stageVariants) return stageVariants[key];
    }
    return stageVariants["default"];
}

function App() {
  const timer = useTimer();
  const mixer = useAudioMixer();
  const garden = useGarden();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const notification = useNotification();

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

  // Plant particles state — render-time state adjustment (React recommended pattern)
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particleType, setParticleType] = useState<"growth" | "harvest" | "death">("growth");
  const [prevStage, setPrevStage] = useState<PlantStage>(garden.stage);

  // Detect stage changes during render (avoids effect + setState)
  if (prevStage !== garden.stage) {
    const current = garden.stage;

    if (current === "DEAD") {
      setParticleType("death");
      setParticleTrigger((t) => t + 1);
    } else if (current === "SEED" && (prevStage === "TREE" || prevStage === "FLOWER")) {
      setParticleType("harvest");
      setParticleTrigger((t) => t + 1);
    } else if (
      (prevStage === "SEED" && current === "SPROUT") ||
      (prevStage === "SPROUT" && current === "BUD") ||
      (prevStage === "BUD" && current === "FLOWER") ||
      (prevStage === "FLOWER" && current === "TREE")
    ) {
      setParticleType("growth");
      setParticleTrigger((t) => t + 1);
    }
    setPrevStage(current);
  }

  // Compute transition variant from current state (derived, not stored)
  const stageTransition = getStageTransition(prevStage, garden.stage);

  // Timer settings for auto-advance
  const { autoAdvance } = useTimerSettings();

  // Active todo from store
  const activeTodo = useTodos((s) => {
    if (!s.activeTodoId) return null;
    return s.todos.find((t) => t.id === s.activeTodoId && !t.completed) ?? null;
  });

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
      garden.grow(progress);
    }
  }, [timer.timeLeft, timer.isRunning, timer.mode, timer.focusDuration, garden]);

  useEffect(() => {
    if (timer.isCompleted) {
      playCompletionSound();
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 600);

      if (timer.mode === "FOCUS") {
        garden.addFocusMinutes(timer.focusDuration);
        showToast("Focus complete! Your plant has grown.");
        notification.notify("Focus Valley", "Focus session complete! Your plant has grown.");
        setConfettiTrigger((t) => t + 1);
      } else {
        showToast("Break is over! Ready to focus?");
        notification.notify("Focus Valley", "Break is over! Time to focus.");
      }
    }
  }, [timer.isCompleted, timer.mode, showToast, garden, notification]);

  // Auto-advance to next mode after completion
  useEffect(() => {
    if (!timer.isCompleted || !autoAdvance) return;
    const timeout = setTimeout(() => {
      timer.advanceToNextMode();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [timer.isCompleted, autoAdvance, timer]);

  useEffect(() => {
    if (garden.pendingUnlock) {
      const unlock = STREAK_UNLOCKS.find((u) => u.plant === garden.pendingUnlock);
      if (unlock) {
        showToast(`New plant unlocked: ${unlock.label}!`);
      }
      garden.clearPendingUnlock();
    }
  }, [garden.pendingUnlock, garden, showToast]);

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

  // Keyboard shortcuts
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

  // Document title
  useDocumentTitle({
    timeLeft: timer.timeLeft,
    totalDuration: timer.totalDuration,
    isRunning: timer.isRunning,
    isCompleted: timer.isCompleted,
    mode: timer.mode,
  });

  const PlantComponent = getPlantComponent(garden.type, garden.stage);
  const canInteract = garden.stage === "TREE" || garden.stage === "FLOWER" || garden.stage === "DEAD";

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden transition-colors duration-700 dot-grid">
      {/* Grain */}
      <svg className="grain-overlay" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Ambient light particles */}
      <Fireflies />

      {/* Vignette — subtle edge darkening */}
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

      {/* Header */}
      <header className="w-full max-w-lg flex justify-between items-center z-10 px-6 pt-5 pb-2">
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Leaf size={15} className="text-muted-foreground" />
          <span className="font-display text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
            Focus Valley
          </span>
          {garden.currentStreak > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60">
              <Flame size={10} />
              <span className="font-body text-[10px] font-medium">{garden.currentStreak}</span>
            </span>
          )}
        </motion.div>
        <motion.div
          className="flex items-center gap-0.5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { action: toggleDark, label: "Toggle dark mode", icon: isDark ? <Sun size={15} /> : <Moon size={15} /> },
            { action: () => setShowSettings(true), label: "Timer settings", icon: <Settings size={15} /> },
            { action: () => setShowTodo(true), label: "To-do list", icon: <ListTodo size={15} /> },
            { action: () => setShowGarden(true), label: "My garden", icon: <Sprout size={15} /> },
            { action: () => setShowHistory(true), label: "Stats & history", icon: <ScrollText size={15} /> },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              aria-label={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </motion.div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative z-10 px-6">
        {/* Aurora Blob — large, vivid central orb */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="relative" style={{ width: 550, height: 550 }}>
            <div
              className="absolute inset-0 rounded-full animate-aurora-1"
              style={{
                background: `radial-gradient(circle at 30% 30%, hsl(var(--aurora-1) / 0.5), transparent 50%)`,
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full animate-aurora-2"
              style={{
                background: `radial-gradient(circle at 75% 35%, hsl(var(--aurora-2) / 0.45), transparent 50%)`,
                filter: "blur(65px)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full animate-aurora-3"
              style={{
                background: `radial-gradient(circle at 50% 75%, hsl(var(--aurora-3) / 0.4), transparent 50%)`,
                filter: "blur(60px)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 40% 55%, hsl(var(--aurora-4) / 0.3), transparent 55%)`,
                filter: "blur(70px)",
              }}
            />
          </div>
        </div>

        {/* Garden */}
        <motion.div
          className="relative w-full flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Plant area */}
          <div className="relative h-32 md:h-40 flex items-end justify-center w-full">
            <button
              className={cn(
                "mb-1 bg-transparent border-none p-0 transition-all relative",
                canInteract ? "cursor-pointer" : "cursor-default"
              )}
              onClick={handlePlantClick}
              aria-label={
                garden.stage === "TREE" || garden.stage === "FLOWER"
                  ? "Harvest your plant"
                  : garden.stage === "DEAD"
                  ? "Plant a new seed"
                  : `${garden.type} plant - ${garden.stage} stage`
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${garden.type}-${garden.stage}`}
                  initial={stageTransition.initial}
                  animate={stageTransition.animate}
                  exit={stageTransition.exit}
                  transition={{ type: "spring", damping: 20, stiffness: 180, duration: 0.4 }}
                  whileHover={canInteract ? { scale: 1.05, y: -2 } : {}}
                >
                  <PlantComponent />
                </motion.div>
              </AnimatePresence>

              {/* Particles overlay */}
              <PlantParticles trigger={particleTrigger} type={particleType} />
            </button>
          </div>

          {/* Stage label — just below the plant */}
          <div className="font-body text-[9px] text-muted-foreground/40 tracking-[0.3em] uppercase mt-1 mb-3">
            {garden.type} &middot; {garden.stage}
          </div>

          {canInteract && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-[11px] text-muted-foreground/50 tracking-wide -mt-1 mb-2"
            >
              {garden.stage === "DEAD" ? "Tap to plant a new seed" : "Tap to harvest"}
            </motion.div>
          )}

          {/* Active todo — focus task display */}
          {activeTodo && !canInteract && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-body text-[11px] text-foreground/40 tracking-wide -mt-1 mb-2 flex items-center gap-1.5 max-w-[200px] truncate"
            >
              <Pin size={10} className="flex-shrink-0 opacity-50" />
              <span className="truncate">{activeTodo.text}</span>
            </motion.div>
          )}
        </motion.div>

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
      <footer className="w-full max-w-md z-10 px-6 pb-6 pt-2">
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
          {showMixer ? (
            <ChevronDown size={11} />
          ) : (
            <ChevronUp size={11} />
          )}
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
                  <div className="h-48 w-full max-w-md flex items-center justify-center text-muted-foreground font-body text-xs">
                    Loading...
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
