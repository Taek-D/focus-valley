import { lazy, Suspense } from "react";
import type { FocusSession, PlantType } from "@/hooks/useGarden";

const HistoryPanel = lazy(() =>
    import("@/components/HistoryPanel").then((module) => ({ default: module.HistoryPanel }))
);
const GardenCollection = lazy(() =>
    import("@/components/GardenCollection").then((module) => ({ default: module.GardenCollection }))
);
const TimerSettings = lazy(() =>
    import("@/components/TimerSettings").then((module) => ({ default: module.TimerSettings }))
);
const TodoPanel = lazy(() =>
    import("@/components/TodoPanel").then((module) => ({ default: module.TodoPanel }))
);
const ShortcutGuide = lazy(() =>
    import("@/components/ShortcutGuide").then((module) => ({ default: module.ShortcutGuide }))
);

type AppPanelsProps = {
    showHistory: boolean;
    closeHistory: () => void;
    showGarden: boolean;
    closeGarden: () => void;
    showSettings: boolean;
    closeSettings: () => void;
    showTodo: boolean;
    closeTodo: () => void;
    showShortcuts: boolean;
    closeShortcuts: () => void;
    history: { type: PlantType; date: string }[];
    totalFocusMinutes: number;
    focusSessions: FocusSession[];
    currentStreak: number;
    bestStreak: number;
    unlockedPlants: PlantType[];
    deepFocusStreak: number;
};

export function AppPanels({
    showHistory,
    closeHistory,
    showGarden,
    closeGarden,
    showSettings,
    closeSettings,
    showTodo,
    closeTodo,
    showShortcuts,
    closeShortcuts,
    history,
    totalFocusMinutes,
    focusSessions,
    currentStreak,
    bestStreak,
    unlockedPlants,
    deepFocusStreak,
}: AppPanelsProps) {
    return (
        <Suspense>
            {showHistory && (
                <HistoryPanel
                    isOpen={showHistory}
                    onClose={closeHistory}
                    history={history}
                    totalFocusMinutes={totalFocusMinutes}
                    focusSessions={focusSessions}
                    currentStreak={currentStreak}
                    bestStreak={bestStreak}
                />
            )}

            {showGarden && (
                <GardenCollection
                    isOpen={showGarden}
                    onClose={closeGarden}
                    history={history}
                    unlockedPlants={unlockedPlants}
                    currentStreak={currentStreak}
                    bestStreak={bestStreak}
                    deepFocusStreak={deepFocusStreak}
                />
            )}

            {showSettings && (
                <TimerSettings
                    isOpen={showSettings}
                    onClose={closeSettings}
                />
            )}

            {showTodo && (
                <TodoPanel
                    isOpen={showTodo}
                    onClose={closeTodo}
                />
            )}

            {showShortcuts && (
                <ShortcutGuide
                    isOpen={showShortcuts}
                    onClose={closeShortcuts}
                />
            )}
        </Suspense>
    );
}
