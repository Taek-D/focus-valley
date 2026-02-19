import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, RefreshCw, Cloud } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { syncWithCloud, getLastSyncTime } from "@/lib/sync";
import { useTranslation } from "@/lib/i18n";
import { useIsPro } from "@/hooks/useSubscription";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { BottomSheet } from "./ui/BottomSheet";
import { Sparkles } from "lucide-react";

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { user, loading, error, signInWithToss, signOut, clearError } = useAuth();
    const { t } = useTranslation();
    const isPro = useIsPro();
    const openUpgrade = useUpgradeModal((s) => s.open);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const lastSync = getLastSyncTime();

    const handleTossLogin = useCallback(async () => {
        clearError();
        const ok = await signInWithToss();
        if (ok) onClose();
    }, [signInWithToss, onClose, clearError]);

    const handleLogout = useCallback(async () => {
        await signOut();
        onClose();
    }, [signOut, onClose]);

    const handleSync = useCallback(async () => {
        if (!user || syncing) return;
        setSyncing(true);
        setSyncStatus(null);
        const result = await syncWithCloud(user);
        setSyncing(false);

        switch (result) {
            case "pushed":
                setSyncStatus(t("sync.pushed"));
                break;
            case "pulled":
                setSyncStatus(t("sync.pulled"));
                setTimeout(() => window.location.reload(), 1500);
                break;
            case "merged":
                setSyncStatus(t("sync.merged"));
                setTimeout(() => window.location.reload(), 1500);
                break;
            case "noop":
                setSyncStatus(t("sync.upToDate"));
                break;
            case "error":
                setSyncStatus(t("sync.failed"));
                break;
        }
    }, [user, syncing, t]);

    const formatLastSync = (iso: string | null) => {
        if (!iso) return t("sync.never");
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return t("sync.justNow");
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h ago`;
        return d.toLocaleDateString();
    };

    // Logged-in view
    if (user) {
        const displayName = user.user_metadata?.full_name || user.user_metadata?.toss_name || user.email?.split("@")[0] || "User";

        return (
            <BottomSheet isOpen={isOpen} onClose={onClose} title={t("auth.account")}>
                <div className="px-5 pb-8 space-y-5">
                    {/* Profile */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-foreground/5">
                        <div className="w-10 h-10 rounded-full bg-foreground/8 flex items-center justify-center">
                            <User size={16} className="text-foreground/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-body text-sm font-medium text-foreground truncate">
                                {displayName}
                            </div>
                            <div className="font-body text-[11px] text-muted-foreground/40 truncate">
                                토스 계정으로 로그인됨
                            </div>
                        </div>
                    </div>

                    {/* Cloud Sync */}
                    <div className="rounded-2xl border border-foreground/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Cloud size={13} className="text-foreground/40" />
                                <span className="font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/40">
                                    {t("sync.title")}
                                </span>
                            </div>
                            <span className="font-body text-[10px] text-muted-foreground/25">
                                {formatLastSync(lastSync)}
                            </span>
                        </div>
                        <p className="font-body text-[11px] text-foreground/40 leading-relaxed">
                            {t("sync.description")}
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] font-body text-[11px] font-medium text-foreground/60 hover:bg-foreground/[0.07] hover:text-foreground transition-all disabled:opacity-30"
                        >
                            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                            {syncing ? t("sync.syncing") : t("sync.now")}
                        </button>
                        <AnimatePresence>
                            {syncStatus && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="font-body text-[10px] text-center text-foreground/35"
                                >
                                    {syncStatus}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Subscription */}
                    <div className="rounded-2xl border border-foreground/5 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={13} className="text-foreground/40" />
                                <span className="font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/40">
                                    {t("pro.proPlan")}
                                </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-body text-[9px] font-medium tracking-wider uppercase ${
                                isPro ? "bg-foreground/8 text-foreground/50" : "bg-foreground/[0.04] text-muted-foreground/30"
                            }`}>
                                {isPro ? t("pro.badge") : t("pro.freePlan")}
                            </span>
                        </div>
                        {!isPro && (
                            <button
                                onClick={() => openUpgrade("account")}
                                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] font-body text-[11px] font-medium text-foreground/60 hover:bg-foreground/[0.07] hover:text-foreground transition-all"
                            >
                                <Sparkles size={12} />
                                {t("pro.upgrade")}
                            </button>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-foreground/8 font-body text-[11px] font-medium text-muted-foreground/50 hover:text-foreground hover:border-foreground/15 transition-all disabled:opacity-30"
                    >
                        <LogOut size={13} />
                        {t("auth.signOut")}
                    </button>
                </div>
            </BottomSheet>
        );
    }

    // Login view — Toss login only
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={t("auth.signIn")}>
            <div className="px-5 pb-8 space-y-4">
                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                        >
                            <p className="font-body text-[11px] text-red-400/80 text-center">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.02]">
                    <Cloud size={11} className="text-muted-foreground/25 shrink-0" />
                    <p className="font-body text-[10px] text-muted-foreground/30 leading-relaxed">
                        토스 계정으로 로그인하면 데이터를 클라우드에 동기화할 수 있어요.
                    </p>
                </div>

                {/* Toss Login */}
                <button
                    onClick={handleTossLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-[#0064FF] font-body text-[12px] font-medium text-white hover:bg-[#0050CC] transition-all disabled:opacity-30"
                >
                    {loading ? (
                        <div className="w-4 h-4 mx-auto rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M7.5 3H4.5C3.67 3 3 3.67 3 4.5V7.5C3 8.33 3.67 9 4.5 9H7.5C8.33 9 9 8.33 9 7.5V4.5C9 3.67 8.33 3 7.5 3Z" fill="white"/>
                                <path d="M19.5 3H16.5C15.67 3 15 3.67 15 4.5V7.5C15 8.33 15.67 9 16.5 9H19.5C20.33 9 21 8.33 21 7.5V4.5C21 3.67 20.33 3 19.5 3Z" fill="white"/>
                                <path d="M7.5 15H4.5C3.67 15 3 15.67 3 16.5V19.5C3 20.33 3.67 21 4.5 21H7.5C8.33 21 9 20.33 9 19.5V16.5C9 15.67 8.33 15 7.5 15Z" fill="white"/>
                                <path d="M19.5 15H16.5C15.67 15 15 15.67 15 16.5V19.5C15 20.33 15.67 21 16.5 21H19.5C20.33 21 21 20.33 21 19.5V16.5C21 15.67 20.33 15 19.5 15Z" fill="white"/>
                            </svg>
                            토스로 로그인
                        </>
                    )}
                </button>
            </div>
        </BottomSheet>
    );
}
