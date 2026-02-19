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

const SOUNDS = [
    { name: "빗소리", icon: "🌧️", color: ACCENT_CYAN, level: 0.7 },
    { name: "모닥불", icon: "🔥", color: ACCENT_AMBER, level: 0.5 },
    { name: "카페", icon: "☕", color: ACCENT_VIOLET, level: 0.3 },
    { name: "시냇물", icon: "🌊", color: ACCENT_EMERALD, level: 0.6 },
    { name: "백색소음", icon: "🍃", color: TEXT_MUTED, level: 0.4 },
];

const Waveform: React.FC<{ color: string; width: number; height: number; frame: number; seed: number }> = ({
    color,
    width,
    height,
    frame,
    seed,
}) => {
    const bars = 24;
    const barWidth = width / bars - 2;

    return (
        <svg width={width} height={height} style={{ opacity: 0.6 }}>
            {Array.from({ length: bars }).map((_, i) => {
                const phase = (frame * 0.08 + i * 0.5 + seed * 3) % (Math.PI * 2);
                const h = (Math.sin(phase) * 0.5 + 0.5) * height * 0.8 + height * 0.1;
                return (
                    <rect
                        key={i}
                        x={i * (barWidth + 2)}
                        y={(height - h) / 2}
                        width={barWidth}
                        height={h}
                        rx={barWidth / 2}
                        fill={color}
                        opacity={0.5}
                    />
                );
            })}
        </svg>
    );
};

export const SoundsScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = scaleFactor(layout);

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const waveEnter = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" });
    const captionOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });

    const sliderWidth = layout === "portrait" ? 160 * s : 200 * s;

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
                마음이 편해지는 소리
            </div>

            <div
                style={{
                    fontFamily,
                    fontSize: 32 * s,
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: 40 * s,
                    opacity: titleOpacity,
                    zIndex: 10,
                    textAlign: "center",
                    textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    letterSpacing: "-0.02em",
                }}
            >
                좋아하는 소리를 섞어보세요
            </div>

            {/* Sound sliders */}
            <GlassContainer
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16 * s,
                    padding: 32 * s,
                    zIndex: 10,
                }}
            >
                {SOUNDS.map((sound, i) => {
                    const enter = spring({ frame, fps, delay: 10 + i * 8, config: { damping: 14 } });
                    const animLevel = interpolate(frame, [20 + i * 8, 50 + i * 8], [0, sound.level], {
                        extrapolateRight: "clamp",
                    });

                    return (
                        <div
                            key={sound.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16 * s,
                                opacity: enter,
                                transform: `translateX(${interpolate(enter, [0, 1], [-20, 0])}px)`,
                            }}
                        >
                            <div style={{ fontSize: 20 * s, width: 30 * s, textAlign: "center", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>{sound.icon}</div>
                            <div
                                style={{
                                    fontFamily,
                                    fontSize: 14 * s,
                                    fontWeight: 500,
                                    color: TEXT,
                                    width: 80 * s,
                                }}
                            >
                                {sound.name}
                            </div>
                            {/* Track */}
                            <div
                                style={{
                                    width: sliderWidth,
                                    height: 6 * s,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(255,255,255,0.06)",
                                    position: "relative",
                                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${animLevel * 100}%`,
                                        height: "100%",
                                        borderRadius: 3,
                                        background: `linear-gradient(90deg, ${sound.color}80, ${sound.color})`,
                                        boxShadow: `0 0 10px ${sound.color}40`,
                                    }}
                                />
                                {/* Thumb */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -3 * s,
                                        left: `${animLevel * 100}%`,
                                        width: 12 * s,
                                        height: 12 * s,
                                        borderRadius: "50%",
                                        backgroundColor: "#fff",
                                        transform: "translateX(-50%)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    fontFamily,
                                    fontSize: 12 * s,
                                    fontWeight: 400,
                                    color: TEXT_MUTED,
                                    width: 40 * s,
                                    textAlign: "right",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {Math.round(animLevel * 100)}%
                            </div>
                        </div>
                    );
                })}
            </GlassContainer>

            {/* Waveform visualization */}
            <div style={{ marginTop: 40 * s, opacity: waveEnter, zIndex: 10 }}>
                <Waveform color={ACCENT_CYAN} width={300 * s} height={40 * s} frame={frame} seed={1} />
            </div>

            {/* Caption */}
            <div
                style={{
                    position: "absolute",
                    bottom: 50 * s,
                    fontFamily,
                    fontSize: 12 * s,
                    fontWeight: 400,
                    color: TEXT_MUTED,
                    opacity: captionOpacity,
                    letterSpacing: "0.05em",
                }}
            >
                끊김 없는 재생 • 자유로운 믹싱 • 깨끗한 음질
            </div>
        </AbsoluteFill>
    );
};
