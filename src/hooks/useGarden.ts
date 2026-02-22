import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getToday, getYesterday } from "@/lib/date-utils";
import { useSubscription } from "@/hooks/useSubscription";
import { getNewlyEarnedMilestones } from "@/lib/milestones";

export type PlantStage = "SEED" | "SPROUT" | "BUD" | "FLOWER" | "TREE" | "DEAD";
export type PlantType = "DEFAULT" | "CACTUS" | "SUNFLOWER" | "PINE" | "ROSE" | "ORCHID" | "LOTUS" | "CRYSTAL" | "BAMBOO" | "SAKURA";

export type FocusSession = { id: string; date: string; minutes: number; categoryId?: string };

function createSessionId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const BASE_PLANT_TYPES: PlantType[] = ["DEFAULT", "CACTUS", "SUNFLOWER", "PINE"];

export const STREAK_UNLOCKS: { streak: number; plant: PlantType }[] = [
    { streak: 3, plant: "ROSE" },
    { streak: 7, plant: "ORCHID" },
];

export const DEEP_FOCUS_UNLOCKS: { depth: number; plant: PlantType }[] = [
    { depth: 3, plant: "LOTUS" },
    { depth: 5, plant: "CRYSTAL" },
];

export const PRO_PLANT_TYPES: PlantType[] = ["BAMBOO", "SAKURA"];

export function getDisplayStreak(currentStreak: number, lastFocusDate: string | null): number {
    if (!lastFocusDate || currentStreak === 0) return 0;
    const today = getToday();
    const yesterday = getYesterday();
    if (lastFocusDate === today || lastFocusDate === yesterday) return currentStreak;
    return 0;
}

function getAvailablePlants(unlocked: PlantType[]): PlantType[] {
    const { plan, expiresAt } = useSubscription.getState();
    const isPro = plan === "pro" && (!expiresAt || new Date(expiresAt) > new Date());
    return [...BASE_PLANT_TYPES, ...unlocked, ...(isPro ? PRO_PLANT_TYPES : [])];
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
    deepFocusStreak: number;
    lastFocusTimestamp: number;
    earnedMilestones: string[];
    pendingMilestone: string | null;
    setStage: (stage: PlantStage) => void;
    setType: (type: PlantType) => void;
    plantSeed: () => void;
    killPlant: () => void;
    harvestPlant: () => void;
    addFocusMinutes: (minutes: number, categoryId?: string) => void;
    clearPendingUnlock: () => void;
    clearPendingMilestone: () => void;
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
            deepFocusStreak: 0,
            lastFocusTimestamp: 0,
            earnedMilestones: [],
            pendingMilestone: null,
            setStage: (stage) => set({ stage }),
            setType: (type) => set({ type }),
            plantSeed: () => set((state) => ({
                stage: "SEED",
                type: randomPlantType(getAvailablePlants(state.unlockedPlants)),
            })),
            killPlant: () => set({ stage: "DEAD", deepFocusStreak: 0 }),
            harvestPlant: () => set((state) => ({
                stage: "SEED",
                type: randomPlantType(getAvailablePlants(state.unlockedPlants)),
                history: [...state.history, { type: state.type, date: new Date().toISOString() }],
            })),
            addFocusMinutes: (minutes, categoryId?) => set((state) => {
                const today = getToday();
                const now = Date.now();
                const newSessions = [...state.focusSessions, { id: createSessionId(), date: today, minutes, categoryId }];

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

                // Deep focus streak: increment if last focus was within 30 min, else reset to 1
                const GAP_MS = 30 * 60 * 1000;
                const timeSinceLastFocus = now - state.lastFocusTimestamp;
                const newDeepFocusStreak = state.lastFocusTimestamp > 0 && timeSinceLastFocus <= GAP_MS
                    ? state.deepFocusStreak + 1
                    : 1;

                let pendingUnlock: PlantType | null = null;
                const newUnlocks = [...state.unlockedPlants];

                // Streak unlocks
                for (const unlock of STREAK_UNLOCKS) {
                    if (newStreak >= unlock.streak && !newUnlocks.includes(unlock.plant)) {
                        newUnlocks.push(unlock.plant);
                        pendingUnlock = unlock.plant;
                    }
                }

                // Deep focus unlocks
                for (const unlock of DEEP_FOCUS_UNLOCKS) {
                    if (newDeepFocusStreak >= unlock.depth && !newUnlocks.includes(unlock.plant)) {
                        newUnlocks.push(unlock.plant);
                        pendingUnlock = unlock.plant;
                    }
                }

                // Milestone checks
                const newTotalMinutes = state.totalFocusMinutes + minutes;
                const milestoneValues = {
                    totalHours: Math.floor(newTotalMinutes / 60),
                    harvests: state.history.length,
                    streak: newStreak,
                };
                const newMilestones = getNewlyEarnedMilestones(milestoneValues, state.earnedMilestones);
                const updatedEarned = newMilestones.length > 0
                    ? [...state.earnedMilestones, ...newMilestones]
                    : state.earnedMilestones;

                return {
                    totalFocusMinutes: newTotalMinutes,
                    focusSessions: newSessions,
                    currentStreak: newStreak,
                    bestStreak: newBestStreak,
                    lastFocusDate: today,
                    unlockedPlants: newUnlocks,
                    pendingUnlock,
                    deepFocusStreak: newDeepFocusStreak,
                    lastFocusTimestamp: now,
                    earnedMilestones: updatedEarned,
                    pendingMilestone: newMilestones[0] ?? null,
                };
            }),
            clearPendingUnlock: () => set({ pendingUnlock: null }),
            clearPendingMilestone: () => set({ pendingMilestone: null }),
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
        setStage: store.setStage,
        setType: store.setType,
        plantSeed: store.plantSeed,
        killPlant: store.killPlant,
        harvest: store.harvestPlant,
        addFocusMinutes: store.addFocusMinutes,
        clearPendingUnlock: store.clearPendingUnlock,
        clearPendingMilestone: store.clearPendingMilestone,
        grow,
        history: store.history,
        totalFocusMinutes: store.totalFocusMinutes,
        focusSessions: store.focusSessions,
        currentStreak: displayStreak,
        bestStreak: store.bestStreak,
        unlockedPlants: store.unlockedPlants,
        pendingUnlock: store.pendingUnlock,
        pendingMilestone: store.pendingMilestone,
        earnedMilestones: store.earnedMilestones,
        deepFocusStreak: store.deepFocusStreak,
    };
}
