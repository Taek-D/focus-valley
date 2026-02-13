import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Clock, Coffee, Sunset } from "lucide-react";
import { useTimerSettings, LIMITS, type TimerDurations } from "../hooks/useTimerSettings";

type TimerSettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

const FIELDS: { key: keyof TimerDurations; label: string; icon: React.ReactNode }[] = [
    { key: "focus", label: "Focus", icon: <Clock size={14} /> },
    { key: "shortBreak", label: "Short Break", icon: <Coffee size={14} /> },
    { key: "longBreak", label: "Long Break", icon: <Sunset size={14} /> },
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Timer settings"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-strong rounded-2xl shadow-cozy-lg p-6 max-w-sm w-full mx-4 space-y-5"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">Settings</h3>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close settings"
                                className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Duration Fields */}
                        <div className="space-y-4">
                            {FIELDS.map(({ key, label, icon }) => {
                                const { min, max } = LIMITS[key];
                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex items-center gap-2 text-muted-foreground/60">
                                            {icon}
                                            <span className="font-body text-[10px] font-medium tracking-[0.1em] uppercase">{label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setDuration(key, values[key] - 1)}
                                                disabled={values[key] <= min}
                                                aria-label={`Decrease ${label}`}
                                                className="w-10 h-10 font-display text-base rounded-xl border border-foreground/10 text-foreground disabled:opacity-20 hover:border-foreground/20 transition-all flex items-center justify-center"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 text-center">
                                                <span className="font-display text-2xl text-foreground" style={{ fontWeight: 300 }}>{values[key]}</span>
                                                <span className="font-body text-[10px] text-muted-foreground/50 ml-1">min</span>
                                            </div>
                                            <button
                                                onClick={() => setDuration(key, values[key] + 1)}
                                                disabled={values[key] >= max}
                                                aria-label={`Increase ${label}`}
                                                className="w-10 h-10 font-display text-base rounded-xl border border-foreground/10 text-foreground disabled:opacity-20 hover:border-foreground/20 transition-all flex items-center justify-center"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="font-body text-[10px] text-muted-foreground/30 text-center">
                                            {min} – {max} min
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reset */}
                        <button
                            onClick={resetDefaults}
                            className="w-full py-2.5 flex items-center justify-center gap-2 font-body text-[10px] font-medium tracking-wide text-muted-foreground/50 hover:text-foreground rounded-xl border border-foreground/5 hover:border-foreground/15 transition-all"
                        >
                            <RotateCcw size={10} />
                            Reset to Defaults
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
