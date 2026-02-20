/* eslint-disable react-refresh/only-export-components */
import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from "remotion";

// ─── Layout Types ───────────────────────────────────────────────────
export type Layout = "landscape" | "portrait" | "square";

export type SceneProps = {
    layout: Layout;
};

// ─── Colors (matching Focus Valley aurora palette) ──────────────────
export const BG = "#080c16";
export const TEXT = "#f0f2f5";
export const TEXT_MUTED = "rgba(240,242,245,0.6)"; // Slightly more visible
export const ACCENT_EMERALD = "#34d399";
export const ACCENT_CYAN = "#22d3ee";
export const ACCENT_VIOLET = "#a78bfa";
export const ACCENT_AMBER = "#fbbf24";

// ─── Font ───────────────────────────────────────────────────────────
// Using a reputable, modern sans-serif stack. 
// Ensure these fonts are loaded via Google Fonts link in index.html or imported in CSS.
export const fontFamily = "'Outfit', 'Manrope', 'Inter', system-ui, sans-serif";
export const fontRetro = "'Press Start 2P', system-ui, cursive";

// ─── Layout Helpers ─────────────────────────────────────────────────
export function scaleFactor(layout: Layout): number {
    return layout === "portrait" ? 0.75 : layout === "square" ? 0.85 : 1;
}

export function isVertical(layout: Layout): boolean {
    return layout === "portrait";
}

// ─── Animated Aurora Component ──────────────────────────────────────
const Blob: React.FC<{
    color: string;
    size: number;
    left: number;
    top: number;
    seed: number;
    opacity: number;
}> = ({ color, size, left, top, seed, opacity }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Slow, organic movement
    const wobbleX = Math.sin(frame / (fps * 4) + seed) * 50;
    const wobbleY = Math.cos(frame / (fps * 5) + seed) * 50;
    const pulse = Math.sin(frame / (fps * 3) + seed * 2) * 0.1 + 0.9; // Scale 0.9 ~ 1.1

    return (
        <div
            style={{
                position: "absolute",
                left,
                top,
                width: size,
                height: size,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: "blur(80px)",
                opacity: opacity,
                transform: `translate(${wobbleX}px, ${wobbleY}px) scale(${pulse})`,
                mixBlendMode: "screen",
            }}
        />
    );
};

export const AnimatedAurora: React.FC = () => {
    return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
             {/* Base dark background */}
            <div style={{ position: "absolute", inset: 0, backgroundColor: BG }} />
            
            {/* Moving blobs */}
            <Blob color={`${ACCENT_VIOLET}40`} size={900} left={-200} top={-200} seed={0} opacity={0.4} />
            <Blob color={`${ACCENT_CYAN}30`} size={800} left={800} top={200} seed={2} opacity={0.3} />
            <Blob color={`${ACCENT_EMERALD}20`} size={700} left={200} top={600} seed={4} opacity={0.3} />
            
            {/* Noise Texture Overlay for grain/texture */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
                    opacity: 0.07,
                    pointerEvents: "none",
                }}
            />
        </AbsoluteFill>
    );
};

// ─── Glass Container ────────────────────────────────────────────────
export const GlassContainer: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}> = ({ children, style, className }) => {
    return (
        <div
            style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
                borderRadius: 24,
                ...style,
            }}
            className={className}
        >
            {children}
        </div>
    );
};

// ─── Scene Transition ───────────────────────────────────────────────
export const SceneTransition: React.FC<{
    children: React.ReactNode;
    durationInFrames: number;
}> = ({ children, durationInFrames }) => {
    const frame = useCurrentFrame();

    const fadeIn = interpolate(frame, [0, 15], [0, 1], {
        extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(
        frame,
        [durationInFrames - 15, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return (
        <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>
            {children}
        </AbsoluteFill>
    );
};
