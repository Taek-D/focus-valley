import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
    X,
    RotateCcw,
    Clock,
    Coffee,
    Sunset,
    Target,
    SkipForward,
    Globe,
    HelpCircle,
    Download,
    Upload,
} from "lucide-react";
import {
    useTimerSettings,
    LIMITS,
    TIMER_PRESETS,
    type TimerDurations,
    type TimerPresetId,
} from "../hooks/useTimerSettings";
import { LOCALE_LABELS, useTranslation, useI18n, type TranslationKey, type Locale } from "../lib/i18n";
import { useTour } from "../hooks/useTour";
import { downloadBackup, restoreBackup } from "@/lib/backup";
import { trackBackupEvent } from "@/lib/analytics";
import { useDialogA11y } from "@/hooks/useDialogA11y";

type TimerSettingsProps = {
    isOpen: boolean;
    onClose: () => void;
};

const FIELDS: { key: keyof TimerDurations; labelKey: TranslationKey; icon: React.ReactNode }[] = [
    { key: "focus", labelKey: "timer.focus", icon: <Clock size={14} /> },
    { key: "shortBreak", labelKey: "timer.shortBreak", icon: <Coffee size={14} /> },
    { key: "longBreak", labelKey: "timer.longBreak", icon: <Sunset size={14} /> },
];

const LOCALE_DISPLAY_LABELS: Record<Locale, string> = {
    en: "English",
    ko: "한국어",
    ja: "日本語",
};

void LOCALE_DISPLAY_LABELS;

