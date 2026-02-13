import React from "react";
import { Composition } from "remotion";
import { FocusValleyIntro } from "./FocusValleyIntro";

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="FocusValleyIntro"
            component={FocusValleyIntro}
            durationInFrames={600}
            fps={30}
            width={1280}
            height={720}
        />
    );
};
