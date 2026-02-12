import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TreePine } from "lucide-react";
import type { PlantType } from "../hooks/useGarden";

type HistoryEntry = { type: PlantType; date: string };

type HistoryPanelProps = {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    totalFocusMinutes: number;
};

const PLANT_ICONS: Record<PlantType, string> = {
    DEFAULT: "🌳",
    CACTUS: "🌵",
    SUNFLOWER: "🌻",
    PINE: "🌲",
};

function groupByDate(history: HistoryEntry[]): Record<string, HistoryEntry[]> {
    const groups: Record<string, HistoryEntry[]> = {};
    for (const entry of history) {
        const date = new Date(entry.date).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
    }
    return groups;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
    isOpen, onClose, history, totalFocusMinutes,
}) => {
    const grouped = groupByDate(history);
    const sortedDates = Object.keys(grouped).reverse();
    const totalHours = Math.floor(totalFocusMinutes / 60);
    const remainingMinutes = totalFocusMinutes % 60;
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
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Garden history"
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <TreePine size={20} className="text-primary" />
                                <h2 className="font-pixel text-sm text-primary">GARDEN HISTORY</h2>
                            </div>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close history panel"
                                className="p-1 hover:bg-accent rounded transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 p-4 border-b border-border">
                            <div className="bg-secondary/50 p-3 text-center">
                                <div className="font-pixel text-lg text-primary">{history.length}</div>
                                <div className="text-xs text-muted-foreground">HARVESTED</div>
                            </div>
                            <div className="bg-secondary/50 p-3 text-center">
                                <div className="font-pixel text-lg text-primary">
                                    {totalHours > 0 ? `${totalHours}h${remainingMinutes}m` : `${remainingMinutes}m`}
                                </div>
                                <div className="text-xs text-muted-foreground">FOCUS TIME</div>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center text-muted-foreground text-sm py-12">
                                    <p className="font-pixel text-xs mb-2">NO HARVESTS YET</p>
                                    <p>Complete a focus session to grow your first plant!</p>
                                </div>
                            ) : (
                                sortedDates.map((date) => (
                                    <div key={date}>
                                        <div className="text-xs font-mono text-muted-foreground mb-2">{date}</div>
                                        <div className="space-y-1">
                                            {grouped[date].map((entry, i) => (
                                                <motion.div
                                                    key={`${date}-${i}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-center gap-3 py-2 px-3 bg-secondary/30 rounded"
                                                >
                                                    <span className="text-xl">{PLANT_ICONS[entry.type]}</span>
                                                    <div className="flex-1">
                                                        <span className="text-sm">{entry.type}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
