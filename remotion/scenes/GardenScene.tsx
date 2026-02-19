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

// 10 actual plant types from the app
const PLANTS = [
    { emoji: "🌱", name: "새싹", tier: "base" },
    { emoji: "🌵", name: "선인장", tier: "base" },
    { emoji: "🌻", name: "해바라기", tier: "base" },
    { emoji: "🌲", name: "소나무", tier: "base" },
    { emoji: "🌹", name: "장미", tier: "streak" },
    { emoji: "🌸", name: "난초", tier: "streak" },
    { emoji: "🪷", name: "연꽃", tier: "deepfocus" },
    { emoji: "💎", name: "크리스탈", tier: "deepfocus" },
    { emoji: "🎋", name: "대나무", tier: "pro" },
    { emoji: "🌸", name: "벚꽃", tier: "pro" },
];

const TIER_COLORS: Record<string, string> = {
    base: "rgba(255,255,255,0.06)",
    streak: `${ACCENT_AMBER}20`,
    deepfocus: `${ACCENT_VIOLET}20`,
    pro: `${ACCENT_CYAN}20`,
};

const TIER_BORDERS: Record<string, string> = {
    base: "rgba(255,255,255,0.06)",
    streak: `${ACCENT_AMBER}40`,
    deepfocus: `${ACCENT_VIOLET}40`,
    pro: `${ACCENT_CYAN}40`,
};

export const GardenScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = scaleFactor(layout);

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const legendOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });

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
                    marginBottom: 20 * s,
                    opacity: titleOpacity,
                    zIndex: 10,
                }}
            >
                다양한 식물이 기다리고 있어요
            </div>

            <div
                style={{
                    fontFamily,
                    fontSize: 36 * s,
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: 36 * s,
                    opacity: titleOpacity,
                    zIndex: 10,
                    textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    letterSpacing: "-0.01em",
                }}
            >
                나만의 작은 정원
            </div>

            <div style={{ display: "flex", gap: 16 * s, flexWrap: "wrap", justifyContent: "center", maxWidth: 600 * s, zIndex: 10 }}>
                {PLANTS.map((plant, i) => {
                    const enter = spring({ frame, fps, delay: 10 + i * 5, config: { damping: 12 } });
                    return (
                        <GlassContainer
                            key={i}
                            style={{
                                width: 80 * s,
                                height: 80 * s,
                                borderRadius: 20 * s, // Slightly rounder
                                backgroundColor: TIER_COLORS[plant.tier],
                                border: `1px solid ${TIER_BORDERS[plant.tier]}`,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4 * s,
                                transform: `scale(${enter})`,
                                opacity: enter,
                                boxShadow: `0 8px 16px -4px ${TIER_COLORS[plant.tier]}`, // Glowy shadow
                            }}
                        >
                            <span style={{ fontSize: 28 * s, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>{plant.emoji}</span>
                            <span style={{ fontFamily, fontSize: 10 * s, color: TEXT, fontWeight: 500, opacity: 0.9 }}>
                                {plant.name}
                            </span>
                        </GlassContainer>
                    );
                })}
            </div>

            {/* Unlock legend */}
            <div
                style={{
                    marginTop: 30 * s,
                    display: "flex",
                    gap: 24 * s,
                    opacity: legendOpacity,
                    zIndex: 10,
                }}
            >
                {[
                    { label: "연속 달성", color: ACCENT_AMBER },
                    { label: "딥 포커스", color: ACCENT_VIOLET },
                    { label: "프로 전용", color: ACCENT_CYAN },
                ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 * s }}>
                        <div style={{ width: 8 * s, height: 8 * s, borderRadius: "50%", backgroundColor: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                        <span style={{ fontFamily, fontSize: 11 * s, color: TEXT_MUTED, fontWeight: 400, letterSpacing: "0.02em" }}>
                            {l.label}
                        </span>
                    </div>
                ))}
            </div>
        </AbsoluteFill>
    );
};
