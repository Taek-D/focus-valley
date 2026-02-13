import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "./hooks/useTimer";
import { useAudioMixer } from "./hooks/useAudioMixer";
import { useGarden } from "./hooks/useGarden";
import { useDarkMode } from "./hooks/useDarkMode";
import { cn } from "./lib/utils";
import { playCompletionSound } from "./lib/notification-sound";
import { TimerDisplay } from "./components/TimerDisplay";
import { Fireflies } from "./components/Fireflies";
import { Toast } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { HistoryPanel } from "./components/HistoryPanel";
import { TimerSettings } from "./components/TimerSettings";
import { getPlantComponent } from "./components/ui/pixel-plants";
import { TreePine, ScrollText, Moon, Sun, ChevronDown, ChevronUp, Settings } from "lucide-react";

const AudioMixer = lazy(() =>
  import("./components/AudioMixer").then((m) => ({ default: m.AudioMixer }))
);

function App() {
  const timer = useTimer();
  const mixer = useAudioMixer();
  const garden = useGarden();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const [showMixer, setShowMixer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [confirmModal, setConfirmModal] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  // Sync Timer with Garden
  useEffect(() => {
    if (timer.isRunning && timer.mode === "FOCUS") {
      const totalTime = timer.focusDuration * 60;
      const elapsed = totalTime - timer.timeLeft;
      const progress = (elapsed / totalTime) * 100;
      garden.grow(progress);
    }
  }, [timer.timeLeft, timer.isRunning, timer.mode, timer.focusDuration, garden]);

  // Completion notification + focus time tracking
  useEffect(() => {
    if (timer.isCompleted) {
      playCompletionSound();
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 600);

      if (timer.mode === "FOCUS") {
        garden.addFocusMinutes(timer.focusDuration);
        showToast("Focus complete! Your plant has grown.");
      } else {
        showToast("Break is over! Ready to focus?");
      }
    }
  }, [timer.isCompleted, timer.mode, showToast, garden]);

  // Handle Give Up
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

  // Handle plant click
  const handlePlantClick = () => {
    if (garden.stage === "TREE" || garden.stage === "FLOWER") {
      garden.harvest();
      timer.reset();
      showToast("Harvested! +1 Focus Tree");
    } else if (garden.stage === "DEAD") {
      garden.plantSeed();
      showToast("New seed planted!");
    }
  };

  const PlantComponent = getPlantComponent(garden.type, garden.stage);
  const canInteract = garden.stage === "TREE" || garden.stage === "FLOWER" || garden.stage === "DEAD";

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden transition-colors duration-700">
      {/* Sky Gradient Background */}
      <div
        className="fixed inset-0 z-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(180deg, var(--sky-from) 0%, var(--sky-via) 50%, var(--sky-to) 100%)`,
        }}
      />

      {/* Fireflies */}
      <Fireflies />

      {/* Screen Flash */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-primary z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center z-10 px-6 pt-6 pb-4">
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TreePine size={22} className="text-primary" />
          <span className="font-pixel text-sm tracking-wider text-foreground">
            FOCUS VALLEY
          </span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={toggleDark}
            className="p-2.5 border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 text-muted-foreground hover:text-primary transition-all"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 text-muted-foreground hover:text-primary transition-all"
            aria-label="Timer settings"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2.5 border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 text-muted-foreground hover:text-primary transition-all"
            aria-label="View history"
          >
            <ScrollText size={16} />
          </button>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl relative z-10 px-6">
        {/* Garden Stage */}
        <motion.div
          className="relative w-full flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Stage Label */}
          <div className="font-retro text-sm text-muted-foreground tracking-widest uppercase mb-4">
            {garden.type} &middot; {garden.stage}
          </div>

          {/* Plant Area */}
          <div className="relative h-48 md:h-64 flex items-end justify-center w-full">
            {/* Plant Glow */}
            {(garden.stage === "TREE" || garden.stage === "FLOWER") && (
              <div className="absolute bottom-8 w-32 h-32 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" />
            )}

            {/* Animated Plant */}
            <button
              className={cn(
                "mb-2 bg-transparent border-none p-0 transition-all",
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
                  initial={{ scale: 0.5, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  whileHover={canInteract ? { scale: 1.12, y: -4 } : {}}
                >
                  <PlantComponent />
                </motion.div>
              </AnimatePresence>
            </button>
          </div>

          {/* Ground Line */}
          <div className="w-full max-w-xs relative">
            <div
              className="h-2 w-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, var(--ground-from) 20%, var(--ground-to) 80%, transparent 100%)`,
              }}
            />
            <div
              className="h-1 w-3/4 mx-auto"
              style={{
                background: `linear-gradient(90deg, transparent 0%, var(--ground-edge) 50%, transparent 100%)`,
                opacity: 0.5,
              }}
            />
          </div>

          {/* Harvest hint */}
          {canInteract && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-retro text-sm text-primary/70 mt-3 tracking-wide"
            >
              {garden.stage === "DEAD" ? "Click to plant a new seed" : "Click to harvest!"}
            </motion.div>
          )}
        </motion.div>

        {/* Timer Control */}
        <motion.div
          className="z-10 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TimerDisplay
            timeLeft={timer.timeLeft}
            isRunning={timer.isRunning}
            isCompleted={timer.isCompleted}
            mode={timer.mode}
            focusCount={timer.focusCount}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={handleReset}
            onSwitchMode={timer.switchMode}
            onSkip={timer.advanceToNextMode}
          />
        </motion.div>
      </main>

      {/* Footer - Soundscape */}
      <footer className="w-full max-w-md z-10 px-6 pb-6 pt-4">
        <motion.button
          onClick={() => setShowMixer(!showMixer)}
          aria-expanded={showMixer}
          aria-label={showMixer ? "Hide soundscape mixer" : "Open soundscape mixer"}
          className="w-full py-3 flex items-center justify-center gap-2 font-pixel text-[10px] tracking-wider text-muted-foreground hover:text-primary transition-colors group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="h-px w-8 bg-border group-hover:bg-primary/30 transition-colors" />
          {showMixer ? (
            <>
              HIDE SOUNDSCAPE <ChevronDown size={12} />
            </>
          ) : (
            <>
              SOUNDSCAPE <ChevronUp size={12} />
            </>
          )}
          <div className="h-px w-8 bg-border group-hover:bg-primary/30 transition-colors" />
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
                  <div className="h-48 w-full max-w-md flex items-center justify-center text-muted-foreground font-retro">
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
        title="GIVE UP?"
        message="Your plant will wither and die. Are you sure?"
        confirmLabel="GIVE UP"
        cancelLabel="KEEP GOING"
        onConfirm={confirmGiveUp}
        onCancel={() => setConfirmModal(false)}
      />

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={garden.history}
        totalFocusMinutes={garden.totalFocusMinutes}
      />

      <TimerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
