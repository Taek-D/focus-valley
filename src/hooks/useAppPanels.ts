import { useCallback, useRef, useState } from "react";

type PanelName = "mixer" | "auth" | "history" | "garden" | "settings" | "todo" | "shortcuts" | "breathing";

export function useAppPanels() {
    const [showMixer, setShowMixer] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showGarden, setShowGarden] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showBreathing, setShowBreathing] = useState(false);

    // LIFO open-stack: tracks open panels in order for back button navigation
    const [openStack, setOpenStack] = useState<PanelName[]>([]);
    const openStackRef = useRef<PanelName[]>([]);

    /** Update both the state and ref together */
    const setStack = useCallback((updater: (prev: PanelName[]) => PanelName[]) => {
        setOpenStack((prev) => {
            const next = updater(prev);
            openStackRef.current = next;
            return next;
        });
    }, []);

    /** Push a panel to the stack (deduplicated) */
    const pushPanel = useCallback((name: PanelName) => {
        setStack((prev) => [...prev.filter((p) => p !== name), name]);
    }, [setStack]);

    /** Remove a panel from the stack */
    const popPanel = useCallback((name: PanelName) => {
        setStack((prev) => prev.filter((p) => p !== name));
    }, [setStack]);

    // Toggle handlers — use functional update to read current boolean state
    const toggleMixer = useCallback(() => {
        setShowMixer((prev) => {
            if (prev) {
                // Closing: remove from stack
                setStack((s) => s.filter((p) => p !== "mixer"));
            } else {
                // Opening: push to stack
                setStack((s) => [...s.filter((p) => p !== "mixer"), "mixer"]);
            }
            return !prev;
        });
    }, [setStack]);

    const toggleShortcuts = useCallback(() => {
        setShowShortcuts((prev) => {
            if (prev) {
                setStack((s) => s.filter((p) => p !== "shortcuts"));
            } else {
                setStack((s) => [...s.filter((p) => p !== "shortcuts"), "shortcuts"]);
            }
            return !prev;
        });
    }, [setStack]);

    // Open/close handlers
    const openAuth = useCallback(() => {
        setShowAuth(true);
        pushPanel("auth");
    }, [pushPanel]);
    const closeAuth = useCallback(() => {
        setShowAuth(false);
        popPanel("auth");
    }, [popPanel]);

    const openHistory = useCallback(() => {
        setShowHistory(true);
        pushPanel("history");
    }, [pushPanel]);
    const closeHistory = useCallback(() => {
        setShowHistory(false);
        popPanel("history");
    }, [popPanel]);

    const openGarden = useCallback(() => {
        setShowGarden(true);
        pushPanel("garden");
    }, [pushPanel]);
    const closeGarden = useCallback(() => {
        setShowGarden(false);
        popPanel("garden");
    }, [popPanel]);

    const openSettings = useCallback(() => {
        setShowSettings(true);
        pushPanel("settings");
    }, [pushPanel]);
    const closeSettings = useCallback(() => {
        setShowSettings(false);
        popPanel("settings");
    }, [popPanel]);

    const openTodo = useCallback(() => {
        setShowTodo(true);
        pushPanel("todo");
    }, [pushPanel]);
    const closeTodo = useCallback(() => {
        setShowTodo(false);
        popPanel("todo");
    }, [popPanel]);

    const closeShortcuts = useCallback(() => {
        setShowShortcuts(false);
        popPanel("shortcuts");
    }, [popPanel]);

    const openBreathing = useCallback(() => {
        setShowBreathing(true);
        pushPanel("breathing");
    }, [pushPanel]);
    const closeBreathing = useCallback(() => {
        setShowBreathing(false);
        popPanel("breathing");
    }, [popPanel]);

    /** Map from panel name to its close callback */
    const closeFnMap = useRef<Record<PanelName, () => void>>({
        mixer: () => setShowMixer(false),
        auth: () => { setShowAuth(false); },
        history: () => { setShowHistory(false); },
        garden: () => { setShowGarden(false); },
        settings: () => { setShowSettings(false); },
        todo: () => { setShowTodo(false); },
        shortcuts: () => { setShowShortcuts(false); },
        breathing: () => { setShowBreathing(false); },
    });

    /**
     * Close the topmost panel in the LIFO stack.
     * Returns true if a panel was closed, false if stack was empty.
     */
    const closeTopPanel = useCallback((): boolean => {
        const stack = openStackRef.current;
        const top = stack[stack.length - 1];
        if (!top) return false;
        // Remove from stack
        setStack((prev) => prev.filter((p) => p !== top));
        // Close the boolean
        closeFnMap.current[top]();
        return true;
    }, [setStack]);

    return {
        showMixer,
        showAuth,
        showHistory,
        showGarden,
        showSettings,
        showTodo,
        showShortcuts,
        showBreathing,
        openStack,
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
        closeTopPanel,
    };
}

export type AppPanelsState = ReturnType<typeof useAppPanels>;
