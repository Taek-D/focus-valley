import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimer } from "./hooks/useTimer";
import { useAudioMixer } from "./hooks/useAudioMixer";
import { useGarden } from "./hooks/useGarden";
import { useDarkMode } from "./hooks/useDarkMode";
import { cn } from "./lib/utils";
import { playCompletionSound } from "./lib/notification-sound";
import { TimerDisplay } from "./components/TimerDisplay";
import { Toast } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { HistoryPanel } from "./components/HistoryPanel";
import { getPlantComponent } from "./components/ui/pixel-plants";
import { Trees, History, Moon, Sun } from "lucide-react";

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
      const totalTime = 25 * 60;
      const elapsed = totalTime - timer.timeLeft;
      const progress = (elapsed / totalTime) * 100;
      garden.grow(progress);
    }
  }, [timer.timeLeft, timer.isRunning, timer.mode, garden]);

  // Completion notification + focus time tracking
  useEffect(() => {
    if (timer.isCompleted) {
      playCompletionSound();
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 600);

      if (timer.mode === "FOCUS") {
        garden.addFocusMinutes(25);
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

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground flex flex-col items-center justify-between p-6 overflow-hidden transition-colors duration-500",
      screenFlash && "animate-pulse"
    )}>
      {screenFlash && (
        <div className="fixed inset-0 bg-primary/10 z-40 pointer-events-none animate-pulse" />
      )}

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center z-10">
        <div className="flex items-center gap-2 font-pixel text-xl tracking-tighter">
          <Trees className="text-primary" />
          <span>FOCUS VALLEY</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 border border-border rounded-lg hover:bg-accent transition-colors"
            aria-label="View history"
          >
            <History size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative">
        {/* The Garden Stage */}
        <div className="relative w-full h-64 md:h-96 flex items-end justify-center mb-12">
          <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Animated Plant */}
          <button
            className="mb-4 cursor-pointer bg-transparent border-none p-0"
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
                whileHover={{ scale: 1.15 }}
              >
                <PlantComponent />
              </motion.div>
            </AnimatePresence>
          </button>

          <div className="absolute -top-10 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {garden.type} - {garden.stage}
          </div>
        </div>

        {/* Timer Control */}
        <div className="z-10 w-full">
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
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="w-full max-w-md z-10">
        <button
          onClick={() => setShowMixer(!showMixer)}
          aria-expanded={showMixer}
          aria-label={showMixer ? "Hide soundscape mixer" : "Open soundscape mixer"}
          className="w-full py-4 text-center font-pixel text-xs text-muted-foreground hover:text-primary transition-colors flex flex-col items-center gap-2"
        >
          <div className="w-8 h-1 bg-border rounded-full" />
          {showMixer ? "HIDE SOUNDSCAPE" : "OPEN SOUNDSCAPE"}
        </button>

        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          showMixer ? "max-h-96 opacity-100 mb-8" : "max-h-0 opacity-0"
        )}>
          {showMixer && (
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground font-pixel text-xs">Loading...</div>}>
              <AudioMixer mixer={mixer} />
            </Suspense>
          )}
        </div>
      </footer>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

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
    </div>
  );
}

export default App;
