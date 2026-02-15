import { memo } from "react";

type AuroraBlobProps = {
    audioIntensity?: number;
};

export const AuroraBlob = memo(function AuroraBlob({ audioIntensity = 0 }: AuroraBlobProps) {
    const scale = 1.0 + audioIntensity * 0.08;
    const opacityBoost = audioIntensity * 0.15;
    const blurBase = 60;
    const blurReduction = audioIntensity * 15; // gets sharper at high intensity

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
                className="relative w-[85vw] h-[85vw] max-w-[550px] max-h-[550px] transition-transform duration-150"
                style={{ transform: `scale(${scale})` }}
            >
                <div
                    className="absolute inset-0 rounded-full animate-aurora-1"
                    style={{
                        background: `radial-gradient(circle at 30% 30%, hsl(var(--aurora-1) / ${0.5 + opacityBoost}), transparent 50%)`,
                        filter: `blur(${blurBase - blurReduction}px)`,
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full animate-aurora-2"
                    style={{
                        background: `radial-gradient(circle at 75% 35%, hsl(var(--aurora-2) / ${0.45 + opacityBoost}), transparent 50%)`,
                        filter: `blur(${blurBase + 5 - blurReduction}px)`,
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full animate-aurora-3"
                    style={{
                        background: `radial-gradient(circle at 50% 75%, hsl(var(--aurora-3) / ${0.4 + opacityBoost}), transparent 50%)`,
                        filter: `blur(${blurBase - blurReduction}px)`,
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 40% 55%, hsl(var(--aurora-4) / ${0.3 + opacityBoost}), transparent 55%)`,
                        filter: `blur(${blurBase + 10 - blurReduction}px)`,
                    }}
                />
            </div>
        </div>
    );
});
