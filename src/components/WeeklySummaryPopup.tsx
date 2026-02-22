import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { getWeeklyStats } from "@/lib/stats";
import { useTranslation } from "@/lib/i18n";
import type { FocusSession } from "@/hooks/useGarden";

type WeeklySummaryPopupProps = {
    isOpen: boolean;
    onDismiss: () => void;
    focusSessions: FocusSession[];
};

export function WeeklySummaryPopup({ isOpen, onDismiss, focusSessions }: WeeklySummaryPopupProps) {
    const { t } = useTranslation();
    const stats = useMemo(() => getWeeklyStats(focusSessions), [focusSessions]);

    // Show stats for last week (the getWeeklyStats gives "thisWeek" relative to now,
    // but since this shows on Monday, the lastWeek data is the real "last week")
    const lastWeekTotal = stats.lastWeek.reduce((sum, d) => sum + d.minutes, 0);
    const hasData = lastWeekTotal > 0;

    const formatTime = (minutes: number) => {
        if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
        return `${minutes}m`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                    onClick={onDismiss}
                    role="dialog"
                    aria-modal="true"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-strong rounded-2xl shadow-cozy-lg p-6 max-w-sm w-full mx-4 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-foreground/60" />
                            <h3 className="font-display text-sm font-medium text-foreground">
                                {t("weeklySummary.title")}
                            </h3>
                        </div>

                        {hasData ? (
                            <div className="grid grid-cols-2 gap-3 py-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-foreground/5">
                                        <Clock size={11} className="text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                            {formatTime(lastWeekTotal)}
                                        </div>
                                        <div className="font-body text-[9px] text-muted-foreground/40">
                                            {t("weeklySummary.totalTime")}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-foreground/5">
                                        <Clock size={11} className="text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                            {formatTime(Math.round(lastWeekTotal / 7))}
                                        </div>
                                        <div className="font-body text-[9px] text-muted-foreground/40">
                                            {t("weeklySummary.dailyAvg")}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-foreground/5">
                                        {stats.changePercent >= 0
                                            ? <TrendingUp size={11} className="text-muted-foreground/50" />
                                            : <TrendingDown size={11} className="text-muted-foreground/50" />
                                        }
                                    </div>
                                    <div>
                                        <div className="font-display text-sm text-foreground" style={{ fontWeight: 400 }}>
                                            {stats.changePercent >= 0 ? "+" : ""}{stats.changePercent}%
                                        </div>
                                        <div className="font-body text-[9px] text-muted-foreground/40">
                                            {t("weeklySummary.vsLastWeek")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="font-body text-xs text-muted-foreground/50 py-4 text-center">
                                {t("weeklySummary.noData")}
                            </p>
                        )}

                        <button
                            onClick={onDismiss}
                            className="w-full py-3 rounded-2xl bg-foreground/8 text-foreground font-body text-[12px] font-medium tracking-wide uppercase hover:bg-foreground/12 transition-all"
                        >
                            {t("weeklySummary.confirm")}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
