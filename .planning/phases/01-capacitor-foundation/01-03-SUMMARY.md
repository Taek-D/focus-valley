---
phase: 01-capacitor-foundation
plan: 03
subsystem: infra
tags: [capacitor, android, splash-screen, status-bar, adaptive-icon, react]

# Dependency graph
requires:
  - phase: 01-01
    provides: Capacitor installed, capacitor.config.ts with SplashScreen/StatusBar plugin config, Android project scaffolded

provides:
  - Branded Android splash screen (light #f5f5f7 / dark #0a0f1a) with theme variants
  - Adaptive launcher icons at all density levels (ldpi through xxxhdpi)
  - SplashScreen.hide() called after React mount with 300ms fade
  - StatusBar background color and style synced to dark mode state
  - StatusBar.setOverlaysWebView(false) guarding against Android 15+ edge-to-edge content overlap

affects: [02-persistence, 03-auth, 04-release]

# Tech tracking
tech-stack:
  added: ["@capacitor/assets (asset generation tool)"]
  patterns:
    - "Capacitor calls gated by isNativePlatform() — zero web impact"
    - "SplashScreen.hide() in useEffect([]) after app mount"
    - "StatusBar theming in useEffect([isDark]) reacting to dark mode toggle"

key-files:
  created:
    - "assets/icon.png (source icon for @capacitor/assets generation)"
    - "android/app/src/main/res/mipmap-*/ic_launcher*.png (all density launcher icons)"
    - "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml (adaptive icon descriptor)"
    - "android/app/src/main/res/drawable*/splash.png (all orientation/density splash variants)"
    - "android/app/src/main/res/drawable-*-night/splash.png (dark mode splash variants)"
  modified:
    - "src/App.tsx (SplashScreen.hide, StatusBar sync, useBackButton, Capacitor imports)"
    - "android/app/src/main/AndroidManifest.xml (whitespace normalized by @capacitor/assets)"

key-decisions:
  - "Used @capacitor/assets Easy Mode (icon.png + color flags) instead of Custom Mode — simpler, fewer source files"
  - "Passed unquoted hex colors to @capacitor/assets CLI — single-quoted values (#f5f5f7) cause color parse failure"
  - "Used void operator on all Capacitor async calls in effects — prevents unhandled promise warnings without requiring async effects"
  - "StatusBar.setOverlaysWebView(false) added proactively per Pitfall 6 — prevents Android 15+ edge-to-edge content overlap"

patterns-established:
  - "All Capacitor plugin calls inside isNativePlatform() guard in App.tsx effects"
  - "Theme-reactive StatusBar: isDark drives both style (Dark/Light icons) and backgroundColor"

requirements-completed: [SETUP-04]

# Metrics
duration: 25min
completed: 2026-03-25
---

# Phase 1 Plan 3: Splash Screen, Status Bar, and Adaptive Icon Summary

**Branded Android cold-start with @capacitor/assets adaptive icons, theme-reactive StatusBar via useEffect([isDark]), and SplashScreen.hide() after React mount**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-25T00:00:00Z
- **Completed:** 2026-03-25T00:25:00Z
- **Tasks:** 2
- **Files modified:** 74 (assets) + 1 (App.tsx)

## Accomplishments
- Generated 74 Android assets (adaptive icons at all densities, light and dark splash screens) from pwa-512x512.png using @capacitor/assets 3.0.5
- Added SplashScreen.hide({ fadeOutDuration: 300 }) to App.tsx running after mount, native-only
- Added StatusBar theming effect to App.tsx reacting to isDark — sets background color (#0a0f1a dark / #f5f5f7 light) and icon style (Style.Dark / Style.Light)
- Added StatusBar.setOverlaysWebView(false) to prevent Android 15+ content overlap
- TypeScript compiles clean, Vite build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate adaptive icon and splash screen assets** - `6bf0185` (chore)
2. **Task 2: Add SplashScreen.hide() and StatusBar theme sync to App.tsx** - `05b835b` (feat)

## Files Created/Modified
- `assets/icon.png` - Source image for @capacitor/assets (copy of pwa-512x512.png)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` - Launcher icon (and all density variants: ldpi, mdpi, xhdpi, xxhdpi, xxxhdpi)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png` - Adaptive icon foreground layer (all densities)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_background.png` - Adaptive icon background layer (all densities)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png` - Round icon (all densities)
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml` - Adaptive icon XML descriptor
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml` - Round adaptive icon XML descriptor
- `android/app/src/main/res/drawable/splash.png` - Default splash screen
- `android/app/src/main/res/drawable-*/splash.png` - Splash at all orientations and densities
- `android/app/src/main/res/drawable-*-night/splash.png` - Dark mode splash variants
- `src/App.tsx` - Added Capacitor imports, useEffect for SplashScreen.hide, useEffect for StatusBar theming, useBackButton call

## Decisions Made
- Used @capacitor/assets Easy Mode with `icon.png` source rather than Custom Mode (icon-only.png + icon-foreground.png + icon-background.png + splash.png). Simpler setup; tool handles adaptive icon layers automatically.
- Hex colors must be passed unquoted to `@capacitor/assets generate` CLI — single-quoted values in bash cause the internal `color` npm package to fail parsing. Passed as bare `#f5f5f7` tokens.
- Used `void` operator on all Capacitor async calls inside useEffect to satisfy no-floating-promises without making effects async.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Unquoted hex color flag required for @capacitor/assets CLI**
- **Found during:** Task 1 (asset generation)
- **Issue:** First run used `--iconBackgroundColor '#f5f5f7'` (single-quoted). The shell passed the literal `'#f5f5f7'` string including apostrophes, causing the internal `color` package to throw `Unable to parse color from string: '#f5f5f7'`.
- **Fix:** Removed shell quotes — passed color values as bare `#f5f5f7` tokens via `cmd //c` invocation.
- **Files modified:** None (CLI invocation fix only)
- **Verification:** Second run completed successfully, 74 assets generated.
- **Committed in:** 6bf0185 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - CLI invocation bug)
**Impact on plan:** Trivial fix to CLI quoting. No scope change.

## Issues Encountered
- `@capacitor/assets` 3.0.5 generates PNG icons (not WebP as the plan's verify step specified). The plan verify step checked for `ic_launcher.webp` but the tool actually generates `ic_launcher.png`. This is correct behavior — the tool generates PNGs for all density buckets plus XML adaptive icon descriptors. No functional issue; the generated assets are valid and complete.

## Next Phase Readiness
- Android launch experience is complete: branded splash, themed status bar, proper launcher icon
- All Capacitor plugin calls are properly gated — web behavior unchanged
- Ready for Phase 02 (Zustand persistence migration to @capacitor/preferences)

---
*Phase: 01-capacitor-foundation*
*Completed: 2026-03-25*
