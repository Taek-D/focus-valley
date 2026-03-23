# Phase 1: Capacitor Foundation - Research

**Researched:** 2026-03-24
**Domain:** Capacitor 8 Android project initialization, service worker isolation, storage migration, timer drift correction, splash/status bar branding
**Confidence:** HIGH (Capacitor official docs + confirmed GitHub issues + direct codebase analysis)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- App icon: Use existing `favicon.svg` (pixel tree art) converted to adaptive icon via @capacitor/assets
- Splash screen: System theme-aware — dark (#0a0f1a) for dark mode, light (#f5f5f7) for light mode, both versions configured
- Play Store app name: "Focus Valley - 집중 타이머"
- Package name convention: `app.focusvalley.android`
- Native app starts fresh — no migration from PWA localStorage; web and native data are completely separate
- Users connect data via Supabase cloud sync (login → pull); no localStorage-to-Preferences migration logic needed
- Two separate build scripts: `npm run build` (web/Vercel) and `npm run build:android` (Capacitor)
- `CAPACITOR_BUILD=true` env var disables VitePWA in the Capacitor build
- Development testing via Android Studio emulator
- Physical device testing before Play Store submission (Phase 4)
- Drift correction only on app resume (same as current web behavior)
- Uses `startedAt` wall-clock comparison to recalculate elapsed time
- Add `App.addListener('appStateChange')` for Capacitor lifecycle events (supplement existing Page Visibility API)
- If session completed during background: show completion UI + plant growth animation on app resume
- Notification on session complete is deferred to Phase 2

### Claude's Discretion
- Capacitor config file structure and plugin initialization order
- Gradle build configuration details
- Exact adaptive icon foreground/background layer split
- Error handling for Preferences API async operations
- Whether to use `@capacitor/app` for back button or custom listener

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SETUP-01 | Capacitor 8 project initialized with Android platform added and working WebView render | Stack section: install commands, `capacitor.config.ts`, `cap init` + `cap add android` workflow |
| SETUP-02 | VitePWA conditionally disabled when CAPACITOR_BUILD=true, web deploy unaffected | Architecture Pattern 1: Conditional PWA Plugin Disable — exact vite.config.ts modification |
| SETUP-03 | Zustand persist storage replaced with @capacitor/preferences adapter on native (localStorage fallback on web) | Architecture Pattern 2: Storage Migration — platform-conditional `createSafeStorage` replacement; all 6 stores identified |
| SETUP-04 | Splash screen, status bar, and adaptive icon configured for Android | Standard Stack: @capacitor/splash-screen + @capacitor/status-bar; Code Examples: config patterns |
| SETUP-05 | Timer resume drift corrected via App.addListener('appStateChange') on Capacitor | Architecture Pattern 3: Drift Correction — extends existing `deadlineRef` wall-clock logic in useTimer.ts |
</phase_requirements>

---

## Summary

Phase 1 is a pure infrastructure phase: the goal is a working Capacitor Android build of the existing SPA with three critical pitfalls resolved before any feature work begins. The existing React codebase remains entirely unchanged in terms of features — all modifications are additive (new files) or narrowly scoped (one env-var guard in vite.config.ts, one storage adapter swap in src/lib/persist.ts, one lifecycle hook in useTimer.ts).

The three hard blockers — service worker plugin injection conflict, localStorage eviction, and Doze timer drift — are all confirmed issues with well-documented fixes. None require architectural invention. The service worker fix is a one-line conditional in vite.config.ts. The storage migration is a new implementation of the `PersistStorage<T>` interface that `createSafeStorage` already returns, meaning only `src/lib/persist.ts` needs updating and all 6 stores inherit the fix automatically. The timer drift fix hooks into the existing `deadlineRef`/`reconcileTimeLeft` pattern already present in useTimer.ts — the `appStateChange` listener is the Capacitor equivalent of the existing `visibilitychange` listener.

Splash screen and status bar configuration (SETUP-04) are declarative: `capacitor.config.ts` entries plus `@capacitor/assets` for icon generation. The `favicon.svg` pixel tree art is the source; `@capacitor/assets` handles all Android size variants. No Kotlin or Java changes are needed for any part of Phase 1.

**Primary recommendation:** Initialize Capacitor 8.2.0, fix all three critical pitfalls in the first task (they share the same test: a working emulator run), then configure branding as the second task.

---

## Standard Stack

### Core (Phase 1 only — install all at once)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@capacitor/core` | ^8.2.0 | JS-to-native bridge runtime | Only version targeting Android API 36; satisfies Google Play 2026 requirement |
| `@capacitor/android` | ^8.2.0 | Android platform layer (`android/` project) | Must match core major exactly; mixing majors causes silent bridge failures |
| `@capacitor/cli` | ^8.2.0 | `cap init`, `cap add`, `cap sync`, `cap build` | Dev tool; must match core major |
| `@capacitor/preferences` | ^8.0.0 | SharedPreferences-backed key-value store | Survives OS memory pressure; localStorage does not. Official Capacitor storage recommendation |
| `@capacitor/splash-screen` | ^8.0.0 | Branded launch screen | Without it: white flash on cold start. Required for SETUP-04 |
| `@capacitor/status-bar` | ^8.0.0 | Status bar color + style | Required to match app dark/light theme. Without it: system-default grey bar |
| `@capacitor/app` | ^8.0.0 | `appStateChange` lifecycle events | Required for SETUP-05 drift correction; also needed for back button (NATIVE-03, Phase 2) |

### Asset Generation (dev-only, one-time use)

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `@capacitor/assets` | latest | Generates all Android icon sizes + splash variants from single source | Run once during SETUP-04 setup; re-run only if `favicon.svg` changes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@capacitor/preferences` | SQLite plugin | Overkill for key-value data; Preferences is the official recommended adapter for Zustand persist |
| `@capacitor/assets` | Manual icon resizing | Error-prone; `@capacitor/assets` handles all 9 mipmap densities + adaptive icon layers automatically |
| `CAPACITOR_BUILD=true` env var | Vite mode flag | Both work; env var is simpler for CI/CD `npm run build:android` script (matches CONTEXT.md decision) |

**Installation (run once, in order):**

```bash
# 1. Core runtime + Android platform
npm install @capacitor/core @capacitor/android @capacitor/preferences @capacitor/splash-screen @capacitor/status-bar @capacitor/app

# 2. CLI (dev dependency)
npm install -D @capacitor/cli

# 3. Asset generation tool (dev dependency)
npm install -D @capacitor/assets

# 4. Initialize Capacitor project (creates capacitor.config.ts at root)
npx cap init "Focus Valley - 집중 타이머" "app.focusvalley.android" --web-dir dist

# 5. Add Android platform (generates android/ directory)
npx cap add android
```

---

## Architecture Patterns

### Recommended Project Structure (delta from current)

```
focus-valley/
├── capacitor.config.ts          # NEW — root-level, alongside vite.config.ts
├── vite.config.ts               # MODIFIED — add CAPACITOR_BUILD conditional (1 line)
├── package.json                 # MODIFIED — add build:android + cap:open scripts
│
├── src/
│   ├── lib/
│   │   └── persist.ts           # MODIFIED — add Capacitor storage adapter, platform-conditional export
│   └── hooks/
│       ├── useTimer.ts          # MODIFIED — add appStateChange listener for drift correction
│       └── (all other hooks)    # UNCHANGED — inherit storage fix via persist.ts
│
└── android/                     # GENERATED by npx cap add android
    ├── variables.gradle         # ONLY Gradle file to hand-edit (SDK version pins)
    └── app/src/main/
        └── AndroidManifest.xml  # MODIFIED — no permissions needed for Phase 1
```

**Files NOT changed:** All React components, App.tsx, Zustand stores (garden, timerSettings, categories, shareTheme, i18n, tour), workers/timer.worker.ts.

### Pattern 1: Conditional PWA Plugin Disable (SETUP-02)

**What:** The `VitePWA()` plugin call in vite.config.ts is wrapped in a condition so it only executes when `CAPACITOR_BUILD` env var is absent (i.e., for web/Vercel builds). When `CAPACITOR_BUILD=true`, the plugin is excluded entirely — no sw.js is generated, no manifest.webmanifest, no workbox assets.

**Why:** Service workers registered at `capacitor://localhost` intercept Capacitor's bridge injection and cause all plugin calls to fail silently with "Plugin not implemented". The existing vite.config.ts already has all PWA configuration that must be preserved for Vercel; the fix is purely additive.

**Exact change to vite.config.ts:**

```typescript
// vite.config.ts
// Source: Capacitor Android Troubleshooting docs + ARCHITECTURE.md Pattern 1

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

export default defineConfig({
  // ...all existing config unchanged...
  plugins: [
    tailwindcss(),
    react(),
    !isCapacitorBuild && VitePWA({
      // ...ALL existing VitePWA config verbatim, unchanged...
      registerType: "autoUpdate",
      includeAssets: [...],
      manifest: {...},
      workbox: {...},
    }),
  ].filter(Boolean),
  // ...rest of config unchanged...
});
```

**package.json scripts to add:**

```json
"build:android": "CAPACITOR_BUILD=true npm run build && npx cap sync android",
"cap:open": "npx cap open android"
```

**Verification:** After `npm run build:android`, confirm `dist/` contains no `sw.js` and no `workbox-*.js` files. Then confirm `android/app/src/main/assets/public/` also has no SW files after sync.

### Pattern 2: Platform-Conditional Storage Adapter (SETUP-03)

**What:** Replace `createSafeStorage` in `src/lib/persist.ts` to return a Capacitor Preferences-backed adapter on native, and the existing localStorage-based adapter on web. All 6 stores that call `createSafeStorage()` inherit the fix automatically — no store files need modification.

**Stores affected (all call `createSafeStorage` — all fixed by one change):**
- `useGarden.ts` → key: `focus-valley-garden`
- `useTimerSettings.ts` → key: `focus-valley-timer-settings`
- `useCategories.ts`
- `useShareTheme.ts`
- `useTour.ts`
- `src/lib/i18n.ts`

**Note on useTimer.ts:** Timer state uses direct `localStorage.setItem/getItem` calls (not `createSafeStorage`). These 3 functions (`saveTimerState`, `loadTimerState`, `clearTimerState`) must ALSO be migrated to use Preferences — handled as a separate sub-task in Pattern 3 below.

**Note on direct localStorage calls (not stores):** `useDarkMode.ts` (key: `focus-valley-dark`), `useWeeklySummary.ts`, `useLanding.ts`, `CategoryChips.tsx`, `useInstallPrompt.ts`, `useWeeklySummary.ts`, and `sync-storage.ts` use `localStorage` directly. These are lower-priority (UI state, not user data) but should be evaluated — at minimum, the dark mode preference should be migrated.

**Exact change to src/lib/persist.ts:**

```typescript
// src/lib/persist.ts
// Source: PITFALLS.md Pitfall 3 + ARCHITECTURE.md Pattern 3

import type { PersistStorage, StorageValue } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// Existing localStorage implementation (kept for web)
function createLocalStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<T>;
      } catch {
        localStorage.removeItem(name);
        return null;
      }
    },
    setItem: (name, value) => {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(name);
    },
  };
}

// Capacitor Preferences adapter (native Android only)
function createCapacitorStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name) => {
      const { value } = await Preferences.get({ key: name });
      if (!value) return null;
      try {
        return JSON.parse(value) as StorageValue<T>;
      } catch {
        await Preferences.remove({ key: name });
        return null;
      }
    },
    setItem: async (name, value) => {
      await Preferences.set({ key: name, value: JSON.stringify(value) });
    },
    removeItem: async (name) => {
      await Preferences.remove({ key: name });
    },
  };
}

// Platform-conditional export — used by all stores
export function createSafeStorage<T>(): PersistStorage<T> {
  return Capacitor.isNativePlatform()
    ? createCapacitorStorage<T>()
    : createLocalStorage<T>();
}
```

**Key point:** The Capacitor Preferences API is async. Zustand's `persist` middleware supports async storage adapters — `PersistStorage<T>` allows async `getItem`/`setItem`/`removeItem`. No store-level changes needed.

**Key point:** `Capacitor.isNativePlatform()` returns `false` on web (including Vercel PWA). The localStorage path is unchanged for web users.

### Pattern 3: Timer State localStorage Migration (SETUP-03 continuation)

**What:** `useTimer.ts` has 3 direct localStorage functions (`saveTimerState`, `loadTimerState`, `clearTimerState`) that bypass `createSafeStorage`. These must be migrated independently.

**The complication:** Timer state reads happen synchronously on mount (`const savedRef = useRef(loadTimerState())`). The Preferences API is async. Two options:

1. **Option A (recommended):** Make `loadTimerState` async; use a loading state in `useTimer` to show a spinner or blank until state is hydrated. This mirrors how Zustand's persist middleware handles async storage internally.

2. **Option B:** Keep timer state in localStorage (it contains `startedAt` timestamp, not long-term user data). The risk is lower than garden data — a lost timer state just resets to idle. Acceptable for v1.1; migrate in a future patch if needed.

**Recommendation (Claude's discretion):** Use Option B for timer state only. Timer state (`focus-valley-timer-state`) is ephemeral session data — the worst case of eviction is a timer reset, not data loss. Garden history, streaks, and settings are the critical data. This avoids introducing async initialization complexity into a component that must render immediately.

**If Option A is chosen:**

```typescript
// useTimer.ts — async hydration approach
async function loadTimerStateAsync(): Promise<PersistedTimerState | null> {
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) return null;
    try {
      const parsed = JSON.parse(value) as Partial<PersistedTimerState>;
      // ...validation logic unchanged...
      return parsed as PersistedTimerState;
    } catch {
      await Preferences.remove({ key: STORAGE_KEY });
      return null;
    }
  }
  return loadTimerState(); // existing sync path for web
}
```

### Pattern 4: Capacitor App Lifecycle Drift Correction (SETUP-05)

**What:** Add a `useEffect` to `useTimer.ts` that registers `App.addListener('appStateChange')`. When `isActive` becomes `true` (app foregrounded), apply the same wall-clock reconciliation already used by the `visibilitychange` handler — use `deadlineRef.current` to compute remaining time.

**The existing pattern to mirror:**

```typescript
// Already in useTimer.ts (lines 181–202) — the visibilitychange handler:
const handleVisibility = () => {
  if (document.visibilityState !== "visible" || !isRunning || deadlineRef.current === null) return;
  const remaining = reconcileTimeLeft(deadlineRef.current, isRunning);
  if (remaining === null) return;
  if (remaining <= 0) {
    setTimeLeft(0);
    setIsRunning(false);
    setIsCompleted(true);
    workerRef.current?.postMessage({ command: "STOP" });
    return;
  }
  setTimeLeft((prev) => (prev === remaining ? prev : remaining));
};
```

**New addition to useTimer.ts (mirrors the above exactly):**

```typescript
// Source: ARCHITECTURE.md Pattern 4 + PITFALLS.md Pitfall 6
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// Add inside useTimer(), alongside the visibilitychange useEffect:
useEffect(() => {
  if (!Capacitor.isNativePlatform()) return; // web uses visibilitychange

  const subscription = App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive || !isRunning || deadlineRef.current === null) return;

    const remaining = reconcileTimeLeft(deadlineRef.current, isRunning);
    if (remaining === null) return;
    if (remaining <= 0) {
      setTimeLeft(0);
      setIsRunning(false);
      setIsCompleted(true);
      workerRef.current?.postMessage({ command: "STOP" });
      return;
    }
    setTimeLeft((prev) => (prev === remaining ? prev : remaining));
  });

  return () => {
    subscription.then(handle => handle.remove());
  };
}, [isRunning]); // same deps as visibilitychange handler
```

**Why `Capacitor.isNativePlatform()` guard is required:** Without it, `@capacitor/app` returns a web no-op implementation, but importing the module adds an unnecessary dependency path in the web bundle. The guard is the standard pattern for all Capacitor plugin calls per CONTEXT.md.

### Pattern 5: capacitor.config.ts (SETUP-01 + SETUP-04)

```typescript
// capacitor.config.ts — create at repo root
// Source: STACK.md + Capacitor Configuration Reference

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.focusvalley.android',
  appName: 'Focus Valley - 집중 타이머',
  webDir: 'dist',
  server: {
    androidScheme: 'https', // Required: prevents React Router issues on WebView 117+
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,       // Show until manually hidden
      launchAutoHide: false,       // Hide programmatically after app ready
      backgroundColor: '#0a0f1a', // Dark theme background (matches app dark bg)
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',              // Overridden at runtime based on user theme
      backgroundColor: '#0a0f1a',
    },
  },
};

export default config;
```

**Note on splash screen dual-theme:** The CONTEXT.md specifies both dark (#0a0f1a) and light (#f5f5f7) splash variants. `@capacitor/assets` supports this via dark/light mode resource qualifiers. The `backgroundColor` in config is the fallback; the actual themed splash is provided by generating two splash resource files with the asset tool.

**Note on splash hide timing:** With `launchAutoHide: false`, call `SplashScreen.hide()` in the app's entry point (App.tsx) after the React tree mounts and initial data is hydrated.

### Pattern 6: Adaptive Icon Generation (SETUP-04)

```bash
# Prepare source assets first
mkdir -p assets
# favicon.svg already exists — copy to assets/logo.svg (1:1 copy)
# OR create assets/logo.png (1024x1024) from favicon.svg via Inkscape/rsvg

# Generate all icon + splash variants
npx capacitor-assets generate --android

# Output locations (automatically placed):
# android/app/src/main/res/mipmap-*/ic_launcher*.png     — launcher icons
# android/app/src/main/res/mipmap-*/ic_launcher_round*   — round icons
# android/app/src/main/res/drawable*/splash.png           — splash screens
```

**Adaptive icon foreground/background split (Claude's discretion recommendation):**
- Foreground layer: the pixel tree (main artwork, centered at ~66% of canvas)
- Background layer: solid color (#0a0f1a for dark splash, #f5f5f7 for light)
- `@capacitor/assets` accepts separate `assets/icon-foreground.png` and `assets/icon-background.png` for explicit control, or a single `assets/logo.png` where the tool infers the split

### Anti-Patterns to Avoid

- **Editing android/app/build.gradle SDK versions directly:** Always use `android/variables.gradle` for `minSdkVersion`, `compileSdkVersion`, `targetSdkVersion`. The build.gradle file is regenerated by `cap sync`. (PITFALLS.md Anti-Pattern 3)
- **Running `npx cap sync` without first running `npm run build:android`:** Sync copies whatever is in `dist/`. If build was not run, stale or web-PWA-enabled assets get synced. Add index.html validation to the build script.
- **Calling Capacitor plugins inside timer.worker.ts:** The bridge has no `window` in worker scope. All plugin calls must originate from main thread. This is a constraint for Phase 2 (notifications, haptics) but is worth noting in the architectural decision for Phase 1.
- **Leaving `server.url` pointing to a dev server in `capacitor.config.ts`:** This is a dev-only override. Never commit a config with `server.url` set — it would ship a production app that loads from localhost.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Android icon generation (all densities) | Manual Photoshop exports for 9 mipmap densities + adaptive icon + round icon | `@capacitor/assets` | Handles mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi, adaptive icon layers, round icons — 40+ files from 1 source |
| Persistent key-value storage | Custom file I/O or SQLite wrapper | `@capacitor/preferences` | Backed by Android SharedPreferences; handles serialization errors, process death, OS eviction |
| App lifecycle events (foreground/background) | `window.focus`/`blur` events or custom native plugin | `@capacitor/app` + `appStateChange` | Official Capacitor API; handles all Android lifecycle states correctly |
| Theme-aware status bar | Direct Android XML styles | `@capacitor/status-bar` + `StatusBar.setStyle()` | Runtime API; works with existing React dark mode detection |
| Splash screen management | CSS/JS loading overlay | `@capacitor/splash-screen` | Native splash avoids white-frame race condition during WebView init; JS overlays appear after the flash |

**Key insight:** Every "don't hand-roll" item in this phase is a standard Capacitor first-party plugin. Custom solutions would re-implement behavior that the bridge already exposes correctly and that has been tested against all Android API versions Capacitor targets.

---

## Common Pitfalls

### Pitfall 1: Service Worker Silently Blocks All Capacitor Plugins
**What goes wrong:** VitePWA generates `sw.js`. On `capacitor://localhost`, the SW intercepts Capacitor's bridge injection. All plugin calls return "Plugin not implemented" — no JS error, no log.
**Why it happens:** Same build used for both Vercel and Capacitor.
**How to avoid:** `CAPACITOR_BUILD=true` guard in vite.config.ts excludes the VitePWA plugin entirely.
**Warning signs:** `@capacitor/preferences` installed but no data persists; `window.Capacitor` is undefined in `chrome://inspect`.

### Pitfall 2: localStorage Eviction Wipes All User Data
**What goes wrong:** Android OS reclaims WebView localStorage under memory pressure. Garden history, streaks, and settings disappear silently.
**Why it happens:** Developers test on desktop; assume localStorage is durable.
**How to avoid:** `createSafeStorage` returns Preferences adapter on native. Single change in `src/lib/persist.ts`.
**Warning signs:** User reports "app reset" after returning to app on a low-storage device.

### Pitfall 3: Doze Mode Freezes Web Worker — Timer Appears Paused
**What goes wrong:** Screen-lock activates Doze mode. Web Worker `setInterval` pauses. Timer shows wrong time on return.
**Why it happens:** Existing `visibilitychange` correction doesn't cover Doze-level OS freeze.
**How to avoid:** `App.addListener('appStateChange')` with `reconcileTimeLeft(deadlineRef.current)` — same logic as existing visibility handler.
**Warning signs:** Lock screen for 5+ minutes; return to app; timer shows time frozen at the lock point.

### Pitfall 4: cap sync Without Prior Build
**What goes wrong:** `npx cap sync` runs against a stale `dist/` directory (or the web-SW-enabled build). Android app loads the wrong version of the app.
**How to avoid:** `build:android` script runs build before sync: `CAPACITOR_BUILD=true npm run build && npx cap sync android`.
**Warning signs:** App behavior differs from expected; SW files visible in android assets.

### Pitfall 5: Preferences API Async Initialization Race
**What goes wrong:** Zustand `persist` with async storage starts hydrating on mount. Components render before hydration completes and read default values, causing flash of empty state.
**Why it happens:** Async storage introduces a hydration delay that synchronous localStorage didn't have.
**How to avoid:** Check `useHydration` pattern from Zustand docs — use `useStore.persist.hasHydrated()` to gate rendering if needed. For most stores this is acceptable (brief empty state). Timer state uses Option B (keep sync localStorage) to avoid this entirely.
**Warning signs:** Garden shows "0 sessions" briefly on app launch then shows real data.

### Pitfall 6: Status Bar Overlap on Android 15+ Edge-to-Edge
**What goes wrong:** Android 15 enforces edge-to-edge for apps targeting API 35+. Status bar overlaps app header content.
**Why it happens:** Active Capacitor GitHub issue #7951 — `@capacitor/status-bar` behavior with Android 15 edge-to-edge changed.
**How to avoid:** Test on Android 15 emulator during SETUP-04 verification. Use `StatusBar.setOverlaysWebView({ overlay: false })` as the safe default. Monitor #7951 for resolution.
**Warning signs:** Timer display or settings panel header is obscured by system status bar on Android 15 devices.

---

## Code Examples

### capacitor.config.ts (complete)

```typescript
// Source: Capacitor Configuration Reference (capacitorjs.com/docs/config)
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.focusvalley.android',
  appName: 'Focus Valley - 집중 타이머',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#0a0f1a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0f1a',
    },
  },
};

export default config;
```

### SplashScreen.hide() call in App.tsx

```typescript
// Source: @capacitor/splash-screen API docs
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

// Inside App component, after initial render:
useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    SplashScreen.hide({ fadeOutDuration: 300 });
  }
}, []); // runs once after mount
```

### StatusBar theme sync with dark mode

```typescript
// Source: @capacitor/status-bar API docs
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// Call when dark mode toggles (in useDarkMode.ts or App.tsx):
async function syncStatusBar(isDark: boolean) {
  if (!Capacitor.isNativePlatform()) return;
  await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  await StatusBar.setBackgroundColor({ color: isDark ? '#0a0f1a' : '#f5f5f7' });
}
```

### Preferences-based storage adapter (complete implementation)

```typescript
// Source: Capacitor Preferences API (capacitorjs.com/docs/apis/preferences)
// + Zustand persist middleware docs (github.com/pmndrs/zustand)
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

function createCapacitorStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name) => {
      const { value } = await Preferences.get({ key: name });
      if (!value) return null;
      try {
        return JSON.parse(value) as StorageValue<T>;
      } catch {
        await Preferences.remove({ key: name });
        return null;
      }
    },
    setItem: async (name, value) => {
      await Preferences.set({ key: name, value: JSON.stringify(value) });
    },
    removeItem: async (name) => {
      await Preferences.remove({ key: name });
    },
  };
}

function createLocalStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<T>;
      } catch {
        localStorage.removeItem(name);
        return null;
      }
    },
    setItem: (name, value) => {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(name);
    },
  };
}

export function createSafeStorage<T>(): PersistStorage<T> {
  return Capacitor.isNativePlatform()
    ? createCapacitorStorage<T>()
    : createLocalStorage<T>();
}
```

### Back button interception (NATIVE-03 prep — implement in Phase 1 per SETUP-04 requirements)

```typescript
// Source: @capacitor/app API docs
// Prevents hardware back button from exiting app during active session
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// In the component that owns session state (or useCapacitorEvents hook):
useEffect(() => {
  if (!Capacitor.isNativePlatform()) return;

  const subscription = App.addListener('backButton', ({ canGoBack }) => {
    if (!canGoBack) {
      // On main screen: allow default exit behavior
      // During active session: show confirmation (NATIVE-03, Phase 2)
      App.exitApp();
    }
  });

  return () => { subscription.then(h => h.remove()); };
}, []);
```

**Note:** Back button exit prevention during active sessions (NATIVE-03) is formally Phase 2, but the listener registration infrastructure is set up in Phase 1 since `@capacitor/app` is already installed.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Capacitor 7 (API 35) | Capacitor 8 (API 36) | March 2026 | Must use v8 — v7 no longer meets Google Play requirements for new app submissions |
| Manual `android/app/build.gradle` edits | `android/variables.gradle` | Capacitor 6+ | variables.gradle is the single source of truth; build.gradle edits are overwritten by cap sync |
| `Preferences` (old name: `@capacitor/storage`) | `@capacitor/preferences` | Capacitor 4 | Package was renamed; `@capacitor/storage` is deprecated; use `@capacitor/preferences` |
| `window.open()` for OAuth (Phase 3 concern) | `@capacitor/browser` (Chrome Custom Tabs) | Google policy 2021 | Affects Phase 3; noted here because Phase 1 installs @capacitor/app which is the companion for this pattern |

**Deprecated/outdated:**
- `@capacitor/storage`: Renamed to `@capacitor/preferences` in Capacitor 4. Do not install `@capacitor/storage`.
- `androidScheme: 'http'`: Removed in Capacitor 7+. Use `androidScheme: 'https'` (now the default, but explicitly set for clarity).
- `Cordova plugins`: Incompatible with Capacitor. Any docs showing `cordova-plugin-*` are irrelevant.

---

## Open Questions

1. **Timer state: Option A vs Option B for async migration**
   - What we know: Preferences API is async; `loadTimerState()` is called synchronously on mount; `useTimer` uses `useRef` for initial state so the component does not re-render on hydration
   - What's unclear: Whether the async hydration delay (typically <10ms on device) is perceptible in practice
   - Recommendation: Use Option B (keep timer state in localStorage) for Phase 1. Timer state is ephemeral — reset on eviction is acceptable. Re-evaluate if user reports of timer reset appear post-launch.

2. **Android 15 edge-to-edge + status bar overlap**
   - What we know: Capacitor issue #7951 is open and active; Android 15 enforces edge-to-edge for API 35+ targets
   - What's unclear: Whether Capacitor 8.2.0 has resolved this in its Android layer or if a workaround in `AndroidManifest.xml` is needed
   - Recommendation: Test on Android 15 emulator during SETUP-04 verification. If overlap occurs, add `android:windowSoftInputMode` and `fitsSystemWindows` attributes to the WebView activity.

3. **Splash screen dual-theme (dark/light)**
   - What we know: `@capacitor/assets` generates splash resources; `capacitor.config.ts` has a single `backgroundColor`
   - What's unclear: Whether `@capacitor/assets` automatically generates `drawable-night/` variants from two source images, or whether this requires manual Android resource folder structure
   - Recommendation: Generate light and dark splash PNG sources separately. Place dark splash at `assets/splash-dark.png` and light at `assets/splash.png`. The `@capacitor/assets` docs clarify the naming convention for dark mode variants.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (configured in vite.config.ts test block) |
| Config file | vite.config.ts (`test.environment: "node"`) |
| Quick run command | `npm test` (runs `vitest run`) |
| Full suite command | `npm run test:ci` (tsc + lint + vitest + playwright) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SETUP-01 | Capacitor project initializes; WebView renders `index.html` | smoke (manual) | `npx cap sync android && ls android/app/src/main/assets/public/index.html` | manual-only |
| SETUP-02 | `build:android` produces no `sw.js` in `dist/` | shell assertion | `CAPACITOR_BUILD=true npm run build && ! ls dist/sw.js 2>/dev/null` | manual-only |
| SETUP-03 | Zustand persist stores use Preferences on native; localStorage on web | unit | `npm test -- src/lib/persist.test.ts` | ❌ Wave 0 |
| SETUP-04 | Splash screen hides after mount; status bar matches theme | smoke (manual) | Manual emulator inspection | manual-only |
| SETUP-05 | Timer drift corrected after 5+ min screen lock | integration (manual) | Manual device test: lock 5 min → verify elapsed time | manual-only |

**Note on SETUP-01, SETUP-04, SETUP-05:** These require a running Android emulator or device. They cannot be automated in Vitest. The verification commands are manual inspection steps in the plan.

**Note on SETUP-02:** Can be asserted in CI via shell command (no Vitest needed). Include in `build:android` script.

### Sampling Rate

- **Per task commit:** `npm test` (unit tests only, < 5 seconds)
- **Per wave merge:** `npm run test:ci` (full suite excluding e2e) + manual emulator smoke test
- **Phase gate:** Full suite green + manual emulator checklist complete before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/persist.test.ts` — covers SETUP-03: tests that `createSafeStorage` returns Preferences adapter when `Capacitor.isNativePlatform()` is true (mock the Capacitor module), localStorage adapter when false
- [ ] `src/hooks/useTimer.test.ts` (extend existing `src/lib/timer-state.test.ts`) — covers SETUP-05: unit test for drift correction logic using `reconcileTimeLeft` with simulated `deadlineRef` values

Existing test file `src/lib/timer-state.test.ts` already tests `resolveInitialState` and `reconcileTimeLeft` — the drift correction logic being added is an extension of `reconcileTimeLeft`. SETUP-05 unit coverage can be added to this file without a new file.

---

## Sources

### Primary (HIGH confidence)
- [Capacitor 8 Getting Started](https://capacitorjs.com/docs/getting-started) — install workflow, init, add android
- [Capacitor 8 Migration Guide](https://capacitorjs.com/docs/updating/8-0) — API 36, Gradle 8.14.3, Android Studio 2025.2.1, JDK 21, Node 22 requirements
- [Capacitor Configuration Reference](https://capacitorjs.com/docs/config) — `webDir`, `androidScheme`, `SplashScreen`, `StatusBar` plugin config
- [Capacitor Android Troubleshooting](https://capacitorjs.com/docs/android/troubleshooting) — SW + plugin injection conflict documented
- [Capacitor Storage Guide](https://capacitorjs.com/docs/guides/storage) — localStorage eviction on Android
- [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences) — SharedPreferences adapter, async API
- [Capacitor App API](https://capacitorjs.com/docs/apis/app) — `appStateChange`, `backButton` event listeners
- [Capacitor Splash Screen API](https://capacitorjs.com/docs/apis/splash-screen) — `hide()`, `launchAutoHide`, `fadeOutDuration`
- [Capacitor Status Bar API](https://capacitorjs.com/docs/apis/status-bar) — `setStyle()`, `setBackgroundColor()`
- [Capacitor Splash Screens and Icons Guide](https://capacitorjs.com/docs/guides/splash-screens-and-icons) — `@capacitor/assets` usage
- [Capacitor Issue #636](https://github.com/ionic-team/capacitor/issues/636) — localStorage lost on Android (confirmed bug)
- [Capacitor Issue #6309](https://github.com/ionic-team/capacitor/issues/6309) — Web Worker + Capacitor plugins (closed "not planned")
- [Capacitor Issue #7951](https://github.com/ionic-team/capacitor/issues/7951) — Edge-to-edge Android 15 behavior (active)
- Direct codebase analysis — `src/lib/persist.ts`, `src/hooks/useTimer.ts`, `src/hooks/useGarden.ts`, `src/hooks/useTimerSettings.ts`, `vite.config.ts`, `package.json`

### Secondary (MEDIUM confidence)
- [Building and Releasing Capacitor Android](https://ionic.io/blog/building-and-releasing-your-capacitor-android-app) — build script patterns, keystore.properties
- [Capacitor Android Edge-to-Edge Issue #7951](https://github.com/ionic-team/capacitor/issues/7951) — behavior unclear; flagged for testing
- Prior milestone research — STACK.md, ARCHITECTURE.md, PITFALLS.md, SUMMARY.md (all researched 2026-03-24)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official Capacitor 8 docs verified; all versions confirmed on npm registry
- Architecture: HIGH — patterns verified via Capacitor docs + confirmed GitHub issues; codebase analysis confirms exact integration points
- Pitfalls: HIGH — critical pitfalls backed by official documentation and confirmed GitHub issues with known status
- Validation architecture: HIGH — vitest already configured in vite.config.ts; existing test files identified

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable APIs; Capacitor 8 is current stable release)
