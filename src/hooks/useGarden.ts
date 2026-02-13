import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlantStage = "SEED" | "SPROUT" | "BUD" | "FLOWER" | "TREE" | "DEAD";
export type PlantType = "DEFAULT" | "CACTUS" | "SUNFLOWER" | "PINE" | "ROSE" | "ORCHID";

export type FocusSession = { date: string; minutes: number; categoryId?: string };

const BASE_PLANT_TYPES: PlantType[] = ["DEFAULT", "CACTUS", "SUNFLOWER", "PINE"];

export const STREAK_UNLOCKS: { streak: number; plant: PlantType; label: string }[] = [
    { streak: 3, plant: "ROSE", label: "Rose" },
    { streak: 7, plant: "ORCHID", label: "Orchid" },
];

import { getToday, getYesterday } from "@/lib/date-utils";

export function getDisplayStreak(currentStreak: number, lastFocusDate: string | null): number {
    if (!lastFocusDate || currentStreak === 0) return 0;
    const today = getToday();
    const yesterday = getYesterday();
    if (lastFocusDate === today || lastFocusDate === yesterday) return currentStreak;
    return 0;
}

function getAvailablePlants(unlocked: PlantType[]): PlantType[] {
    return [...BASE_PLANT_TYPES, ...unlocked];
}

function randomPlantType(available: PlantType[]): PlantType {
    return available[Math.floor(Math.random() * available.length)];
}

type HistoryEntry = { type: PlantType; date: string };

interface GardenState {
    stage: PlantStage;
    type: PlantType;
    history: HistoryEntry[];
    totalFocusMinutes: number;
    focusSessions: FocusSession[];
    currentStreak: number;
    bestStreak: number;
    lastFocusDate: string | null;
    unlockedPlants: PlantType[];
    pendingUnlock: PlantType | null;
    setStage: (stage: PlantStage) => void;
    plantSeed: () => void;
    killPlant: () => void;
    harvestPlant: () => void;
    addFocusMinutes: (minutes: number, categoryId?: string) => void;
    clearPendingUnlock: () => void;
}

const useGardenStore = create<GardenState>()(
    persist(
        (set) => ({
            stage: "SEED",
            type: randomPlantType(BASE_PLANT_TYPES),
            history: [],
            totalFocusMinutes: 0,
            focusSessions: [],
            currentStreak: 0,
            bestStreak: 0,
            lastFocusDate: null,
            unlockedPlants: [],
            pendingUnlock: null,
            setStage: (stage) => set({ stage }),
            plantSeed: () => set((state) => ({
                stage: "SEED",
                type: randomPlantType(getAvailablePlants(state.unlockedPlants)),
            })),
            killPlant: () => set({ stage: "DEAD" }),
            harvestPlant: () => set((state) => ({
                stage: "SEED",
                type: randomPlantType(getAvailablePlants(state.unlockedPlants)),
                history: [...state.history, { type: state.type, date: new Date().toISOString() }],
            })),
            addFocusMinutes: (minutes, categoryId?) => set((state) => {
                const today = getToday();
                const newSessions = [...state.focusSessions, { date: today, minutes, categoryId }];

                let newStreak = state.currentStreak;

                if (state.lastFocusDate !== today) {
                    const yesterday = getYesterday();
                    if (state.lastFocusDate === yesterday || state.lastFocusDate === null) {
                        newStreak = state.currentStreak + 1;
                    } else {
                        newStreak = 1;
                    }
                }

                const newBestStreak = Math.max(state.bestStreak, newStreak);

                let pendingUnlock: PlantType | null = null;
                const newUnlocks = [...state.unlockedPlants];
                for (const unlock of STREAK_UNLOCKS) {
                    if (newStreak >= unlock.streak && !newUnlocks.includes(unlock.plant)) {
                        newUnlocks.push(unlock.plant);
                        pendingUnlock = unlock.plant;
                    }
                }

                return {
                    totalFocusMinutes: state.totalFocusMinutes + minutes,
                    focusSessions: newSessions,
                    currentStreak: newStreak,
                    bestStreak: newBestStreak,
                    lastFocusDate: today,
                    unlockedPlants: newUnlocks,
                    pendingUnlock,
                };
            }),
            clearPendingUnlock: () => set({ pendingUnlock: null }),
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

    const displayStreak = getDisplayStreak(store.currentStreak, store.lastFocusDate);

    return {
        stage: store.stage,
        type: store.type,
        plantSeed: store.plantSeed,
        killPlant: store.killPlant,
        harvest: store.harvestPlant,
        addFocusMinutes: store.addFocusMinutes,
        clearPendingUnlock: store.clearPendingUnlock,
        grow,
        history: store.history,
        totalFocusMinutes: store.totalFocusMinutes,
        focusSessions: store.focusSessions,
        currentStreak: displayStreak,
        bestStreak: store.bestStreak,
        unlockedPlants: store.unlockedPlants,
        pendingUnlock: store.pendingUnlock,
    };
}
