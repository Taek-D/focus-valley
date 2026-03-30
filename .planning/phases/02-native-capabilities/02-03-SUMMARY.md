---
phase: 02-native-capabilities
plan: 03
subsystem: app-integration
tags: [capacitor, haptics, back-button, audio, wiring]
dependency_graph:
  requires: [02-01, 02-02]
  provides: [haptic-in-session-flow, back-button-confirmations, audio-background-suspend]
  affects: [App.tsx, useAppSessionFlow, TimerDisplay, useAudioMixer, useHaptic]
key_files:
  modified:
    - src/App.tsx
    - src/hooks/useAppSessionFlow.ts
    - src/hooks/useHaptic.ts
    - src/hooks/useHaptic.test.ts
    - src/hooks/useAudioMixer.ts
    - src/components/TimerDisplay.tsx
    - android/gradle.properties
decisions:
  - "completionHandledRef guard prevents isCompleted effect from re-triggering when garden state mutates inside the effect — fixes infinite notification loop"
  - "Android Haptics.impact() Light/Medium/Heavy are indistinguishable on most devices — switched to three distinct APIs: impact(Light), notification(Warning), vibrate({duration:400})"
  - "AudioContext must be suspended on background (appStateChange isActive=false) and resumed on foreground — prevents ambient sounds leaking into other apps"
  - "android.overridePathCheck=true added to gradle.properties to support non-ASCII (Korean) project paths on Windows"
metrics:
  duration: "~25 min"
  completed_date: "2026-03-26"
  tasks_completed: 3
  files_changed: 7
  bugs_fixed: 3
---

# Phase 2 Plan 03: Wire Native Capabilities into App — Summary

**One-liner:** Integrated haptic feedback, back button confirmations, and audio background suspend/resume into the app, then fixed three device-testing bugs (infinite notifications, indistinguishable haptics, background audio leak).

## What Was Built

### Task 1: Wire haptic feedback into session flow and timer controls
- Added `useHaptic()` to `useAppSessionFlow` — `haptic.strong()` on session complete and plant death
- Added `prevStageRef` tracking with separate `useEffect` on `garden.stage` — `haptic.medium()` on plant growth stage transitions (SEED excluded)
- Added `useHaptic()` to `TimerDisplay` — `haptic.light()` on start/stop button tap

### Task 2: Wire back button and audio resume into App.tsx
- Updated `useBackButton` call with 4-parameter signature (isRunning, panels, exitConfirm, giveUpConfirm)
- Added exit confirmation `ConfirmModal` with Korean text ("앱을 종료하시겠습니까?")
- Added `appStateChange` listener for `mixer.resumeAudio()` on foreground return

### Task 3: Device verification and bug fixes
Three bugs discovered during Android device testing:

**Bug 1 — Infinite notification loop (CRITICAL)**
- Root cause: `isCompleted` useEffect had `garden` in dependency array; calling `garden.addFocusMinutes()` inside the effect mutated garden → re-triggered effect → infinite loop firing notifications, sounds, and haptics
- Fix: Added `completionHandledRef` guard — effect body runs once per completion, resets when `isCompleted` becomes false

**Bug 2 — Haptic intensities indistinguishable**
- Root cause: `Haptics.impact()` Light/Medium/Heavy map to similar amplitude-based vibrations on Android devices without advanced haptic motors
- Fix: Switched to three distinct Capacitor APIs:
  - light: `Haptics.impact({ style: ImpactStyle.Light })` — single tap
  - medium: `Haptics.notification({ type: NotificationType.Warning })` — double-tap pattern
  - strong: `Haptics.vibrate({ duration: 400 })` — 0.4s continuous vibration

**Bug 3 — Audio continues in background**
- Root cause: Only `resumeAudio()` existed (resume on foreground); no suspend on background transition
- Fix: Added `suspendAudio()` to `useAudioMixer` (calls `ctx.suspend()`), wired into `appStateChange` listener alongside `resumeAudio()`

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc -b` | Zero errors |
| `npx vitest run` | 51/51 pass |
| `npm run build` | Clean (3.21s) |
| Device: notifications | Single notification on completion, no repeats |
| Device: haptics | Three distinct intensities felt |
| Device: back button | LIFO panel close, exit/give-up confirmations |
| Device: audio | Suspends on background, resumes on foreground |

## Deviations from Plan

1. **Bug fixes added** — Three bugs discovered during device verification required additional code changes beyond the original plan scope
2. **Haptic API changed** — Original plan used `Haptics.impact()` for all three levels; actual implementation uses three different Capacitor APIs for perceptible differentiation on Android
3. **Audio suspend added** — Original plan only had `resumeAudio`; `suspendAudio` was added to prevent background audio leak

## Commits

| Hash | Message |
|------|---------|
| `55f7b65` | `feat(02-03): wire haptic feedback into session flow and timer controls` |
| `11b2f55` | `feat(02-03): wire back button confirmations and audio resume in App.tsx` |
| pending | `fix(02-03): fix infinite notification loop, haptic differentiation, and background audio` |

## Self-Check: PASSED

All four NATIVE requirements verified on physical Android device. Phase 2 functionally complete.
