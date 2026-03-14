import { useCallback, useState } from "react";

export function useAppPanels() {
    const [showMixer, setShowMixer] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showGarden, setShowGarden] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);

    const toggleMixer = useCallback(() => {
        setShowMixer((value) => !value);
    }, []);

    const openAuth = useCallback(() => setShowAuth(true), []);
    const closeAuth = useCallback(() => setShowAuth(false), []);

    const openHistory = useCallback(() => setShowHistory(true), []);
    const closeHistory = useCallback(() => setShowHistory(false), []);

    const openGarden = useCallback(() => setShowGarden(true), []);
    const closeGarden = useCallback(() => setShowGarden(false), []);

    const openSettings = useCallback(() => setShowSettings(true), []);
    const closeSettings = useCallback(() => setShowSettings(false), []);

    const openTodo = useCallback(() => setShowTodo(true), []);
    const closeTodo = useCallback(() => setShowTodo(false), []);

    const toggleShortcuts = useCallback(() => {
        setShowShortcuts((value) => !value);
    }, []);
    const closeShortcuts = useCallback(() => setShowShortcuts(false), []);

    const openBreathing = useCallback(() => setShowBreathing(true), []);
    const closeBreathing = useCallback(() => setShowBreathing(false), []);

    return {
        showMixer,
        showAuth,
        showHistory,
        showGarden,
        showSettings,
        showTodo,
        showShortcuts,
        showBreathing,
        toggleMixer,
        openAuth,
        closeAuth,
        openHistory,
        closeHistory,
        openGarden,
        closeGarden,
        openSettings,
        closeSettings,
        openTodo,
        closeTodo,
        toggleShortcuts,
        closeShortcuts,
        openBreathing,
        closeBreathing,
    };
}

export type AppPanelsState = ReturnType<typeof useAppPanels>;
