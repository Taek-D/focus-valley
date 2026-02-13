import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogOut, User, RefreshCw, Cloud, CloudOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { syncWithCloud, getLastSyncTime } from "@/lib/sync";
import { BottomSheet } from "./ui/BottomSheet";

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { user, loading, error, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, clearError } = useAuth();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            setLastSync(getLastSyncTime());
        }
    }, [isOpen, user]);

    const switchMode = useCallback(() => {
        setMode((m) => (m === "login" ? "signup" : "login"));
        clearError();
        setSignupSuccess(false);
    }, [clearError]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        if (mode === "signup") {
            const ok = await signUpWithEmail(email, password);
            if (ok) {
                setSignupSuccess(true);
                setEmail("");
                setPassword("");
            }
        } else {
            const ok = await signInWithEmail(email, password);
            if (ok) {
                onClose();
                setEmail("");
                setPassword("");
            }
        }
    }, [email, password, mode, signUpWithEmail, signInWithEmail, onClose]);

    const handleGoogleLogin = useCallback(() => {
        signInWithGoogle();
    }, [signInWithGoogle]);

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
        setLastSync(getLastSyncTime());

        switch (result) {
            case "pushed":
                setSyncStatus("Data uploaded to cloud");
                break;
            case "pulled":
                setSyncStatus("Data downloaded from cloud");
                // Reload to pick up new localStorage data
                setTimeout(() => window.location.reload(), 1500);
                break;
            case "merged":
                setSyncStatus("Data synced across devices");
                setTimeout(() => window.location.reload(), 1500);
                break;
            case "error":
                setSyncStatus("Sync failed. Please try again.");
                break;
        }
    }, [user, syncing]);

    const formatLastSync = (iso: string | null) => {
        if (!iso) return "Never";
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH}h ago`;
        return d.toLocaleDateString();
    };

    // Logged-in view
    if (user) {
        const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

        return (
            <BottomSheet isOpen={isOpen} onClose={onClose} title="Account">
                <div className="px-5 pb-8 space-y-5">
                    {/* Profile */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-foreground/5">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt=""
                                className="w-10 h-10 rounded-full"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-foreground/8 flex items-center justify-center">
                                <User size={16} className="text-foreground/40" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="font-body text-sm font-medium text-foreground truncate">
                                {displayName}
                            </div>
                            <div className="font-body text-[11px] text-muted-foreground/40 truncate">
                                {user.email}
                            </div>
                        </div>
                    </div>

                    {/* Cloud Sync */}
                    <div className="rounded-2xl border border-foreground/5 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Cloud size={13} className="text-foreground/40" />
                                <span className="font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/40">
                                    Cloud Sync
                                </span>
                            </div>
                            <span className="font-body text-[10px] text-muted-foreground/25">
                                {formatLastSync(lastSync)}
                            </span>
                        </div>
                        <p className="font-body text-[11px] text-foreground/40 leading-relaxed">
                            Sync your garden, stats, settings, and todos across devices.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] font-body text-[11px] font-medium text-foreground/60 hover:bg-foreground/[0.07] hover:text-foreground transition-all disabled:opacity-30"
                        >
                            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                            {syncing ? "Syncing..." : "Sync Now"}
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

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-foreground/8 font-body text-[11px] font-medium text-muted-foreground/50 hover:text-foreground hover:border-foreground/15 transition-all disabled:opacity-30"
                    >
                        <LogOut size={13} />
                        Sign Out
                    </button>
                </div>
            </BottomSheet>
        );
    }

    // Auth form
    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={mode === "login" ? "Sign In" : "Create Account"}>
            <div className="px-5 pb-8 space-y-4">
                {/* Signup success message */}
                <AnimatePresence>
                    {signupSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                        >
                            <p className="font-body text-[11px] text-emerald-400/80 text-center">
                                Check your email to confirm your account!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                {/* Sync info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.02]">
                    <CloudOff size={11} className="text-muted-foreground/25 shrink-0" />
                    <p className="font-body text-[10px] text-muted-foreground/30 leading-relaxed">
                        Sign in to sync your garden and progress across devices
                    </p>
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-foreground/8 font-body text-[12px] font-medium text-foreground hover:bg-foreground/[0.03] transition-all disabled:opacity-30"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-foreground/5" />
                    <span className="font-body text-[9px] text-muted-foreground/25 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-foreground/5" />
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/25" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            autoComplete="email"
                            className="w-full pl-9 pr-3 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/8 text-foreground font-body text-[12px] placeholder:text-muted-foreground/25 focus:outline-none focus:border-foreground/15 transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/25" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            minLength={6}
                            autoComplete={mode === "signup" ? "new-password" : "current-password"}
                            className="w-full pl-9 pr-3 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/8 text-foreground font-body text-[12px] placeholder:text-muted-foreground/25 focus:outline-none focus:border-foreground/15 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email.trim() || !password.trim()}
                        className="w-full py-3 rounded-xl bg-foreground/8 text-foreground font-body text-[12px] font-medium hover:bg-foreground/12 transition-all disabled:opacity-30"
                    >
                        {loading ? (
                            <div className="w-4 h-4 mx-auto rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
                        ) : mode === "login" ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                {/* Switch mode */}
                <p className="text-center font-body text-[11px] text-muted-foreground/40">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={switchMode}
                        className="text-foreground/60 hover:text-foreground font-medium transition-colors"
                    >
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </BottomSheet>
    );
}
