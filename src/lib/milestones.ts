import type { TranslationKey } from "./i18n";

export type MilestoneMetric = "totalHours" | "harvests" | "streak";

export type Milestone = {
    id: string;
    titleKey: TranslationKey;
    icon: string;
    threshold: number;
    metric: MilestoneMetric;
};

export const MILESTONES: Milestone[] = [
    { id: "sprout-gardener", titleKey: "milestone.sproutGardener", icon: "\u{1F331}", threshold: 10, metric: "totalHours" },
    { id: "skilled-farmer", titleKey: "milestone.skilledFarmer", icon: "\u{1F33E}", threshold: 50, metric: "totalHours" },
    { id: "master-gardener", titleKey: "milestone.masterGardener", icon: "\u{1F3C6}", threshold: 100, metric: "totalHours" },
    { id: "first-harvest", titleKey: "milestone.firstHarvest", icon: "\u{1F33B}", threshold: 1, metric: "harvests" },
    { id: "ten-harvests", titleKey: "milestone.tenHarvests", icon: "\u{1F490}", threshold: 10, metric: "harvests" },
    { id: "week-warrior", titleKey: "milestone.weekWarrior", icon: "\u{1F525}", threshold: 7, metric: "streak" },
    { id: "streak-master", titleKey: "milestone.streakMaster", icon: "\u{2B50}", threshold: 30, metric: "streak" },
];

type MilestoneValues = {
    totalHours: number;
    harvests: number;
    streak: number;
};

export function getEarnedMilestones(values: MilestoneValues): string[] {
    return MILESTONES
        .filter((m) => values[m.metric] >= m.threshold)
        .map((m) => m.id);
}

export function getNewlyEarnedMilestones(values: MilestoneValues, alreadyEarned: string[]): string[] {
    const earned = new Set(alreadyEarned);
    return MILESTONES
        .filter((m) => values[m.metric] >= m.threshold && !earned.has(m.id))
        .map((m) => m.id);
}

export function getMilestoneById(id: string): Milestone | undefined {
    return MILESTONES.find((m) => m.id === id);
}
