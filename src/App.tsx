import { useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronDown, ChevronUp, Wind, BookOpen, Navigation, X } from "lucide-react";
import { useTimer } from "./hooks/useTimer";
import { useAudioMixer } from "./hooks/useAudioMixer";
import { useAudioReactivity } from "./hooks/useAudioReactivity";
import { useGarden } from "./hooks/useGarden";
import { useDarkMode } from "./hooks/useDarkMode";
import { useNotification } from "./hooks/useNotification";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import { useTimerSettings } from "./hooks/useTimerSettings";
import { useTodos } from "./hooks/useTodos";
import { usePlantParticles } from "./hooks/usePlantParticles";
import { useCategoryStore } from "./hooks/useCategories";
import { useWeather } from "./hooks/useWeather";
import { useTranslation } from "./lib/i18n";
import { TimerDisplay } from "./components/TimerDisplay";
import { CategoryChips } from "./components/CategoryChips";
import { Fireflies } from "./components/Fireflies";
import { AuroraBlob } from "./components/AuroraBlob";
import { AppHeader } from "./components/AppHeader";
import { PlantGarden } from "./components/PlantGarden";
import { InstallBanner } from "./components/InstallBanner";
import { AppPanels } from "./components/AppPanels";
import { AppOverlays } from "./components/AppOverlays";
import { useWeeklySummary } from "./hooks/useWeeklySummary";
import { useLanding } from "./hooks/useLanding";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import { useTour } from "./hooks/useTour";
import { useAppPanels } from "./hooks/useAppPanels";
import { useAppSyncFlow } from "./hooks/useAppSyncFlow";
import { useAppEnvironmentEffects } from "./hooks/useAppEnvironmentEffects";
import { useAppSessionFlow } from "./hooks/useAppSessionFlow";
import type { TodoState } from "./hooks/useTodos";

const AudioMixer = lazy(() =>
    import("./components/AudioMixer").then((module) => ({ default: module.AudioMixer }))
);

const selectActiveCategoryId = (state: { activeCategoryId: string }) => state.activeCategoryId;

const selectActiveTodo = (state: TodoState) => {
    if (!state.activeTodoId) return null;
    return state.todos.find((todo) => todo.id === state.activeTodoId && !todo.completed) ?? null;
};

