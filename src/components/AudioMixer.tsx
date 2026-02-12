import React from "react";
import { useAudioMixer, type NoiseType } from "../hooks/useAudioMixer";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";

interface AudioMixerProps {
    mixer: ReturnType<typeof useAudioMixer>;
}

const tracks: { id: NoiseType; label: string; icon: string; color: string }[] = [
    { id: "rain", label: "Rain", icon: "🌧", color: "text-blue-400" },
    { id: "fire", label: "Fire", icon: "🔥", color: "text-orange-400" },
    { id: "cafe", label: "Cafe", icon: "☕", color: "text-amber-400" },
    { id: "stream", label: "Stream", icon: "🌊", color: "text-cyan-400" },
    { id: "white", label: "White", icon: "📡", color: "text-gray-400" },
];

export const AudioMixer: React.FC<AudioMixerProps> = React.memo(({ mixer }) => {
    return (
        <div className="bg-card/90 backdrop-blur-md border-2 border-border p-5 space-y-4 w-full max-w-md shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between">
                <h3 className="font-pixel text-[10px] tracking-wider text-primary">SOUNDSCAPE</h3>
                <button
                    onClick={mixer.toggleMute}
                    aria-label={mixer.isMuted ? "Unmute all sounds" : "Mute all sounds"}
                    aria-pressed={mixer.isMuted}
                    className={cn(
                        "p-2 border-2 transition-all",
                        mixer.isMuted
                            ? "border-destructive/50 text-destructive bg-destructive/10"
                            : "border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                    )}
                >
                    {mixer.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
            </div>

            <div className="space-y-3">
                {tracks.map((track) => {
                    const active = mixer.volumes[track.id] > 0;
                    return (
                        <div key={track.id} className="flex items-center gap-3 group">
                            <span className={cn(
                                "text-lg w-7 text-center transition-all",
                                active ? "scale-110 grayscale-0" : "grayscale opacity-50"
                            )}>
                                {track.icon}
                            </span>
                            <span className={cn(
                                "font-retro text-base w-14 transition-colors",
                                active ? "text-foreground" : "text-muted-foreground"
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
                                    className="pixel-slider w-full disabled:opacity-40"
                                />
                            </div>
                            <span className={cn(
                                "font-retro text-sm w-10 text-right tabular-nums",
                                active ? "text-primary" : "text-muted-foreground/50"
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
