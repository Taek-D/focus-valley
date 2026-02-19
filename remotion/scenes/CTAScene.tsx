import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";
import {
    BG,
    TEXT,
    TEXT_MUTED,
    ACCENT_EMERALD,
    fontFamily,
    scaleFactor,
    type SceneProps,
    AnimatedAurora,
} from "./shared";

export const CTAScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = scaleFactor(layout);

    const enter = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
    const badgeEnter = spring({ frame, fps, delay: 15, config: { damping: 14 } });
    const urlOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            <AnimatedAurora />

            {/* Logo Mark for brand recall */}
            <svg
                width={64 * s}
                height={64 * s}
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT_EMERALD}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    transform: `scale(${enter})`,
                    marginBottom: 24 * s,
                    opacity: enter,
                    filter: `drop-shadow(0 0 20px ${ACCENT_EMERALD}80)`,
                }}
            >
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>

            {/* Main CTA */}
            <div
                style={{
                    fontFamily,
                    fontSize: 48 * s,
                    fontWeight: 800,
                    color: TEXT,
                    letterSpacing: "-0.02em",
                    transform: `scale(${enter})`,
                    opacity: enter,
                    textAlign: "center",
                    textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                    marginBottom: 24 * s,
                    background: `linear-gradient(to bottom right, #fff, #c7d2fe)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    zIndex: 10,
                }}
            >
                오늘, 첫 번째 식물을 심어보세요
            </div>

            {/* Badge */}
            <div
                style={{
                    padding: `${10 * s}px ${28 * s}px`,
                    borderRadius: 100,
                    backgroundColor: "rgba(52,211,153,0.1)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    fontFamily,
                    fontSize: 14 * s,
                    fontWeight: 600,
                    color: ACCENT_EMERALD,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transform: `scale(${badgeEnter})`,
                    opacity: badgeEnter,
                    boxShadow: `0 0 20px rgba(52,211,153,0.2)`,
                    zIndex: 10,
                }}
            >
                무료 &nbsp;•&nbsp; 가입 없이 &nbsp;•&nbsp; 바로 시작
            </div>

            {/* URL */}
            <div
                style={{
                    marginTop: 40 * s,
                    fontFamily,
                    fontSize: 20 * s,
                    fontWeight: 400,
                    color: TEXT_MUTED,
                    letterSpacing: "0.05em",
                    opacity: urlOpacity,
                    zIndex: 10,
                }}
            >
                focusvalley.app
            </div>
        </AbsoluteFill>
    );
};
