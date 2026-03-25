---
phase: 02-native-capabilities
plan: 02
subsystem: hooks
tags: [back-button, panel-navigation, audio, tdd, android]
dependency_graph:
  requires: []
  provides:
    - useAppPanels.openStack
    - useAppPanels.closeTopPanel
    - useBackButton (4-param)
    - resolveBackAction
    - useAudioMixer.resumeAudio
  affects:
    - src/App.tsx (uses new useBackButton signature)
    - src/hooks/useAppPanels.ts
    - src/hooks/useBackButton.ts
    - src/hooks/useAudioMixer.ts
tech_stack:
  added:
    - "@testing-library/react (dev) — renderHook for hook-level tests"
  patterns:
    - "LIFO stack via openStackRef for synchronized state+ref panel tracking"
    - "Functional setState for toggle panels to read current bool before push/pop"
    - "Pure function extraction (resolveBackAction) for testable logic without mocks"
    - "vi.fn().mockImplementation() for AudioContext constructor mocking in jsdom"
key_files:
  created:
    - src/hooks/useBackButton.test.ts
    - src/hooks/useAudioMixer.test.ts
  modified:
    - src/hooks/useAppPanels.ts
    - src/hooks/useBackButton.ts
    - src/hooks/useAudioMixer.ts
    - src/App.tsx
decisions:
  - "LIFO panel stack maintained via both useState (openStack) and useRef (openStackRef) — ref enables synchronous reads in closeTopPanel without stale closures"
  - "Toggle panels (mixer, shortcuts) use functional setState pattern to read current bool inside setter before updating stack"
  - "App.tsx wired with stub callbacks for Plan 03 — confirmation dialogs not yet implemented"
  - "resolveBackAction extracted as pure function — enables testing back button decision logic without any Capacitor mocks"
  - "useHaptic.ts pre-existing TypeScript error logged to deferred-items (out of plan scope)"
metrics:
  duration: "~9 minutes"
  completed_date: "2026-03-25"
  tasks_completed: 2
  files_modified: 6
---

# Phase 02 Plan 02: Back Button Panel Stack and Audio Resume Summary

LIFO panel open-stack in useAppPanels with closeTopPanel, rewritten useBackButton with resolveBackAction pure function, and resumeAudio added to useAudioMixer — all tested via TDD with 12 passing tests.

## What Was Built

### Task 1: useAppPanels LIFO open-stack + useBackButton rewrite

Extended `useAppPanels` with a synchronized state+ref LIFO stack. All 8 panels (mixer, auth, history, garden, settings, todo, shortcuts, breathing) push to the stack on open and pop on close. Toggle panels (mixer, shortcuts) use functional `setState` to read the current boolean before deciding whether to push or pop.

Added `closeTopPanel()` which reads from `openStackRef.current` (synchronous, no stale closure) to identify and close the topmost panel, returning `true` if closed and `false` if stack was empty.

Rewrote `useBackButton` with a new 4-parameter signature:
```typescript
useBackButton(isRunning, panels, onShowExitConfirm, onShowSessionGiveUpConfirm)
```

Extracted `resolveBackAction(hasOpenPanels, isRunning)` as a pure function returning `'close-panel' | 'session-giveup' | 'exit-confirm'`.

Updated `App.tsx` to use the new 4-param signature with stub callbacks (Plan 03 will replace them with real confirmation dialogs).

### Task 2: resumeAudio in useAudioMixer

Added a single `resumeAudio` callback:
```typescript
const resumeAudio = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') { void ctx.resume(); }
}, []);
```

No-op when context is null or already running. Exported from the hook return object. The `appStateChange` listener that calls `resumeAudio` will be wired in Plan 03.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing @testing-library/react dependency**
- **Found during:** Task 1 RED phase
- **Issue:** `@testing-library/react` not installed — renderHook import failed
- **Fix:** Installed `@testing-library/react` and `@testing-library/user-event` as dev dependencies
- **Files modified:** package.json, package-lock.json
- **Commit:** 1916583

**2. [Rule 3 - Blocking] App.tsx still using old 1-param useBackButton signature**
- **Found during:** TypeScript verification after Task 2
- **Issue:** `src/App.tsx:94` called `useBackButton(timer.isRunning)` — now expects 4 args
- **Fix:** Updated App.tsx with stub callbacks; added TODO comment for Plan 03 replacement
- **Files modified:** src/App.tsx
- **Commit:** c53a190

**3. [Rule 1 - Bug] AudioContext constructor mock incompatibility**
- **Found during:** Task 2 RED→GREEN transition
- **Issue:** `vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext))` does not work as a constructor — vitest warning about missing `function`/`class` syntax
- **Fix:** Changed to `vi.fn().mockImplementation(function() { return mockAudioContext; })` which correctly works as a constructor
- **Files modified:** src/hooks/useAudioMixer.test.ts

**4. [Rule 1 - Bug] initAudio already calls context.resume() — double-call in tests**
- **Found during:** Task 2 GREEN phase (tests failing)
- **Issue:** `initAudio()` calls `context.resume()` when state is `'suspended'`, so tests checking `resumeAudio()` call count were getting +1 from `initAudio`
- **Fix:** Added `mockResume.mockClear()` after `initAudio()` calls in the two affected tests
- **Files modified:** src/hooks/useAudioMixer.test.ts

### Pre-existing Issues (Out of Scope — Logged to Deferred)

- `src/hooks/useHaptic.ts(7,53): error TS2339: Property 'hapticEnabled' does not exist on type 'TimerSettingsState'` — introduced by commit `33cae2c` (Plan 01 haptics install), pre-dates this plan's work. Logged for Plan 03 or dedicated fix.

## Self-Check: PASSED

| Item | Result |
|------|--------|
| src/hooks/useAppPanels.ts | FOUND |
| src/hooks/useBackButton.ts | FOUND |
| src/hooks/useBackButton.test.ts | FOUND |
| src/hooks/useAudioMixer.ts | FOUND |
| src/hooks/useAudioMixer.test.ts | FOUND |
| Commit 1916583 (useAppPanels + useBackButton) | FOUND |
| Commit 27bdf74 (resumeAudio) | FOUND |
| Commit c53a190 (App.tsx fix) | FOUND |
| useAppPanels exports openStack, closeTopPanel | VERIFIED |
| useBackButton exports resolveBackAction, useBackButton | VERIFIED |
| useAudioMixer exports resumeAudio | VERIFIED |
| All 12 tests pass | VERIFIED |
| Build succeeds | VERIFIED |
