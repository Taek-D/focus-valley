import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Clock, Coffee, Sunset, Target, SkipForward, Globe } from "lucide-react";
import { useTimerSettings, LIMITS, type TimerDurations } from "../hooks/useTimerSettings";
import { useTranslation, useI18n, LOCALE_LABELS, type TranslationKey, type Locale } from "../lib/i18n";

type TimerSettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

const FIELDS: { key: keyof TimerDurations; labelKey: TranslationKey; icon: React.ReactNode }[] = [
    { key: "focus", labelKey: "timer.focus", icon: <Clock size={14} /> },
    { key: "shortBreak", labelKey: "timer.shortBreak", icon: <Coffee size={14} /> },
    { key: "longBreak", labelKey: "timer.longBreak", icon: <Sunset size={14} /> },
];

const DurationField: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    min: number;
    max: number;
    step?: number;
    minutesLabel: string;
    onDecrease: () => void;
    onIncrease: () => void;
    onCommit: (value: number) => void;
}> = ({ label, icon, value, min, max, minutesLabel, onDecrease, onIncrease, onCommit }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const startEditing = () => {
        setDraft(String(value));
        setEditing(true);
    };

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const commitDraft = () => {
        const parsed = parseInt(draft, 10);
        if (!isNaN(parsed)) onCommit(parsed);
        setEditing(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground/60">
                {icon}
                <span className="font-body text-[10px] font-medium tracking-[0.1em] uppercase">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onDecrease}
                    disabled={value <= min}
                    aria-label={`Decrease ${label}`}
                    className="w-10 h-10 font-display text-base rounded-xl border border-foreground/10 text-foreground disabled:opacity-20 hover:border-foreground/20 transition-all flex items-center justify-center"
                >
                    -
                </button>
                <div className="flex-1 text-center">
                    {editing ? (
                        <input
                            ref={inputRef}
                            type="number"
                            value={draft}
                            min={min}
                            max={max}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commitDraft}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitDraft();
                                if (e.key === "Escape") setEditing(false);
                            }}
                            className="w-16 mx-auto font-display text-2xl text-foreground text-center bg-foreground/5 rounded-lg outline-none focus:ring-1 focus:ring-foreground/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={{ fontWeight: 300 }}
                        />
                    ) : (
                        <button
                            onClick={startEditing}
                            className="cursor-text hover:bg-foreground/5 rounded-lg px-2 py-0.5 transition-colors"
                            aria-label={`Edit ${label} value`}
                        >
                            <span className="font-display text-2xl text-foreground" style={{ fontWeight: 300 }}>{value}</span>
                        </button>
                    )}
                    <span className="font-body text-[10px] text-muted-foreground/50 ml-1">{minutesLabel}</span>
                </div>
                <button
                    onClick={onIncrease}
                    disabled={value >= max}
                    aria-label={`Increase ${label}`}
                    className="w-10 h-10 font-display text-base rounded-xl border border-foreground/10 text-foreground disabled:opacity-20 hover:border-foreground/20 transition-all flex items-center justify-center"
                >
                    +
                </button>
            </div>
            <div className="font-body text-[10px] text-muted-foreground/30 text-center">
                {min} – {max} {minutesLabel}
            </div>
        </div>
    );
};

export const TimerSettings: React.FC<TimerSettingsProps> = ({ isOpen, onClose }) => {
    const { focus, shortBreak, longBreak, dailyGoal, autoAdvance, setDuration, setDailyGoal, setAutoAdvance, resetDefaults } = useTimerSettings();
    const values: TimerDurations = { focus, shortBreak, longBreak };
    const closeRef = useRef<HTMLButtonElement>(null);
    const { t } = useTranslation();
    const { locale, setLocale } = useI18n();

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
                            <h3 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">{t("settings.settings")}</h3>
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
                            {FIELDS.map(({ key, labelKey, icon }) => {
                                const { min, max } = LIMITS[key];
                                const label = t(labelKey);
                                return (
                                    <DurationField
                                        key={key}
                                        label={label}
                                        icon={icon}
                                        value={values[key]}
                                        min={min}
                                        max={max}
                                        minutesLabel={t("settings.minutes")}
                                        onDecrease={() => setDuration(key, values[key] - 1)}
                                        onIncrease={() => setDuration(key, values[key] + 1)}
                                        onCommit={(v) => setDuration(key, v)}
                                    />
                                );
                            })}
                        </div>

                        {/* Daily Goal */}
                        <DurationField
                            label={t("settings.dailyGoal")}
                            icon={<Target size={14} />}
                            value={dailyGoal}
                            min={LIMITS.dailyGoal.min}
                            max={LIMITS.dailyGoal.max}
                            step={10}
                            minutesLabel={t("settings.minutes")}
                            onDecrease={() => setDailyGoal(dailyGoal - 10)}
                            onIncrease={() => setDailyGoal(dailyGoal + 10)}
                            onCommit={(v) => setDailyGoal(v)}
                        />

                        {/* Auto-advance */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <SkipForward size={14} />
                                <span className="font-body text-[10px] font-medium tracking-[0.1em] uppercase">{t("settings.autoAdvance")}</span>
                            </div>
                            <button
                                onClick={() => setAutoAdvance(!autoAdvance)}
                                aria-label={autoAdvance ? "Disable auto-advance" : "Enable auto-advance"}
                                className={`w-10 h-5 rounded-full transition-all flex items-center ${
                                    autoAdvance ? "bg-foreground/20 justify-end" : "bg-foreground/5 justify-start"
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full mx-0.5 transition-colors ${
                                    autoAdvance ? "bg-foreground" : "bg-foreground/30"
                                }`} />
                            </button>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <Globe size={14} />
                                <span className="font-body text-[10px] font-medium tracking-[0.1em] uppercase">{t("settings.language")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {(["en", "ko", "ja"] as const).map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => setLocale(loc as Locale)}
                                        className={`px-2.5 py-1 rounded-lg font-body text-[10px] transition-all ${
                                            locale === loc
                                                ? "bg-foreground/10 text-foreground font-medium"
                                                : "text-muted-foreground/40 hover:text-muted-foreground/60"
                                        }`}
                                    >
                                        {LOCALE_LABELS[loc]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reset */}
                        <button
                            onClick={resetDefaults}
                            className="w-full py-2.5 flex items-center justify-center gap-2 font-body text-[10px] font-medium tracking-wide text-muted-foreground/50 hover:text-foreground rounded-xl border border-foreground/5 hover:border-foreground/15 transition-all"
                        >
                            <RotateCcw size={10} />
                            {t("settings.resetDefaults")}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
