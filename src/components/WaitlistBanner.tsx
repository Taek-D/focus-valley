import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, Check } from "lucide-react";
import { trackWaitlistSignup, trackWaitlistDismissed } from "../lib/analytics";

// ── Configuration ────────────────────────────────────────
// Replace with your Formspree form ID (get one at https://formspree.io)
const FORMSPREE_ID = "xykdeoyz";
const STORAGE_KEY = "fv-waitlist";

type WaitlistState = "idle" | "submitting" | "success" | "dismissed";

function getStoredState(): WaitlistState {
    try {
        const val = localStorage.getItem(STORAGE_KEY);
        if (val === "success" || val === "dismissed") return val;
    } catch { /* noop */ }
    return "idle";
}

/** Inline waitlist CTA — place inside HistoryPanel or as standalone */
export function WaitlistBanner({ source = "history" }: { source?: string }) {
    const [state, setState] = useState<WaitlistState>(getStoredState);
    const [email, setEmail] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const dismiss = useCallback(() => {
        setState("dismissed");
        localStorage.setItem(STORAGE_KEY, "dismissed");
        trackWaitlistDismissed();
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || state === "submitting") return;

        setState("submitting");
        setSubmitError(null);

        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email: email.trim(), source }),
            });
            if (!response.ok) {
                throw new Error(`waitlist submit failed: ${response.status}`);
            }
            setState("success");
            localStorage.setItem(STORAGE_KEY, "success");
            trackWaitlistSignup(source);
        } catch {
            setState("idle");
            setSubmitError("Could not join waitlist. Please try again.");
        }
    }, [email, state, source]);

    // Don't render if already signed up or dismissed
    if (state === "success" || state === "dismissed") return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative rounded-2xl border border-foreground/5 overflow-hidden"
            >
                {/* Gradient accent bar */}
                <div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{
                        background: "linear-gradient(90deg, hsl(var(--aurora-1)), hsl(var(--aurora-2)), hsl(var(--aurora-3)), hsl(var(--aurora-4)))",
                    }}
                />

                <div className="p-4 pt-5">
                    {/* Dismiss */}
                    <button
                        onClick={dismiss}
                        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X size={12} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-foreground/40" />
                        <span className="font-body text-[10px] font-medium tracking-[0.12em] uppercase text-muted-foreground/50">
                            Coming Soon
                        </span>
                    </div>

                    {/* Copy */}
                    <p className="font-body text-[12px] text-foreground/60 leading-relaxed mb-3">
                        Cloud sync, premium plants, and advanced stats. Join the waitlist to get early access.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (submitError) setSubmitError(null);
                            }}
                            placeholder="you@email.com"
                            required
                            className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-foreground/5 border border-foreground/8 text-foreground font-body text-[11px] placeholder:text-muted-foreground/25 focus:outline-none focus:border-foreground/15 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={state === "submitting" || !email.trim()}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground/8 text-foreground font-body text-[11px] font-medium hover:bg-foreground/12 transition-all disabled:opacity-30"
                        >
                            {state === "submitting" ? (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
                            ) : (
                                <>
                                    Join
                                    <ArrowRight size={11} />
                                </>
                            )}
                        </button>
                    </form>
                    {submitError && (
                        <p className="mt-2 font-body text-[10px] text-red-400/70">
                            {submitError}
                        </p>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

/** Compact success toast — shown once after first session completion */
export function WaitlistSuccessInline() {
    const stored = getStoredState();
    if (stored !== "success") return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 py-2 px-3 rounded-xl bg-foreground/[0.03]"
        >
            <Check size={10} className="text-foreground/30" />
            <span className="font-body text-[10px] text-muted-foreground/40">
                You're on the waitlist!
            </span>
        </motion.div>
    );
}
