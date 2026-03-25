---
phase: 01-capacitor-foundation
verified: 2026-03-25T12:10:00Z
status: human_needed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "Run `npm run build:android` and inspect dist/ — confirm no sw.js or workbox-*.js present, then confirm android/app/src/main/assets/public/ also lacks sw.js"
    expected: "dist/ produced with zero service worker files; assets synced to Android WebView without SW conflicts"
    why_human: "Build runs Gradle sync and cap sync — cannot run Android SDK tools in this environment"
  - test: "Install APK on a physical Android device (or emulator), kill the app, relaunch, and verify garden data, streak count, and settings are intact"
    expected: "All Zustand-persisted data survives app kill — reads from SharedPreferences, not localStorage"
    why_human: "Requires a running Android device; SharedPreferences read is runtime-only verification"
  - test: "Start a 5-minute focus session on a physical Android device, lock the screen for 5+ minutes, unlock and return to the app"
    expected: "Timer shows drift-corrected time (not the value it had when screen locked); if timer expired during lock, app shows completed state"
    why_human: "Requires Android Doze mode simulation; appStateChange fires only on real device resume"
  - test: "On a physical Android device, cold-start the app and observe the launch screen"
    expected: "Branded dark (#0a0f1a) background visible immediately; no white flash; splash fades out after ~300ms; status bar color matches the current light/dark theme"
    why_human: "Visual launch experience cannot be verified statically; requires device observation"
  - test: "Start a focus session on a physical Android device, then press the hardware back button"
    expected: "App does not exit; back button press is suppressed silently during an active session"
    why_human: "Requires physical back button interaction on Android hardware"
notes:
  - "REQUIREMENTS.md traceability table still shows SETUP-01 and SETUP-02 as Pending ([ ]) — implementation is complete; this is a documentation-only discrepancy"
  - "android/app/build.gradle is Groovy DSL (not .kts) — plan expected .kts but cap add android generates Groovy by default; this is correct behavior"
---

# Phase 1: Capacitor Foundation Verification Report

**Phase Goal:** The existing SPA runs correctly inside Android WebView with reliable storage, accurate timer, and polished launch experience
**Verified:** 2026-03-25T12:10:00Z
**Status:** human_needed (all automated checks pass; 5 items require device testing)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `npm run build:android` produces a build that loads in Android WebView without white flash or service worker conflicts | ? UNCERTAIN | `package.json` has `build:android` with `cross-env CAPACITOR_BUILD=true`; `vite.config.ts` conditionally strips VitePWA via `.filter(Boolean)`; Android project exists. Actual APK load requires device. |
| 2 | User data (garden, streaks, settings) survives app kill and relaunch — Zustand persist reads from SharedPreferences | ? UNCERTAIN | `persist.ts` verified: `createSafeStorage()` returns Capacitor Preferences adapter on `isNativePlatform()`. 8 Zustand stores confirmed using it. Runtime behavior needs device. |
| 3 | Timer continues counting accurately after screen lock for 5+ minutes — drift corrected via wall-clock | ? UNCERTAIN | `useTimer.ts` lines 207-228: `App.addListener('appStateChange')` uses `reconcileTimeLeft(deadlineRef.current, isRunning)` — identical logic to existing `visibilitychange` handler. Runtime verification needs device. |
| 4 | Splash screen displays branded background on cold start; status bar matches light/dark theme | ? UNCERTAIN | `App.tsx` lines 96-112: `SplashScreen.hide({ fadeOutDuration: 300 })` on mount, `StatusBar.setStyle()` + `StatusBar.setBackgroundColor()` reactive to `isDark`. `capacitor.config.ts` has `launchAutoHide: false`. Visual requires device. |
| 5 | Pressing the Android hardware back button during an active session does not exit the app | ? UNCERTAIN | `useBackButton.ts` exists with `App.addListener('backButton')` — suppresses exit when `isRunning` is true. Wired into `App.tsx` line 94: `useBackButton(timer.isRunning)`. Requires device to confirm. |

