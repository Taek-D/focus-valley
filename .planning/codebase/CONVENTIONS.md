# Coding Conventions

**Analysis Date:** 2026-03-23

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `TimerDisplay.tsx`, `PlantGarden.tsx`, `AppHeader.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTimer.ts`, `useGarden.ts`, `useAudioMixer.ts`)
- Utilities: camelCase (e.g., `utils.ts`, `date-utils.ts`, `analytics.ts`)
- Stores/modules: camelCase (e.g., `sync.test.ts`, `notification-sound.ts`)
- Test files: append `.test.ts` or `.test.tsx` to source filename (e.g., `useGarden.test.ts`)

**Functions:**
- Regular functions: camelCase (e.g., `getDuration`, `getDisplayStreak`, `saveTimerState`, `resolveInitialState`)
- Helper/utility functions exported from hooks: camelCase (e.g., `getBreathCycle`, `getGrowthPercent`, `getIsBreakActive`)
- React components: PascalCase, exported as `export const ComponentName = memo(function ComponentName(...) { ... })`

**Variables:**
- Standard variables: camelCase (e.g., `timeLeft`, `focusCount`, `isRunning`, `deadlineRef`)
- Constants: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `TIMER_STATE_VERSION`, `BASE_PLANT_TYPES`, `MODE_KEYS`)
- Type references in constants: Record types map string keys to objects (e.g., `MODE_KEYS: Record<TimerMode, { label: TranslationKey; short: TranslationKey }>`)

**Types:**
- Type definitions: PascalCase with `Type` suffix or descriptive name (e.g., `TimerMode`, `PlantStage`, `PlantType`, `FocusSession`)
- Type unions preferred over enums: `type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK"`
- Props type: `{ComponentName}Props` suffix (e.g., `TimerDisplayProps`)
- Zustand store state interfaces: `{Name}State` (e.g., `GardenState`, `AuthState`, `CategoryState`)
- Array/readonly array types: `{Type}[]` or `ReadonlySet<{Type}>` (e.g., `PlantType[]`, `HistoryEntry[]`)
- Helper function return types: explicit return type annotations (e.g., `function getDisplayStreak(...): number`)

**Type vs Interface:**
- Use `type` for all new type definitions (no `interface`)
- Examples: `type TimerMode`, `type FocusSession`, `type PersistedTimerState`

## Code Style

**Formatting:**
- Prettier configured via `package.json` (implicit config)
- Line length: not enforced explicitly; code follows natural wrapping
- Indentation: 2 spaces (standard in `package.json` scripts)
- String quotes: double quotes for JSX attributes, single quotes for JavaScript strings (Prettier default)

**Linting:**
- ESLint 9 with flat config (`eslint.config.js`)
- Enabled rules:
  - `@eslint/js:recommended`
  - `typescript-eslint:recommended`
  - `react-hooks:flat.recommended`
  - `react-refresh:vite`
- Disabled patterns: `eslint-disable-next-line react-hooks/exhaustive-deps` used when refs should not trigger re-runs

**TypeScript Strictness:**
- `strict: true` enabled
- `noUnusedLocals: true` - unused variables not allowed
- `noUnusedParameters: true` - unused parameters not allowed
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `erasableSyntaxOnly: true`

## Import Organization

**Order:**
1. External libraries/packages (React, Framer Motion, Lucide, Zustand)
2. Internal utilities (`@/lib/*`)
3. Internal hooks (`@/hooks/*`)
4. Internal components (`@/components/*`)
5. Type imports (`import type { ... }`)

**Path Aliases:**
- `@/` maps to `./src/`
- Used consistently: `@/lib/utils`, `@/hooks/useTimer`, `@/components/TimerDisplay`

**Example from `src/App.tsx`:**
```typescript
import "@/lib/i18n-packs/core-shell";
import { useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Volume2, ChevronDown, ChevronUp, Wind, BookOpen, Navigation, X } from "lucide-react";
import { useTimer } from "./hooks/useTimer";
import { useGarden } from "./hooks/useGarden";
import { TimerDisplay } from "./components/TimerDisplay";
import type { TodoState } from "./hooks/useTodos";
```

## Error Handling

**Pattern:**
- Silent failures with try/catch where quota/permission is expected (no throw):
  ```typescript
  function saveTimerState(state: PersistedTimerState) {
      try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* quota exceeded — ignore */ }
  }
  ```

- Explicit error recovery for state restoration:
  ```typescript
  try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw) as Partial<PersistedTimerState>;
      // Validation logic
      return parsed;
  } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
  }
  ```

- No error propagation to UI in utility functions; return null/undefined instead
- Sentry integration in `main.tsx` for uncaught errors with custom ErrorBoundary
- Validation of persisted state before use (type checks, version checks)

## Logging

