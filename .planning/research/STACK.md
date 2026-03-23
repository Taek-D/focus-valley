# Stack Research

**Domain:** Capacitor Android deployment for existing React 19 + Vite 7 PWA
**Researched:** 2026-03-24
**Confidence:** HIGH (official Capacitor docs + npm registry verified)

---

## Recommended Stack

### Core Technologies (New Additions Only)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@capacitor/core` | ^8.2.0 | Capacitor runtime bridge | Latest stable (8.2.0, March 2026). v8 targets Android API 36 / compileSdk 36, satisfying Google Play's 2025 requirement (API 35+). Node 22 required — current env is v22.17.1, matches. |
| `@capacitor/cli` | ^8.2.0 | Build + sync CLI tooling | Must match `@capacitor/core` major version exactly. Dev dependency. Provides `cap init`, `cap add android`, `cap sync`, `cap build`. |
| `@capacitor/android` | ^8.2.0 | Android platform layer | Generates `android/` project. Must pin to same major as core. Use AAB output for Play Store. |

### Native Capability Plugins

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@capacitor/local-notifications` | ^8.0.0 | Schedule timer-completion notifications | Required — replaces browser Notifications API for native Android. Supports exact-alarm scheduling, notification channels, and Doze-mode awareness. |
| `@capacitor/haptics` | ^8.0.1 | Vibration feedback on plant growth / focus start | Required — wraps Android `Vibrator`/`VibrationEffect`. No-ops silently on devices without vibration hardware, so safe to call unconditionally. |
| `@capacitor/splash-screen` | ^8.0.0 | Branded launch screen | Required — controls native Android splash. Without this, the WebView shows a white flash on cold start. |
| `@capacitor/status-bar` | ^8.0.0 | Status bar color + style control | Required for polished feel — lets the app match the status bar to its dark/light theme. Without it the status bar stays system-default grey. |

### Asset Generation Tool

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `@capacitor/assets` | latest (`npm i -D @capacitor/assets`) | Generate all Android icon sizes + splash variants from a single source | One-time dev tool. Needs a `1024×1024px` source icon and `2732×2732px` splash. Easy Mode accepts a single `assets/logo.png`. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Android Studio Meerkat (2025.2.1+) | Android SDK manager, emulator, signing | Capacitor 8 requires this specific version. Earlier versions (Ladybug, etc.) lack API 36 support. |
| Java JDK 21 | Gradle build runtime | Bundled with Android Studio 2025.x. Do not install separately unless overriding. |
| Gradle 8.14.3 / AGP 8.13.0 | Android build system | Auto-configured by `npx cap add android`. Do not manually override unless Google Play compliance requires it. |
| `keytool` (JDK bundled) | Generate release keystore | One-time setup. Keystore must be kept outside the repo (add to `.gitignore`). |

---

## Installation

```bash
# Core Capacitor runtime + Android platform
npm install @capacitor/core @capacitor/android

# Dev: Capacitor CLI (must match core major)
npm install -D @capacitor/cli

# Native capability plugins
npm install @capacitor/local-notifications @capacitor/haptics @capacitor/splash-screen @capacitor/status-bar

# Dev: Asset generation tool
npm install -D @capacitor/assets

# Initialize Capacitor (run once, answers prompts)
npx cap init "Focus Valley" "com.focusvalley.app" --web-dir dist

# Add Android platform
npx cap add android

# Sync web build into native project (run after every `npm run build`)
npx cap sync android
```

---

## Vite + Capacitor Configuration

### `capacitor.config.ts` (create at repo root)

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.focusvalley.app',
  appName: 'Focus Valley',
  webDir: 'dist',          // matches Vite's default output dir
  server: {
    androidScheme: 'https', // required — custom schemes break React Router on WebView 117+
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
```

### `vite.config.ts` — No changes required

Vite's default `dist/` output already satisfies Capacitor's `webDir`. The existing `@vitejs/plugin-react` + `vite-plugin-pwa` configuration is compatible.

**Critical:** The service worker registered by `vite-plugin-pwa` must be disabled for the native Capacitor build. Active service workers prevent Capacitor plugin injection, causing "Plugin not implemented" errors. Add a build-target guard:

