import { useState, useEffect, useRef, type RefObject } from "react";

/**
 * Reads frequency data from an AnalyserNode via rAF loop
 * and returns a normalized intensity value (0–1).
 */
export function useAudioReactivity(analyserRef: RefObject<AnalyserNode | null>) {
    const [intensity, setIntensity] = useState(0);
    const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    const rafRef = useRef(0);

    useEffect(() => {
        const tick = () => {
            const analyser = analyserRef.current;
            if (!analyser) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.frequencyBinCount) {
                dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            }

            analyser.getByteFrequencyData(dataArrayRef.current);

            // Compute RMS of frequency data, normalized to 0–1
            let sum = 0;
            const data = dataArrayRef.current;
            for (let i = 0; i < data.length; i++) {
                sum += data[i];
            }
            const avg = sum / data.length / 255;
            // Apply smoothing — lerp toward target
            setIntensity((prev) => prev + (avg - prev) * 0.15);

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [analyserRef]);

    return intensity;
}
