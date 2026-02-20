import { useEffect, useReducer } from "react";
import type { PlantStage } from "./useGarden";
import type { TargetAndTransition } from "framer-motion";

export type StageTransition = {
    initial: TargetAndTransition;
    animate: TargetAndTransition;
    exit: TargetAndTransition;
};

const stageVariants: Record<string, StageTransition> = {
    "SEED-SPROUT": {
        initial: { scale: 0.3, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
    "SPROUT-BUD": {
        initial: { scale: 0.8, opacity: 0, rotate: -5 },
        animate: { scale: 1, opacity: 1, rotate: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
    "BUD-FLOWER": {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: [0.9, 1.1, 1], opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
    },
    "FLOWER-TREE": {
        initial: { scale: 0.95, opacity: 0, y: 10 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
    "DEAD": {
        initial: { rotate: 0, opacity: 1 },
        animate: { rotate: 5, opacity: 0.6 },
        exit: { scale: 0.5, opacity: 0 },
    },
    "default": {
        initial: { scale: 0.5, opacity: 0, y: 20 },
        animate: { scale: 1, opacity: 1, y: 0 },
        exit: { scale: 0.8, opacity: 0, y: -10 },
    },
};

function getStageTransition(prev: PlantStage | null, current: PlantStage): StageTransition {
    if (current === "DEAD") return stageVariants["DEAD"];
    if (prev) {
        const key = `${prev}-${current}`;
        if (key in stageVariants) return stageVariants[key];
    }
    return stageVariants["default"];
}

type ParticleState = {
    trigger: number;
    type: "growth" | "harvest" | "death";
    prevStage: PlantStage;
};

function particleReducer(state: ParticleState, currentStage: PlantStage): ParticleState {
    const prevStage = state.prevStage;
    if (prevStage === currentStage) return state;

    let nextType = state.type;
    let nextTrigger = state.trigger;

    if (currentStage === "DEAD") {
        nextType = "death";
        nextTrigger += 1;
    } else if (currentStage === "SEED" && (prevStage === "TREE" || prevStage === "FLOWER")) {
        nextType = "harvest";
        nextTrigger += 1;
    } else if (
        (prevStage === "SEED" && currentStage === "SPROUT") ||
        (prevStage === "SPROUT" && currentStage === "BUD") ||
        (prevStage === "BUD" && currentStage === "FLOWER") ||
        (prevStage === "FLOWER" && currentStage === "TREE")
    ) {
        nextType = "growth";
        nextTrigger += 1;
    }

    return {
        trigger: nextTrigger,
        type: nextType,
        prevStage: currentStage,
    };
}

export function usePlantParticles(currentStage: PlantStage) {
    const [state, syncStage] = useReducer(particleReducer, {
        trigger: 0,
        type: "growth",
        prevStage: currentStage,
    });

    useEffect(() => {
        syncStage(currentStage);
    }, [currentStage]);

    const stageTransition = getStageTransition(state.prevStage, currentStage);

    return { trigger: state.trigger, type: state.type, stageTransition };
}
