import { useRef, useState, useCallback } from "react";

export type NoiseType = "rain" | "fire" | "cafe" | "stream" | "white";

interface AudioTrack {
    gainNode: GainNode;
    source: AudioBufferSourceNode | OscillatorNode | null;
}

export function useAudioMixer() {
    const contextRef = useRef<AudioContext | null>(null);
    // Store gain nodes to control volume
    const tracksRef = useRef<Map<NoiseType, AudioTrack>>(new Map());

    const [volumes, setVolumes] = useState<Record<NoiseType, number>>({
        rain: 0,
        fire: 0,
        cafe: 0,
        stream: 0,
        white: 0,
    });

    const [isMuted, setIsMuted] = useState(false);

    // Initialize AudioContext (must be triggered by user gesture)
    const initAudio = useCallback(() => {
        if (!contextRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            contextRef.current = new AudioCtx();
        }
        if (contextRef.current.state === "suspended") {
            contextRef.current.resume();
        }
        return contextRef.current;
    }, []);

    const createNoiseBuffer = (ctx: AudioContext, type: NoiseType): AudioBuffer => {
        const bufferSize = 2 * ctx.sampleRate; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        // White Noise Generation
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        if (type === "white") return buffer;

        // Pink Noise (Rain-like)
        if (type === "rain") {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // Normalize
                b6 = white * 0.115926;
            }
            return buffer;
        }

        // Brown Noise (Fire-like rumble)
        if (type === "fire") {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
            return buffer;
        }

        // Cafe: Modulated pink noise with irregular amplitude bursts
        if (type === "cafe") {
            let b0 = 0, b1 = 0, b2 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99765 * b0 + white * 0.0990460;
                b1 = 0.96300 * b1 + white * 0.2965164;
                b2 = 0.57000 * b2 + white * 0.1526527;
                output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.15;
                // Amplitude modulation for "chatter" effect
                const mod = 0.5 + 0.5 * Math.sin(i / (ctx.sampleRate * 0.3) * Math.PI * 2);
                const burst = Math.random() > 0.997 ? 2.0 : 1.0;
                output[i] *= mod * burst;
            }
            return buffer;
        }

        // Stream: Modulated brown noise with gentle wavering
        if (type === "stream") {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.035 * white)) / 1.035;
                lastOut = output[i];
                // Gentle wavering modulation
                const wave = 0.6 + 0.4 * Math.sin(i / (ctx.sampleRate * 0.8) * Math.PI * 2);
                output[i] *= wave * 3.0;
            }
            return buffer;
        }

        return buffer;
    };

    const startTrack = (type: NoiseType) => {
        const ctx = initAudio();
        if (!ctx) return;

        if (tracksRef.current.has(type)) return;

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNode.gain.value = isMuted ? 0 : (volumes[type] / 100);

        const buffer = createNoiseBuffer(ctx, type);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Filters for specific sounds
        if (type === "rain") {
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 800;
            source.connect(filter);
            filter.connect(gainNode);
        } else if (type === "fire") {
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 250;
            source.connect(filter);
            filter.connect(gainNode);
        } else if (type === "cafe") {
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 1200;
            filter.Q.value = 0.5;
            source.connect(filter);
            filter.connect(gainNode);
        } else if (type === "stream") {
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 500;
            source.connect(filter);
            filter.connect(gainNode);
        } else {
            source.connect(gainNode);
        }

        source.start();
        tracksRef.current.set(type, { source, gainNode });
    };

    const setVolume = (type: NoiseType, value: number) => {
        setVolumes(prev => ({ ...prev, [type]: value }));
        initAudio(); // Ensure context is ready

        // Lazy load track if volume > 0
        if (value > 0 && !tracksRef.current.has(type)) {
            startTrack(type);
        }

        const track = tracksRef.current.get(type);
        if (track) {
            if (value === 0) {
                // Optimization: Stop track if volume is 0
                // stopTrack(type); // Optional: keep running for instant resume
                track.gainNode.gain.setTargetAtTime(0, track.gainNode.context.currentTime, 0.1);
            } else {
                const gain = isMuted ? 0 : value / 100;
                track.gainNode.gain.setTargetAtTime(gain, track.gainNode.context.currentTime, 0.1);
            }
        }
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);

        tracksRef.current.forEach((track, type) => {
            const vol = volumes[type];
            const gain = newMuted ? 0 : vol / 100;
            track.gainNode.gain.setTargetAtTime(gain, track.gainNode.context.currentTime, 0.1);
        });
    };

    return {
        volumes,
        setVolume,
        isMuted,
        toggleMute,
        initAudio
    };
}
