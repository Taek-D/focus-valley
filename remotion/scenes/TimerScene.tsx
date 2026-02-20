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
    isVertical,
    type SceneProps,
    AnimatedAurora,
    GlassContainer,
} from "./shared";

export const TimerScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const s = scaleFactor(layout);
    const vertical = isVertical(layout);

    const enterScale = spring({ frame, fps, config: { damping: 15 } });
    const timerMinutes = 25;
    const timerSeconds = Math.max(0, 59 - Math.floor(frame / 2.5));
    const progress = frame / durationInFrames;

    // Plant growth stages
    const plantHeight = interpolate(frame, [0, durationInFrames], [20, 100], { extrapolateRight: "clamp" });
    const leavesOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateRight: "clamp" });
    const flowerOpacity = interpolate(frame, [100, 130], [0, 1], { extrapolateRight: "clamp" });

    // Focus dots (4 sessions in a cycle)
    const dotsOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

    // Progress ring
    const radius = 90 * s;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);
    const svgSize = 220 * s;

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            <AnimatedAurora />

            <GlassContainer
                style={{
                    display: "flex",
                    flexDirection: vertical ? "column" : "row",
                    alignItems: "center",
                    gap: vertical ? 60 * s : 100 * s,
                    padding: vertical ? 60 * s : 80 * s,
                    transform: `scale(${enterScale})`,
                }}
            >
                {/* Timer */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={svgSize} height={svgSize} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
                        <circle
                            cx={svgSize / 2}
                            cy={svgSize / 2}
                            r={radius}
                            fill="none"
                            stroke={ACCENT_EMERALD}
                            strokeWidth={4}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ opacity: 0.8, filter: `drop-shadow(0 0 10px ${ACCENT_EMERALD}40)` }}
                        />
                    </svg>
                    <div
                        style={{
                            position: "absolute",
                            fontFamily,
                            fontSize: 64 * s,
                            fontWeight: 800, // Bolder for premium look
                            color: TEXT,
                            letterSpacing: "-0.02em",
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {timerMinutes}:{timerSeconds.toString().padStart(2, "0")}
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            bottom: 40 * s,
                            fontFamily,
                            fontSize: 12 * s,
                            fontWeight: 600,
                            color: ACCENT_EMERALD,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                        }}
                    >
                        집중 중
                    </div>
                    {/* Focus session dots */}
                    <div
                        style={{
                            position: "absolute",
                            top: 35 * s,
                            display: "flex",
                            gap: 8 * s,
                            opacity: dotsOpacity,
                        }}
                    >
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: 6 * s,
                                    height: 6 * s,
                                    borderRadius: "50%",
                                    backgroundColor: i < 2 ? ACCENT_EMERALD : "rgba(255,255,255,0.1)",
                                    boxShadow: i < 2 ? `0 0 10px ${ACCENT_EMERALD}60` : "none",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Plant growing */}
                <div style={{ width: 140 * s, height: 180 * s, position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    {/* Ground */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            width: 120 * s,
                            height: 10 * s,
                            borderRadius: 100,
                            backgroundColor: "rgba(255,255,255,0.1)",
                            filter: "blur(4px)",
                        }}
                    />
                    {/* Stem */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 8 * s,
                            width: 4 * s,
                            height: plantHeight * s,
                            backgroundColor: ACCENT_EMERALD,
                            borderRadius: 4,
                            opacity: 0.9,
                        }}
                    />
                    {/* Leaves */}
                    <svg
                        width={80 * s}
                        height={50 * s}
                        viewBox="0 0 60 40"
                        style={{
                            position: "absolute",
                            bottom: (plantHeight - 15) * s,
                            opacity: leavesOpacity,
                        }}
                    >
                        <ellipse cx={15} cy={25} rx={12} ry={8} fill={ACCENT_EMERALD} opacity={0.8} transform="rotate(-30 15 25)" />
                        <ellipse cx={45} cy={25} rx={12} ry={8} fill={ACCENT_EMERALD} opacity={0.8} transform="rotate(30 45 25)" />
                    </svg>
                    {/* Flower */}
                    <svg
                        width={50 * s}
                        height={50 * s}
                        viewBox="0 0 40 40"
                        style={{
                            position: "absolute",
                            bottom: (plantHeight + 10) * s,
                            opacity: flowerOpacity,
                            filter: `drop-shadow(0 0 15px ${ACCENT_VIOLET}80)`,
                        }}
                    >
                        {[0, 60, 120, 180, 240, 300].map((angle) => (
                            <ellipse
                                key={angle}
                                cx={20}
                                cy={20}
                                rx={6}
                                ry={10}
                                fill={ACCENT_VIOLET}
                                opacity={0.9}
                                transform={`rotate(${angle} 20 20)`}
                            />
                        ))}
                        <circle cx={20} cy={20} r={5} fill={ACCENT_AMBER} opacity={1} />
                    </svg>
                </div>
            </GlassContainer>

            {/* Label */}
            <div
                style={{
                    position: "absolute",
                    bottom: vertical ? 100 * s : 60 * s,
                    fontFamily,
                    fontSize: 14 * s,
                    fontWeight: 500,
                    color: TEXT_MUTED,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                }}
            >
                다른 탭으로 가도 괜찮아요
            </div>
        </AbsoluteFill>
    );
};
