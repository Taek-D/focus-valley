import React from "react";
import { Composition } from "remotion";
import { FocusValleyIntro } from "./FocusValleyIntro";
import { Teaser } from "./compositions/Teaser";
import { Shorts } from "./compositions/Shorts";
import { Full } from "./compositions/Full";
import type { Layout } from "./scenes/shared";

const FPS = 30;

type VariantConfig = {
    id: string;
    component: React.FC<{ layout: Layout }>;
    durationInFrames: number;
    layout: Layout;
    width: number;
    height: number;
};

const VARIANTS: VariantConfig[] = [
    // Teaser — 15s = 450 frames
    { id: "Teaser-Landscape", component: Teaser, durationInFrames: 450, layout: "landscape", width: 1920, height: 1080 },
    { id: "Teaser-Portrait", component: Teaser, durationInFrames: 450, layout: "portrait", width: 1080, height: 1920 },
    { id: "Teaser-Square", component: Teaser, durationInFrames: 450, layout: "square", width: 1080, height: 1080 },

    // Shorts — 30s = 900 frames
    { id: "Shorts-Landscape", component: Shorts, durationInFrames: 900, layout: "landscape", width: 1920, height: 1080 },
    { id: "Shorts-Portrait", component: Shorts, durationInFrames: 900, layout: "portrait", width: 1080, height: 1920 },
    { id: "Shorts-Square", component: Shorts, durationInFrames: 900, layout: "square", width: 1080, height: 1080 },

    // Full — 60s = 1800 frames
    { id: "Full-Landscape", component: Full, durationInFrames: 1800, layout: "landscape", width: 1920, height: 1080 },
    { id: "Full-Portrait", component: Full, durationInFrames: 1800, layout: "portrait", width: 1080, height: 1920 },
    { id: "Full-Square", component: Full, durationInFrames: 1800, layout: "square", width: 1080, height: 1080 },
];

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* Legacy 20s intro — preserved for compatibility */}
            <Composition
                id="FocusValleyIntro"
                component={FocusValleyIntro}
                durationInFrames={600}
                fps={FPS}
                width={1280}
                height={720}
            />

            {/* 9 new variants */}
            {VARIANTS.map((v) => (
                <Composition
                    key={v.id}
                    id={v.id}
                    component={() => <v.component layout={v.layout} />}
                    durationInFrames={v.durationInFrames}
                    fps={FPS}
                    width={v.width}
                    height={v.height}
                />
            ))}
        </>
    );
};
