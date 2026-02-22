import { useRef, useState, useCallback } from "react";

export type NoiseType = "rain" | "fire" | "cafe" | "stream" | "white" | "thunder" | "wind" | "night";

export const PRO_SOUNDS: ReadonlySet<NoiseType> = new Set(["thunder", "wind", "night"]);

type AudioTrack = {
    gainNode: GainNode;
    source: AudioBufferSourceNode;
};

const SOUND_URLS: Record<NoiseType, string[]> = {
    rain: ["/sounds/rain.mp3", "/sounds/rain.wav"],
    fire: ["/sounds/fire.mp3", "/sounds/fire.wav"],
    cafe: ["/sounds/cafe.mp3", "/sounds/cafe.wav"],
    stream: ["/sounds/stream.mp3", "/sounds/stream.wav"],
    white: ["/sounds/white.mp3", "/sounds/white.wav"],
    thunder: ["/sounds/thunder.mp3"],
    wind: ["/sounds/wind.mp3"],
    night: ["/sounds/night.mp3"],
};

// Crossfade duration at loop boundary (seconds)
const CROSSFADE_SEC = 1.5;

/** Apply equal-power crossfade between end and start of each channel */
function applyLoopCrossfade(buffer: AudioBuffer): AudioBuffer {
    const fadeSamples = Math.floor(CROSSFADE_SEC * buffer.sampleRate);
    if (fadeSamples * 2 >= buffer.length) return buffer; // too short to crossfade

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        const len = data.length;
        for (let i = 0; i < fadeSamples; i++) {
            const t = i / fadeSamples;
            // Equal-power curves
            const fadeIn = Math.sin((t * Math.PI) / 2);
            const fadeOut = Math.cos((t * Math.PI) / 2);
            const headVal = data[i];
            const tailVal = data[len - fadeSamples + i];
            const blended = headVal * fadeIn + tailVal * fadeOut;
            data[i] = blended;
            data[len - fadeSamples + i] = blended;
        }
    }
    return buffer;
}

export function useAudioMixer() {
    const contextRef = useRef<AudioContext | null>(null);
    const tracksRef = useRef<Map<NoiseType, AudioTrack>>(new Map());
    const compressorRef = useRef<DynamicsCompressorNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const bufferCacheRef = useRef<Map<NoiseType, AudioBuffer>>(new Map());
    const loadingRef = useRef<Set<NoiseType>>(new Set());

    const [volumes, setVolumes] = useState<Record<NoiseType, number>>({
        rain: 0,
        fire: 0,
        cafe: 0,
        stream: 0,
        white: 0,
        thunder: 0,
        wind: 0,
        night: 0,
    });
    const volumesRef = useRef(volumes);

    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(isMuted);

    const initAudio = useCallback(() => {
        if (!contextRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            contextRef.current = new AudioCtx();

            // Master compressor for consistent levels and headroom
            const comp = contextRef.current.createDynamicsCompressor();
            comp.threshold.value = -20;
            comp.knee.value = 10;
            comp.ratio.value = 4;
            comp.attack.value = 0.005;
            comp.release.value = 0.15;

            // Analyser for audio reactivity (between compressor and destination)
            const analyser = contextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            comp.connect(analyser);
            analyser.connect(contextRef.current.destination);
            compressorRef.current = comp;
            analyserRef.current = analyser;
        }
        if (contextRef.current.state === "suspended") {
            contextRef.current.resume();
        }
        return contextRef.current;
    }, []);

    // Logarithmic gain curve — feels more natural to human hearing
    const toGain = (sliderValue: number): number => {
        if (sliderValue <= 0) return 0;
        return 1.0 * Math.pow(sliderValue / 100, 1.8);
    };

    const loadBuffer = async (ctx: AudioContext, type: NoiseType): Promise<AudioBuffer> => {
        for (const url of SOUND_URLS[type]) {
            try {
                const response = await fetch(url);
                if (!response.ok) continue;
                const arrayBuffer = await response.arrayBuffer();
                return await ctx.decodeAudioData(arrayBuffer);
            } catch {
                // Try next candidate.
            }
        }
        throw new Error(`Failed to load audio for ${type}`);
    };

    const loadAndPlayTrack = async (type: NoiseType) => {
        const ctx = initAudio();
        if (!ctx || !compressorRef.current) return;
        if (tracksRef.current.has(type) || loadingRef.current.has(type)) return;

        loadingRef.current.add(type);

        try {
            let audioBuffer = bufferCacheRef.current.get(type);

            if (!audioBuffer) {
                audioBuffer = await loadBuffer(ctx, type);
                applyLoopCrossfade(audioBuffer);
                bufferCacheRef.current.set(type, audioBuffer);
            }

            // Re-check: user may have set volume to 0 while loading
            const latestVolume = volumesRef.current[type];
            if (latestVolume <= 0) return;

            const gainNode = ctx.createGain();
            gainNode.connect(compressorRef.current!);
            gainNode.gain.value = isMutedRef.current ? 0 : toGain(latestVolume);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            source.connect(gainNode);
            source.start();

            tracksRef.current.set(type, { source, gainNode });
        } catch {
            // Silently fail — sound is non-essential
        } finally {
            loadingRef.current.delete(type);
        }
    };

    const setVolume = (type: NoiseType, value: number) => {
        setVolumes((prev) => {
            const next = { ...prev, [type]: value };
            volumesRef.current = next;
            return next;
        });
        initAudio();

        if (value > 0 && !tracksRef.current.has(type)) {
            loadAndPlayTrack(type);
        }

        const track = tracksRef.current.get(type);
        if (track) {
            if (value === 0) {
                // Stop track to free resources
                track.source.stop();
                track.source.disconnect();
                track.gainNode.disconnect();
                tracksRef.current.delete(type);
            } else {
                const gain = isMutedRef.current ? 0 : toGain(value);
                track.gainNode.gain.setTargetAtTime(gain, track.gainNode.context.currentTime, 0.15);
            }
        }
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        isMutedRef.current = newMuted;

        tracksRef.current.forEach((track, type) => {
            const gain = newMuted ? 0 : toGain(volumes[type]);
            track.gainNode.gain.setTargetAtTime(gain, track.gainNode.context.currentTime, 0.15);
        });
    };

    return {
        volumes,
        setVolume,
        isMuted,
        toggleMute,
        initAudio,
        analyserRef,
    };
}