function App() {
    const timer = useTimer();
    const mixer = useAudioMixer();
    const audioIntensity = useAudioReactivity(mixer.analyserRef);
    const garden = useGarden();
    const weather = useWeather();
    const { isDark, toggle: toggleDark } = useDarkMode();
    const notification = useNotification();
    const { autoAdvance } = useTimerSettings();
    const activeTodo = useTodos(selectActiveTodo);
    const activeCategoryId = useCategoryStore(selectActiveCategoryId);
    const categories = useCategoryStore((state) => state.categories);
    const { canInstall, install: installPwa, dismiss: dismissInstall } = useInstallPrompt();
    const { showWeeklySummary, dismissWeeklySummary } = useWeeklySummary();
    const { showLanding, dismissLanding } = useLanding();
    const { startTour, isActive: isTourActive } = useTour();
    const { t, locale } = useTranslation();
    const panels = useAppPanels();
    const syncFlow = useAppSyncFlow(t);
    const session = useAppSessionFlow({
        timer,
        garden,
        activeCategoryId,
        autoAdvance,
        notification,
        categories,
        locale,
        t,
        syncCurrentUser: syncFlow.syncCurrentUser,
    });

    const { trigger: particleTrigger, type: particleType, stageTransition } = usePlantParticles(garden.stage);

    useAppEnvironmentEffects({
        mode: timer.mode,
        isRunning: timer.isRunning,
        weatherLoaded: weather.loaded,
        weatherMood: weather.mood,
        deepFocusStreak: garden.deepFocusStreak,
    });

    const handleLandingGetStarted = useCallback(() => {
        dismissLanding();
    }, [dismissLanding]);

    const handleLandingDemo = useCallback(() => {
        dismissLanding();
        session.startDemoMode();
    }, [dismissLanding, session]);

    useKeyboardShortcuts({
        isRunning: timer.isRunning,
        isCompleted: timer.isCompleted,
        onToggle: session.handleToggle,
        onReset: session.handleReset,
        onSkip: session.handleAdvanceToNextMode,
        onSwitchMode: session.handleSwitchMode,
        onToggleMixer: panels.toggleMixer,
        onToggleShortcutGuide: panels.toggleShortcuts,
    });

    useDocumentTitle({
        timeLeft: timer.timeLeft,
        totalDuration: timer.totalDuration,
        isRunning: timer.isRunning,
        isCompleted: timer.isCompleted,
        mode: timer.mode,
    });

    return (
        <div className="min-h-screen flex flex-col items-center relative overflow-hidden transition-colors duration-700 dot-grid">
            <InstallBanner canInstall={canInstall} onInstall={installPwa} onDismiss={dismissInstall} />

            <svg className="grain-overlay" aria-hidden="true">
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#grain)" />
            </svg>

            <Fireflies />

            <div
                className="fixed inset-0 pointer-events-none z-[4]"
                style={{
                    background: "radial-gradient(ellipse at 50% 50%, transparent 50%, hsl(var(--background) / 0.4) 100%)",
                }}
                aria-hidden="true"
            />

            <AppHeader
                isDark={isDark}
                currentStreak={garden.currentStreak}
                user={syncFlow.user}
                syncState={syncFlow.syncIndicatorState}
                syncLabel={syncFlow.syncIndicatorLabel}
                onToggleDark={toggleDark}
                onShowSettings={panels.openSettings}
                onShowTodo={panels.openTodo}
                onShowGarden={panels.openGarden}
                onShowHistory={panels.openHistory}
                onShowAuth={panels.openAuth}
            />

            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative z-10 px-4 sm:px-6">
                <AuroraBlob audioIntensity={audioIntensity} />

                <PlantGarden
                    gardenType={garden.type}
                    gardenStage={garden.stage}
                    canInteract={session.canInteract}
                    onPlantClick={session.handlePlantClick}
                    activeTodo={activeTodo}
                    stageTransition={stageTransition}
                    particleTrigger={particleTrigger}
                    particleType={particleType}
                    breathCycle={session.breathCycle}
                    isBreathing={session.isPlantBreathing}
                    growthPercent={session.growthPercent}
                />

                <div className="z-10 w-full mb-2">
                    <CategoryChips />
                </div>

                <div className="z-10 flex items-center gap-3 mb-2">
                    {session.isDemoMode && (
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
                                onClick={session.handleEndDemo}
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
                    {session.isBreakActive && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={panels.openBreathing}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/8 hover:border-foreground/15 transition-colors"
                        >
                            <Wind size={10} className="text-muted-foreground/40" />
                            <span className="text-[10px] font-body font-medium tracking-[0.08em] uppercase text-muted-foreground/40">
                                {t("breathing.start")}
                            </span>
                        </motion.button>
                    )}
                </div>

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
                        onStart={session.handleStart}
                        onPause={timer.pause}
                        onReset={session.handleReset}
                        onSwitchMode={session.handleSwitchMode}
                        onSkip={session.handleAdvanceToNextMode}
                    />
                </motion.div>
            </main>

            <footer className="w-full max-w-lg z-10 px-4 sm:px-6 pb-4 pt-2">
                <motion.button
                    onClick={panels.toggleMixer}
                    aria-expanded={panels.showMixer}
                    aria-label={panels.showMixer ? t("footer.hideSounds") : t("footer.openSounds")}
                    data-tour="sounds-button"
                    data-testid="sound-toggle"
                    className="w-full py-2.5 flex items-center justify-center gap-2 font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <Volume2 size={11} className="opacity-50" />
                    {t("footer.sounds")}
                    {panels.showMixer ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                </motion.button>

                <AnimatePresence>
                    {panels.showMixer && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="pb-6 flex justify-center">
                                <Suspense
                                    fallback={
                                        <div className="h-48 w-full max-w-lg flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 rounded-full border-2 border-foreground/10 border-t-foreground/30 animate-spin" />
                                                <span className="font-body text-[10px] tracking-[0.1em] uppercase text-muted-foreground/30">
                                                    {t("footer.loadingSounds")}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                >
                                    <AudioMixer mixer={mixer} />
                                </Suspense>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-3 py-2" data-tour="shortcuts-hint">
                    <a
                        href="/guide.html"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors"
                    >
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
                    <a
                        href="/privacy.html"
                        target="_blank"
                        rel="noopener"
                        className="font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors"
                    >
                        {t("footer.privacy")}
                    </a>
                    <span className="text-muted-foreground/10 text-[9px]">&middot;</span>
                    <a
                        href="/terms.html"
                        target="_blank"
                        rel="noopener"
                        className="font-body text-[9px] text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors"
                    >
                        {t("footer.terms")}
                    </a>
                </div>
            </footer>

            <AppPanels
                showHistory={panels.showHistory}
                closeHistory={panels.closeHistory}
                showGarden={panels.showGarden}
                closeGarden={panels.closeGarden}
                showSettings={panels.showSettings}
                closeSettings={panels.closeSettings}
                showTodo={panels.showTodo}
                closeTodo={panels.closeTodo}
                showShortcuts={panels.showShortcuts}
                closeShortcuts={panels.closeShortcuts}
                history={garden.history}
                totalFocusMinutes={garden.totalFocusMinutes}
                focusSessions={garden.focusSessions}
                currentStreak={garden.currentStreak}
                bestStreak={garden.bestStreak}
                unlockedPlants={garden.unlockedPlants}
                deepFocusStreak={garden.deepFocusStreak}
            />

            <AppOverlays
                session={session}
                timer={timer}
                garden={garden}
                showAuth={panels.showAuth}
                closeAuth={panels.closeAuth}
                showBreathing={panels.showBreathing}
                closeBreathing={panels.closeBreathing}
                syncFeedback={syncFlow.syncFeedback}
                clearSyncFeedback={syncFlow.clearSyncFeedback}
                showWeeklySummary={showWeeklySummary}
                dismissWeeklySummary={dismissWeeklySummary}
                showLanding={showLanding}
                onLandingGetStarted={handleLandingGetStarted}
                onLandingDemo={handleLandingDemo}
                startTour={startTour}
                isTourActive={isTourActive}
                t={t}
            />
        </div>
    );
}

export default App;
