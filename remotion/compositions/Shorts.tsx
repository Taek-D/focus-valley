import React from "react";
import { AbsoluteFill, Sequence, Audio, Loop, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { BG, SceneTransition, type Layout } from "../scenes/shared";
import { LogoScene } from "../scenes/LogoScene";
import { TimerScene } from "../scenes/TimerScene";
import { FeaturesScene } from "../scenes/FeaturesScene";
import { SoundsScene } from "../scenes/SoundsScene";
import { CTAScene } from "../scenes/CTAScene";

// 30 seconds = 900 frames @ 30fps
// Logo(3s=90f) → Timer+Plant(8s=240f) → Features(8s=240f) → Sounds(5s=150f) → CTA(6s=180f)

export const Shorts: React.FC<{ layout: Layout }> = ({ layout }) => {
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
            <Loop durationInFrames={750}>
                <Audio src={staticFile("sounds/rain.mp3")} volume={() => 0.15 * audioVolume} />
            </Loop>
            <Loop durationInFrames={900}>
                <Audio src={staticFile("sounds/cafe.mp3")} volume={() => 0.08 * audioVolume} />
            </Loop>

            {/* Logo: 0-3s */}
            <Sequence from={0} durationInFrames={105}>
                <SceneTransition durationInFrames={105}>
                    <LogoScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Timer + Plant: 3-11s */}
            <Sequence from={90} durationInFrames={255}>
                <SceneTransition durationInFrames={255}>
                    <TimerScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Features: 11-19s */}
            <Sequence from={330} durationInFrames={255}>
                <SceneTransition durationInFrames={255}>
                    <FeaturesScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Sounds: 19-24s */}
            <Sequence from={570} durationInFrames={165}>
                <SceneTransition durationInFrames={165}>
                    <SoundsScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* CTA: 24-30s */}
            <Sequence from={720} durationInFrames={180}>
                <CTAScene layout={layout} />
            </Sequence>
        </AbsoluteFill>
    );
};
