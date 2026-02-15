/* eslint-disable react-refresh/only-export-components -- exports both SVG components and getPlantComponent lookup */
import type { PlantType } from "../../hooks/useGarden";

/* ─── Shared: Terracotta Pot ─── */
const Pot = () => (
    <g>
        {/* Pot body */}
        <path d="M38 85 L42 105 L78 105 L82 85 Z" fill="#C67B5C" />
        {/* Pot rim */}
        <ellipse cx="60" cy="85" rx="24" ry="5" fill="#D4896A" />
        {/* Pot rim top highlight */}
        <ellipse cx="60" cy="84" rx="22" ry="3.5" fill="#DFA088" />
        {/* Inner shadow */}
        <ellipse cx="60" cy="86" rx="18" ry="3" fill="#B06B4C" opacity="0.4" />
        {/* Soil */}
        <ellipse cx="60" cy="85" rx="18" ry="3.5" fill="#7A5C3E" />
        {/* Pot bottom rim */}
        <ellipse cx="60" cy="105" rx="18" ry="3" fill="#B06B4C" />
    </g>
);

/* ─── Shared: Seed ─── */
export const PixelSeed = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Seed in soil */}
        <ellipse cx="60" cy="82" rx="4" ry="3" fill="#8B6914" />
        <ellipse cx="60" cy="81.5" rx="2.5" ry="1.5" fill="#A67C1A" opacity="0.6" />
    </svg>
);

/* ─── Shared: Dead ─── */
export const PixelDead = () => (
    <svg width="120" height="120" viewBox="0 0 120 120">
        <Pot />
        {/* Wilted stem */}
        <path d="M60 82 Q58 70 55 60 Q53 55 56 52" fill="none" stroke="#9B8B78" strokeWidth="2.5" strokeLinecap="round" />
        {/* Drooping leaves */}
        <path d="M56 52 Q50 54 48 58" fill="none" stroke="#9B8B78" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M57 60 Q64 62 66 66" fill="none" stroke="#9B8B78" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

/* ═══════════════════════════════
   DEFAULT — Leafy Fern
   ═══════════════════════════════ */

const DefaultSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Stem */}
        <path d="M60 82 L60 65" stroke="#6B9B5E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Two small leaves */}
        <ellipse cx="54" cy="68" rx="6" ry="3" fill="#7DB86A" transform="rotate(-30 54 68)" />
        <ellipse cx="66" cy="68" rx="6" ry="3" fill="#7DB86A" transform="rotate(30 66 68)" />
    </svg>
);

const DefaultBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Stem */}
        <path d="M60 82 L60 55" stroke="#5E8C52" strokeWidth="2.5" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="50" cy="70" rx="8" ry="3.5" fill="#7DB86A" transform="rotate(-25 50 70)" />
        <ellipse cx="70" cy="72" rx="8" ry="3.5" fill="#7DB86A" transform="rotate(25 70 72)" />
        <ellipse cx="52" cy="60" rx="7" ry="3" fill="#8CC67E" transform="rotate(-35 52 60)" />
        <ellipse cx="68" cy="62" rx="7" ry="3" fill="#8CC67E" transform="rotate(35 68 62)" />
        <ellipse cx="58" cy="54" rx="5" ry="2.5" fill="#9DD48F" transform="rotate(-20 58 54)" />
    </svg>
);

const DefaultFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Stem */}
        <path d="M60 82 Q58 60 60 42" stroke="#5E8C52" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Lush leaves */}
        <ellipse cx="46" cy="72" rx="10" ry="4" fill="#6BA85E" transform="rotate(-30 46 72)" />
        <ellipse cx="74" cy="74" rx="10" ry="4" fill="#6BA85E" transform="rotate(30 74 74)" />
        <ellipse cx="44" cy="60" rx="12" ry="4.5" fill="#7DB86A" transform="rotate(-40 44 60)" />
        <ellipse cx="76" cy="62" rx="12" ry="4.5" fill="#7DB86A" transform="rotate(40 76 62)" />
        <ellipse cx="48" cy="48" rx="10" ry="4" fill="#8CC67E" transform="rotate(-35 48 48)" />
        <ellipse cx="72" cy="50" rx="10" ry="4" fill="#8CC67E" transform="rotate(35 72 50)" />
        <ellipse cx="55" cy="42" rx="8" ry="3.5" fill="#9DD48F" transform="rotate(-20 55 42)" />
        <ellipse cx="65" cy="42" rx="8" ry="3.5" fill="#9DD48F" transform="rotate(20 65 42)" />
    </svg>
);

const DefaultTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Main stem */}
        <path d="M60 82 Q56 55 58 35" stroke="#4E7C44" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Overflowing leaves */}
        <ellipse cx="40" cy="75" rx="12" ry="4.5" fill="#5E9B52" transform="rotate(-35 40 75)" />
        <ellipse cx="80" cy="76" rx="12" ry="4.5" fill="#5E9B52" transform="rotate(35 80 76)" />
        <ellipse cx="36" cy="62" rx="14" ry="5" fill="#6BA85E" transform="rotate(-45 36 62)" />
        <ellipse cx="84" cy="64" rx="14" ry="5" fill="#6BA85E" transform="rotate(45 84 64)" />
        <ellipse cx="40" cy="48" rx="13" ry="5" fill="#7DB86A" transform="rotate(-40 40 48)" />
        <ellipse cx="80" cy="50" rx="13" ry="5" fill="#7DB86A" transform="rotate(40 80 50)" />
        <ellipse cx="46" cy="38" rx="11" ry="4.5" fill="#8CC67E" transform="rotate(-30 46 38)" />
        <ellipse cx="74" cy="38" rx="11" ry="4.5" fill="#8CC67E" transform="rotate(30 74 38)" />
        <ellipse cx="55" cy="32" rx="10" ry="4" fill="#9DD48F" transform="rotate(-15 55 32)" />
        <ellipse cx="65" cy="32" rx="10" ry="4" fill="#9DD48F" transform="rotate(15 65 32)" />
        <ellipse cx="60" cy="28" rx="8" ry="3.5" fill="#AEDFAA" />
    </svg>
);

/* ═══════════════════════════════
   CACTUS
   ═══════════════════════════════ */

const CactusSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Small cactus body */}
        <ellipse cx="60" cy="72" rx="6" ry="10" fill="#5A8C4A" />
        <ellipse cx="60" cy="70" rx="4.5" ry="8" fill="#6B9B5E" />
        {/* Highlight */}
        <ellipse cx="58" cy="69" rx="1.5" ry="5" fill="#7DB86A" opacity="0.5" />
    </svg>
);

const CactusBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Main body */}
        <path d="M54 82 Q52 65 54 52 Q56 44 60 42 Q64 44 66 52 Q68 65 66 82 Z" fill="#5A8C4A" />
        <path d="M55 80 Q54 65 55 53 Q57 46 60 44 Q63 46 65 53 Q66 65 65 80 Z" fill="#6B9B5E" />
        {/* Left arm forming */}
        <path d="M54 65 Q48 63 46 58 Q45 54 47 52" fill="none" stroke="#5A8C4A" strokeWidth="6" strokeLinecap="round" />
        <path d="M54 65 Q49 63 47 59 Q46 55 48 53" fill="none" stroke="#6B9B5E" strokeWidth="4" strokeLinecap="round" />
        {/* Right arm forming */}
        <path d="M66 70 Q72 68 74 63 Q75 60 73 58" fill="none" stroke="#5A8C4A" strokeWidth="6" strokeLinecap="round" />
        <path d="M66 70 Q71 68 73 64 Q74 61 72 59" fill="none" stroke="#6B9B5E" strokeWidth="4" strokeLinecap="round" />
    </svg>
);

const CactusFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Main body */}
        <path d="M52 82 Q50 60 53 45 Q56 38 60 36 Q64 38 67 45 Q70 60 68 82 Z" fill="#5A8C4A" />
        <path d="M54 80 Q52 60 54 46 Q57 40 60 38 Q63 40 66 46 Q68 60 66 80 Z" fill="#6B9B5E" />
        {/* Left arm */}
        <path d="M52 62 Q44 58 40 50 Q38 44 40 38" fill="none" stroke="#5A8C4A" strokeWidth="7" strokeLinecap="round" />
        <path d="M52 62 Q45 58 41 51 Q40 46 41 40" fill="none" stroke="#6B9B5E" strokeWidth="5" strokeLinecap="round" />
        {/* Right arm */}
        <path d="M68 66 Q76 62 80 54 Q82 48 80 42" fill="none" stroke="#5A8C4A" strokeWidth="7" strokeLinecap="round" />
        <path d="M68 66 Q75 62 79 55 Q80 50 79 44" fill="none" stroke="#6B9B5E" strokeWidth="5" strokeLinecap="round" />
        {/* Flower on top */}
        <circle cx="60" cy="34" r="4" fill="#F472B6" />
        <circle cx="56" cy="32" r="3" fill="#FB7185" />
        <circle cx="64" cy="32" r="3" fill="#FB7185" />
        <circle cx="60" cy="30" r="3" fill="#FB7185" />
        <circle cx="60" cy="33" r="2" fill="#FBBF24" />
    </svg>
);

const CactusTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Main body - taller */}
        <path d="M50 82 Q47 55 50 38 Q54 28 60 26 Q66 28 70 38 Q73 55 70 82 Z" fill="#4E7C3E" />
        <path d="M52 80 Q50 55 52 40 Q55 30 60 28 Q65 30 68 40 Q70 55 68 80 Z" fill="#5A8C4A" />
        {/* Left arm */}
        <path d="M50 58 Q40 52 35 42 Q33 34 36 26" fill="none" stroke="#4E7C3E" strokeWidth="8" strokeLinecap="round" />
        <path d="M50 58 Q41 52 37 43 Q35 36 37 28" fill="none" stroke="#5A8C4A" strokeWidth="5.5" strokeLinecap="round" />
        {/* Right arm */}
        <path d="M70 62 Q80 56 85 46 Q87 38 84 30" fill="none" stroke="#4E7C3E" strokeWidth="8" strokeLinecap="round" />
        <path d="M70 62 Q79 56 83 47 Q85 40 83 32" fill="none" stroke="#5A8C4A" strokeWidth="5.5" strokeLinecap="round" />
        {/* Multiple flowers */}
        <circle cx="60" cy="24" r="3.5" fill="#F472B6" />
        <circle cx="57" cy="22" r="2.5" fill="#FB7185" />
        <circle cx="63" cy="22" r="2.5" fill="#FB7185" />
        <circle cx="60" cy="23" r="1.8" fill="#FBBF24" />
        <circle cx="36" cy="24" r="3" fill="#F472B6" />
        <circle cx="36" cy="23" r="1.5" fill="#FBBF24" />
        <circle cx="84" cy="28" r="3" fill="#F472B6" />
        <circle cx="84" cy="27" r="1.5" fill="#FBBF24" />
    </svg>
);

/* ═══════════════════════════════
   SUNFLOWER
   ═══════════════════════════════ */

const SunflowerSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Stem */}
        <path d="M60 82 L60 65" stroke="#5E8C52" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cotyledons (seed leaves) */}
        <ellipse cx="54" cy="66" rx="6" ry="3.5" fill="#7DB86A" transform="rotate(-25 54 66)" />
        <ellipse cx="66" cy="66" rx="6" ry="3.5" fill="#7DB86A" transform="rotate(25 66 66)" />
        {/* Seed shell on top */}
        <path d="M57 64 Q60 60 63 64" fill="#8B6914" stroke="#7A5B10" strokeWidth="0.5" />
    </svg>
);

const SunflowerBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Tall stem */}
        <path d="M60 82 Q59 60 60 42" stroke="#5E8C52" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Leaves along stem */}
        <ellipse cx="50" cy="70" rx="9" ry="3.5" fill="#6BA85E" transform="rotate(-30 50 70)" />
        <ellipse cx="70" cy="60" rx="9" ry="3.5" fill="#6BA85E" transform="rotate(30 70 60)" />
        {/* Bud */}
        <ellipse cx="60" cy="40" rx="7" ry="9" fill="#D4A820" />
        <ellipse cx="60" cy="39" rx="5" ry="7" fill="#E8BC2A" />
        {/* Sepals */}
        <path d="M53 44 Q50 38 53 34" fill="#6BA85E" stroke="none" />
        <path d="M67 44 Q70 38 67 34" fill="#6BA85E" stroke="none" />
    </svg>
);

const SunflowerFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Stem */}
        <path d="M60 82 Q58 55 60 35" stroke="#4E7C44" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Leaves */}
        <ellipse cx="46" cy="70" rx="11" ry="4" fill="#6BA85E" transform="rotate(-35 46 70)" />
        <ellipse cx="74" cy="58" rx="11" ry="4" fill="#6BA85E" transform="rotate(35 74 58)" />
        {/* Petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <ellipse
                key={angle}
                cx="60"
                cy="20"
                rx="3.5"
                ry="9"
                fill="#F5C542"
                transform={`rotate(${angle} 60 30)`}
            />
        ))}
        {/* Center */}
        <circle cx="60" cy="30" r="8" fill="#8B5E14" />
        <circle cx="60" cy="30" r="6" fill="#A67020" />
        <circle cx="58" cy="28" r="1.5" fill="#8B5E14" opacity="0.6" />
        <circle cx="62" cy="32" r="1.5" fill="#8B5E14" opacity="0.6" />
    </svg>
);

const SunflowerTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Main stem */}
        <path d="M60 82 Q57 50 58 28" stroke="#4E7C44" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Side stem */}
        <path d="M58 55 Q45 45 40 35" stroke="#4E7C44" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Leaves */}
        <ellipse cx="44" cy="72" rx="12" ry="4.5" fill="#5E9B52" transform="rotate(-35 44 72)" />
        <ellipse cx="76" cy="60" rx="12" ry="4.5" fill="#5E9B52" transform="rotate(35 76 60)" />
        <ellipse cx="46" cy="52" rx="10" ry="3.5" fill="#6BA85E" transform="rotate(-40 46 52)" />
        {/* Main flower */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <ellipse
                key={`main-${angle}`}
                cx="58"
                cy="14"
                rx="4"
                ry="10"
                fill="#F5C542"
                transform={`rotate(${angle} 58 24)`}
            />
        ))}
        <circle cx="58" cy="24" r="9" fill="#8B5E14" />
        <circle cx="58" cy="24" r="7" fill="#A67020" />
        {/* Side flower */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <ellipse
                key={`side-${angle}`}
                cx="40"
                cy="29"
                rx="2.5"
                ry="6"
                fill="#F5C542"
                transform={`rotate(${angle} 40 35)`}
            />
        ))}
        <circle cx="40" cy="35" r="5.5" fill="#8B5E14" />
        <circle cx="40" cy="35" r="4" fill="#A67020" />
    </svg>
);

/* ═══════════════════════════════
   PINE — Bonsai Style
   ═══════════════════════════════ */

const PineSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Small trunk */}
        <path d="M60 82 L60 68" stroke="#8B6B4A" strokeWidth="3" strokeLinecap="round" />
        {/* Needle cluster */}
        <ellipse cx="60" cy="66" rx="8" ry="5" fill="#3D7A4A" />
        <ellipse cx="57" cy="64" rx="5" ry="3" fill="#4E8C58" />
        <ellipse cx="63" cy="65" rx="4" ry="3" fill="#4E8C58" />
    </svg>
);

const PineBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Trunk */}
        <path d="M60 82 Q58 70 59 58" stroke="#8B6B4A" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Small conical shape */}
        <path d="M60 48 L48 68 L72 68 Z" fill="#3D7A4A" />
        <path d="M60 52 L50 66 L70 66 Z" fill="#4E8C58" />
        {/* Top tuft */}
        <ellipse cx="60" cy="50" rx="6" ry="4" fill="#5A9B62" />
    </svg>
);

const PineFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Bonsai trunk - curved */}
        <path d="M60 82 Q52 70 50 60 Q48 52 52 45" stroke="#7A5C3E" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Branch */}
        <path d="M54 58 Q62 55 68 58" stroke="#7A5C3E" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Foliage clouds */}
        <ellipse cx="50" cy="42" rx="14" ry="8" fill="#3D7A4A" />
        <ellipse cx="48" cy="40" rx="10" ry="6" fill="#4E8C58" />
        <ellipse cx="68" cy="55" rx="10" ry="6" fill="#3D7A4A" />
        <ellipse cx="67" cy="53" rx="7" ry="4.5" fill="#4E8C58" />
        <ellipse cx="55" cy="35" rx="8" ry="5" fill="#5A9B62" />
    </svg>
);

const PineTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Mature bonsai trunk - sinuous */}
        <path d="M58 82 Q48 68 44 58 Q40 48 44 40 Q48 34 54 32" stroke="#6B4E32" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Branches */}
        <path d="M46 55 Q38 50 34 52" stroke="#6B4E32" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M48 44 Q56 40 62 42" stroke="#6B4E32" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M50 36 Q60 30 68 34" stroke="#6B4E32" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Foliage clouds */}
        <ellipse cx="32" cy="48" rx="12" ry="7" fill="#2D6B3A" />
        <ellipse cx="30" cy="46" rx="9" ry="5" fill="#3D7A4A" />
        <ellipse cx="62" cy="38" rx="14" ry="8" fill="#2D6B3A" />
        <ellipse cx="60" cy="36" rx="11" ry="6" fill="#3D7A4A" />
        <ellipse cx="68" cy="30" rx="10" ry="6" fill="#3D7A4A" />
        <ellipse cx="66" cy="28" rx="7" ry="4.5" fill="#4E8C58" />
        <ellipse cx="52" cy="28" rx="12" ry="7" fill="#2D6B3A" />
        <ellipse cx="50" cy="26" rx="9" ry="5" fill="#3D7A4A" />
        <ellipse cx="42" cy="22" rx="8" ry="5" fill="#5A9B62" />
    </svg>
);

/* ═══════════════════════════════
   ROSE — Streak Unlock (3 days)
   ═══════════════════════════════ */

const RoseSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Stem */}
        <path d="M60 82 L60 66" stroke="#4A8C4A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Two small leaves */}
        <ellipse cx="54" cy="72" rx="5" ry="2.5" fill="#5E9B52" transform="rotate(-30 54 72)" />
        <ellipse cx="66" cy="72" rx="5" ry="2.5" fill="#5E9B52" transform="rotate(30 66 72)" />
        {/* Tiny bud hint */}
        <ellipse cx="60" cy="64" rx="3" ry="4" fill="#E8A0B4" />
    </svg>
);

const RoseBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Stem with thorns */}
        <path d="M60 82 Q59 65 60 50" stroke="#3D7A3D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M58 70 L55 68" stroke="#3D7A3D" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 62 L65 60" stroke="#3D7A3D" strokeWidth="1.5" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="48" cy="72" rx="8" ry="3" fill="#5E9B52" transform="rotate(-25 48 72)" />
        <ellipse cx="72" cy="64" rx="8" ry="3" fill="#5E9B52" transform="rotate(25 72 64)" />
        {/* Rose bud — tight petals */}
        <path d="M56 50 Q58 42 60 40 Q62 42 64 50 Z" fill="#E86B8A" />
        <path d="M57 48 Q60 38 63 48" fill="#D4567A" />
        {/* Sepals */}
        <path d="M55 52 Q53 48 56 46" fill="#4A8C4A" />
        <path d="M65 52 Q67 48 64 46" fill="#4A8C4A" />
    </svg>
);

const RoseFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Stem */}
        <path d="M60 82 Q58 60 60 44" stroke="#3D7A3D" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Thorns */}
        <path d="M58 72 L54 70" stroke="#3D7A3D" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 62 L66 60" stroke="#3D7A3D" strokeWidth="1.5" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="46" cy="74" rx="10" ry="3.5" fill="#5E9B52" transform="rotate(-30 46 74)" />
        <ellipse cx="74" cy="62" rx="10" ry="3.5" fill="#5E9B52" transform="rotate(30 74 62)" />
        {/* Rose bloom — layered petals */}
        <ellipse cx="60" cy="36" rx="12" ry="10" fill="#E86B8A" />
        <ellipse cx="56" cy="34" rx="8" ry="7" fill="#D4567A" />
        <ellipse cx="64" cy="34" rx="8" ry="7" fill="#D4567A" />
        <ellipse cx="60" cy="32" rx="6" ry="5" fill="#C44060" />
        <ellipse cx="60" cy="34" rx="4" ry="3" fill="#B03050" />
        {/* Highlight */}
        <ellipse cx="58" cy="30" rx="2" ry="1.5" fill="#F0A0B8" opacity="0.5" />
    </svg>
);

const RoseTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Main stem */}
        <path d="M60 82 Q56 58 58 38" stroke="#2D6B2D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Side branches */}
        <path d="M57 60 Q48 54 42 48" stroke="#2D6B2D" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M59 50 Q68 44 74 38" stroke="#2D6B2D" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Thorns */}
        <path d="M58 72 L54 70" stroke="#2D6B2D" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M62 64 L66 62" stroke="#2D6B2D" strokeWidth="1.5" strokeLinecap="round" />
        {/* Leaves */}
        <ellipse cx="44" cy="74" rx="10" ry="3.5" fill="#4E8C48" transform="rotate(-30 44 74)" />
        <ellipse cx="76" cy="56" rx="10" ry="3.5" fill="#4E8C48" transform="rotate(30 76 56)" />
        <ellipse cx="38" cy="52" rx="8" ry="3" fill="#5E9B52" transform="rotate(-35 38 52)" />
        {/* Main rose */}
        <ellipse cx="58" cy="32" rx="11" ry="9" fill="#E86B8A" />
        <ellipse cx="55" cy="30" rx="7" ry="6" fill="#D4567A" />
        <ellipse cx="61" cy="30" rx="7" ry="6" fill="#D4567A" />
        <ellipse cx="58" cy="28" rx="5" ry="4" fill="#C44060" />
        <ellipse cx="58" cy="30" rx="3" ry="2.5" fill="#B03050" />
        {/* Side rose */}
        <ellipse cx="42" cy="44" rx="7" ry="6" fill="#E86B8A" />
        <ellipse cx="40" cy="42" rx="5" ry="4" fill="#D4567A" />
        <ellipse cx="42" cy="42" rx="3" ry="2.5" fill="#C44060" />
        {/* Side rose 2 */}
        <ellipse cx="74" cy="34" rx="7" ry="6" fill="#E86B8A" />
        <ellipse cx="73" cy="32" rx="5" ry="4" fill="#D4567A" />
        <ellipse cx="75" cy="33" rx="3" ry="2.5" fill="#C44060" />
    </svg>
);

/* ═══════════════════════════════
   ORCHID — Streak Unlock (7 days)
   ═══════════════════════════════ */

const OrchidSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Thick leaves emerging from soil */}
        <ellipse cx="55" cy="76" rx="4" ry="10" fill="#5A8C6A" transform="rotate(-8 55 76)" />
        <ellipse cx="65" cy="76" rx="4" ry="10" fill="#5A8C6A" transform="rotate(8 65 76)" />
        {/* Lighter highlight */}
        <ellipse cx="55" cy="74" rx="2" ry="7" fill="#6BA87A" opacity="0.5" transform="rotate(-8 55 74)" />
        <ellipse cx="65" cy="74" rx="2" ry="7" fill="#6BA87A" opacity="0.5" transform="rotate(8 65 74)" />
    </svg>
);

const OrchidBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Thick leaves */}
        <ellipse cx="50" cy="74" rx="5" ry="12" fill="#4A7C5A" transform="rotate(-12 50 74)" />
        <ellipse cx="70" cy="74" rx="5" ry="12" fill="#4A7C5A" transform="rotate(12 70 74)" />
        <ellipse cx="58" cy="76" rx="4" ry="10" fill="#5A8C6A" transform="rotate(-4 58 76)" />
        {/* Flower stem — arching */}
        <path d="M60 72 Q58 60 56 50 Q54 42 58 36" stroke="#5A8C6A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Buds on stem */}
        <ellipse cx="58" cy="36" rx="3" ry="4" fill="#C88AE0" />
        <ellipse cx="56" cy="44" rx="2.5" ry="3" fill="#B878D0" />
    </svg>
);

const OrchidFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Thick leaves */}
        <ellipse cx="48" cy="74" rx="5" ry="14" fill="#4A7C5A" transform="rotate(-15 48 74)" />
        <ellipse cx="72" cy="74" rx="5" ry="14" fill="#4A7C5A" transform="rotate(15 72 74)" />
        <ellipse cx="56" cy="76" rx="4.5" ry="11" fill="#5A8C6A" transform="rotate(-5 56 76)" />
        {/* Arching stem */}
        <path d="M60 70 Q56 55 52 42 Q48 32 52 24" stroke="#5A8C6A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Main orchid bloom */}
        {/* Outer petals */}
        <ellipse cx="52" cy="22" rx="8" ry="4" fill="#D8A0F0" transform="rotate(-15 52 22)" />
        <ellipse cx="52" cy="22" rx="4" ry="8" fill="#D8A0F0" transform="rotate(10 52 22)" />
        <ellipse cx="48" cy="18" rx="6" ry="3.5" fill="#C88AE0" transform="rotate(-40 48 18)" />
        <ellipse cx="56" cy="18" rx="6" ry="3.5" fill="#C88AE0" transform="rotate(40 56 18)" />
        {/* Lip petal */}
        <ellipse cx="52" cy="26" rx="5" ry="3" fill="#E0B0F8" />
        {/* Center */}
        <circle cx="52" cy="22" r="2" fill="#9B5EC0" />
        <circle cx="52" cy="22" r="1" fill="#FBBF24" />
        {/* Second bud */}
        <ellipse cx="50" cy="34" rx="3" ry="4" fill="#C88AE0" />
    </svg>
);

const OrchidTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <Pot />
        {/* Thick leaves */}
        <ellipse cx="44" cy="74" rx="6" ry="16" fill="#3D6B4A" transform="rotate(-18 44 74)" />
        <ellipse cx="76" cy="74" rx="6" ry="16" fill="#3D6B4A" transform="rotate(18 76 74)" />
        <ellipse cx="54" cy="76" rx="5" ry="13" fill="#4A7C5A" transform="rotate(-6 54 76)" />
        <ellipse cx="66" cy="76" rx="5" ry="13" fill="#4A7C5A" transform="rotate(6 66 76)" />
        {/* Main arching stem */}
        <path d="M60 68 Q54 50 48 36 Q44 26 48 18" stroke="#4A7C5A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Second stem */}
        <path d="M62 66 Q66 52 70 40 Q72 32 70 26" stroke="#4A7C5A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Bloom 1 — full */}
        <ellipse cx="48" cy="16" rx="9" ry="4.5" fill="#D8A0F0" transform="rotate(-10 48 16)" />
        <ellipse cx="48" cy="16" rx="4.5" ry="9" fill="#D8A0F0" transform="rotate(15 48 16)" />
        <ellipse cx="44" cy="12" rx="6" ry="3.5" fill="#C88AE0" transform="rotate(-35 44 12)" />
        <ellipse cx="52" cy="12" rx="6" ry="3.5" fill="#C88AE0" transform="rotate(35 52 12)" />
        <ellipse cx="48" cy="20" rx="5" ry="3" fill="#E0B0F8" />
        <circle cx="48" cy="16" r="2.5" fill="#9B5EC0" />
        <circle cx="48" cy="16" r="1.2" fill="#FBBF24" />
        {/* Bloom 2 */}
        <ellipse cx="70" cy="24" rx="7" ry="3.5" fill="#D8A0F0" transform="rotate(10 70 24)" />
        <ellipse cx="70" cy="24" rx="3.5" ry="7" fill="#D8A0F0" transform="rotate(-15 70 24)" />
        <ellipse cx="67" cy="20" rx="5" ry="3" fill="#C88AE0" transform="rotate(-30 67 20)" />
        <ellipse cx="73" cy="20" rx="5" ry="3" fill="#C88AE0" transform="rotate(30 73 20)" />
        <ellipse cx="70" cy="28" rx="4" ry="2.5" fill="#E0B0F8" />
        <circle cx="70" cy="24" r="2" fill="#9B5EC0" />
        <circle cx="70" cy="24" r="1" fill="#FBBF24" />
        {/* Bloom 3 — bud */}
        <ellipse cx="46" cy="30" rx="4" ry="5" fill="#C88AE0" />
        <ellipse cx="46" cy="29" rx="2.5" ry="3" fill="#D8A0F0" />
    </svg>
);

/* ═══════════════════════════════
   LOTUS — Deep Focus Unlock (x3)
   Rare water flower with glow
   ═══════════════════════════════ */

const LotusSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Water surface hint */}
        <ellipse cx="60" cy="83" rx="20" ry="2" fill="#6BABCF" opacity="0.3" />
        {/* Small leaf pads */}
        <ellipse cx="55" cy="78" rx="8" ry="3" fill="#4A8C5A" transform="rotate(-10 55 78)" />
        <ellipse cx="65" cy="78" rx="8" ry="3" fill="#4A8C5A" transform="rotate(10 65 78)" />
        {/* Tiny bud */}
        <ellipse cx="60" cy="72" rx="3" ry="5" fill="#F0A0C0" />
    </svg>
);

const LotusBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Water surface */}
        <ellipse cx="60" cy="83" rx="22" ry="2.5" fill="#6BABCF" opacity="0.3" />
        {/* Lily pads */}
        <ellipse cx="45" cy="78" rx="12" ry="4" fill="#4A8C5A" transform="rotate(-15 45 78)" />
        <ellipse cx="75" cy="78" rx="12" ry="4" fill="#4A8C5A" transform="rotate(15 75 78)" />
        {/* Stem */}
        <path d="M60 78 Q59 68 60 58" stroke="#5A8C6A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Closed lotus bud */}
        <path d="M56 58 Q58 46 60 42 Q62 46 64 58 Z" fill="#F0A0C0" />
        <path d="M57 56 Q60 44 63 56" fill="#E8889A" />
        <ellipse cx="60" cy="56" rx="5" ry="2" fill="#5A8C6A" />
    </svg>
);

const LotusFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <defs>
            <filter id="lotus-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <Pot />
        <ellipse cx="60" cy="83" rx="22" ry="2.5" fill="#6BABCF" opacity="0.3" />
        <ellipse cx="42" cy="78" rx="14" ry="4.5" fill="#4A8C5A" transform="rotate(-15 42 78)" />
        <ellipse cx="78" cy="78" rx="14" ry="4.5" fill="#4A8C5A" transform="rotate(15 78 78)" />
        <path d="M60 76 Q58 60 60 44" stroke="#5A8C6A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Lotus bloom with glow */}
        <g filter="url(#lotus-glow)">
            {/* Outer petals */}
            <ellipse cx="50" cy="38" rx="5" ry="10" fill="#F5B8D0" transform="rotate(-25 50 38)" />
            <ellipse cx="70" cy="38" rx="5" ry="10" fill="#F5B8D0" transform="rotate(25 70 38)" />
            <ellipse cx="46" cy="42" rx="4" ry="8" fill="#F0A0C0" transform="rotate(-40 46 42)" />
            <ellipse cx="74" cy="42" rx="4" ry="8" fill="#F0A0C0" transform="rotate(40 74 42)" />
            {/* Inner petals */}
            <ellipse cx="54" cy="36" rx="4" ry="9" fill="#E8889A" transform="rotate(-12 54 36)" />
            <ellipse cx="66" cy="36" rx="4" ry="9" fill="#E8889A" transform="rotate(12 66 36)" />
            <ellipse cx="60" cy="34" rx="3.5" ry="8" fill="#E07088" />
            {/* Center */}
            <circle cx="60" cy="38" r="4" fill="#FBBF24" />
            <circle cx="60" cy="38" r="2.5" fill="#F5C542" />
        </g>
    </svg>
);

const LotusTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <defs>
            <filter id="lotus-glow-full">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <Pot />
        <ellipse cx="60" cy="83" rx="24" ry="3" fill="#6BABCF" opacity="0.3" />
        <ellipse cx="38" cy="78" rx="14" ry="5" fill="#3D7A4A" transform="rotate(-20 38 78)" />
        <ellipse cx="82" cy="78" rx="14" ry="5" fill="#3D7A4A" transform="rotate(20 82 78)" />
        <ellipse cx="55" cy="80" rx="10" ry="3.5" fill="#4A8C5A" transform="rotate(-5 55 80)" />
        {/* Main stem */}
        <path d="M60 76 Q56 55 58 34" stroke="#4A7C5A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Side stem */}
        <path d="M58 60 Q48 52 42 42" stroke="#4A7C5A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Main lotus */}
        <g filter="url(#lotus-glow-full)">
            <ellipse cx="48" cy="28" rx="6" ry="11" fill="#F5B8D0" transform="rotate(-20 48 28)" />
            <ellipse cx="72" cy="28" rx="6" ry="11" fill="#F5B8D0" transform="rotate(20 72 28)" />
            <ellipse cx="44" cy="32" rx="5" ry="9" fill="#F0A0C0" transform="rotate(-35 44 32)" />
            <ellipse cx="76" cy="32" rx="5" ry="9" fill="#F0A0C0" transform="rotate(35 76 32)" />
            <ellipse cx="54" cy="26" rx="5" ry="10" fill="#E8889A" transform="rotate(-10 54 26)" />
            <ellipse cx="66" cy="26" rx="5" ry="10" fill="#E8889A" transform="rotate(10 66 26)" />
            <ellipse cx="60" cy="24" rx="4" ry="9" fill="#E07088" />
            <circle cx="60" cy="28" r="5" fill="#FBBF24" />
            <circle cx="60" cy="28" r="3" fill="#F5C542" />
        </g>
        {/* Side lotus (smaller) */}
        <g filter="url(#lotus-glow-full)">
            <ellipse cx="38" cy="38" rx="4" ry="7" fill="#F5B8D0" transform="rotate(-20 38 38)" />
            <ellipse cx="48" cy="38" rx="4" ry="7" fill="#F5B8D0" transform="rotate(20 48 38)" />
            <ellipse cx="43" cy="36" rx="3" ry="6" fill="#E8889A" />
            <circle cx="43" cy="38" r="3" fill="#FBBF24" />
        </g>
    </svg>
);

/* ═══════════════════════════════
   CRYSTAL — Deep Focus Unlock (x5)
   Crystalline plant with prismatic glow
   ═══════════════════════════════ */

