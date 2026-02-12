import type { PlantType } from "../../hooks/useGarden";

// === DEFAULT Plant (Original) ===

const DefaultSprout = () => (
    <svg width="128" height="128" viewBox="0 0 16 16" fill="currentColor" className="text-green-500 animate-bounce-slow">
        <rect x="7" y="10" width="2" height="4" className="text-green-700" />
        <rect x="7" y="8" width="2" height="2" />
        <rect x="5" y="6" width="2" height="2" />
        <rect x="9" y="6" width="2" height="2" />
        <rect x="4" y="5" width="2" height="1" className="text-green-300" />
    </svg>
);

const DefaultBud = () => (
    <svg width="192" height="192" viewBox="0 0 16 16" fill="currentColor" className="text-green-600">
        <rect x="7" y="10" width="2" height="6" className="text-green-800" />
        <rect x="6" y="8" width="4" height="2" />
        <rect x="5" y="6" width="6" height="2" />
        <rect x="6" y="4" width="4" height="2" className="text-pink-400" />
        <rect x="7" y="5" width="2" height="1" className="text-pink-200" />
    </svg>
);

const DefaultFlower = () => (
    <svg width="224" height="224" viewBox="0 0 32 32" fill="currentColor" className="text-green-600 animate-sway">
        <rect x="15" y="18" width="2" height="12" className="text-green-800" />
        <rect x="13" y="28" width="6" height="2" className="text-green-900" />
        {/* Flower petals */}
        <rect x="13" y="10" width="6" height="2" className="text-pink-400" />
        <rect x="11" y="12" width="10" height="2" className="text-pink-400" />
        <rect x="13" y="14" width="6" height="2" className="text-pink-400" />
        <rect x="14" y="12" width="4" height="2" className="text-yellow-400" />
        {/* Leaves */}
        <rect x="10" y="20" width="4" height="2" />
        <rect x="18" y="22" width="4" height="2" />
    </svg>
);

const DefaultTree = () => (
    <svg width="256" height="256" viewBox="0 0 32 32" fill="currentColor" className="text-green-600 animate-sway">
        <rect x="14" y="20" width="4" height="12" className="text-amber-800" />
        <rect x="12" y="28" width="8" height="2" className="text-amber-900" />
        <rect x="10" y="16" width="12" height="4" />
        <rect x="8" y="12" width="16" height="4" />
        <rect x="10" y="8" width="12" height="4" />
        <rect x="12" y="4" width="8" height="4" />
        <rect x="14" y="6" width="2" height="2" className="text-green-400" />
        <rect x="10" y="14" width="2" height="2" className="text-green-400" />
        <rect x="20" y="10" width="2" height="2" className="text-green-400" />
    </svg>
);

// === CACTUS ===

const CactusSprout = () => (
    <svg width="128" height="128" viewBox="0 0 16 16" fill="currentColor" className="text-green-700 animate-bounce-slow">
        <rect x="7" y="8" width="2" height="6" />
        <rect x="7" y="14" width="2" height="2" className="text-amber-700" />
        <rect x="8" y="9" width="1" height="1" className="text-green-400" />
    </svg>
);

const CactusBud = () => (
    <svg width="192" height="192" viewBox="0 0 16 16" fill="currentColor" className="text-green-700">
        <rect x="7" y="6" width="2" height="8" />
        <rect x="4" y="8" width="3" height="2" />
        <rect x="9" y="10" width="3" height="2" />
        <rect x="7" y="14" width="2" height="2" className="text-amber-700" />
        <rect x="8" y="7" width="1" height="1" className="text-green-400" />
        <rect x="5" y="8" width="1" height="1" className="text-green-400" />
    </svg>
);

const CactusFlower = () => (
    <svg width="224" height="224" viewBox="0 0 32 32" fill="currentColor" className="text-green-700 animate-sway">
        <rect x="14" y="10" width="4" height="16" />
        <rect x="8" y="14" width="6" height="4" />
        <rect x="18" y="18" width="6" height="4" />
        <rect x="14" y="26" width="4" height="4" className="text-amber-700" />
        {/* Flower on top */}
        <rect x="13" y="8" width="6" height="2" className="text-pink-500" />
        <rect x="15" y="7" width="2" height="1" className="text-yellow-400" />
        <rect x="15" y="12" width="2" height="1" className="text-green-400" />
        <rect x="9" y="15" width="2" height="1" className="text-green-400" />
    </svg>
);

