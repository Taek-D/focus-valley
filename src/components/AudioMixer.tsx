import React from "react";
import { useAudioMixer, type NoiseType } from "../hooks/useAudioMixer";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";

interface AudioMixerProps {
    mixer: ReturnType<typeof useAudioMixer>;
}

const tracks: { id: NoiseType; label: string; icon: string }[] = [
    { id: "rain", label: "Rain", icon: "\u{1F327}" },
    { id: "fire", label: "Fire", icon: "\u{1F525}" },
    { id: "cafe", label: "Cafe", icon: "\u2615" },
    { id: "stream", label: "Stream", icon: "\u{1F30A}" },
    { id: "white", label: "White", icon: "\u{1F4E1}" },
];

export const AudioMixer: React.FC<AudioMixerProps> = React.memo(({ mixer }) => {
    return (
        <div className="glass-strong rounded-2xl shadow-cozy p-5 space-y-4 w-full max-w-md">
            <div className="flex items-center justify-between">
                <h3 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">Soundscape</h3>
                <button
                    onClick={mixer.toggleMute}
                    aria-label={mixer.isMuted ? "Unmute all sounds" : "Mute all sounds"}
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
                {tracks.map((track) => {
                    const active = mixer.volumes[track.id] > 0;
                    return (
                        <div key={track.id} className="flex items-center gap-3 group">
                            <span className={cn(
                                "text-base w-6 text-center transition-all",
                                active ? "grayscale-0" : "grayscale opacity-40"
                            )}>
                                {track.icon}
                            </span>
                            <span className={cn(
                                "font-body text-xs w-12 transition-colors",
                                active ? "text-foreground" : "text-muted-foreground/50"
                            )}>
                                {track.label}
                            </span>
                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    disabled={mixer.isMuted}
                                    value={mixer.volumes[track.id]}
                                    onChange={(e) => mixer.setVolume(track.id, Number(e.target.value))}
                                    aria-label={`${track.label} volume`}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={mixer.volumes[track.id]}
                                    className="cozy-slider w-full disabled:opacity-30"
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
                })}
            </div>
        </div>
    );
});
