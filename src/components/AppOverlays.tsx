import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Toast } from "@/components/Toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { AuthModal } from "@/components/AuthModal";
import { BreathingGuide } from "@/components/BreathingGuide";
import { Confetti } from "@/components/Confetti";
import { SessionRecoveryDialog } from "@/components/SessionRecoveryDialog";
import { WeeklySummaryPopup } from "@/components/WeeklySummaryPopup";
import { TourGuide } from "@/components/TourGuide";
import { LandingScreen } from "@/components/LandingScreen";
import { UpgradeModal } from "@/components/UpgradeModal";
import { HelpButton } from "@/components/HelpButton";
import { trackRecoveryChoice } from "@/lib/analytics";
import type { TranslationKey } from "@/lib/i18n";
import type { SyncResult } from "@/lib/sync";
import type { useGarden } from "@/hooks/useGarden";
import type { useTimer } from "@/hooks/useTimer";
import type { AppSessionFlow } from "@/hooks/useAppSessionFlow";

type Translate = (key: TranslationKey) => string;

type AppOverlaysProps = {
    session: AppSessionFlow;
    timer: ReturnType<typeof useTimer>;
    garden: ReturnType<typeof useGarden>;
    showAuth: boolean;
    closeAuth: () => void;
    showBreathing: boolean;
    closeBreathing: () => void;
    syncFeedback: SyncResult | null;
    clearSyncFeedback: () => void;
    showWeeklySummary: boolean;
    dismissWeeklySummary: () => void;
    showLanding: boolean;
    onLandingGetStarted: () => void;
    onLandingDemo: () => void;
    startTour: () => void;
    isTourActive: boolean;
    t: Translate;
};

export function AppOverlays({
    session,
    timer,
    garden,
    showAuth,
    closeAuth,
    showBreathing,
    closeBreathing,
    syncFeedback,
    clearSyncFeedback,
    showWeeklySummary,
    dismissWeeklySummary,
    showLanding,
    onLandingGetStarted,
    onLandingDemo,
    startTour,
    isTourActive,
    t,
}: AppOverlaysProps) {
    return (
        <>
            <AnimatePresence>
                {session.screenFlash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.06 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-foreground z-40 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {session.showSharePrompt && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        onClick={() => void session.handlePostSessionShare()}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground/8 border border-foreground/[0.06] backdrop-blur-sm hover:bg-foreground/12 transition-colors"
                    >
                        <Share2 size={14} className="text-foreground/60" />
                        <span className="font-body text-[12px] font-medium text-foreground/70">
                            {t("share.todayRecord")}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {syncFeedback?.requiresReload && !timer.isRunning && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        data-testid="sync-reload-banner"
                        className="fixed bottom-6 left-1/2 z-30 flex w-[min(92vw,28rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-background/90 px-4 py-3 shadow-cozy-lg backdrop-blur-sm"
                    >
                        <div className="space-y-1">
                            <p className="font-body text-[11px] font-medium text-foreground/70">{t("sync.reloadRequired")}</p>
                            <p className="font-body text-[10px] text-muted-foreground/45">{t("sync.reloadHint")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearSyncFeedback}
                                className="font-body text-[10px] uppercase tracking-[0.08em] text-muted-foreground/45 transition-colors hover:text-foreground/60"
                            >
                                {t("category.dismissHint")}
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                data-testid="sync-reload-button"
                                className="rounded-xl bg-foreground/8 px-3 py-2 font-body text-[10px] font-medium uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:bg-foreground/12"
                            >
                                {t("settings.reloadToApply")}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Toast
                message={session.toast.message}
                isVisible={session.toast.visible}
                onClose={session.closeToast}
                action={session.toast.action}
                duration={session.toast.action ? 5000 : 3000}
            />

            <ConfirmModal
                isOpen={session.confirmModalOpen}
                title={t("confirm.giveUpTitle")}
                message={t("confirm.giveUpMessage")}
                confirmLabel={t("confirm.giveUp")}
                cancelLabel={t("confirm.keepGoing")}
                onConfirm={session.confirmGiveUp}
                onCancel={session.closeConfirmModal}
            />

            <AuthModal
                isOpen={showAuth}
                onClose={closeAuth}
            />

            <BreathingGuide
                isOpen={session.isBreakActive && showBreathing}
                onClose={closeBreathing}
            />

            <Confetti trigger={session.confettiTrigger} />

            <SessionRecoveryDialog
                isOpen={timer.needsRecoveryPrompt}
                onResume={() => {
                    trackRecoveryChoice("resume");
                    timer.confirmResume();
                }}
                onDiscard={() => {
                    trackRecoveryChoice("discard");
                    timer.discardRecovery();
                }}
                remainingSeconds={timer.timeLeft}
                mode={timer.mode}
            />

            <WeeklySummaryPopup
                isOpen={showWeeklySummary && !showLanding}
                onDismiss={dismissWeeklySummary}
                focusSessions={garden.focusSessions}
            />

            <TourGuide />

            <LandingScreen
                isOpen={showLanding}
                onGetStarted={onLandingGetStarted}
                onTryDemo={onLandingDemo}
            />

            <UpgradeModal />

            <HelpButton
                visible={!showLanding && !isTourActive}
                onClick={startTour}
            />
        </>
    );
}
