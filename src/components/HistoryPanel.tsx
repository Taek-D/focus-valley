import React, { useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Trophy, Flame, TrendingUp, TrendingDown, Calendar, Target, Download, Share2 } from "lucide-react";
import type { PlantType, FocusSession } from "../hooks/useGarden";
import { useTimerSettings } from "../hooks/useTimerSettings";
import { useCategories } from "../hooks/useCategories";
import { getWeeklyStats, getMonthlyHeatmap, exportSessionsCSV, downloadCSV, getCategoryBreakdown } from "../lib/stats";
import { PLANT_ICONS } from "../lib/constants";
import { getDayLabel, getLast7Days, groupByDate } from "../lib/date-utils";
import { generateShareCard, shareOrDownload } from "../lib/share-card";
import { BottomSheet } from "./ui/BottomSheet";
import { WaitlistBanner } from "./WaitlistBanner";
import { trackShareCard, trackCsvExport } from "../lib/analytics";

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

const HEATMAP_COLORS = [
    "bg-foreground/4",
    "bg-foreground/10",
    "bg-foreground/20",
    "bg-foreground/30",
    "bg-foreground/45",
];

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
    isOpen, onClose, history, totalFocusMinutes, focusSessions, currentStreak, bestStreak,
}) => {
    const grouped = groupByDate(history);
    const sortedDates = Object.keys(grouped).reverse();
    const totalHours = Math.floor(totalFocusMinutes / 60);
    const remainingMinutes = totalFocusMinutes % 60;
    const { dailyGoal } = useTimerSettings();
    const { categories } = useCategories();
    const [sharing, setSharing] = useState(false);

    const weekData = useMemo(() => {
        const days = getLast7Days();
        const minutesByDay: Record<string, number> = {};
        for (const session of focusSessions) {
            minutesByDay[session.date] = (minutesByDay[session.date] || 0) + session.minutes;
        }
        const data = days.map((d) => ({ date: d, minutes: minutesByDay[d] || 0 }));
        const max = Math.max(...data.map((d) => d.minutes), dailyGoal, 1);
        return { data, max };
    }, [focusSessions, dailyGoal]);

    const heatmapWeeks = useMemo(() => getMonthlyHeatmap(focusSessions, dailyGoal), [focusSessions, dailyGoal]);

    const weeklyStats = useMemo(() => getWeeklyStats(focusSessions), [focusSessions]);

    const categoryBreakdown = useMemo(() => getCategoryBreakdown(focusSessions, categories), [focusSessions, categories]);

    const goalLinePercent = (dailyGoal / weekData.max) * 100;

    const handleExport = () => {
        const csv = exportSessionsCSV(focusSessions, categories);
        downloadCSV(csv, `focus-valley-${new Date().toISOString().slice(0, 10)}.csv`);
        trackCsvExport();
    };

    const handleShare = useCallback(async () => {
        setSharing(true);
        try {
            const today = new Date().toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
            });
            const todaySessions = focusSessions.filter((s) => s.date === new Date().toISOString().slice(0, 10));
            const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);
            const todayBreakdown = getCategoryBreakdown(todaySessions, categories);

            const blob = await generateShareCard({
                date: today,
                totalMinutes: todayMinutes,
                streak: currentStreak,
                categoryBreakdown: todayBreakdown,
                plantCount: history.length,
            });

            await shareOrDownload(blob, `focus-valley-${new Date().toISOString().slice(0, 10)}.png`);
            trackShareCard();
        } finally {
            setSharing(false);
        }
    }, [focusSessions, categories, currentStreak, history.length]);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Stats & History"
            headerActions={
                <>
                    <button
                        onClick={handleShare}
                        disabled={sharing}
                        aria-label="Share focus card"
                        className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all disabled:opacity-30"
                    >
                        <Share2 size={14} />
                    </button>
                    <button
                        onClick={handleExport}
                        aria-label="Export data as CSV"
                        className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all"
                    >
                        <Download size={14} />
                    </button>
                </>
            }
        >
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
                            {dailyGoal}m goal
                        </span>
                    </div>

                    {weekData.data.map((day, i) => {
                        const height = day.minutes > 0 ? Math.max((day.minutes / weekData.max) * 100, 8) : 4;
                        const isLast = i === 6;
                        return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                {/* Minute label */}
                                <div className="font-body text-[8px] text-muted-foreground/40 h-3 flex items-end">
                                    {day.minutes > 0 && `${day.minutes}m`}
                                </div>
                                <div className="w-full flex items-end justify-center" style={{ height: 56 }}>
                                    <motion.div
                                        className={`w-full max-w-[28px] rounded-t-lg ${
                                            isLast
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
                                <div className={`font-body text-[9px] ${isLast ? "text-foreground font-medium" : "text-muted-foreground/40"}`}>
                                    {getDayLabel(day.date)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Activity Heatmap — 13 weeks */}
            <div className="px-5 pb-4">
                <div className="font-body text-[10px] font-medium text-muted-foreground/40 tracking-[0.1em] uppercase mb-2">
                    Activity · Last 3 Months
                </div>
                <div className="flex gap-[2px] justify-center">
                    {heatmapWeeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col gap-[2px]">
                            {week.map((day, di) => (
                                <div
                                    key={`${wi}-${di}`}
                                    className={`w-[10px] h-[10px] rounded-[2px] ${
                                        day === null
                                            ? "bg-transparent"
                                            : HEATMAP_COLORS[day.level]
                                    }`}
                                    title={day ? `${day.date}: ${day.minutes}m` : ""}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-end gap-1 mt-1.5">
                    <span className="font-body text-[8px] text-muted-foreground/25">Less</span>
                    {HEATMAP_COLORS.map((color, i) => (
                        <div key={i} className={`w-[8px] h-[8px] rounded-[1px] ${color}`} />
                    ))}
                    <span className="font-body text-[8px] text-muted-foreground/25">More</span>
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

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
                <div className="px-5 pb-4">
                    <div className="rounded-2xl border border-foreground/5 p-4">
                        <div className="font-body text-[10px] font-medium text-muted-foreground/40 tracking-[0.1em] uppercase mb-3">
                            Category Breakdown
                        </div>

                        {/* Stacked bar */}
                        <div className="flex h-2 rounded-full overflow-hidden mb-3">
                            {categoryBreakdown.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="h-full first:rounded-l-full last:rounded-r-full"
                                    style={{
                                        width: `${cat.percent}%`,
                                        backgroundColor: `hsl(${cat.color})`,
                                        minWidth: cat.percent > 0 ? 4 : 0,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Category rows */}
                        <div className="space-y-2">
                            {categoryBreakdown.map((cat) => (
                                <div key={cat.id} className="flex items-center gap-2.5">
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: `hsl(${cat.color})` }}
                                    />
                                    <span className="text-sm leading-none">{cat.emoji}</span>
                                    <span className="font-body text-[11px] text-foreground/70 flex-1">{cat.label}</span>
                                    <span className="font-body text-[11px] text-foreground/50 tabular-nums">
                                        {cat.minutes >= 60
                                            ? `${Math.floor(cat.minutes / 60)}h ${cat.minutes % 60}m`
                                            : `${cat.minutes}m`}
                                    </span>
                                    <span className="font-body text-[9px] text-muted-foreground/40 w-8 text-right tabular-nums">
                                        {cat.percent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Waitlist CTA */}
            <div className="px-5 pb-4">
                <WaitlistBanner source="history" />
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
        </BottomSheet>
    );
};