```typescript
// vite.config.ts (partial — add to existing config)
import { Capacitor } from '@capacitor/core'; // only available at runtime, not build time

// Use an env var instead:
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

// In VitePWA plugin options:
// disabled: isCapacitorBuild
```

Practical approach — add a separate npm script for Capacitor builds:

```json
// package.json scripts to add:
"build:android": "CAPACITOR_BUILD=true npm run build && npx cap sync android",
"cap:open": "npx cap open android"
```

Then in `vite.config.ts`, pass `disabled: !!process.env.CAPACITOR_BUILD` to `VitePWA({...})`.

### `android/app/build.gradle` — Signing configuration

```groovy
// Add to android/app/build.gradle (after android { ... } block)
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

```properties
# android/keystore.properties (DO NOT COMMIT — add to .gitignore)
storeFile=../../release.keystore
storePassword=<your-store-password>
keyAlias=focusvalley
keyPassword=<your-key-password>
```

---

## Android SDK Requirements

| Requirement | Value | Notes |
|-------------|-------|-------|
| `minSdkVersion` | 24 | Android 7.0+. Covers ~99% of active Android devices. |
| `targetSdkVersion` | 36 | Required by Google Play for new apps submitted after August 2025. |
| `compileSdkVersion` | 36 | Must match targetSdk. |
| Android Studio | Meerkat 2025.2.1+ | Earlier versions lack API 36 SDK. |
| JDK | 21 | Bundled with Android Studio 2025.x. |
| Gradle Wrapper | 8.14.3 | Auto-set by `npx cap add android`. |
| Android Gradle Plugin | 8.13.0 | Auto-set. |
| Kotlin | 2.2.20 | Used internally by Capacitor Android layer. |
| Node.js | 22+ | `v22.17.1` already installed, satisfies requirement. |

---

## Play Store Release Build

```bash
# 1. Generate release keystore (one-time)
keytool -genkey -v \
  -keystore release.keystore \
  -alias focusvalley \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. Build signed AAB (preferred over APK for Play Store)
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

