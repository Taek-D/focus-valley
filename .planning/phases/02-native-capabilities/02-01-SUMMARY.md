---
phase: 02-native-capabilities
plan: 01
subsystem: native-hooks
tags: [capacitor, notifications, haptics, zustand, tdd]
dependency_graph:
  requires: []
  provides: [useNotification, useHaptic, hapticEnabled-store-field]
  affects: [useAppSessionFlow, TimerDisplay, useGarden]
tech_stack:
  added: ["@capacitor/local-notifications@^8.0.2", "@capacitor/haptics@^8.0.1"]
  patterns: [vi.hoisted-mock-pattern, TDD-RED-GREEN, foreground-suppression-via-ref]
key_files:
  created:
    - src/hooks/useNotification.ts
    - src/hooks/useNotification.test.ts
    - src/hooks/useHaptic.ts
    - src/hooks/useHaptic.test.ts
  modified:
    - package.json
    - package-lock.json
    - android/app/src/main/AndroidManifest.xml
    - capacitor.config.ts
    - src/hooks/useTimerSettings.ts
decisions:
  - "useNotification foreground suppression via isAppActiveRef (App.addListener appStateChange) not plugin config — iOS-only suppressInForeground does not apply to Android"
  - "notification ID uses Date.now() % 2147483647 to stay within 32-bit signed int range"
  - "hapticEnabled defaults to true — users expect haptic on first session, opt-out not opt-in"
  - "STORAGE_VERSION bumped to 3 with explicit hapticEnabled migration handler for existing users"
  - "vi.hoisted() required for Vitest mock factories that reference module-level variables — avoids ReferenceError on hoisting"
metrics:
  duration: "~10 min"
  completed_date: "2026-03-25"
  tasks_completed: 3
  files_changed: 9
---

# Phase 2 Plan 01: Native Notifications and Haptics Summary

**One-liner:** `@capacitor/local-notifications` with foreground suppression via `isAppActiveRef` and `@capacitor/haptics` with three intensity levels gated by `isNativePlatform()` and `hapticEnabled` Zustand store field.

## What Was Built

### Task 1: Package installation and Android configuration
- Installed `@capacitor/local-notifications@^8.0.2` and `@capacitor/haptics@^8.0.1` (both match existing Capacitor 8.x)
- Ran `npx cap sync` — all 6 plugins registered in Android project
- Added `SCHEDULE_EXACT_ALARM` (Android 12+) and `POST_NOTIFICATIONS` (Android 13+) to `AndroidManifest.xml`
- Added `LocalNotifications` plugin config to `capacitor.config.ts` with green icon color (`#22c55e`) matching plant theme

### Task 2: useNotification hook replacement (TDD)
- Replaced the web-only `useNotification.ts` with a native-first implementation
- Native path: creates `focus-valley-timer` channel on mount (Android 8+ requirement), tracks `isAppActiveRef` via `App.addListener('appStateChange')`
- `notify()` returns early when `isAppActiveRef.current === true` (foreground suppression)
- `notify()` calls `LocalNotifications.schedule()` with `allowWhileIdle: true` when backgrounded
- `requestPermission()` uses `LocalNotifications.checkPermissions/requestPermissions` on native
- Web fallback: existing `Notification` API behavior unchanged — zero web regression
- Return signature `{ permission, requestPermission, notify }` preserved — no caller changes needed
- 8 unit tests (RED → GREEN via `vi.hoisted()` mock pattern)

### Task 3: useHaptic hook and hapticEnabled store field (TDD)
- Created `src/hooks/useHaptic.ts` — `light/medium/strong` methods wrapping `Haptics.impact()`
- All methods gated by `Capacitor.isNativePlatform()` AND `hapticEnabled` from Zustand store
- `light()` → `ImpactStyle.Light`, `medium()` → `ImpactStyle.Medium`, `strong()` → `ImpactStyle.Heavy`
- Added `hapticEnabled: boolean` to `useTimerSettings` Zustand store (default: `true`, persisted)
- Added `setHapticEnabled` setter to store
- Bumped `STORAGE_VERSION` from 2 to 3, migrate function handles `hapticEnabled` for existing users
- 9 unit tests (RED → GREEN)

## Verification Results

| Check | Result |
|-------|--------|
| `npx vitest run useNotification.test.ts` | 8/8 pass |
| `npx vitest run useHaptic.test.ts` | 9/9 pass |
| `npx tsc -b` | Zero errors |
| `npm run lint` | Zero errors |
| `npm run build` | Clean (3.45s) |
| `SCHEDULE_EXACT_ALARM` in AndroidManifest | Present |
| `hapticEnabled` in useTimerSettings | Present (default: true) |

## Deviations from Plan

None — plan executed exactly as written.

**Note:** The `vi.hoisted()` pattern was required in test files because `vi.mock()` factory callbacks are hoisted to the top of the file by Vitest, making module-level `const` variables inaccessible (ReferenceError). Using `vi.hoisted()` declares mock functions before the hoisting occurs. This is consistent with Vitest documentation and the existing test style in the project.

## Commits

| Hash | Message |
|------|---------|
| `33cae2c` | `chore(02-01): install local-notifications and haptics, add Android permissions` |
| `e75e2a8` | `feat(02-01): replace useNotification with native LocalNotifications + web fallback` |
| `5748c0a` | `feat(02-01): create useHaptic hook and add hapticEnabled to settings store` |

## Self-Check: PASSED

All created files exist on disk. All 3 task commits verified in git history.