**Score:** 5/5 truths implemented and wired; all 5 require human/device verification for confirmation.

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `capacitor.config.ts` | VERIFIED | Exists. Contains `appId: 'app.focusvalley.android'`, `webDir: 'dist'`, `androidScheme: 'https'`, `SplashScreen` plugin config with `launchAutoHide: false`, `backgroundColor: '#0a0f1a'` |
| `vite.config.ts` | VERIFIED | Contains `isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true'`; VitePWA wrapped in `!isCapacitorBuild && VitePWA(...)` with `.filter(Boolean)` |
| `package.json` | VERIFIED | `build:android` script: `cross-env CAPACITOR_BUILD=true npm run build && npx cap sync android`; `cap:open` script present; all Capacitor packages in dependencies |
| `android/app/build.gradle` | VERIFIED | Exists (Groovy DSL — plan expected `.kts` but Groovy is what `cap add android` generates; functionally equivalent) |
| `android/app/src/main/AndroidManifest.xml` | VERIFIED | Exists |
| `src/lib/persist.ts` | VERIFIED | `createSafeStorage()` branches on `Capacitor.isNativePlatform()` — returns `createCapacitorStorage<T>()` (Preferences-backed) on native, `createLocalStorage<T>()` on web |
| `src/lib/persist.test.ts` | VERIFIED | 119 lines, 9 tests covering both web path (localStorage) and native path (Preferences mock). All 9 pass. |
| `src/hooks/useTimer.ts` | VERIFIED | Lines 206-228: `appStateChange` listener registered via `App.addListener`; handler uses `reconcileTimeLeft(deadlineRef.current, isRunning)` — mirrors `visibilitychange` handler exactly |
| `src/hooks/useBackButton.ts` | VERIFIED | 31 lines. `App.addListener('backButton')` — suppresses exit when `isRunning`, calls `App.exitApp()` when idle and `!canGoBack` |
| `src/App.tsx` | VERIFIED | Imports: `useBackButton`, `Capacitor`, `SplashScreen`, `StatusBar`, `Style`. Line 94: `useBackButton(timer.isRunning)`. Lines 96-112: SplashScreen and StatusBar effects, both guarded by `isNativePlatform()` |
| `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` | VERIFIED | Exists; all density variants confirmed (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) |
| `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` | VERIFIED | Adaptive icon XML descriptor present |
| `android/app/src/main/res/drawable/splash.png` | VERIFIED | Default splash present |
| `android/app/src/main/res/drawable-night/splash.png` | VERIFIED | Dark mode splash variant present |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `package.json (build:android)` | `vite.config.ts (CAPACITOR_BUILD)` | `cross-env CAPACITOR_BUILD=true` env var | WIRED | `cross-env` in devDependencies (^10.1.0); `vite.config.ts` reads `process.env.CAPACITOR_BUILD === 'true'` |
| `capacitor.config.ts (webDir)` | `dist/` | `cap sync` reads webDir | WIRED | `webDir: 'dist'` in config; `npx cap sync android` in build:android script |
| `src/lib/persist.ts (createSafeStorage)` | `@capacitor/preferences` | `Capacitor.isNativePlatform()` conditional | WIRED | `Preferences.get/set/remove` called in `createCapacitorStorage`; guarded by `isNativePlatform()` |
| `src/hooks/useTimer.ts (appStateChange)` | `@capacitor/app` | `App.addListener('appStateChange')` | WIRED | Import on line 5: `import { App } from "@capacitor/app"`. Listener registered in useEffect at line 210 |
| `src/hooks/useTimer.ts (appStateChange handler)` | `reconcileTimeLeft` | Same wall-clock logic as visibilitychange | WIRED | Line 213: `reconcileTimeLeft(deadlineRef.current, isRunning)` — identical to visibilitychange handler |
| `src/hooks/useBackButton.ts` | `@capacitor/app` | `App.addListener('backButton')` | WIRED | Import line 3: `import { App } from "@capacitor/app"`. Listener on line 14. |
| `src/App.tsx (useBackButton)` | `src/hooks/useBackButton.ts` | Import + call with `timer.isRunning` | WIRED | Line 36: `import { useBackButton } from "./hooks/useBackButton"`. Line 94: `useBackButton(timer.isRunning)` |
| `src/App.tsx (SplashScreen.hide)` | `@capacitor/splash-screen` | `SplashScreen.hide({ fadeOutDuration: 300 })` | WIRED | Line 38 import; line 97-99 useEffect with `isNativePlatform()` guard |
| `src/App.tsx (StatusBar)` | `@capacitor/status-bar` | `StatusBar.setStyle/setBackgroundColor/setOverlaysWebView` | WIRED | Line 39 import; lines 102-112 useEffect reactive to `isDark` |
| `capacitor.config.ts (SplashScreen.androidSplashResourceName)` | `android/res/drawable*/splash.png` | `androidSplashResourceName: 'splash'` | WIRED | Splash resources present at `drawable/splash.png` and `drawable-night/splash.png` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SETUP-01 | 01-01-PLAN.md | Capacitor 8 project initialized with Android platform added and working WebView render | SATISFIED | `capacitor.config.ts` exists, `android/` directory with valid Gradle project committed, all Capacitor packages in package.json |
| SETUP-02 | 01-01-PLAN.md | VitePWA conditionally disabled when CAPACITOR_BUILD=true, web deploy unaffected | SATISFIED | `vite.config.ts` has `isCapacitorBuild` conditional; VitePWA wrapped in `!isCapacitorBuild && ...` with `.filter(Boolean)` |
| SETUP-03 | 01-02-PLAN.md | Zustand persist storage replaced with @capacitor/preferences adapter on native | SATISFIED | `persist.ts` branches on `isNativePlatform()`; 8 stores (useGarden, useTimerSettings, useTodos, useCategories, useTour, useShareTheme, i18n, i18n-legacy) all use `createSafeStorage()` |
| SETUP-04 | 01-03-PLAN.md | Splash screen, status bar, and adaptive icon configured for Android | SATISFIED | `App.tsx` has SplashScreen.hide + StatusBar effects; `capacitor.config.ts` has SplashScreen/StatusBar plugin config; icons at all densities; splash with dark variant |
| SETUP-05 | 01-02-PLAN.md | Timer resume drift corrected via App.addListener('appStateChange') on Capacitor | SATISFIED | `useTimer.ts` lines 207-228 implement appStateChange listener using reconcileTimeLeft logic |

