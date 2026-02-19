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

const FEATURES = [
    { emoji: "🌱", title: "식물 수집", desc: "집중할수록 특별한 식물을 만나요", color: ACCENT_EMERALD },
    { emoji: "📋", title: "할 일 관리", desc: "오늘 할 일을 정하고 하나씩 완료해요", color: ACCENT_CYAN },
    { emoji: "🧘", title: "호흡 가이드", desc: "쉬는 시간엔 깊은 호흡으로 쉬어가요", color: ACCENT_VIOLET },
    { emoji: "☁️", title: "클라우드 동기화", desc: "어디서든 내 정원을 이어갈 수 있어요", color: ACCENT_AMBER },
];

const FeatureCard: React.FC<{
    feature: (typeof FEATURES)[0];
    delay: number;
    cardWidth: number;
    scale: number;
}> = ({ feature, delay, cardWidth, scale }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const enter = spring({ frame, fps, delay, config: { damping: 14 } });
    const y = interpolate(enter, [0, 1], [40, 0]);

    return (
        <GlassContainer
            style={{
                width: cardWidth,
                padding: `${28 * scale}px ${24 * scale}px`,
                opacity: enter,
                transform: `translateY(${y}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12 * scale,
            }}
        >
            <div style={{ fontSize: 32 * scale, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" }}>{feature.emoji}</div>
            <div
                style={{
                    fontFamily,
                    fontSize: 16 * scale,
                    fontWeight: 700,
                    color: TEXT,
                    letterSpacing: "-0.01em",
                }}
            >
                {feature.title}
            </div>
            <div
                style={{
                    fontFamily,
                    fontSize: 13 * scale,
                    fontWeight: 400,
                    color: TEXT_MUTED,
                    letterSpacing: "0.01em",
                    textAlign: "center",
                    lineHeight: 1.4,
                }}
            >
                {feature.desc}
            </div>
            <div
                style={{
                    width: 40 * scale,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: feature.color,
                    opacity: 0.6,
                    marginTop: 8 * scale,
                    boxShadow: `0 0 10px ${feature.color}60`,
                }}
            />
        </GlassContainer>
    );
};

export const FeaturesScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const s = scaleFactor(layout);

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    // Layout: landscape=4col, portrait/square=2x2
    const useGrid = layout !== "landscape";
    const cardWidth = useGrid ? 200 * s : 240 * s;

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            <AnimatedAurora />

            <div
                style={{
                    fontFamily,
                    fontSize: 16 * s,
                    fontWeight: 600,
                    color: ACCENT_VIOLET,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: 40 * s,
                    opacity: titleOpacity,
                    textShadow: "0 2px 10px rgba(167, 139, 250, 0.3)",
                }}
            >
                당신의 집중을 도와줄게요
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: useGrid ? "wrap" : "nowrap",
                    gap: 24 * s, // Increased gap slightly
                    justifyContent: "center",
                    maxWidth: useGrid ? (cardWidth * 2 + 50 * s) : undefined,
                    zIndex: 10,
                }}
            >
                {FEATURES.map((f, i) => (
                    <FeatureCard key={f.title} feature={f} delay={i * 5} cardWidth={cardWidth} scale={s} />
                ))}
            </div>
        </AbsoluteFill>
    );
};
