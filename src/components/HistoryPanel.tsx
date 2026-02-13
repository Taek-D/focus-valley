import React, { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, Clock, Trophy, Flame, TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";
import type { PlantType, FocusSession } from "../hooks/useGarden";
import { getWeeklyStats } from "../lib/stats";

type HistoryEntry = { type: PlantType; date: string };

type HistoryPanelProps = {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    totalFocusMinutes: number;
    focusSessions: FocusSession[];
    currentStreak: number;
    bestStreak: number;
};

const PLANT_ICONS: Record<PlantType, string> = {
    DEFAULT: "\u{1F333}",
    CACTUS: "\u{1F335}",
    SUNFLOWER: "\u{1F33B}",
    PINE: "\u{1F332}",
    ROSE: "\u{1F339}",
    ORCHID: "\u{1F33A}",
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

function getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
}

function getDayLabel(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short" });
}

const DAILY_GOAL_MINUTES = 120;

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
    isOpen, onClose, history, totalFocusMinutes, focusSessions, currentStreak, bestStreak,
}) => {
    const grouped = groupByDate(history);
    const sortedDates = Object.keys(grouped).reverse();
    const totalHours = Math.floor(totalFocusMinutes / 60);
    const remainingMinutes = totalFocusMinutes % 60;
    const closeRef = useRef<HTMLButtonElement>(null);

    const weekData = useMemo(() => {
        const days = getLast7Days();
        const minutesByDay: Record<string, number> = {};
        for (const session of focusSessions) {
            minutesByDay[session.date] = (minutesByDay[session.date] || 0) + session.minutes;
        }
        const data = days.map((d) => ({ date: d, minutes: minutesByDay[d] || 0 }));
        const max = Math.max(...data.map((d) => d.minutes), DAILY_GOAL_MINUTES, 1);
        return { data, max };
    }, [focusSessions]);

    const weeklyStats = useMemo(() => getWeeklyStats(focusSessions), [focusSessions]);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) onClose();
    };

    const goalLinePercent = (DAILY_GOAL_MINUTES / weekData.max) * 100;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Garden history"
                        className="fixed bottom-0 left-0 right-0 max-h-[85vh] glass-strong rounded-t-3xl shadow-cozy-lg z-50 flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-8 h-0.5 rounded-full bg-foreground/10" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-3 pt-1">
                            <h2 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">Stats & History</h2>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close history panel"
                                className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-2 px-5 pb-4">
                            {[
                                { icon: <Trophy size={12} />, value: history.length, label: "Harvested", color: "text-foreground" },
                                { icon: <Clock size={12} />, value: totalHours > 0 ? `${totalHours}h` : `${remainingMinutes}m`, label: "Focus", color: "text-foreground" },
                                { icon: <Flame size={12} />, value: currentStreak, label: "Streak", color: "text-foreground" },
                                { icon: <TrendingUp size={12} />, value: bestStreak, label: "Best", color: "text-foreground" },
                            ].map((stat, i) => (
                                <div key={i} className="rounded-2xl border border-foreground/5 p-3 text-center">
                                    <div className="text-muted-foreground/40 mx-auto mb-1.5 flex justify-center">{stat.icon}</div>
                                    <div className={`font-display text-lg ${stat.color}`} style={{ fontWeight: 400 }}>{stat.value}</div>
                                    <div className="font-body text-[9px] text-muted-foreground/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* 7-Day Focus Chart */}
                        <div className="px-5 pb-4">
                            <div className="font-body text-[10px] font-medium text-muted-foreground/40 tracking-[0.1em] uppercase mb-2">This Week</div>
                            <div className="relative flex items-end gap-1.5 h-24">
                                {/* Goal line */}
                                <div
                                    className="absolute left-0 right-0 border-t border-dashed border-foreground/10 pointer-events-none"
                                    style={{ bottom: `${Math.min(goalLinePercent, 100) * 0.7}%` }}
                                >
                                    <span className="absolute -top-3 right-0 font-body text-[8px] text-muted-foreground/25">
                                        {DAILY_GOAL_MINUTES}m goal
                                    </span>
                                </div>

                                {weekData.data.map((day, i) => {
                                    const height = day.minutes > 0 ? Math.max((day.minutes / weekData.max) * 100, 8) : 4;
                                    const isToday = i === 6;
                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                            {/* Minute label */}
                                            <div className="font-body text-[8px] text-muted-foreground/40 h-3 flex items-end">
                                                {day.minutes > 0 && `${day.minutes}m`}
                                            </div>
                                            <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                                                <motion.div
                                                    className={`w-full max-w-[28px] rounded-t-lg ${
                                                        isToday
                                                            ? "bg-foreground/30"
                                                            : day.minutes > 0
                                                            ? "bg-foreground/10"
                                                            : "bg-foreground/4"
                                                    }`}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${height}%` }}
                                                    transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                                                />
                                            </div>
                                            <div className={`font-body text-[9px] ${isToday ? "text-foreground font-medium" : "text-muted-foreground/40"}`}>
                                                {getDayLabel(day.date)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Weekly Summary Card */}
                        <div className="px-5 pb-4">
                            <div className="rounded-2xl border border-foreground/5 p-4">
                                <div className="font-body text-[10px] font-medium text-muted-foreground/40 tracking-[0.1em] uppercase mb-3">Weekly Summary</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-foreground/5">
                                            <Clock size={11} className="text-muted-foreground/50" />
                                        </div>
                                        <div>
                                            <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                                {weeklyStats.totalMinutes >= 60
                                                    ? `${Math.floor(weeklyStats.totalMinutes / 60)}h ${weeklyStats.totalMinutes % 60}m`
                                                    : `${weeklyStats.totalMinutes}m`}
                                            </div>
                                            <div className="font-body text-[9px] text-muted-foreground/40">Total this week</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-foreground/5">
                                            <Target size={11} className="text-muted-foreground/50" />
                                        </div>
                                        <div>
                                            <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                                {weeklyStats.avgMinutes >= 60
                                                    ? `${Math.floor(weeklyStats.avgMinutes / 60)}h ${weeklyStats.avgMinutes % 60}m`
                                                    : `${weeklyStats.avgMinutes}m`}
                                            </div>
                                            <div className="font-body text-[9px] text-muted-foreground/40">Daily average</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-foreground/5">
                                            <Calendar size={11} className="text-muted-foreground/50" />
                                        </div>
                                        <div>
                                            <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                                {weeklyStats.bestDay}
                                            </div>
                                            <div className="font-body text-[9px] text-muted-foreground/40">Most focused</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-foreground/5">
                                            {weeklyStats.changePercent >= 0
                                                ? <TrendingUp size={11} className="text-muted-foreground/50" />
                                                : <TrendingDown size={11} className="text-muted-foreground/50" />}
                                        </div>
                                        <div>
                                            <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                                {weeklyStats.changePercent >= 0 ? "+" : ""}{weeklyStats.changePercent}%
                                            </div>
                                            <div className="font-body text-[9px] text-muted-foreground/40">vs last week</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
                            {history.length === 0 ? (
                                <div className="text-center py-10 space-y-3">
                                    <div className="text-3xl opacity-40">{"\u{1F331}"}</div>
                                    <p className="font-body text-xs font-medium text-muted-foreground/50">No harvests yet</p>
                                    <p className="font-body text-xs text-muted-foreground/30">
                                        Complete a focus session<br />to grow your first plant!
                                    </p>
                                </div>
                            ) : (
                                sortedDates.map((date) => (
                                    <div key={date}>
                                        <div className="font-body text-[10px] text-muted-foreground/40 mb-2 pb-1 border-b border-foreground/5">
                                            {date}
                                        </div>
                                        <div className="space-y-1">
                                            {grouped[date].map((entry, i) => (
                                                <motion.div
                                                    key={`${date}-${i}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-foreground/3 transition-colors"
                                                >
                                                    <span className="text-base">{PLANT_ICONS[entry.type]}</span>
                                                    <span className="font-body text-xs flex-1 text-foreground/70">{entry.type}</span>
                                                    <span className="font-body text-[10px] text-muted-foreground/40">
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
