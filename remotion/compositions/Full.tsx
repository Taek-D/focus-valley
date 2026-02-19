import React from "react";
import { AbsoluteFill, Sequence, Audio, Loop, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BG, SceneTransition, type Layout } from "../scenes/shared";
import { LogoScene } from "../scenes/LogoScene";
import { TimerScene } from "../scenes/TimerScene";
import { FeaturesScene } from "../scenes/FeaturesScene";
import { SoundsScene } from "../scenes/SoundsScene";
import { GardenScene } from "../scenes/GardenScene";
import { StatsScene } from "../scenes/StatsScene";
import { CategoriesScene } from "../scenes/CategoriesScene";
import { CTAScene } from "../scenes/CTAScene";

// 60 seconds = 1800 frames @ 30fps
// Logo(4s=120f) → Timer(10s=300f) → Features(10s=300f) → Sounds(8s=240f)
// → Garden(8s=240f) → Stats(8s=240f) → Categories(6s=180f) → CTA(6s=180f)

export const Full: React.FC<{ layout: Layout }> = ({ layout }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const audioVolume = interpolate(
        frame,
        [0, 60, durationInFrames - 60, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* Ambient Audio */}
            {/* Rain: ~25s loop */}
            <Loop durationInFrames={750}>
                <Audio src={staticFile("sounds/rain.mp3")} volume={0.15 * audioVolume} />
            </Loop>
            {/* Cafe: ~30s loop */}
            <Loop durationInFrames={900}>
                <Audio src={staticFile("sounds/cafe.mp3")} volume={0.08 * audioVolume} />
            </Loop>

            {/* Logo: 0-4s */}
            <Sequence from={0} durationInFrames={135}>
                <SceneTransition durationInFrames={135}>
                    <LogoScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Timer + Plant: 4-14s */}
            <Sequence from={120} durationInFrames={315}>
                <SceneTransition durationInFrames={315}>
                    <TimerScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Features: 14-24s */}
            <Sequence from={420} durationInFrames={315}>
                <SceneTransition durationInFrames={315}>
                    <FeaturesScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Sounds: 24-32s */}
            <Sequence from={720} durationInFrames={255}>
                <SceneTransition durationInFrames={255}>
                    <SoundsScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Garden: 32-40s */}
            <Sequence from={960} durationInFrames={255}>
                <SceneTransition durationInFrames={255}>
                    <GardenScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Stats: 40-48s */}
            <Sequence from={1200} durationInFrames={255}>
                <SceneTransition durationInFrames={255}>
                    <StatsScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Categories: 48-54s */}
            <Sequence from={1440} durationInFrames={195}>
                <SceneTransition durationInFrames={195}>
                    <CategoriesScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* CTA: 54-60s */}
            <Sequence from={1620} durationInFrames={180}>
                <CTAScene layout={layout} />
            </Sequence>
        </AbsoluteFill>
    );
};