**Note on REQUIREMENTS.md traceability table:** REQUIREMENTS.md still shows SETUP-01 (`[ ]`) and SETUP-02 (`[ ]`) as Pending, and SETUP-03/04/05 as Complete. The implementation for SETUP-01 and SETUP-02 is fully present in the codebase. The traceability table was not updated after Plan 01-01 completed. This is a documentation-only gap — no code changes needed.

---

## Anti-Patterns Found

No anti-patterns detected in phase-modified files.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/hooks/useBackButton.ts` | 17 | `// Phase 2 (NATIVE-03) will replace this...` | Info | Intentional scope note, not a TODO blocking current functionality |

No `TODO`, `FIXME`, `console.log`, empty implementations, or stub return values found in any phase-modified files.

---

## Human Verification Required

### 1. Service Worker Exclusion in Android Build

**Test:** Run `npm run build:android`, inspect `dist/` directory and `android/app/src/main/assets/public/`
**Expected:** No `sw.js` or `workbox-*.js` files in either location; web `npm run build` still produces `sw.js`
**Why human:** npm/Gradle toolchain not runnable in this environment

### 2. Persistent Storage Survives App Kill

**Test:** Open the app on an Android device, grow a plant/complete a focus session, force-kill the app via Recent Apps, relaunch
**Expected:** Garden state, streak count, timer settings, and todos are intact after relaunch
**Why human:** SharedPreferences read/write requires a running Android app instance

### 3. Timer Drift Correction After Screen Lock

**Test:** Start a 5-minute focus session, immediately lock the screen for 6+ minutes, unlock and return to the app
**Expected:** Timer shows approximately 0 seconds remaining (or completed state), not 5:00 minus only the seconds before lock
**Why human:** Requires Android Doze mode behavior on physical hardware

### 4. Branded Splash and Status Bar Theme

**Test:** Cold-start the app on an Android device (both dark and light theme variants)
**Expected:** Dark background (#0a0f1a) fills screen immediately on cold start, no white flash; status bar color and icon style matches the current theme
**Why human:** Visual rendering during app startup is not statically verifiable

### 5. Back Button Suppression During Active Session

**Test:** Start a focus session, press the Android hardware back button multiple times
**Expected:** App remains open; no exit occurs; no dialog appears (Phase 2 scope)
**When no session is active:** Back button allows normal exit when at root screen
**Why human:** Requires physical Android hardware back button interaction

---

## Additional Notes

### Zustand Store Coverage

The `createSafeStorage` adapter is confirmed used by 8 stores, exceeding the 6 mentioned in the plan: `useGarden`, `useTimerSettings`, `useTodos`, `useCategories`, `useTour`, `useShareTheme`, `i18n`, `i18n-legacy`. Timer ephemeral state (`saveTimerState`/`loadTimerState`) intentionally stays in localStorage — this is correct per the plan decision.

### Gradle DSL Format

The plan's artifact check expected `android/app/build.gradle.kts` (Kotlin DSL). The actual file is `android/app/build.gradle` (Groovy DSL). This is the default output of `cap add android` with Capacitor 8 and is functionally identical. It is not a defect.

### TypeScript Compilation

`npx tsc -b` exits clean (no output = no errors) across all modified files including Capacitor plugin imports.

### Test Results

All 22 tests pass across 6 test files:
- `src/lib/persist.test.ts` — 9 tests (new, all pass)
- `src/lib/timer-state.test.ts` — 4 tests (existing, unaffected)
- `src/hooks/useGarden.test.ts` — 2 tests
- `src/hooks/useAppSessionFlow.test.ts` — 3 tests
- `src/hooks/useAppSyncFlow.test.ts` — 2 tests
- `src/lib/sync.test.ts` — 2 tests

---

## Gaps Summary

No gaps found. All 5 phase success criteria are implemented and wired correctly in the codebase. The phase status is `human_needed` rather than `passed` because the 5 success criteria describe runtime behaviors (APK load, storage survival, timer drift, splash rendering, back button) that require a physical Android device to confirm.

The only documentation inconsistency is in REQUIREMENTS.md: SETUP-01 and SETUP-02 are marked as Pending when both are complete. This can be corrected by updating the traceability table checkboxes.

---

_Verified: 2026-03-25T12:10:00Z_
_Verifier: Claude (gsd-verifier)_
