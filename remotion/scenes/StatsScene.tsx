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

// Mock 13-week heatmap (7 cols x 6 rows)
const HEATMAP_DATA: number[][] = [
    [0, 1, 2, 0, 3, 1, 0],
    [1, 3, 2, 1, 0, 2, 1],
    [2, 1, 3, 3, 2, 0, 1],
    [0, 2, 1, 2, 3, 3, 2],
    [1, 0, 3, 2, 1, 3, 1],
    [2, 3, 1, 0, 2, 1, 3],
];

const INTENSITY_COLORS = [
    "rgba(255,255,255,0.03)",
    `${ACCENT_EMERALD}30`,
    `${ACCENT_EMERALD}60`,
    ACCENT_EMERALD,
];

const STATS = [
    { label: "현재 연속", value: "12", unit: "일", color: ACCENT_AMBER },
    { label: "총 집중 시간", value: "47.5", unit: "시간", color: ACCENT_CYAN },
    { label: "수확한 식물", value: "23", unit: "개", color: ACCENT_EMERALD },
    { label: "최고 기록", value: "18", unit: "일", color: ACCENT_VIOLET },
];

export const StatsScene: React.FC<SceneProps> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const s = scaleFactor(layout);
    const vertical = isVertical(layout);

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const chartLabelOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });

    const cellSize = vertical ? 14 * s : 18 * s;
    const cellGap = 4 * s;

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
                얼마나 집중했을까?
            </div>

            <div
                style={{
                    fontFamily,
                    fontSize: 36 * s,
                    fontWeight: 700,
                    color: TEXT,
                    marginBottom: 40 * s,
                    opacity: titleOpacity,
                    zIndex: 10,
                    textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    letterSpacing: "-0.01em",
                }}
            >
                내 집중의 발자취
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: vertical ? "column" : "row",
                    alignItems: "center",
                    gap: vertical ? 36 * s : 60 * s,
                    zIndex: 10,
                }}
            >
                {/* Heatmap Container */}
                <GlassContainer style={{ padding: 24 * s, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: cellGap,
                        }}
                    >
                        {HEATMAP_DATA.map((week, wi) => (
                            <div key={wi} style={{ display: "flex", gap: cellGap }}>
                                {week.map((intensity, di) => {
                                    const cellDelay = 5 + wi * 4 + di * 2;
                                    const cellEnter = spring({ frame, fps, delay: cellDelay, config: { damping: 15, stiffness: 120 } });
                                    return (
                                        <div
                                            key={di}
                                            style={{
                                                width: cellSize,
                                                height: cellSize,
                                                borderRadius: 4 * s,
                                                backgroundColor: INTENSITY_COLORS[intensity],
                                                transform: `scale(${cellEnter})`,
                                                opacity: cellEnter,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    {/* Day labels */}
                    <div style={{ display: "flex", gap: cellGap, marginTop: 12 * s }}>
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                            <div
                                key={i}
                                style={{
                                    width: cellSize,
                                    textAlign: "center",
                                    fontFamily,
                                    fontSize: 10 * s,
                                    color: TEXT_MUTED,
                                    fontWeight: 500,
                                }}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                    <div
                        style={{
                            fontFamily,
                            fontSize: 10 * s,
                            color: TEXT_MUTED,
                            textAlign: "center",
                            marginTop: 16 * s,
                            opacity: chartLabelOpacity,
                            letterSpacing: "0.02em",
                        }}
                    >
                        분석하고 • 저장하고 • 공유해요
                    </div>
                </GlassContainer>

                {/* Stat counters */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 * s }}>
                    {STATS.map((stat, i) => {
                        const enter = spring({ frame, fps, delay: 20 + i * 10, config: { damping: 14 } });
                        const countUp = interpolate(frame, [20 + i * 10, 50 + i * 10], [0, 1], {
                            extrapolateRight: "clamp",
                        });
                        const numVal = parseFloat(stat.value);
                        const displayVal = stat.value.includes(".")
                            ? (numVal * countUp).toFixed(1)
                            : Math.round(numVal * countUp).toString();

                        return (
                            <GlassContainer
                                key={stat.label}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: 20 * s,
                                    width: 140 * s,
                                    gap: 4 * s,
                                    opacity: enter,
                                    transform: `translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily,
                                        fontSize: 32 * s,
                                        fontWeight: 700,
                                        color: stat.color,
                                        fontVariantNumeric: "tabular-nums",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {displayVal}
                                </div>
                                <div
                                    style={{
                                        fontFamily,
                                        fontSize: 11 * s,
                                        fontWeight: 500,
                                        color: TEXT_MUTED,
                                        letterSpacing: "0.02em",
                                        opacity: 0.9,
                                        textAlign: "center",
                                    }}
                                >
                                    {stat.label}
                                    <br />
                                    <span style={{ fontSize: 9 * s, opacity: 0.7 }}>({stat.unit})</span>
                                </div>
                            </GlassContainer>
                        );
                    })}
                </div>
            </div>
        </AbsoluteFill>
    );
};