const CactusTree = () => (
    <svg width="256" height="256" viewBox="0 0 32 32" fill="currentColor" className="text-green-700 animate-sway">
        <rect x="14" y="8" width="4" height="18" />
        <rect x="6" y="12" width="8" height="4" />
        <rect x="6" y="10" width="2" height="6" />
        <rect x="18" y="16" width="8" height="4" />
        <rect x="24" y="14" width="2" height="6" />
        <rect x="14" y="26" width="4" height="4" className="text-amber-700" />
        <rect x="12" y="28" width="8" height="2" className="text-amber-800" />
        <rect x="15" y="9" width="2" height="1" className="text-green-400" />
        <rect x="7" y="13" width="1" height="1" className="text-green-400" />
        <rect x="25" y="15" width="1" height="1" className="text-green-400" />
    </svg>
);

// === SUNFLOWER ===

const SunflowerSprout = () => (
    <svg width="128" height="128" viewBox="0 0 16 16" fill="currentColor" className="text-green-500 animate-bounce-slow">
        <rect x="7" y="10" width="2" height="4" className="text-green-700" />
        <rect x="6" y="8" width="2" height="2" />
        <rect x="8" y="8" width="2" height="2" />
        <rect x="5" y="7" width="2" height="1" className="text-green-300" />
    </svg>
);

const SunflowerBud = () => (
    <svg width="192" height="192" viewBox="0 0 16 16" fill="currentColor" className="text-green-600">
        <rect x="7" y="8" width="2" height="8" className="text-green-800" />
        <rect x="5" y="10" width="2" height="2" />
        <rect x="9" y="12" width="2" height="2" />
        <rect x="6" y="5" width="4" height="3" className="text-yellow-500" />
        <rect x="7" y="6" width="2" height="1" className="text-amber-700" />
    </svg>
);

const SunflowerFlower = () => (
    <svg width="224" height="224" viewBox="0 0 32 32" fill="currentColor" className="text-green-600 animate-sway">
        <rect x="15" y="16" width="2" height="12" className="text-green-800" />
        <rect x="12" y="20" width="3" height="2" />
        <rect x="17" y="22" width="3" height="2" />
        <rect x="13" y="28" width="6" height="2" className="text-green-900" />
        {/* Petals */}
        <rect x="12" y="8" width="8" height="2" className="text-yellow-400" />
        <rect x="10" y="10" width="12" height="2" className="text-yellow-400" />
        <rect x="10" y="12" width="12" height="2" className="text-yellow-400" />
        <rect x="12" y="14" width="8" height="2" className="text-yellow-400" />
        {/* Center */}
        <rect x="13" y="10" width="6" height="4" className="text-amber-800" />
        <rect x="14" y="11" width="2" height="2" className="text-amber-600" />
    </svg>
);

const SunflowerTree = () => (
    <svg width="256" height="256" viewBox="0 0 32 32" fill="currentColor" className="text-green-600 animate-sway">
        <rect x="15" y="16" width="2" height="12" className="text-green-800" />
        <rect x="11" y="20" width="4" height="2" />
        <rect x="17" y="22" width="4" height="2" />
        <rect x="13" y="28" width="6" height="2" className="text-green-900" />
        {/* Large sunflower head */}
        <rect x="11" y="6" width="10" height="2" className="text-yellow-400" />
        <rect x="9" y="8" width="14" height="2" className="text-yellow-400" />
        <rect x="9" y="10" width="14" height="2" className="text-yellow-400" />
        <rect x="9" y="12" width="14" height="2" className="text-yellow-400" />
        <rect x="11" y="14" width="10" height="2" className="text-yellow-400" />
        {/* Center */}
        <rect x="12" y="9" width="8" height="5" className="text-amber-800" />
        <rect x="13" y="10" width="2" height="2" className="text-amber-600" />
        <rect x="17" y="11" width="2" height="2" className="text-amber-600" />
    </svg>
);

// === PINE ===

const PineSprout = () => (
    <svg width="128" height="128" viewBox="0 0 16 16" fill="currentColor" className="text-emerald-700 animate-bounce-slow">
        <rect x="7" y="10" width="2" height="4" className="text-amber-800" />
        <rect x="7" y="8" width="2" height="2" />
        <rect x="6" y="9" width="1" height="1" />
        <rect x="9" y="9" width="1" height="1" />
    </svg>
);

