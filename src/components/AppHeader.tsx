import { memo } from "react";
import { motion } from "framer-motion";
import { ScrollText, Moon, Sun, Leaf, Settings, Sprout, Flame, ListTodo, UserCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type AppHeaderProps = {
    isDark: boolean;
    currentStreak: number;
    user: User | null;
    onToggleDark: () => void;
    onShowSettings: () => void;
    onShowTodo: () => void;
    onShowGarden: () => void;
    onShowHistory: () => void;
    onShowAuth: () => void;
};

export const AppHeader = memo(function AppHeader({
    isDark, currentStreak, user,
    onToggleDark, onShowSettings, onShowTodo, onShowGarden, onShowHistory, onShowAuth,
}: AppHeaderProps) {
    return (
        <header className="w-full max-w-lg flex justify-between items-center z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
            <motion.div
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Leaf size={15} className="text-muted-foreground" />
                <span className="font-display text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    Focus Valley
                </span>
                {currentStreak > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/[0.04] text-foreground/50 border border-foreground/[0.04]">
                        <Flame size={9} className="text-foreground/40" />
                        <span className="font-body text-[10px] font-medium tabular-nums">{currentStreak}</span>
                    </span>
                )}
            </motion.div>
            <motion.div
                className="flex items-center gap-0.5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >

                {[
                    { action: onToggleDark, label: "Toggle dark mode", icon: isDark ? <Sun size={15} /> : <Moon size={15} /> },
                    { action: onShowSettings, label: "Timer settings", icon: <Settings size={15} /> },
                    { action: onShowTodo, label: "To-do list", icon: <ListTodo size={15} /> },
                    { action: onShowGarden, label: "My garden", icon: <Sprout size={15} /> },
                    { action: onShowHistory, label: "Stats & history", icon: <ScrollText size={15} /> },
                ].map((btn) => (
                    <button
                        key={btn.label}
                        onClick={btn.action}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={btn.label}
                    >
                        {btn.icon}
                    </button>
                ))}
                <button
                    onClick={onShowAuth}
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={user ? "Account" : "Sign in"}
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
            </motion.div>
        </header>
    );
});
