import React from "react";
import { useAudioMixer, type NoiseType } from "../hooks/useAudioMixer";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation, type TranslationKey } from "../lib/i18n";
import { useIsPro } from "@/hooks/useSubscription";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import { ProBadge } from "./ProGate";

interface AudioMixerProps {
    mixer: ReturnType<typeof useAudioMixer>;
}

const freeTrackIds: { id: NoiseType; i18nKey: string; icon: string }[] = [
    { id: "rain", i18nKey: "audio.rain", icon: "\u{1F327}" },
    { id: "fire", i18nKey: "audio.fire", icon: "\u{1F525}" },
    { id: "cafe", i18nKey: "audio.cafe", icon: "\u2615" },
    { id: "stream", i18nKey: "audio.stream", icon: "\u{1F30A}" },
    { id: "white", i18nKey: "audio.white", icon: "\u{1F4E1}" },
];

const proTrackIds: { id: NoiseType; i18nKey: string; icon: string }[] = [
    { id: "thunder", i18nKey: "audio.thunder", icon: "\u{1F329}" },
    { id: "wind", i18nKey: "audio.wind", icon: "\u{1F343}" },
    { id: "night", i18nKey: "audio.night", icon: "\u{1F997}" },
];

function TrackRow({ track, mixer, locked, onLocked }: {
    track: { id: NoiseType; i18nKey: string; icon: string };
    mixer: ReturnType<typeof useAudioMixer>;
    locked: boolean;
    onLocked: () => void;
}) {
    const { t } = useTranslation();
    const active = mixer.volumes[track.id] > 0;
    const label = t(track.i18nKey as TranslationKey);
    return (
        <div className="flex items-center gap-3 group">
            <span className={cn(
                "text-base w-6 text-center transition-all",
                active ? "grayscale-0" : "grayscale opacity-40"
            )}>
                {track.icon}
            </span>
            <span className={cn(
                "font-body text-xs w-12 transition-colors flex items-center gap-1",
                active ? "text-foreground" : "text-muted-foreground/50"
            )}>
                {label}
                {locked && <ProBadge source="pro-sound" asSpan />}
            </span>
            <div className="flex-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    disabled={mixer.isMuted}
                    value={mixer.volumes[track.id]}
                    onChange={(e) => {
                        if (locked) { onLocked(); return; }
                        mixer.setVolume(track.id, Number(e.target.value));
                    }}
                    onMouseDown={(e) => { if (locked) { e.preventDefault(); onLocked(); } }}
                    onTouchStart={(e) => { if (locked) { e.preventDefault(); onLocked(); } }}
                    aria-label={`${label} volume`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={mixer.volumes[track.id]}
                    className={cn("cozy-slider w-full disabled:opacity-30", locked && "opacity-30 cursor-not-allowed")}
                />
            </div>
            <span className={cn(
                "font-body text-[10px] w-9 text-right tabular-nums",
                active ? "text-foreground/60" : "text-muted-foreground/30"
            )}>
                {mixer.volumes[track.id]}%
            </span>
        </div>
    );
}

export const AudioMixer: React.FC<AudioMixerProps> = React.memo(({ mixer }) => {
    const { t } = useTranslation();
    const isPro = useIsPro();
    const openUpgrade = useUpgradeModal((s) => s.open);
    const handleLocked = () => openUpgrade("pro-sound");

    return (
        <div className="glass rounded-2xl shadow-cozy p-5 space-y-4 w-full max-w-lg">
            <div className="flex items-center justify-between">
                <h3 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">{t("audio.soundscape")}</h3>
                <button
                    onClick={mixer.toggleMute}
                    aria-label={mixer.isMuted ? t("audio.unmuteAll") : t("audio.muteAll")}
                    aria-pressed={mixer.isMuted}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        mixer.isMuted
                            ? "text-destructive bg-destructive/10"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {mixer.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
            </div>

            <div className="space-y-3">
                {freeTrackIds.map((track) => (
                    <TrackRow key={track.id} track={track} mixer={mixer} locked={false} onLocked={handleLocked} />
                ))}

                {/* Pro sounds divider */}
                <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 border-t border-foreground/5" />
                    <span className="font-body text-[8px] font-medium tracking-wider uppercase text-muted-foreground/30">PRO</span>
                    <div className="flex-1 border-t border-foreground/5" />
                </div>

                {proTrackIds.map((track) => (
                    <TrackRow key={track.id} track={track} mixer={mixer} locked={!isPro} onLocked={handleLocked} />
                ))}
            </div>
        </div>
    );
});
