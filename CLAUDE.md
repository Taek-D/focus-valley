# Focus Valley - Development Guide

## Project Overview
Pomodoro timer app with pixel art garden. Plants grow during focus sessions, wither on give-up.

## Package Manager
- **Always use `npm`**

## Development Workflow
1. Make changes
2. Type check: `npx tsc -b`
3. Lint: `npm run lint`
4. Build: `npm run build`
5. Preview: `npm run preview`

## Tech Stack
- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** with CSS variables (shadcn/ui pattern)
- **Zustand 5** for state management (with persist middleware)
- **Framer Motion 12** for animations
- **Lucide React** for icons
- **Web Workers** for timer (avoids tab throttling)
- **Web Audio API** for ambient soundscape

## Project Structure
```
src/
  App.tsx                         # Main app layout
  main.tsx                        # Entry point
  index.css                       # Tailwind + CSS variables (light/dark)
  lib/utils.ts                    # cn() utility (clsx + tailwind-merge)
  hooks/
    useTimer.ts                   # Timer logic (Web Worker based)
    useGarden.ts                  # Garden state (Zustand + persist)
    useAudioMixer.ts              # Audio mixer (Web Audio API)
  components/
    TimerDisplay.tsx              # Timer UI with controls
    AudioMixer.tsx                # Ambient sound mixer UI
    ui/pixel-plants.tsx           # SVG pixel art plant stages
  workers/
    timer.worker.ts               # Web Worker for accurate intervals
```

## Coding Conventions
- Use `type` over `interface` for new type definitions
- Never use `enum` - use string literal unions instead
- Path alias: `@/` maps to `./src/`
- Component files use PascalCase, hooks use camelCase with `use` prefix
- CSS: Use Tailwind utility classes, customize via CSS variables in index.css
- State: Use Zustand stores for shared state, React hooks for local state

## Key Patterns
- **Timer**: Web Worker posts TICK messages every 1s, main thread updates state
- **Garden**: Zustand store with persist to localStorage (`focus-valley-garden`)
- **Audio**: Procedural noise generation (pink/brown/white) via Web Audio API
- **Styling**: shadcn/ui color system with HSL CSS variables, dark mode via `.dark` class

## Do NOT
- Use `console.log` for debugging in production code
- Use `any` type (except in worker self-reference workaround)
- Install additional UI libraries without discussion
- Modify the Web Worker timer pattern (it exists to avoid browser tab throttling)
