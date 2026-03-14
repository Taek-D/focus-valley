import "@/lib/i18n-packs/feature-pack";
import { AuthModal } from "@/components/AuthModal";
import { BreathingGuide } from "@/components/BreathingGuide";
import { Confetti } from "@/components/Confetti";
import { SessionRecoveryDialog } from "@/components/SessionRecoveryDialog";
import { WeeklySummaryPopup } from "@/components/WeeklySummaryPopup";
import { TourGuide } from "@/components/TourGuide";
import { LandingScreen } from "@/components/LandingScreen";
import { UpgradeModal } from "@/components/UpgradeModal";
import { trackRecoveryChoice } from "@/lib/analytics";
import type { useGarden } from "@/hooks/useGarden";
import type { useTimer } from "@/hooks/useTimer";
import type { AppSessionFlow } from "@/hooks/useAppSessionFlow";

type AppLazyOverlaysProps = {
    session: AppSessionFlow;
    timer: ReturnType<typeof useTimer>;
    garden: ReturnType<typeof useGarden>;
    showAuth: boolean;
    closeAuth: () => void;
    showBreathing: boolean;
    closeBreathing: () => void;
    showWeeklySummary: boolean;
    dismissWeeklySummary: () => void;
    showLanding: boolean;
    onLandingGetStarted: () => void;
    onLandingDemo: () => void;
    isTourActive: boolean;
    isUpgradeOpen: boolean;
};

export function AppLazyOverlays({
    session,
    timer,
    garden,
    showAuth,
    closeAuth,
    showBreathing,
    closeBreathing,
    showWeeklySummary,
    dismissWeeklySummary,
    showLanding,
    onLandingGetStarted,
    onLandingDemo,
    isTourActive,
    isUpgradeOpen,
}: AppLazyOverlaysProps) {
    return (
        <>
            {showAuth && (
                <AuthModal
                    isOpen={showAuth}
                    onClose={closeAuth}
                />
            )}

            {session.isBreakActive && showBreathing && (
                <BreathingGuide
                    isOpen={session.isBreakActive && showBreathing}
                    onClose={closeBreathing}
                />
            )}

            {session.confettiTrigger > 0 && <Confetti trigger={session.confettiTrigger} />}

            {timer.needsRecoveryPrompt && (
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
            )}

            {showWeeklySummary && !showLanding && (
                <WeeklySummaryPopup
                    isOpen={showWeeklySummary && !showLanding}
                    onDismiss={dismissWeeklySummary}
                    focusSessions={garden.focusSessions}
                />
            )}

            {isTourActive && <TourGuide />}

            {showLanding && (
                <LandingScreen
                    isOpen={showLanding}
                    onGetStarted={onLandingGetStarted}
                    onTryDemo={onLandingDemo}
                />
            )}

            {isUpgradeOpen && <UpgradeModal />}
        </>
    );
}