const PineBud = () => (
    <svg width="192" height="192" viewBox="0 0 16 16" fill="currentColor" className="text-emerald-700">
        <rect x="7" y="12" width="2" height="4" className="text-amber-800" />
        <rect x="6" y="8" width="4" height="4" />
        <rect x="5" y="10" width="6" height="2" />
        <rect x="7" y="6" width="2" height="2" />
        <rect x="7" y="9" width="1" height="1" className="text-emerald-500" />
    </svg>
);

const PineFlower = () => (
    <svg width="224" height="224" viewBox="0 0 32 32" fill="currentColor" className="text-emerald-700 animate-sway">
        <rect x="15" y="22" width="2" height="8" className="text-amber-800" />
        <rect x="13" y="28" width="6" height="2" className="text-amber-900" />
        <rect x="14" y="18" width="4" height="4" />
        <rect x="12" y="20" width="8" height="2" />
        <rect x="13" y="14" width="6" height="4" />
        <rect x="11" y="16" width="10" height="2" />
        <rect x="14" y="10" width="4" height="4" />
        <rect x="12" y="12" width="8" height="2" />
        <rect x="15" y="8" width="2" height="2" />
        <rect x="14" y="15" width="1" height="1" className="text-emerald-500" />
    </svg>
);

const PineTree = () => (
    <svg width="256" height="256" viewBox="0 0 32 32" fill="currentColor" className="text-emerald-700 animate-sway">
        <rect x="15" y="24" width="2" height="6" className="text-amber-800" />
        <rect x="13" y="28" width="6" height="2" className="text-amber-900" />
        {/* Layers */}
        <rect x="14" y="20" width="4" height="4" />
        <rect x="12" y="22" width="8" height="2" />
        <rect x="13" y="16" width="6" height="4" />
        <rect x="10" y="18" width="12" height="2" />
        <rect x="12" y="12" width="8" height="4" />
        <rect x="8" y="14" width="16" height="2" />
        <rect x="13" y="8" width="6" height="4" />
        <rect x="10" y="10" width="12" height="2" />
        <rect x="14" y="4" width="4" height="4" />
        {/* Snow/detail */}
        <rect x="15" y="5" width="2" height="1" className="text-emerald-500" />
        <rect x="11" y="11" width="2" height="1" className="text-emerald-500" />
        <rect x="19" y="15" width="2" height="1" className="text-emerald-500" />
    </svg>
);

// === Dead (shared) ===

export const PixelDead = () => (
    <svg width="128" height="128" viewBox="0 0 16 16" fill="currentColor" className="text-stone-400">
        <rect x="7" y="12" width="2" height="4" className="text-stone-600" />
        <rect x="6" y="10" width="1" height="2" />
        <rect x="9" y="11" width="1" height="1" />
        <rect x="5" y="11" width="1" height="1" />
        <rect x="8" y="9" width="1" height="1" />
    </svg>
);

// === Seed (shared) ===

export const PixelSeed = () => (
    <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor" className="text-stone-500 animate-pulse">
        <rect x="7" y="10" width="2" height="2" />
        <rect x="6" y="11" width="4" height="2" />
        <rect x="7" y="11" width="2" height="1" className="text-stone-300" />
    </svg>
);

// === Lookup by type ===

const PLANTS: Record<PlantType, {
    sprout: React.FC;
    bud: React.FC;
    flower: React.FC;
    tree: React.FC;
}> = {
    DEFAULT: { sprout: DefaultSprout, bud: DefaultBud, flower: DefaultFlower, tree: DefaultTree },
    CACTUS: { sprout: CactusSprout, bud: CactusBud, flower: CactusFlower, tree: CactusTree },
    SUNFLOWER: { sprout: SunflowerSprout, bud: SunflowerBud, flower: SunflowerFlower, tree: SunflowerTree },
    PINE: { sprout: PineSprout, bud: PineBud, flower: PineFlower, tree: PineTree },
};

export function getPlantComponent(type: PlantType, stage: string): React.FC {
    if (stage === "SEED") return PixelSeed;
    if (stage === "DEAD") return PixelDead;

    const plant = PLANTS[type] ?? PLANTS.DEFAULT;

    switch (stage) {
        case "SPROUT": return plant.sprout;
        case "BUD": return plant.bud;
        case "FLOWER": return plant.flower;
        case "TREE": return plant.tree;
        default: return PixelSeed;
    }
}

// Legacy exports for backwards compatibility
export const PixelSprout = DefaultSprout;
export const PixelBud = DefaultBud;
export const PixelTree = DefaultTree;
