---
name: focus-valley-architecture
description: Focus Valley 전체 아키텍처, 데이터 흐름, 컴포넌트 관계. Use when working with app structure, adding features, or refactoring.
---

# Architecture Skill

## Data Flow

```
[timer.worker.ts] --TICK--> [useTimer] --timeLeft/isRunning--> [App.tsx]
                                                                   |
                                                          progress calc
                                                                   |
                                                            [useGarden] --stage--> [pixel-plants]
                                                                   |
                                                          Zustand persist
                                                                   |
                                                            localStorage
```

## Component Tree

```
App.tsx
├── header (Trees icon + "FOCUS VALLEY" + History button)
├── main
│   ├── Garden Stage (plant render by stage + click to harvest/replant)
│   └── TimerDisplay (timer + start/pause/reset controls)
└── footer
    ├── Soundscape toggle button
    └── AudioMixer (5 noise track sliders + mute)
```

## State Ownership

| State | Owner | Persistence | Scope |
|-------|-------|-------------|-------|
| Timer (mode, timeLeft, isRunning) | `useTimer` (useState) | None (resets on refresh) | App.tsx |
| Garden (stage, type, history) | `useGardenStore` (Zustand) | localStorage | Global |
| Audio (volumes, isMuted) | `useAudioMixer` (useState + refs) | None | App.tsx |
| UI (showMixer) | App.tsx (useState) | None | App.tsx |

## Key Integration Points

- **Timer -> Garden**: App.tsx calculates progress from `timeLeft` and calls `garden.grow(progress)` in useEffect
- **Give Up**: `handleReset` in App.tsx calls `garden.killPlant()` + `timer.reset()` with confirm dialog
- **Harvest**: Click handler on plant checks stage is TREE/FLOWER, calls `garden.harvest()` + `timer.reset()`
- **Replant**: Click on DEAD plant calls `garden.plantSeed()`

## Adding New Features Checklist

1. State: Decide if local (useState) or shared (Zustand store)
2. If shared state: Add to existing store or create new one in `src/hooks/`
3. UI: Create component in `src/components/`, use `cn()` for class merging
4. If async/interval: Consider Web Worker pattern (see timer.worker.ts)
5. Styling: Use Tailwind + project CSS variables, pixel font for headings
