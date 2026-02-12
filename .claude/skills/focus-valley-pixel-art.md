---
name: focus-valley-pixel-art
description: SVG 픽셀아트 컨벤션, 식물 단계, 애니메이션 패턴. Use when working with pixel art, plant visuals, or adding new plant types.
---

# Pixel Art Skill

## Plant Growth Stages

```
SEED (0-9%) → SPROUT (10-39%) → BUD (40-79%) → TREE (80-100%) → [harvest] → SEED
                                                                    ↓ (give up)
                                                                   DEAD → [click] → SEED
```

## SVG Conventions

- All plants use `<svg>` with `viewBox` for crisp pixel scaling
- Individual pixels are `<rect>` elements (x, y, width, height)
- Colors via Tailwind classes on individual rects (`className="text-green-400"`)
- Parent `fill="currentColor"` sets default color, rects override with className

| Stage | Size | ViewBox | Base Color |
|-------|------|---------|------------|
| SEED | 64x64 | 0 0 16 16 | stone-500 |
| SPROUT | 128x128 | 0 0 16 16 | green-500 |
| BUD | 192x192 | 0 0 16 16 | green-600 |
| TREE | 256x256 | 0 0 32 32 | green-600 |
| DEAD | 128x128 | 0 0 16 16 | stone-400 |

## Animation Classes

| Class | Effect | Used On |
|-------|--------|---------|
| `animate-pulse` | Gentle fade in/out | SEED |
| `animate-bounce-slow` | Slow bounce | SPROUT |
| `animate-sway` | Side-to-side sway | TREE |

Note: `animate-bounce-slow` and `animate-sway` are custom — ensure they're defined in Tailwind config or CSS.

## Adding a New Plant Type

1. Create new SVG components in `src/components/ui/pixel-plants.tsx`
2. Follow the existing pattern: named export, `<svg>` with `viewBox`, `<rect>` pixels
3. Size should increase with growth stage (64 → 128 → 192 → 256)
4. Use Tailwind color classes on rects for detail colors
5. Add animation class appropriate to the stage
6. Update `PlantType` union in `useGarden.ts`
7. Update `renderPlant()` in `App.tsx` to handle the new type

## Design Guidelines

- Keep pixel density low (16x16 or 32x32 viewBox) for authentic pixel feel
- Use 2-3 color variations per plant for depth
- Trunk/stem colors: amber-800/900 or green-700/800
- Leaf colors: green-400/500/600 with lighter highlights
- Flower accents: pink-200/400 or yellow-300/400