const DurationField: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    min: number;
    max: number;
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
        if (!Number.isNaN(parsed)) onCommit(parsed);
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 font-display text-base text-foreground transition-all hover:border-foreground/20 disabled:opacity-20"
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
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={commitDraft}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") commitDraft();
                                if (event.key === "Escape") setEditing(false);
                            }}
                            className="mx-auto w-16 rounded-lg bg-foreground/5 text-center font-display text-2xl text-foreground outline-none focus:ring-1 focus:ring-foreground/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            style={{ fontWeight: 300 }}
                        />
                    ) : (
                        <button
                            onClick={startEditing}
                            className="rounded-lg px-2 py-0.5 transition-colors hover:bg-foreground/5"
                            aria-label={`Edit ${label} value`}
                        >
                            <span className="font-display text-2xl text-foreground" style={{ fontWeight: 300 }}>{value}</span>
                        </button>
                    )}
                    <span className="ml-1 font-body text-[10px] text-muted-foreground/50">{minutesLabel}</span>
                </div>
                <button
                    onClick={onIncrease}
                    disabled={value >= max}
                    aria-label={`Increase ${label}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 font-display text-base text-foreground transition-all hover:border-foreground/20 disabled:opacity-20"
                >
                    +
                </button>
            </div>
            <div className="text-center font-body text-[10px] text-muted-foreground/30">
                {min} - {max} {minutesLabel}
            </div>
        </div>
    );
};

export const TimerSettings: React.FC<TimerSettingsProps> = ({ isOpen, onClose }) => {
    const {
        focus,
        shortBreak,
        longBreak,
        dailyGoal,
        autoAdvance,
        presetId,
        setDuration,
        setDailyGoal,
        setAutoAdvance,
        applyPreset,
        saveCustomPreset,
        resetDefaults,
    } = useTimerSettings();
    const values: TimerDurations = { focus, shortBreak, longBreak };
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const { locale, setLocale } = useI18n();
    const startTour = useTour((state) => state.startTour);
    const shouldReduceMotion = useReducedMotion();
    const [backupNotice, setBackupNotice] = useState<{
        tone: "neutral" | "success" | "error";
        message: string;
        canReload?: boolean;
    } | null>(null);

    useDialogA11y({
        isOpen,
        onClose,
        containerRef: dialogRef,
        initialFocusRef: closeRef,
    });

    const handleExportBackup = () => {
        downloadBackup();
        trackBackupEvent("export");
        setBackupNotice({ tone: "success", message: t("settings.backupExported") });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        try {
            await restoreBackup(file);
            trackBackupEvent("import_success");
            setBackupNotice({ tone: "success", message: t("settings.backupImported"), canReload: true });
        } catch {
            trackBackupEvent("import_error");
            setBackupNotice({ tone: "error", message: t("settings.backupImportFailed") });
        }
    };

    const presetButtons: Array<{ id: TimerPresetId; label: string }> = [
        ...TIMER_PRESETS.map((preset) => ({ id: preset.id, label: preset.label })),
        { id: "custom", label: t("settings.customPreset") },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Timer settings"
                >
                    <motion.div
                        ref={dialogRef}
                        initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.98, opacity: 0, y: 4 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(event) => event.stopPropagation()}
                        tabIndex={-1}
                        data-testid="settings-dialog"
                        className="glass-strong mx-4 w-full max-w-sm space-y-5 rounded-2xl p-6 shadow-cozy-lg"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-body text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">{t("settings.settings")}</h3>
                            <button
                                ref={closeRef}
                                onClick={onClose}
                                aria-label="Close settings"
                                className="rounded-xl p-1.5 text-muted-foreground/40 transition-all hover:text-foreground"
                            >
                                <X size={14} />
                            </button>
                        </div>

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
                                        onCommit={(value) => setDuration(key, value)}
                                    />
                                );
                            })}
                        </div>

                        <DurationField
                            label={t("settings.dailyGoal")}
                            icon={<Target size={14} />}
                            value={dailyGoal}
                            min={LIMITS.dailyGoal.min}
                            max={LIMITS.dailyGoal.max}
                            minutesLabel={t("settings.minutes")}
                            onDecrease={() => setDailyGoal(dailyGoal - 10)}
                            onIncrease={() => setDailyGoal(dailyGoal + 10)}
                            onCommit={(value) => setDailyGoal(value)}
                        />

                        <div className="space-y-3 rounded-2xl border border-foreground/5 p-4" data-testid="settings-presets">
                            <div className="flex items-center justify-between">
                                <span className="font-body text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60">
                                    {t("settings.presets")}
                                </span>
                                <button
                                    onClick={saveCustomPreset}
                                    className="font-body text-[10px] text-muted-foreground/40 transition-colors hover:text-foreground"
                                >
                                    {t("settings.saveCustomPreset")}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {presetButtons.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => applyPreset(preset.id)}
                                        className={`rounded-xl border px-3 py-2 font-body text-[11px] transition-all ${
                                            presetId === preset.id
                                                ? "border-foreground/20 bg-foreground/8 text-foreground"
                                                : "border-foreground/8 text-muted-foreground/50 hover:border-foreground/15 hover:text-foreground"
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <SkipForward size={14} />
                                <span className="font-body text-[10px] font-medium uppercase tracking-[0.1em]">{t("settings.autoAdvance")}</span>
                            </div>
                            <button
                                onClick={() => setAutoAdvance(!autoAdvance)}
                                aria-label={autoAdvance ? "Disable auto-advance" : "Enable auto-advance"}
                                className={`flex h-5 w-10 items-center rounded-full transition-all ${
                                    autoAdvance ? "justify-end bg-foreground/20" : "justify-start bg-foreground/5"
                                }`}
                            >
                                <div className={`mx-0.5 h-4 w-4 rounded-full transition-colors ${
                                    autoAdvance ? "bg-foreground" : "bg-foreground/30"
                                }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <Globe size={14} />
                                <span className="font-body text-[10px] font-medium uppercase tracking-[0.1em]">{t("settings.language")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {(["en", "ko", "ja"] as const).map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => setLocale(loc as Locale)}
                                        className={`rounded-lg px-2.5 py-1 font-body text-[10px] transition-all ${
                                            locale === loc
                                                ? "bg-foreground/10 font-medium text-foreground"
                                                : "text-muted-foreground/40 hover:text-muted-foreground/60"
                                        }`}
                                    >
                                        {LOCALE_LABELS[loc]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-foreground/5 p-4" data-testid="settings-backup">
                            <span className="font-body text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60">
                                {t("settings.backup")}
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleExportBackup}
                                    data-testid="backup-export"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-foreground/8 px-3 py-2 font-body text-[11px] text-foreground/70 transition-colors hover:border-foreground/15"
                                >
                                    <Download size={12} />
                                    {t("settings.exportBackup")}
                                </button>
                                <button
                                    onClick={handleImportClick}
                                    data-testid="backup-import"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-foreground/8 px-3 py-2 font-body text-[11px] text-foreground/70 transition-colors hover:border-foreground/15"
                                >
                                    <Upload size={12} />
                                    {t("settings.importBackup")}
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/json"
                                className="hidden"
                                data-testid="backup-import-input"
                                onChange={handleImportBackup}
                            />
                            {backupNotice && (
                                <div data-testid="settings-backup-notice" className={`space-y-2 rounded-xl px-3 py-2 ${
                                    backupNotice.tone === "error"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-foreground/[0.03] text-foreground/60"
                                }`}>
                                    <p className="font-body text-[11px] leading-relaxed">{backupNotice.message}</p>
                                    {backupNotice.canReload && (
                                        <button
                                            onClick={() => window.location.reload()}
                                            data-testid="settings-backup-reload"
                                            className="font-body text-[10px] font-medium uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:text-foreground"
                                        >
                                            {t("settings.reloadToApply")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { startTour(); onClose(); }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-foreground/5 py-2.5 font-body text-[10px] font-medium tracking-wide text-muted-foreground/50 transition-all hover:border-foreground/15 hover:text-foreground"
                        >
                            <HelpCircle size={10} />
                            {t("settings.restartTour")}
                        </button>

                        <button
                            onClick={resetDefaults}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-foreground/5 py-2.5 font-body text-[10px] font-medium tracking-wide text-muted-foreground/50 transition-all hover:border-foreground/15 hover:text-foreground"
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
