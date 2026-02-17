import React from "react";
import {
    AbsoluteFill,
    Sequence,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

// ─── Colors (matching Focus Valley aurora palette) ────────────────────
const BG = "#080c16";
const TEXT = "#f0f2f5";
const TEXT_MUTED = "rgba(240,242,245,0.4)";
const ACCENT_EMERALD = "#34d399";
const ACCENT_CYAN = "#22d3ee";
const ACCENT_VIOLET = "#a78bfa";
const ACCENT_AMBER = "#fbbf24";

// ─── Shared Styles ───────────────────────────────────────────────────
const fontFamily = "'Sora', 'Inter', system-ui, sans-serif";

// ─── Scene 1: Logo + Tagline (0-3s, frames 0-90) ────────────────────
const LogoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const leafScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
    const titleOpacity = interpolate(frame, [15, 40], [0, 1], { extrapolateRight: "clamp" });
    const titleY = interpolate(frame, [15, 40], [20, 0], { extrapolateRight: "clamp" });
    const taglineOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
    const taglineY = interpolate(frame, [35, 55], [15, 0], { extrapolateRight: "clamp" });
    const glowOpacity = interpolate(frame, [0, 30], [0, 0.6], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            {/* Aurora glow */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT_EMERALD}30 0%, ${ACCENT_CYAN}15 40%, transparent 70%)`,
                    filter: "blur(80px)",
                    opacity: glowOpacity,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT_VIOLET}20 0%, transparent 60%)`,
                    filter: "blur(60px)",
                    opacity: glowOpacity,
                    transform: "translate(100px, -50px)",
                }}
            />

            {/* Leaf icon */}
            <svg
                width={48}
                height={48}
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT_EMERALD}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    transform: `scale(${leafScale})`,
                    marginBottom: 20,
                    opacity: leafScale,
                }}
            >
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>

            {/* Title */}
            <div
                style={{
                    fontFamily,
                    fontSize: 56,
                    fontWeight: 500,
                    color: TEXT,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                }}
            >
                Focus Valley
            </div>

            {/* Tagline */}
            <div
                style={{
                    fontFamily,
                    fontSize: 20,
                    fontWeight: 300,
                    color: TEXT_MUTED,
                    letterSpacing: "0.1em",
                    marginTop: 12,
                    opacity: taglineOpacity,
                    transform: `translateY(${taglineY}px)`,
                }}
            >
                Grow your garden while you focus
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene 2: Timer + Plant Growth (3-8s, frames 90-240) ────────────
const TimerScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const totalFrames = 150; // 5 seconds

    const enterScale = spring({ frame, fps, config: { damping: 15 } });
    const timerMinutes = 25;
    const timerSeconds = Math.max(0, 59 - Math.floor(frame / 2.5));
    const progress = frame / totalFrames;

    // Plant growth stages
    const plantHeight = interpolate(frame, [0, totalFrames], [20, 100], { extrapolateRight: "clamp" });
    const leavesOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateRight: "clamp" });
    const flowerOpacity = interpolate(frame, [100, 130], [0, 1], { extrapolateRight: "clamp" });

    // Progress ring
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            {/* Aurora glow */}
            <div
                style={{
                    position: "absolute",
                    width: 500,
                    height: 500,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT_CYAN}20 0%, transparent 60%)`,
                    filter: "blur(80px)",
                    opacity: 0.5,
                }}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 120,
                    transform: `scale(${enterScale})`,
                }}
            >
                {/* Timer */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={220} height={220} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={110} cy={110} r={90} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={3} />
                        <circle
                            cx={110}
                            cy={110}
                            r={90}
                            fill="none"
                            stroke={ACCENT_EMERALD}
                            strokeWidth={3}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ opacity: 0.6 }}
                        />
                    </svg>
                    <div
                        style={{
                            position: "absolute",
                            fontFamily,
                            fontSize: 64,
                            fontWeight: 200,
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
                            bottom: 30,
                            fontFamily,
                            fontSize: 10,
                            fontWeight: 500,
                            color: TEXT_MUTED,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                        }}
                    >
                        Focus
                    </div>
                </div>

                {/* Plant growing */}
                <div style={{ width: 120, height: 160, position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    {/* Ground */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            width: 100,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "rgba(52,211,153,0.15)",
                        }}
                    />
                    {/* Stem */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 8,
                            width: 3,
                            height: plantHeight,
                            backgroundColor: ACCENT_EMERALD,
                            borderRadius: 2,
                            opacity: 0.7,
                        }}
                    />
                    {/* Leaves */}
                    <svg
                        width={60}
                        height={40}
                        viewBox="0 0 60 40"
                        style={{
                            position: "absolute",
                            bottom: plantHeight - 10,
                            opacity: leavesOpacity,
                        }}
                    >
                        <ellipse cx={15} cy={25} rx={12} ry={8} fill={ACCENT_EMERALD} opacity={0.5} transform="rotate(-30 15 25)" />
                        <ellipse cx={45} cy={25} rx={12} ry={8} fill={ACCENT_EMERALD} opacity={0.5} transform="rotate(30 45 25)" />
                    </svg>
                    {/* Flower */}
                    <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        style={{
                            position: "absolute",
                            bottom: plantHeight + 15,
                            opacity: flowerOpacity,
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
                                opacity={0.6}
                                transform={`rotate(${angle} 20 20)`}
                            />
                        ))}
                        <circle cx={20} cy={20} r={5} fill={ACCENT_AMBER} opacity={0.8} />
                    </svg>
                </div>
            </div>

            {/* Label */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    fontFamily,
                    fontSize: 14,
                    fontWeight: 400,
                    color: TEXT_MUTED,
                    letterSpacing: "0.08em",
                }}
            >
                Your plant grows as you focus
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene 3: Feature Cards (8-13s, frames 240-390) ─────────────────
const FEATURES = [
    { emoji: "🎵", title: "Ambient Sounds", desc: "Rain, fire, cafe & stream", color: ACCENT_VIOLET },
    { emoji: "📊", title: "Focus Stats", desc: "Track streaks & categories", color: ACCENT_CYAN },
    { emoji: "🌱", title: "Plant Garden", desc: "Collect rare plants", color: ACCENT_EMERALD },
    { emoji: "🌙", title: "Dark Mode", desc: "Beautiful aurora theme", color: ACCENT_AMBER },
];

const FeatureCard: React.FC<{ feature: typeof FEATURES[0]; delay: number }> = ({ feature, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const enter = spring({ frame, fps, delay, config: { damping: 14 } });
    const y = interpolate(enter, [0, 1], [40, 0]);

    return (
        <div
            style={{
                width: 240,
                padding: "28px 24px",
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.06)`,
                opacity: enter,
                transform: `translateY(${y}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
            }}
        >
            <div style={{ fontSize: 32 }}>{feature.emoji}</div>
            <div
                style={{
                    fontFamily,
                    fontSize: 16,
                    fontWeight: 500,
                    color: TEXT,
                    letterSpacing: "0.04em",
                }}
            >
                {feature.title}
            </div>
            <div
                style={{
                    fontFamily,
                    fontSize: 12,
                    fontWeight: 300,
                    color: TEXT_MUTED,
                    letterSpacing: "0.06em",
                }}
            >
                {feature.desc}
            </div>
            <div
                style={{
                    width: 30,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: feature.color,
                    opacity: 0.4,
                    marginTop: 4,
                }}
            />
        </div>
    );
};

const FeaturesScene: React.FC = () => {
    const frame = useCurrentFrame();

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            {/* Aurora */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 400,
                    borderRadius: "50%",
                    background: `radial-gradient(ellipse, ${ACCENT_VIOLET}10 0%, transparent 60%)`,
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            <div
                style={{
                    fontFamily,
                    fontSize: 13,
                    fontWeight: 500,
                    color: TEXT_MUTED,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: 40,
                    opacity: titleOpacity,
                }}
            >
                Everything you need
            </div>

            <div style={{ display: "flex", gap: 20 }}>
                {FEATURES.map((f, i) => (
                    <FeatureCard key={f.title} feature={f} delay={i * 8} />
                ))}
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene 4: Garden Collection (13-17s, frames 390-510) ────────────
const PLANTS = ["🌸", "🌻", "🌷", "🌺", "🌿", "🌳", "🍀", "🌵"];

const GardenScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            {/* Aurora */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT_EMERALD}12 0%, ${ACCENT_AMBER}08 40%, transparent 70%)`,
                    filter: "blur(80px)",
                    opacity: 0.7,
                }}
            />

            <div
                style={{
                    fontFamily,
                    fontSize: 13,
                    fontWeight: 500,
                    color: TEXT_MUTED,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: 20,
                    opacity: titleOpacity,
                }}
            >
                Build your collection
            </div>

            <div
                style={{
                    fontFamily,
                    fontSize: 36,
                    fontWeight: 300,
                    color: TEXT,
                    marginBottom: 40,
                    opacity: titleOpacity,
                }}
            >
                My Garden
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
                {PLANTS.map((plant, i) => {
                    const enter = spring({ frame, fps, delay: 10 + i * 6, config: { damping: 12 } });
                    const scale = enter;

                    return (
                        <div
                            key={i}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 16,
                                backgroundColor: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 36,
                                transform: `scale(${scale})`,
                                opacity: enter,
                            }}
                        >
                            {plant}
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    marginTop: 30,
                    fontFamily,
                    fontSize: 14,
                    fontWeight: 300,
                    color: TEXT_MUTED,
                    opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
                }}
            >
                Unlock rare plants with streaks & focus sessions
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene 5: CTA (17-20s, frames 510-600) ──────────────────────────
const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const enter = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
    const badgeEnter = spring({ frame, fps, delay: 15, config: { damping: 14 } });
    const urlOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
    const glowPulse = interpolate(frame, [0, 90], [0.4, 0.7], {
        extrapolateRight: "clamp",
        easing: (t) => Math.sin(t * Math.PI),
    });

    return (
        <AbsoluteFill style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center" }}>
            {/* Large aurora glow */}
            <div
                style={{
                    position: "absolute",
                    width: 800,
                    height: 800,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${ACCENT_EMERALD}20 0%, ${ACCENT_CYAN}10 30%, ${ACCENT_VIOLET}08 50%, transparent 70%)`,
                    filter: "blur(100px)",
                    opacity: glowPulse,
                }}
            />

            {/* Leaf */}
            <svg
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={ACCENT_EMERALD}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    transform: `scale(${enter})`,
                    marginBottom: 16,
                    opacity: enter,
                }}
            >
                <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>

            {/* Title */}
            <div
                style={{
                    fontFamily,
                    fontSize: 48,
                    fontWeight: 500,
                    color: TEXT,
                    letterSpacing: "0.04em",
                    transform: `scale(${enter})`,
                    opacity: enter,
                }}
            >
                Start Growing Today
            </div>

            {/* Free badge */}
            <div
                style={{
                    marginTop: 20,
                    padding: "8px 24px",
                    borderRadius: 100,
                    backgroundColor: "rgba(52,211,153,0.1)",
                    border: `1px solid rgba(52,211,153,0.2)`,
                    fontFamily,
                    fontSize: 14,
                    fontWeight: 500,
                    color: ACCENT_EMERALD,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transform: `scale(${badgeEnter})`,
                    opacity: badgeEnter,
                }}
            >
                Free &middot; PWA &middot; No Sign-up Required
            </div>

            {/* URL */}
            <div
                style={{
                    marginTop: 30,
                    fontFamily,
                    fontSize: 18,
                    fontWeight: 300,
                    color: TEXT_MUTED,
                    letterSpacing: "0.08em",
                    opacity: urlOpacity,
                }}
            >
                focusvalley.app
            </div>
        </AbsoluteFill>
    );
};

// ─── Scene Transitions ──────────────────────────────────────────────
const SceneTransition: React.FC<{ children: React.ReactNode; durationInFrames: number }> = ({
    children,
    durationInFrames,
}) => {
    const frame = useCurrentFrame();

    const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
            {children}
        </AbsoluteFill>
    );
};

// ─── Main Composition ───────────────────────────────────────────────
export const FocusValleyIntro: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* Scene 1: Logo (0-3s) */}
            <Sequence from={0} durationInFrames={105}>
                <SceneTransition durationInFrames={105}>
                    <LogoScene />
                </SceneTransition>
            </Sequence>

            {/* Scene 2: Timer + Plant (3-8s) */}
            <Sequence from={90} durationInFrames={165}>
                <SceneTransition durationInFrames={165}>
                    <TimerScene />
                </SceneTransition>
            </Sequence>

            {/* Scene 3: Features (8-13s) */}
            <Sequence from={240} durationInFrames={165}>
                <SceneTransition durationInFrames={165}>
                    <FeaturesScene />
                </SceneTransition>
            </Sequence>

            {/* Scene 4: Garden (13-17s) */}
            <Sequence from={390} durationInFrames={135}>
                <SceneTransition durationInFrames={135}>
                    <GardenScene />
                </SceneTransition>
            </Sequence>

            {/* Scene 5: CTA (17-20s) */}
            <Sequence from={510} durationInFrames={90}>
                <CTAScene />
            </Sequence>
        </AbsoluteFill>
    );
};