Upload `app-release.aab` to Google Play Console > Production track.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Capacitor 8 | Capacitor 7 | Never for new projects — v7 targets API 35 (Play Store deadline passed for new apps), v8 targets API 36 which is the current requirement. |
| `@capacitor/local-notifications` | Firebase Cloud Messaging (FCM) | Use FCM only when you need server-triggered push (e.g., friend invites, social features). Local notifications are sufficient for timer completion — no server needed, no privacy surface. |
| AAB (Android App Bundle) | APK | Use APK only for sideloading or direct distribution. Play Store mandates AAB since August 2021. |
| `keytool` + `keystore.properties` | Android Studio GUI signing | Use Studio GUI during development; CLI approach is required for CI/CD pipelines. |
| Disable SW for native build | Keep PWA service worker active | Never keep SW active in native Capacitor build — it prevents plugin bridge injection. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Cordova plugins | Incompatible with Capacitor. Different bridge, different lifecycle, causes subtle runtime errors. | `@capacitor/*` official plugins or community Capacitor plugins. |
| `@ionic/pwa-elements` | Only needed when using Capacitor Camera/File plugins that need fallback web UI. Focus Valley uses none of those. | Nothing — omit it entirely. |
| `@capacitor/push-notifications` | Requires Firebase Cloud Messaging setup, APNs certificates, and server-side infrastructure. Overkill for timer completion. | `@capacitor/local-notifications` — fully client-side, no server needed. |
| React Native | Requires rewriting the entire app. | Capacitor wraps the existing Vite SPA as-is. |
| `ionic-appflow` | Paid CI/CD service for Ionic. Not needed — GitHub Actions + Gradle handles AAB builds. | `./gradlew bundleRelease` in GitHub Actions. |
| Capacitor Live Reload in production | `server.url` in `capacitor.config.ts` points to a dev server — catastrophic if accidentally shipped. | Use `server.url` only in dev configs; never in the committed config. |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@capacitor/core@^8.2.0` | `@capacitor/android@^8.2.0` | All `@capacitor/*` packages must share the same major version. Mixing majors (e.g., core@8 + android@7) causes runtime bridge errors. |
| `@capacitor/core@^8.2.0` | Node.js 22+ | `v22.17.1` installed — satisfies requirement. |
| `@capacitor/local-notifications@^8.0.0` | Android API 24+ | Requires `SCHEDULE_EXACT_ALARM` permission in `AndroidManifest.xml` for exact-time scheduling on Android 12+. |
| `vite-plugin-pwa@^1.2.0` | Capacitor native builds | Compatible IF service worker is disabled for native builds via `disabled: !!process.env.CAPACITOR_BUILD`. Keep it enabled for the PWA web build. |
| `vite@^7.3.1` | `@capacitor/cli@^8.2.0` | No Vite version constraint in Capacitor. Vite is only a build tool — Capacitor only consumes `dist/` output. |
| `framer-motion@^12.34.0` | Capacitor Android WebView | Compatible. Chrome-based WebView on Android 7+ supports all Framer Motion animations. |
| Web Audio API | Capacitor Android WebView | Compatible — Android WebView supports Web Audio API since API 21. Existing 8-channel audio mixer works without changes. |
| Web Workers | Capacitor Android WebView | Compatible — the timer Web Worker runs normally in Android WebView. No changes needed. |

---

## Stack Patterns by Variant

**For local notification scheduling (timer completion):**
- Use `@capacitor/local-notifications` with `schedule()` + `allowWhileIdle: true`
- Because the app must fire the notification even when the device enters Doze mode
- Requires `SCHEDULE_EXACT_ALARM` in `AndroidManifest.xml`

**For haptics on plant growth stages:**
- Use `Haptics.impact({ style: ImpactStyle.Medium })` for stage transitions
- Use `Haptics.notification({ type: NotificationType.Success })` for session completion
- Because these map to the semantic meaning — growth = physical sensation, success = positive feedback

**For the service worker / PWA conflict:**
- Use `CAPACITOR_BUILD=true npm run build` to produce a SW-disabled native build
- Use `npm run build` (no env var) for the Vercel PWA deployment
- Because a single codebase serves both targets with zero duplication

**For signing in CI/CD:**
- Store `release.keystore` as a base64 GitHub Actions secret
- Decode it at build time: `echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > release.keystore`
- Because committing the keystore to the repo is a critical security vulnerability

---

## Sources

- [Capacitor 8 Migration Guide](https://capacitorjs.com/docs/updating/8-0) — minSdkVersion 24, targetSdkVersion 36, compileSdkVersion 36, Gradle 8.14.3, Android Studio 2025.2.1, JDK 21, Node 22 (HIGH confidence — official docs)
- [Capacitor Getting Started](https://capacitorjs.com/docs/getting-started) — install commands, init workflow (HIGH confidence)
- [Capacitor Configuration Reference](https://capacitorjs.com/docs/config) — `webDir`, `androidScheme`, `server.*`, `buildOptions` (HIGH confidence)
- [Capacitor Android Troubleshooting](https://capacitorjs.com/docs/android/troubleshooting) — service worker + plugin injection conflict confirmed (HIGH confidence)
- [@capacitor/local-notifications API docs](https://capacitorjs.com/docs/apis/local-notifications) — `SCHEDULE_EXACT_ALARM`, channels, `allowWhileIdle`, v8 API (HIGH confidence)
- [@capacitor/haptics API docs](https://capacitorjs.com/docs/apis/haptics) — ImpactStyle, NotificationType, silent no-op on devices without vibration (HIGH confidence)
- [Building and Releasing Capacitor Android](https://ionic.io/blog/building-and-releasing-your-capacitor-android-app) — AAB signing, keystore.properties, Gradle signing config (MEDIUM confidence — Ionic official blog)
- [Google Play Target API Requirements](https://developer.android.com/google/play/requirements/target-sdk) — API 35 minimum for new apps from August 2025, API 36 in 2026 (HIGH confidence)
- [npm: @capacitor/haptics](https://www.npmjs.com/package/@capacitor/haptics) — version 8.0.1 confirmed (HIGH confidence)
- [npm: @capacitor/local-notifications](https://www.npmjs.com/package/@capacitor/local-notifications) — version 8.0.0 confirmed (HIGH confidence)
- [Capacitor 7 GA announcement](https://ionic.io/blog/capacitor-7-has-hit-ga) — context for v7 vs v8 decision (MEDIUM confidence)

---

*Stack research for: Capacitor Android deployment (Focus Valley v1.1)*
*Researched: 2026-03-24*
