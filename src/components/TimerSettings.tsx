import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Clock, Coffee, Sunset } from "lucide-react";
import { useTimerSettings, LIMITS, type TimerDurations } from "../hooks/useTimerSettings";

type TimerSettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

const FIELDS: { key: keyof TimerDurations; label: string; icon: React.ReactNode }[] = [
    { key: "focus", label: "FOCUS", icon: <Clock size={16} /> },
    { key: "shortBreak", label: "SHORT BREAK", icon: <Coffee size={16} /> },
    { key: "longBreak", label: "LONG BREAK", icon: <Sunset size={16} /> },
];

export const TimerSettings: React.FC<TimerSettingsProps> = ({ isOpen, onClose }) => {
    const { focus, shortBreak, longBreak, setDuration, resetDefaults } = useTimerSettings();
    const values: TimerDurations = { focus, shortBreak, longBreak };
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Timer settings"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 5 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] p-6 max-w-sm w-full mx-4 space-y-5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-pixel text-[11px] tracking-wider text-primary">TIMER SETTINGS</h3>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close settings"
                                className="p-1.5 border-2 border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Duration Fields */}
                        <div className="space-y-4">
                            {FIELDS.map(({ key, label, icon }) => {
                                const { min, max } = LIMITS[key];
                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            {icon}
                                            <span className="font-pixel text-[9px] tracking-wider">{label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setDuration(key, values[key] - 1)}
                                                disabled={values[key] <= min}
                                                aria-label={`Decrease ${label}`}
                                                className="w-10 h-10 font-pixel text-lg border-2 border-border bg-card hover:bg-muted hover:border-primary/30 text-foreground disabled:opacity-30 disabled:hover:bg-card transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center">
                                                <span className="font-pixel text-2xl text-foreground">{values[key]}</span>
                                                <span className="font-retro text-sm text-muted-foreground ml-1">min</span>
                                            </div>
                                            <button
                                                onClick={() => setDuration(key, values[key] + 1)}
                                                disabled={values[key] >= max}
                                                aria-label={`Increase ${label}`}
                                                className="w-10 h-10 font-pixel text-lg border-2 border-border bg-card hover:bg-muted hover:border-primary/30 text-foreground disabled:opacity-30 disabled:hover:bg-card transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none"
                                            >
                                                +
                                            </button>
                                        </div>
                                        {/* Range indicator */}
                                        <div className="font-retro text-xs text-muted-foreground/50 text-center">
                                            {min} – {max} min
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reset to defaults */}
                        <button
                            onClick={resetDefaults}
                            className="w-full py-2.5 flex items-center justify-center gap-2 font-pixel text-[9px] tracking-wider text-muted-foreground hover:text-primary border-2 border-border hover:border-primary/30 transition-all"
                        >
                            <RotateCcw size={12} />
                            RESET TO DEFAULTS (25/5/15)
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
