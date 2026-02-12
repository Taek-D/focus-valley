import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TreePine, Clock, Trophy } from "lucide-react";
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
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
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-card border-l-2 border-border shadow-[-6px_0_20px_rgba(0,0,0,0.1)] dark:shadow-[-6px_0_20px_rgba(0,0,0,0.4)] z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b-2 border-border">
                            <div className="flex items-center gap-2.5">
                                <TreePine size={18} className="text-primary" />
                                <h2 className="font-pixel text-[11px] tracking-wider text-primary">GARDEN HISTORY</h2>
                            </div>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close history panel"
                                className="p-1.5 border-2 border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 p-5 border-b-2 border-border">
                            <div className="bg-primary/10 border-2 border-primary/20 p-4 text-center">
                                <Trophy size={16} className="text-primary mx-auto mb-2" />
                                <div className="font-pixel text-lg text-primary">{history.length}</div>
                                <div className="font-retro text-sm text-muted-foreground">Harvested</div>
                            </div>
                            <div className="bg-accent/10 border-2 border-accent/20 p-4 text-center">
                                <Clock size={16} className="text-accent mx-auto mb-2" />
                                <div className="font-pixel text-lg text-accent">
                                    {totalHours > 0 ? `${totalHours}h${remainingMinutes}m` : `${remainingMinutes}m`}
                                </div>
                                <div className="font-retro text-sm text-muted-foreground">Focus Time</div>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {history.length === 0 ? (
                                <div className="text-center py-16 space-y-3">
                                    <div className="text-4xl">🌱</div>
                                    <p className="font-pixel text-[10px] text-muted-foreground tracking-wider">NO HARVESTS YET</p>
                                    <p className="font-retro text-base text-muted-foreground">
                                        Complete a focus session<br />to grow your first plant!
                                    </p>
                                </div>
                            ) : (
                                sortedDates.map((date) => (
                                    <div key={date}>
                                        <div className="font-retro text-sm text-muted-foreground mb-2 pb-1 border-b border-border/50">
                                            {date}
                                        </div>
                                        <div className="space-y-1.5">
                                            {grouped[date].map((entry, i) => (
                                                <motion.div
                                                    key={`${date}-${i}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-center gap-3 py-2 px-3 bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors"
                                                >
                                                    <span className="text-lg">{PLANT_ICONS[entry.type]}</span>
                                                    <span className="font-retro text-base flex-1">{entry.type}</span>
                                                    <span className="font-retro text-sm text-muted-foreground">
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
