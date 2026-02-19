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
    ACCENT_CYAN,
    ACCENT_VIOLET,
    ACCENT_AMBER,
    fontFamily,
    scaleFactor,
    type SceneProps,
    AnimatedAurora,
    GlassContainer,
} from "./shared";

// Actual default categories from the app + custom examples
const CATEGORIES = [
    { name: "업무", emoji: "💼", color: ACCENT_CYAN, sessions: 42 },
    { name: "공부", emoji: "📚", color: ACCENT_VIOLET, sessions: 38 },
    { name: "창작", emoji: "🎨", color: ACCENT_AMBER, sessions: 25 },
    { name: "운동", emoji: "💪", color: ACCENT_EMERALD, sessions: 18 },
    { name: "일상", emoji: "🏠", color: ACCENT_VIOLET, sessions: 31 },
    { name: "독서", emoji: "📖", color: ACCENT_CYAN, sessions: 22 },
    { name: "코딩", emoji: "💻", color: ACCENT_EMERALD, sessions: 56 },
    { name: "명상", emoji: "🧘", color: ACCENT_AMBER, sessions: 15 },
];

export const CategoriesScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = scaleFactor(layout);

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const captionOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            <AnimatedAurora />

            <div
                style={{
                    fontFamily,
                    fontSize: 13 * s,
                    fontWeight: 500,
                    color: TEXT_MUTED,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: 16 * s,
                    opacity: titleOpacity,
                    zIndex: 10,
                }}
            >
                무엇에 집중하고 있나요?
            </div>

            <div
                style={{
                    fontFamily,
                    fontSize: 36 * s,
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: 48 * s,
                    opacity: titleOpacity,
                    zIndex: 10,
                    textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    letterSpacing: "-0.01em",
                }}
            >
                원하는 카테고리를 자유롭게
            </div>

            {/* Category chips */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16 * s,
                    justifyContent: "center",
                    maxWidth: 700 * s,
                    zIndex: 10,
                }}
            >
                {CATEGORIES.map((cat, i) => {
                    const enter = spring({ frame, fps, delay: 8 + i * 6, config: { damping: 13 } });
                    const y = interpolate(enter, [0, 1], [30, 0]);

                    return (
                        <GlassContainer
                            key={cat.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12 * s,
                                padding: `${12 * s}px ${24 * s}px`,
                                borderRadius: 100,
                                backgroundColor: "rgba(255,255,255,0.03)",
                                border: `1px solid ${cat.color}30`,
                                opacity: enter,
                                transform: `translateY(${y}px)`,
                                boxShadow: `0 4px 12px ${cat.color}15`,
                            }}
                        >
                            <span style={{ fontSize: 20 * s, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>{cat.emoji}</span>
                            <span
                                style={{
                                    fontFamily,
                                    fontSize: 16 * s,
                                    fontWeight: 500,
                                    color: TEXT,
                                }}
                            >
                                {cat.name}
                            </span>
                            <span
                                style={{
                                    fontFamily,
                                    fontSize: 12 * s,
                                    fontWeight: 400,
                                    color: cat.color,
                                    opacity: 0.9,
                                    letterSpacing: "0.02em",
                                }}
                            >
                                {cat.sessions}회
                            </span>
                        </GlassContainer>
                    );
                })}
            </div>

            {/* Caption */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60 * s,
                    fontFamily,
                    fontSize: 12 * s,
                    fontWeight: 400,
                    color: TEXT_MUTED,
                    opacity: captionOpacity,
                    letterSpacing: "0.02em",
                    zIndex: 10,
                }}
            >
                어디에 시간을 쓰고 있는지 한눈에
            </div>
        </AbsoluteFill>
    );
};