**Framework:** No logging framework; uses browser console in limited capacity

**Patterns:**
- No `console.log` in production code per project guidelines
- Analytics tracking via custom functions (`@/lib/analytics`):
  - `trackSessionStart()`, `trackSessionComplete()`, `trackSessionAbandon()`
  - `trackPlantDied()`, `trackPlantHarvested()`, `trackSeedPlanted()`
  - `trackShareCard()`

**When to use:**
- Track user actions and session events
- No debug logging in published code

## Comments

**When to Comment:**
- Inline comments explain **why**, not **what**:
  ```typescript
  // Don't auto-resume — show recovery prompt instead
  return { mode: saved.mode, timeLeft: ..., isRunning: false, ... };
  ```

- Comments for non-obvious algorithms or state transitions:
  ```typescript
  // Page Visibility API: reconcile time when tab becomes visible again
  useEffect(() => { ... }, []);
  ```

- Comments explaining storage/persistence logic:
  ```typescript
  // Resume worker if we restored a running timer
  if (init.shouldStartWorker) { ... }
  ```

**JSDoc/TSDoc:**
- Not used systematically; types are self-documenting
- No JSDoc comments required (TypeScript inference is sufficient)
- Function parameters documented via `type` aliases:
  ```typescript
  type UseAppSessionFlowArgs = {
      timer: ReturnType<typeof useTimer>;
      garden: ReturnType<typeof useGarden>;
      activeCategoryId: string;
      // ... other fields
  };
  ```

## Function Design

**Size:**
- Utilities are small (5-20 lines) and testable
- React component functions use `memo()` for optimization; can be 100+ lines
- Hook functions are 30-150 lines depending on state complexity

**Parameters:**
- Destructured from object type (e.g., `UseAppSessionFlowArgs`)
- Example: `function useAppSessionFlow({ timer, garden, activeCategoryId, ... }: UseAppSessionFlowArgs)`
- Helper functions use positional parameters: `getBreathCycle(isPlantBreathing, timeLeft, focusDuration)`

**Return Values:**
- Hooks return objects with multiple properties:
  ```typescript
  return {
      mode: TimerMode,
      timeLeft: number,
      isRunning: boolean,
      isCompleted: boolean,
      focusCount: number,
      pause: () => void,
      reset: () => void,
      start: () => void,
  };
  ```

- Utility functions return primitives or typed objects
- Components return JSX via explicit `return (...)`
- Helper functions exported from hooks return primitives (`number`, `boolean`, `undefined`)

## Module Design

**Exports:**
- Hooks export a single default hook plus helper functions:
  ```typescript
  export function getBreathCycle(...) { ... }
  export function getGrowthPercent(...) { ... }
  export function useAppSessionFlow(...) { ... }
  export type AppSessionFlow = ReturnType<typeof useAppSessionFlow>;
  ```

- Components export as named const with memo:
  ```typescript
  export const TimerDisplay = memo(function TimerDisplay(props) { ... });
  ```

- Zustand stores are created with `create()`:
  ```typescript
  export const useGarden = create<GardenState>()(persist(...));
  export const useCategoryStore = create<CategoryState>()(persist(...));
  ```

**Barrel Files:**
- Not used; imports reference specific files by path

**Re-exports:**
- Minimal; each module exports what it defines

## React Patterns

**Component Memoization:**
- All functional components wrapped in `memo()`:
  ```typescript
  export const TimerDisplay = memo(function TimerDisplay({ props }) { ... });
  ```

**Hooks:**
- Custom hooks return objects with state and callbacks
- State selectors for Zustand: `const selectActiveTodo = (state: TodoState) => ...`
- Lazy loading for heavy components:
  ```typescript
  const AudioMixer = lazy(() =>
      import("./components/AudioMixer").then((module) => ({ default: module.AudioMixer }))
  );
  ```

**Animation:**
- Framer Motion for UI animations
- `MotionConfig reducedMotion="user"` wraps app for accessibility
- Layout animations use `layoutId` for shared element transitions

**Styling:**
- Tailwind CSS utilities (primary)
- CSS variables for theming (HSL format): `--background: 220 10% 97%`
- Dark mode via `.dark` class on document root
- `cn()` utility from `lib/utils.ts` for conditional class merging (clsx + tailwind-merge)

## Data Persistence

**Storage Keys:**
- Zustand stores use persist middleware with descriptive keys:
  - `focus-valley-garden`
  - `focus-valley-timer-state`
  - `focus-valley-locale`
  - `focus-valley-install-dismissed`
  - `focus-valley-landing-done`

- Keys follow kebab-case pattern: `focus-valley-{feature}`
- Versioned payloads include `version` field for migration
- Invalid/corrupted data is cleared from localStorage on parse failure

---

*Convention analysis: 2026-03-23*
