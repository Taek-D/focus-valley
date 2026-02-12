import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlantStage = "SEED" | "SPROUT" | "BUD" | "FLOWER" | "TREE" | "DEAD";
export type PlantType = "DEFAULT" | "CACTUS" | "SUNFLOWER" | "PINE";

const PLANT_TYPES: PlantType[] = ["DEFAULT", "CACTUS", "SUNFLOWER", "PINE"];

function randomPlantType(): PlantType {
    return PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)];
}

type HistoryEntry = { type: PlantType; date: string };

interface GardenState {
    stage: PlantStage;
    type: PlantType;
    history: HistoryEntry[];
    totalFocusMinutes: number;
    setStage: (stage: PlantStage) => void;
    plantSeed: () => void;
    killPlant: () => void;
    harvestPlant: () => void;
    addFocusMinutes: (minutes: number) => void;
}

const useGardenStore = create<GardenState>()(
    persist(
        (set) => ({
            stage: "SEED",
            type: randomPlantType(),
            history: [],
            totalFocusMinutes: 0,
            setStage: (stage) => set({ stage }),
            plantSeed: () => set({ stage: "SEED", type: randomPlantType() }),
            killPlant: () => set({ stage: "DEAD" }),
            harvestPlant: () => set((state) => ({
                stage: "SEED",
                type: randomPlantType(),
                history: [...state.history, { type: state.type, date: new Date().toISOString() }],
            })),
            addFocusMinutes: (minutes) => set((state) => ({
                totalFocusMinutes: state.totalFocusMinutes + minutes,
            })),
        }),
        {
            name: "focus-valley-garden",
        }
    )
);

export function useGarden() {
    const store = useGardenStore();

    const grow = useCallback((progressPercentage: number) => {
        if (store.stage === "DEAD") return;

        let nextStage: PlantStage = store.stage;

        if (progressPercentage < 10) nextStage = "SEED";
        else if (progressPercentage < 40) nextStage = "SPROUT";
        else if (progressPercentage < 70) nextStage = "BUD";
        else if (progressPercentage < 100) nextStage = "FLOWER";
        else nextStage = "TREE";

        if (nextStage !== store.stage) {
            store.setStage(nextStage);
        }
    }, [store]);

    return {
        stage: store.stage,
        type: store.type,
        plantSeed: store.plantSeed,
        killPlant: store.killPlant,
        harvest: store.harvestPlant,
        addFocusMinutes: store.addFocusMinutes,
        grow,
        history: store.history,
        totalFocusMinutes: store.totalFocusMinutes,
    };
}
