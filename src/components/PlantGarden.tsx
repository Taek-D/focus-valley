import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlantComponent } from "./ui/pixel-plants";
import { PlantParticles } from "./PlantParticles";
import { useTranslation, type TranslationKey } from "@/lib/i18n";
import type { PlantType, PlantStage } from "@/hooks/useGarden";
import type { StageTransition } from "@/hooks/usePlantParticles";

type PlantGardenProps = {
    gardenType: PlantType;
    gardenStage: PlantStage;
    canInteract: boolean;
    onPlantClick: () => void;
    activeTodo: { text: string } | null;
    stageTransition: StageTransition;
    particleTrigger: number;
    particleType: "growth" | "harvest" | "death";
};

export const PlantGarden = memo(function PlantGarden({
    gardenType, gardenStage, canInteract, onPlantClick,
    activeTodo, stageTransition, particleTrigger, particleType,
}: PlantGardenProps) {
    const { t } = useTranslation();
    const PlantComponent = useMemo(
        () => getPlantComponent(gardenType, gardenStage),
        [gardenType, gardenStage],
    );

    return (
        <motion.div
            className="relative w-full flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            {/* Plant area */}
            <div className="relative h-32 md:h-40 flex items-end justify-center w-full">
                <button
                    className={cn(
                        "mb-1 bg-transparent border-none p-0 transition-all relative",
                        canInteract ? "cursor-pointer" : "cursor-default"
                    )}
                    onClick={onPlantClick}
                    aria-label={
                        gardenStage === "TREE" || gardenStage === "FLOWER"
                            ? t("plant.harvestLabel")
                            : gardenStage === "DEAD"
                            ? t("plant.plantSeedLabel")
                            : `${t(`plantType.${gardenType}` as TranslationKey)} - ${t(`plant.${gardenStage.toLowerCase()}` as TranslationKey)}`
                    }
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${gardenType}-${gardenStage}`}
                            initial={stageTransition.initial}
                            animate={stageTransition.animate}
                            exit={stageTransition.exit}
                            transition={{ type: "spring", damping: 20, stiffness: 180, duration: 0.4 }}
                            whileHover={canInteract ? { scale: 1.05, y: -2 } : {}}
                        >
                            {/* eslint-disable-next-line react-hooks/static-components -- lookup table returns stable refs */}
                            <PlantComponent />
                        </motion.div>
                    </AnimatePresence>

                    {/* Particles overlay */}
                    <PlantParticles trigger={particleTrigger} type={particleType} />
                </button>
            </div>

            {/* Stage label */}
            <div className="font-body text-[9px] text-muted-foreground/30 tracking-[0.25em] uppercase mt-1 mb-2">
                {t(`plantType.${gardenType}` as TranslationKey)} &middot; {t(`plant.${gardenStage.toLowerCase()}` as TranslationKey)}
            </div>

            {canInteract && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-body text-[11px] text-muted-foreground/50 tracking-wide -mt-1 mb-2"
                >
                    {gardenStage === "DEAD" ? t("plant.tapToPlant") : t("plant.tapToHarvest")}
                </motion.div>
            )}

            {/* Active todo — focus task display */}
            {activeTodo && !canInteract && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-body text-[11px] text-foreground/40 tracking-wide -mt-1 mb-2 flex items-center gap-1.5 max-w-[200px] truncate"
                >
                    <Pin size={10} className="flex-shrink-0 opacity-50" />
                    <span className="truncate">{activeTodo.text}</span>
                </motion.div>
            )}
        </motion.div>
    );
});
