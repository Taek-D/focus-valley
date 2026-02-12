import React from "react";
import { useAudioMixer, type NoiseType } from "../hooks/useAudioMixer";
import { Volume2, VolumeX } from "lucide-react";

interface AudioMixerProps {
    mixer: ReturnType<typeof useAudioMixer>;
}

const tracks: { id: NoiseType; label: string; icon: string }[] = [
    { id: "rain", label: "Rain", icon: "🌧️" },
    { id: "fire", label: "Fire", icon: "🔥" },
    { id: "cafe", label: "Cafe", icon: "☕" },
    { id: "stream", label: "Stream", icon: "🌊" },
    { id: "white", label: "White", icon: "📡" },
];

export const AudioMixer: React.FC<AudioMixerProps> = React.memo(({ mixer }) => {
    return (
        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border shadow-lg space-y-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-pixel text-primary">Soundscape</h3>
                <button
                    onClick={mixer.toggleMute}
                    aria-label={mixer.isMuted ? "Unmute all sounds" : "Mute all sounds"}
                    aria-pressed={mixer.isMuted}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                    {mixer.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            <div className="grid gap-4">
                {tracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-4 group">
                        <span className="text-2xl w-8 text-center">{track.icon}</span>
                        <div className="flex-1 flex flex-col gap-1">
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
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all disabled:opacity-50"
                            />
                        </div>
                        <span className="text-xs font-mono w-8 text-right text-muted-foreground">
                            {mixer.volumes[track.id]}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});
