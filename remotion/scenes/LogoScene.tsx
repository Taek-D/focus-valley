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
    // ACCENT_CYAN,
    // ACCENT_VIOLET,
    fontFamily,
    // fontRetro,
    scaleFactor,
    type SceneProps,
    AnimatedAurora,
    // GlassContainer,
} from "./shared";

export const LogoScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = scaleFactor(layout);

    const leafScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
    const titleOpacity = interpolate(frame, [15, 40], [0, 1], { extrapolateRight: "clamp" });
    const titleY = interpolate(frame, [15, 40], [20, 0], { extrapolateRight: "clamp" });
    const taglineOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
    const taglineY = interpolate(frame, [35, 55], [15, 0], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            <AnimatedAurora />

            {/* Content Container */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>

                {/* Leaf icon */}
                <svg
                    width={48 * s}
                    height={48 * s}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={ACCENT_EMERALD}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: `scale(${leafScale})`,
                        marginBottom: 24 * s,
                        opacity: leafScale,
                        filter: `drop-shadow(0 0 20px ${ACCENT_EMERALD}60)`,
                    }}
                >
                    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>

                {/* Title */}
                <div
                    style={{
                        fontFamily,
                        fontSize: 56 * s,
                        fontWeight: 800,
                        color: TEXT,
                        letterSpacing: "-0.02em",
                        opacity: titleOpacity,
                        transform: `translateY(${titleY}px)`,
                        textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        background: `linear-gradient(to bottom right, #fff, #a5b4fc)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Focus Valley
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontFamily,
                        fontSize: 20 * s,
                        fontWeight: 400,
                        color: TEXT_MUTED,
                        letterSpacing: "0.02em",
                        marginTop: 16 * s,
                        opacity: taglineOpacity,
                        transform: `translateY(${taglineY}px)`,
                    }}
                >
                    집중하면, 정원이 피어나요
                </div>
            </div>
        </AbsoluteFill>
    );
};
