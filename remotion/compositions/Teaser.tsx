import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BG, SceneTransition, type Layout } from "../scenes/shared";
import { LogoScene } from "../scenes/LogoScene";
import { TimerScene } from "../scenes/TimerScene";
import { CTAScene } from "../scenes/CTAScene";

// 15 seconds = 450 frames @ 30fps
// Logo(3s=90f) → Timer+Plant(6s=180f) → CTA(6s=180f)

export const Teaser: React.FC<{ layout: Layout }> = ({ layout }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: BG }}>
            {/* Logo: 0-3s */}
            <Sequence from={0} durationInFrames={105}>
                <SceneTransition durationInFrames={105}>
                    <LogoScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* Timer + Plant: 3-9s */}
            <Sequence from={90} durationInFrames={195}>
                <SceneTransition durationInFrames={195}>
                    <TimerScene layout={layout} />
                </SceneTransition>
            </Sequence>

            {/* CTA: 9-15s */}
            <Sequence from={270} durationInFrames={180}>
                <CTAScene layout={layout} />
            </Sequence>
        </AbsoluteFill>
    );
};