const CrystalSprout = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <Pot />
        {/* Small crystal emerging */}
        <polygon points="60,68 56,80 64,80" fill="#A0D8EF" />
        <polygon points="60,68 56,80 60,78" fill="#C0E8FF" opacity="0.6" />
        {/* Tiny sparkle */}
        <circle cx="59" cy="72" r="1" fill="white" opacity="0.8" />
    </svg>
);

const CrystalBud = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-breathe">
        <defs>
            <filter id="crystal-glow-s">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <Pot />
        <g filter="url(#crystal-glow-s)">
            {/* Main crystal */}
            <polygon points="60,50 52,78 60,82 68,78" fill="#88C8E8" />
            <polygon points="60,50 52,78 60,82" fill="#A0D8EF" opacity="0.7" />
            {/* Side crystal */}
            <polygon points="48,62 44,78 52,78" fill="#80B8D8" />
            <polygon points="72,58 68,78 76,78" fill="#80B8D8" />
        </g>
        {/* Sparkles */}
        <circle cx="58" cy="58" r="1.2" fill="white" opacity="0.9" />
        <circle cx="65" cy="66" r="0.8" fill="white" opacity="0.7" />
    </svg>
);

const CrystalFlower = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <defs>
            <filter id="crystal-glow-m">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="prism1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A0D8EF" />
                <stop offset="50%" stopColor="#C8A0E8" />
                <stop offset="100%" stopColor="#F0A0C0" />
            </linearGradient>
        </defs>
        <Pot />
        <g filter="url(#crystal-glow-m)">
            {/* Main crystal cluster */}
            <polygon points="60,36 50,78 60,82 70,78" fill="url(#prism1)" />
            <polygon points="60,36 50,78 60,82" fill="#B0E0FF" opacity="0.5" />
            {/* Left crystal */}
            <polygon points="44,50 38,78 50,78" fill="#80B8D8" />
            <polygon points="44,50 38,78 44,76" fill="#A0D8EF" opacity="0.5" />
            {/* Right crystal */}
            <polygon points="76,46 70,78 82,78" fill="#80B8D8" />
            <polygon points="76,46 82,78 76,76" fill="#A0D8EF" opacity="0.5" />
        </g>
        {/* Sparkles */}
        <circle cx="58" cy="48" r="1.5" fill="white" opacity="0.9" />
        <circle cx="67" cy="56" r="1" fill="white" opacity="0.8" />
        <circle cx="44" cy="60" r="1" fill="white" opacity="0.7" />
        <circle cx="78" cy="58" r="1.2" fill="white" opacity="0.7" />
    </svg>
);

const CrystalTree = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" className="animate-sway-gentle">
        <defs>
            <filter id="crystal-glow-l">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="prism2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A0D8EF" />
                <stop offset="33%" stopColor="#C8A0E8" />
                <stop offset="66%" stopColor="#F0A0C0" />
                <stop offset="100%" stopColor="#A0EFC8" />
            </linearGradient>
        </defs>
        <Pot />
        <g filter="url(#crystal-glow-l)">
            {/* Tall main crystal */}
            <polygon points="60,24 48,78 60,82 72,78" fill="url(#prism2)" />
            <polygon points="60,24 48,78 60,82" fill="#C0E8FF" opacity="0.4" />
            {/* Left tall crystal */}
            <polygon points="40,38 32,78 48,78" fill="#88C8E8" />
            <polygon points="40,38 32,78 40,74" fill="#B0E0FF" opacity="0.5" />
            {/* Right tall crystal */}
            <polygon points="80,34 72,78 88,78" fill="#88C8E8" />
            <polygon points="80,34 88,78 80,74" fill="#B0E0FF" opacity="0.5" />
            {/* Small front crystal */}
            <polygon points="52,52 48,78 56,78" fill="#A0C8E0" />
            {/* Small right crystal */}
            <polygon points="70,48 66,78 74,78" fill="#A0C8E0" />
        </g>
        {/* Sparkles */}
        <circle cx="58" cy="38" r="1.8" fill="white" opacity="0.95" />
        <circle cx="68" cy="50" r="1.2" fill="white" opacity="0.8" />
        <circle cx="40" cy="50" r="1.3" fill="white" opacity="0.8" />
        <circle cx="82" cy="48" r="1.5" fill="white" opacity="0.8" />
        <circle cx="52" cy="60" r="0.8" fill="white" opacity="0.6" />
        <circle cx="72" cy="62" r="0.8" fill="white" opacity="0.6" />
    </svg>
);

/* ═══════════════════════════════
   Lookup Table
   ═══════════════════════════════ */

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
    ROSE: { sprout: RoseSprout, bud: RoseBud, flower: RoseFlower, tree: RoseTree },
    ORCHID: { sprout: OrchidSprout, bud: OrchidBud, flower: OrchidFlower, tree: OrchidTree },
    LOTUS: { sprout: LotusSprout, bud: LotusBud, flower: LotusFlower, tree: LotusTree },
    CRYSTAL: { sprout: CrystalSprout, bud: CrystalBud, flower: CrystalFlower, tree: CrystalTree },
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
