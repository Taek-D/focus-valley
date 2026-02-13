import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { type PlantType, type PlantStage, STREAK_UNLOCKS } from "../hooks/useGarden";
import { getPlantComponent } from "./ui/pixel-plants";
import { PLANT_LABELS } from "../lib/constants";
import { BottomSheet } from "./ui/BottomSheet";

type HistoryEntry = { type: PlantType; date: string };

type GardenCollectionProps = {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    unlockedPlants: PlantType[];
    currentStreak: number;
    bestStreak: number;
};

const ALL_TYPES: PlantType[] = ["DEFAULT", "CACTUS", "SUNFLOWER", "PINE", "ROSE", "ORCHID"];
const GROWTH_STAGES: PlantStage[] = ["SEED", "SPROUT", "BUD", "FLOWER", "TREE"];

export const GardenCollection: React.FC<GardenCollectionProps> = ({
    isOpen, onClose, history, unlockedPlants, currentStreak, bestStreak,
}) => {
    const typeCounts = useMemo(() => {
        const counts: Partial<Record<PlantType, number>> = {};
        for (const entry of history) {
            counts[entry.type] = (counts[entry.type] || 0) + 1;
        }
        return counts;
    }, [history]);

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="My Garden">
            {/* Stats */}
            <div className="flex gap-3 px-5 pb-4">
                {[
                    { value: currentStreak, label: "Day Streak" },
                    { value: bestStreak, label: "Best Streak" },
                    { value: history.length, label: "Harvested" },
                ].map((stat, i) => (
                    <div key={i} className="flex-1 rounded-2xl border border-foreground/5 p-3 text-center">
                        <div className="font-display text-xl text-foreground" style={{ fontWeight: 300 }}>{stat.value}</div>
                        <div className="font-body text-[9px] text-muted-foreground/40">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Plant Grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
                <div className="grid grid-cols-3 gap-3">
                    {ALL_TYPES.map((type) => {
                        const count = typeCounts[type] || 0;
                        const isBase = ["DEFAULT", "CACTUS", "SUNFLOWER", "PINE"].includes(type);
                        const isUnlocked = isBase || unlockedPlants.includes(type);
                        const streakInfo = STREAK_UNLOCKS.find((u) => u.plant === type);
                        const PlantSvg = getPlantComponent(type, "TREE");

                        return (
                            <motion.div
                                key={type}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: ALL_TYPES.indexOf(type) * 0.05 }}
                                className={`relative rounded-2xl border p-3 flex flex-col items-center gap-1 ${
                                    isUnlocked
                                        ? "border-foreground/5"
                                        : "border-foreground/3 opacity-50"
                                }`}
                            >
                                {!isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-2xl z-10">
                                        <div className="text-center">
                                            <Lock size={14} className="mx-auto mb-1 text-muted-foreground/40" />
                                            <div className="font-body text-[9px] text-muted-foreground/40">
                                                {streakInfo ? `${streakInfo.streak}-day streak` : "Locked"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="w-16 h-16 flex items-center justify-center">
                                    <div className="scale-[0.55] origin-center">
                                        <PlantSvg />
                                    </div>
                                </div>
                                <div className="font-body text-[10px] font-medium text-foreground/70">{PLANT_LABELS[type]}</div>
                                {isUnlocked && (
                                    <>
                                        <div className="font-body text-[9px] text-muted-foreground/30">
                                            {count > 0 ? `${count} grown` : "Not yet grown"}
                                        </div>
                                        <div className="flex items-end gap-0.5 mt-1">
                                            {GROWTH_STAGES.map((stage) => {
                                                const StageSvg = getPlantComponent(type, stage);
                                                return (
                                                    <div key={stage} className="w-4 h-4 flex items-center justify-center opacity-40">
                                                        <div className="scale-[0.12] origin-center">
                                                            <StageSvg />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Unlock Progress */}
                {STREAK_UNLOCKS.some((u) => !unlockedPlants.includes(u.plant)) && (
                    <div className="mt-5 space-y-2">
                        <div className="font-body text-[10px] font-medium text-muted-foreground/40 tracking-[0.1em] uppercase">Unlock Progress</div>
                        {STREAK_UNLOCKS.filter((u) => !unlockedPlants.includes(u.plant)).map((unlock) => {
                            const progress = Math.min(currentStreak / unlock.streak, 1);
                            return (
                                <div key={unlock.plant} className="flex items-center gap-3">
                                    <div className="font-body text-[10px] flex-1 text-foreground/50">{unlock.label}</div>
                                    <div className="flex-[2] h-1 bg-foreground/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-foreground/20 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress * 100}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                    <div className="font-body text-[9px] text-muted-foreground/30 w-12 text-right">
                                        {currentStreak}/{unlock.streak} days
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </BottomSheet>
    );
};
