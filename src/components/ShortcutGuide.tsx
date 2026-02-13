import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ShortcutGuideProps = {
    isOpen: boolean;
    onClose: () => void;
};

const SHORTCUTS = [
    { key: "Space", desc: "Start / Pause" },
    { key: "R", desc: "Reset timer" },
    { key: "S", desc: "Skip to next mode" },
    { key: "1", desc: "Focus mode" },
    { key: "2", desc: "Short Break mode" },
    { key: "3", desc: "Long Break mode" },
    { key: "M", desc: "Toggle sounds" },
    { key: "?", desc: "Shortcut guide" },
    { key: "Esc", desc: "Close panel" },
];

export const ShortcutGuide: React.FC<ShortcutGuideProps> = ({ isOpen, onClose }) => {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" || e.key === "?") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
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
                    aria-label="Keyboard shortcuts"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-strong rounded-2xl shadow-cozy-lg p-5 max-w-xs w-full mx-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                                Keyboard Shortcuts
                            </h3>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close shortcuts"
                                className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {SHORTCUTS.map(({ key, desc }) => (
                                <div key={key} className="flex items-center justify-between py-1">
                                    <span className="font-body text-xs text-foreground/60">{desc}</span>
                                    <kbd className="px-2 py-0.5 rounded-lg bg-foreground/5 border border-foreground/8 font-body text-[10px] font-medium text-foreground/50 min-w-[36px] text-center">
                                        {key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
