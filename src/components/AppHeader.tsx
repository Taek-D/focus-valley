import { memo } from "react";
import { ScrollText, Moon, Sun, Leaf, Settings, Sprout, Flame, ListTodo, UserCircle, Cloud, CloudAlert, CloudOff, LoaderCircle } from "lucide-react";
import { useTranslation } from "../lib/i18n";
import type { User } from "@supabase/supabase-js";

type AppHeaderProps = {
    isDark: boolean;
    currentStreak: number;
    user: User | null;
    syncState: "idle" | "syncing" | "ok" | "warning" | "error";
    syncLabel?: string;
    onToggleDark: () => void;
    onShowSettings: () => void;
    onShowTodo: () => void;
    onShowGarden: () => void;
    onShowHistory: () => void;
    onShowAuth: () => void;
};

export const AppHeader = memo(function AppHeader({
    isDark,
    currentStreak,
    user,
    syncState,
    syncLabel,
    onToggleDark,
    onShowSettings,
    onShowTodo,
    onShowGarden,
    onShowHistory,
    onShowAuth,
}: AppHeaderProps) {
    const { t } = useTranslation();
    const syncIcon = syncState === "syncing"
        ? <LoaderCircle size={11} className="animate-spin" />
        : syncState === "warning"
          ? <CloudAlert size={11} />
          : syncState === "error"
            ? <CloudOff size={11} />
            : <Cloud size={11} />;

    return (
        <header className="w-full max-w-lg flex justify-between items-center z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
            <div className="flex items-center gap-2.5 header-enter-left">
                <Leaf size={15} className="text-muted-foreground" />
                <span className="font-display text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    {t("app.name")}
                </span>
                {currentStreak > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/[0.04] text-foreground/50 border border-foreground/[0.04]">
                        <Flame size={9} className="text-foreground/40" />
                        <span className="font-body text-[10px] font-medium tabular-nums">{currentStreak}</span>
                    </span>
                )}
                {syncState !== "idle" && (
                    <span
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 ${
                            syncState === "error"
                                ? "border-destructive/20 bg-destructive/10 text-destructive/80"
                                : syncState === "warning"
                                  ? "border-amber-500/20 bg-amber-500/10 text-amber-600/80 dark:text-amber-300/80"
                                  : "border-foreground/[0.04] bg-foreground/[0.04] text-foreground/50"
                        }`}
                        aria-label={syncLabel}
                        title={syncLabel}
                    >
                        {syncIcon}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-0.5 header-enter-right" data-tour="header-icons">
                {[
                    { action: onToggleDark, label: t("header.darkMode"), icon: isDark ? <Sun size={15} /> : <Moon size={15} />, testId: "header-dark-mode" },
                    { action: onShowSettings, label: t("header.settings"), icon: <Settings size={15} />, testId: "header-settings" },
                    { action: onShowTodo, label: t("header.todo"), icon: <ListTodo size={15} />, testId: "header-todo" },
                    { action: onShowGarden, label: t("header.garden"), icon: <Sprout size={15} />, testId: "header-garden" },
                    { action: onShowHistory, label: t("header.history"), icon: <ScrollText size={15} />, testId: "header-history" },
                ].map((button) => (
                    <button
                        key={button.label}
                        onClick={button.action}
                        data-testid={button.testId}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={button.label}
                    >
                        {button.icon}
                    </button>
                ))}
                <button
                    onClick={onShowAuth}
                    data-testid="header-auth"
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={user ? t("header.account") : t("header.signIn")}
                >
                    {user?.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url as string}
                            alt=""
                            className="w-[18px] h-[18px] rounded-full"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <UserCircle size={15} />
                    )}
                </button>
            </div>
        </header>
    );
});
