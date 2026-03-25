---
phase: 01-capacitor-foundation
plan: 02
subsystem: infra
tags: [capacitor, android, zustand, persist, preferences, localStorage, timer, back-button]

# Dependency graph
requires:
  - phase: 01-01
    provides: Capacitor packages installed (@capacitor/core, @capacitor/app, @capacitor/preferences)
provides:
  - Platform-conditional Zustand persist storage adapter (SharedPreferences on native, localStorage on web)
  - Capacitor appStateChange drift correction in useTimer
  - Android back button exit prevention during active timer session
  - Unit tests for storage adapter platform branching (persist.test.ts)
affects: [all future phases using Zustand persist stores, NATIVE-01, NATIVE-03]

# Tech tracking
tech-stack:
  added: [jsdom (vitest dev dependency for jsdom environment in persist.test.ts)]
  patterns:
    - Capacitor.isNativePlatform() guard pattern for zero web impact
    - Capacitor addListener returns Promise — cleanup via subscription.then(handle => handle.remove())
    - createSafeStorage() is the single entry point; all 6 Zustand stores inherit the fix with no store-level changes

key-files:
  created:
    - src/lib/persist.test.ts
    - src/hooks/useBackButton.ts
  modified:
    - src/lib/persist.ts
    - src/hooks/useTimer.ts
    - src/App.tsx

key-decisions:
  - "Timer ephemeral state (saveTimerState/loadTimerState) stays in localStorage — only Zustand persist stores move to Preferences on native"
  - "No migration logic needed — native app starts fresh with Preferences from day one"
  - "appStateChange handler is an exact mirror of visibilitychange handler — same deadlineRef + reconcileTimeLeft logic"
  - "Phase 1 back button scope: suppress exit during active session only; Phase 2 (NATIVE-03) adds BottomSheet close + confirmation dialog"
  - "jsdom installed as dev dependency to enable localStorage testing in vitest node environment"

patterns-established:
  - "Capacitor platform guard: if (!Capacitor.isNativePlatform()) return; at top of useEffect"
  - "Capacitor listener cleanup: subscription.then((handle) => handle.remove()) in useEffect return"
  - "Storage adapter factory: createSafeStorage<T>() branches on isNativePlatform(), Zustand stores need no changes"

requirements-completed: [SETUP-03, SETUP-05]

# Metrics
duration: 15min
completed: 2026-03-25
---

# Phase 1 Plan 02: Capacitor Runtime Fixes Summary

**Platform-conditional Zustand persist storage (Preferences on Android, localStorage on web), Doze mode drift correction via appStateChange, and back button exit prevention via Capacitor App listener**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-25T11:50:00Z
- **Completed:** 2026-03-25T11:55:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- `createSafeStorage` now returns a `@capacitor/preferences`-backed adapter on native, preserving localStorage on web — all 6 Zustand stores inherit the fix with zero store-level changes
- `useTimer` registers an `appStateChange` listener on native to reconcile timer drift after Android Doze mode using the same `deadlineRef + reconcileTimeLeft` logic as the existing `visibilitychange` handler
- `useBackButton` hook created and wired into `App.tsx` — suppresses Android hardware back button exit during active focus sessions, allowing normal exit when no session is active

## Task Commits

Each task was committed atomically:

1. **Task 1: Platform-conditional storage adapter in persist.ts** - `8227030` (feat)
2. **Task 2: Capacitor appStateChange drift correction in useTimer.ts** - `0b35d95` (feat)
3. **Task 3: Back button exit prevention during active session** - `4eb5457` (feat)

## Files Created/Modified
- `src/lib/persist.ts` - Added createCapacitorStorage (Preferences-backed) and createLocalStorage (extracted); createSafeStorage branches on isNativePlatform()
- `src/lib/persist.test.ts` - 9 unit tests covering web path (localStorage) and native path (Preferences mock); uses @vitest-environment jsdom
- `src/hooks/useTimer.ts` - Added Capacitor/App imports; appStateChange useEffect after visibilitychange handler
- `src/hooks/useBackButton.ts` - New hook: Capacitor backButton listener, suppresses exit when isRunning, allows App.exitApp() when idle
- `src/App.tsx` - Import useBackButton; call useBackButton(timer.isRunning) after useAppEnvironmentEffects

## Decisions Made
- Timer ephemeral state (`saveTimerState`/`loadTimerState`) keeps using localStorage directly — it is session-scoped and does not need Preferences persistence
- No data migration from localStorage to Preferences — native app starts fresh on first launch
- `appStateChange` handler deliberately mirrors the `visibilitychange` handler exactly (same guard conditions, same reconcile logic, same dependency array `[isRunning]`)
- Back button Phase 1 scope is minimal: suppress exit only. Phase 2 (NATIVE-03) will add BottomSheet dismissal and confirmation dialog

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing jsdom dependency for vitest**
- **Found during:** Task 1 (persist.test.ts)
- **Issue:** Test file used `@vitest-environment jsdom` but `jsdom` package was not installed — vitest threw `Cannot find package 'jsdom'`
- **Fix:** Ran `npm install --save-dev jsdom`
- **Files modified:** package.json, package-lock.json
- **Verification:** All 9 persist.test.ts tests passed after install
- **Committed in:** `8227030` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** jsdom is required for the localStorage mocking in the web-path tests. No scope creep.

## Issues Encountered
- Vitest environment is `"node"` by default (set in vite.config.ts). The web-path tests require localStorage, so the test file uses `// @vitest-environment jsdom` directive. jsdom was not in devDependencies and had to be installed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 critical Android runtime pitfalls resolved: localStorage eviction, Doze mode timer drift, back button accidental exit
- All existing tests pass (22/22), Android build succeeds
- Plan 01-03 (service worker + Capacitor config hardening) can proceed immediately

## Self-Check: PASSED

All files verified present. All task commits verified in git log.

---
*Phase: 01-capacitor-foundation*
*Completed: 2026-03-25*
