# Project Research Summary

**Project:** Focus Valley — Capacitor Android Deployment (v1.1)
**Domain:** Capacitor Android wrapping of existing React 19 + Vite 7 PWA for Google Play Store
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

Focus Valley is a feature-complete Pomodoro timer web app (React 19, Vite 7, Zustand 5, Web Workers, Web Audio API) being wrapped for native Android via Capacitor 8. This is not a greenfield build — the existing SPA runs unchanged inside the Android WebView. The work is entirely additive: a thin native integration layer (Capacitor project setup, native plugins, build pipeline changes) on top of a finished product. The recommended approach is Capacitor 8.2.0 targeting Android API 36, which satisfies Google Play's 2026 requirements and ships with zero changes to the existing React codebase.

The native integration has four phases of work: project scaffolding and critical infrastructure fixes, native capability implementation (notifications, haptics, UX polish), auth/deep link integration, and Play Store submission. The first phase carries the highest technical risk because three critical pitfalls — service worker blocking all plugin injection, localStorage data loss on Android, and Doze mode timer drift — must be resolved before any other native feature work is valid. These are confirmed bugs with documented workarounds, not unknowns. The architecture is well-understood: Capacitor serves as a transparent JS-to-native bridge, and all existing React code continues to work without modification.

The biggest risks are operational rather than technical: losing the release keystore (unrecoverable without a Play Console reset), submitting without incrementing `versionCode` (immediate rejection), and Play Store rejection for "minimum functionality" if native features (haptics, notifications) are installed but not functional. All three are entirely preventable with a proper pre-submission checklist. Overall, the research gives HIGH confidence in both the technical approach and the path to Play Store launch.

---

## Key Findings

### Recommended Stack

Capacitor 8.2.0 is the correct choice: it targets Android API 36 (compileSdk 36, minSdk 24), satisfying Google Play's current requirement. Capacitor 7 targeting API 35 is no longer acceptable for new app submissions. The existing Node 22.17.1 environment already satisfies Capacitor 8's Node 22+ requirement. All `@capacitor/*` packages must be pinned to the same major version — mixing majors causes silent runtime bridge failures.

Four native capability plugins are required: `@capacitor/local-notifications` for timer-completion alerts, `@capacitor/haptics` for growth feedback, `@capacitor/splash-screen` to prevent the white-flash launch experience, and `@capacitor/status-bar` for dark/light theme matching. The PWA service worker must be conditionally disabled for Capacitor builds via a `VITE_CAPACITOR=true` env flag — this is not optional. Android Studio Meerkat (2025.2.1+) is required; earlier versions do not support the API 36 SDK.

**Core technologies:**
- `@capacitor/core@^8.2.0`: Native bridge runtime — only version targeting API 36 (Play Store 2026 requirement)
- `@capacitor/android@^8.2.0`: Android platform layer — generates the `android/` project; must match core major exactly
- `@capacitor/cli@^8.2.0`: Build + sync tooling — provides `cap init`, `cap add`, `cap sync`, `cap build`
- `@capacitor/local-notifications@^8.0.0`: Timer-completion alerts — replaces browser Notifications API for native; Doze-mode aware
- `@capacitor/haptics@^8.0.1`: Tactile feedback — wraps Android VibrationEffect; no-ops silently on devices without vibration hardware
- `@capacitor/splash-screen@^8.0.0`: Branded launch screen — prevents white flash on cold start
- `@capacitor/status-bar@^8.0.0`: Theme-matched status bar — essential for visual polish; mismatched bar looks broken
- `@capacitor/preferences`: Reliable key-value storage — backed by Android SharedPreferences; replaces localStorage for Zustand persist
- `@capacitor/assets` (dev): Icon + splash generation — accepts single 1024x1024 source image; generates all required Android sizes

### Expected Features

The web app already ships all core Pomodoro features. The v1.1 milestone adds the Android native integration layer only. See `FEATURES.md` for full competitor analysis and Play Store listing requirements.

**Must have (table stakes) — blocks Play Store submission without these:**
- Local notifications for timer completion — core native value; #1 complaint about web Pomodoro apps is "can't hear it in the background"
- Adaptive app icon + splash screen — required for Play Store; missing adaptive icon = ugly on modern launchers
- Target API 35/36 compliance — mandatory for new app submissions post-August 2025
- Privacy policy URL + Data Safety form — Play Console blocks submission without both
- Content rating (IARC questionnaire) — required; productivity timer = "Everyone", 5 minutes to complete
- Status bar theming — LOW complexity; a mismatched status bar immediately signals "this is just a website"
- Back button handling — Android hardware/gesture back must not exit the app mid-session
- Play Store listing assets — minimum 2 phone screenshots (1080x1920), feature graphic (1024x500), short/full descriptions

**Should have (competitive differentiators):**
- Haptic feedback on plant growth + timer controls — Forest (main competitor) has no haptics; LOW complexity, HIGH perceived-native value
- Edge-to-edge layout hardening — Android 15+ enforces edge-to-edge; required for polished layout on modern devices
- Deep links for share card integration — bridges web-to-native referral once share feature has usage data

**Defer (v1.x post-validation):**
- Foreground service for Doze-mode timer continuity — HIGH complexity; add when reviews report timer kills
- Home screen widget — requires native Kotlin; defer until Capacitor community plugin matures (v2+)
- iOS (Capacitor) — PROJECT.md defers until Android is validated

**Explicit anti-features (do not implement):**
- FCM push notifications — overkill for timer completion; local notifications cover the need with zero server infrastructure
- App-to-app blocking (Forest-style) — high Play Store policy rejection risk; `PACKAGE_USAGE_STATS` + Accessibility Service flags trigger review
- In-app purchases — PROJECT.md defers IAP to post-v1.1; existing Supabase web checkout handles Pro tier

### Architecture Approach

The architecture is a standard Capacitor wrapping pattern: the existing Vite SPA compiles to `dist/`, `npx cap sync` copies it into `android/app/src/main/assets/public/`, and the Android WebView loads it from the `capacitor://localhost` scheme. No React code moves or is rewritten. Three new source files are added (`src/lib/notifications.ts`, `src/lib/capacitor-storage.ts`, `src/hooks/useCapacitorEvents.ts`), and two existing files are modified (`vite.config.ts` for conditional PWA disable, `package.json` for build scripts). The generated `android/` directory is entirely managed by Capacitor tooling.

All Capacitor plugin calls must occur on the main JS thread. The existing Web Worker (`timer.worker.ts`) posts `postMessage` events — the `useTimer` hook on the main thread is the correct call site for `LocalNotifications.schedule()` and `Haptics.impact()`. This constraint is a confirmed closed Capacitor issue (#6309) and must be documented before any plugin integration work begins.

**Major components:**
1. `capacitor.config.ts` (new, repo root) — declares appId, appName, webDir, plugin configuration; read by `cap sync`
2. `src/lib/notifications.ts` (new) — thin `LocalNotifications` wrapper with `Capacitor.isNativePlatform()` guard; called from `useTimer` on session complete
3. `src/lib/capacitor-storage.ts` (new) — custom Zustand `StateStorage` adapter using `@capacitor/preferences`; swaps in for native builds to prevent localStorage eviction
4. `src/hooks/useCapacitorEvents.ts` (new) — `App.addListener('appStateChange')` bridge for lifecycle events; wires Doze drift correction to existing Page Visibility timer logic
5. `android/variables.gradle` — single source of truth for SDK versions (`minSdkVersion=24`, `compileSdkVersion=36`, `targetSdkVersion=36`); never edit `build.gradle` directly
6. `android/app/src/main/AndroidManifest.xml` — permissions (`VIBRATE`, `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`); custom URL scheme for OAuth deep links

### Critical Pitfalls

1. **Service worker blocks all Capacitor plugin injection** — Disable `vite-plugin-pwa` for native builds via `VITE_CAPACITOR=true` env flag. Active service workers on `capacitor://localhost` intercept bridge injection; all plugin calls silently return "Plugin not implemented". Must be resolved in Phase 1 before any plugin work.

2. **localStorage eviction wipes all user data on Android** — Replace Zustand `persist` storage with `@capacitor/preferences` adapter before Play Store launch. Android OS reclaims WebView localStorage under memory pressure. User's entire garden history, streaks, and settings disappear with no warning. Confirmed Capacitor issue #636.

3. **Capacitor plugins cannot be called from inside `timer.worker.ts`** — All `LocalNotifications`, `Haptics`, and `Preferences` calls must be on the main thread. The Web Worker has no `window`; plugin bridge detection evaluates the wrong context. Extend the existing `postMessage` flow to route plugin calls through `useTimer`'s message handler.

4. **Google OAuth returns 403 `disallowed_useragent` in WebView** — Use `@capacitor/browser` to open OAuth in Chrome Custom Tabs, then handle the return deep link via `App.addListener('appUrlOpen')`. Google explicitly bans OAuth in embedded WebViews. Supabase's `signInWithOAuth` called directly will silently fail on all Android devices.

5. **Android Doze mode freezes the Web Worker timer** — On `appStateChange` foreground return, compare `Date.now()` against the last known tick timestamp (stored in Preferences) and apply wall-clock drift correction. The existing Page Visibility API correction does not cover Doze-level freezes. Screen-lock for 5+ minutes during an active session will expose this on any physical device.

6. **Keystore loss permanently orphans the app** — Back up the release keystore to a password manager (base64-encoded) immediately after generation. Lost keystore after first Play Store upload requires a days-long upload key reset process; the app cannot receive updates until resolved.

7. **`versionCode` not incremented blocks every Play Store update** — Establish a release checklist with `versionCode` increment as step 1. Google Play requires strictly increasing integer `versionCode`; Capacitor does not sync this from `package.json`. First-time deployers discover this only on rejection.

---

## Implications for Roadmap

Based on research, the dependency graph forces a clear 4-phase structure. Phase 1 infrastructure fixes are load-bearing — no native feature tested before Phase 1 is complete produces valid results.

### Phase 1: Capacitor Foundation + Critical Infrastructure

**Rationale:** Three critical pitfalls (SW plugin block, localStorage eviction, Doze timer drift) must be resolved before any native feature work produces valid test results. Installing plugins before fixing these gives false negatives. The build pipeline, storage layer, and timer drift correction are prerequisites for everything else.

**Delivers:** A working Capacitor Android build that loads the existing SPA, with correct storage, correct timer behavior on device, branded splash, and no service worker conflicts.

**Addresses:** Capacitor project setup (P1), splash screen (P1), status bar theming (P1), back button handling (P1)

**Avoids:** Pitfall 1 (SW block), Pitfall 3 (localStorage), Pitfall 5 (Doze), Pitfall 9 (webDir mismatch)

**Key tasks:**
- Install `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`; run `cap init` + `cap add android`
- Create `capacitor.config.ts` at repo root with `androidScheme: 'https'`
- Add `VITE_CAPACITOR=true` conditional to `vite.config.ts` to disable VitePWA for native builds
- Add `build:android` npm script (`VITE_CAPACITOR=true npm run build && npx cap sync android`)
- Add `build:android` validation check for `dist/index.html` existence before sync
- Implement `capacitor-storage.ts` Preferences adapter; wire into Zustand `persist` with platform detection
- Implement `useCapacitorEvents.ts` with `appStateChange` handler; extend `useTimer` drift correction
- Configure `@capacitor/splash-screen` (branded `#0a0a0f` background, `launchAutoHide: false`)
- Configure `@capacitor/status-bar` wired to existing dark/light mode
- Add `VIBRATE`, `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM` to `AndroidManifest.xml`
- Intercept Android hardware back button during active sessions
- Verify on physical device: screen-lock 5 min → timer drift corrected; `Preferences.get()` returns garden data; no `sw.js` in assets

### Phase 2: Native Capability Integration

**Rationale:** With infrastructure validated, native plugins can be implemented and tested with confidence. Haptics and local notifications are independent of each other and can be implemented in parallel. Both are LOW-to-MEDIUM complexity with HIGH perceived-native value — these are the features that make the app feel non-web.

**Delivers:** Timer-completion notifications that fire even when the screen is off, haptic feedback on plant growth and timer controls, and polished audio initialization on Android.

**Addresses:** Local notifications (P1), haptic feedback (P1), audio autoplay fix (unlisted but HIGH severity pitfall)

**Avoids:** Pitfall 2 (Web Worker + Capacitor boundary), Pitfall 5 (audio context suspension)

**Key tasks:**
- Install `@capacitor/local-notifications`, `@capacitor/haptics`
- Implement `src/lib/notifications.ts` with `scheduleCompletionNotification()` using `Capacitor.isNativePlatform()` guard
- Wire notification call into `useTimer`'s session-complete handler (main thread, not worker)
- Add `LocalNotifications.requestPermissions()` on first launch or before first session
- Implement `Haptics.impact({ style: ImpactStyle.Medium })` on plant growth stage transitions
- Implement `Haptics.notification({ type: NotificationType.Success })` on session complete
- Implement `Haptics.impact({ style: ImpactStyle.Light })` on timer start/stop/pause
- Add `audioContext.resume()` gate on first user gesture; store audio intent in Preferences (not in-memory) for app resume
- Test notification delivery with screen locked; test haptics on physical device (emulator does not simulate vibration)

### Phase 3: Auth and Deep Link Integration

**Rationale:** Google OAuth in WebView is a hard blocker for all existing users who signed up via Google. This must be fixed before QA of the auth flow. Deep links extend the existing share card feature to route to the native app and are implemented in the same phase because both require URL scheme registration in `AndroidManifest.xml`.

**Delivers:** Working Google OAuth via Chrome Custom Tabs, functional deep link routing from share cards to native app, auth session stored durably.

**Addresses:** Deep links (P2), Google OAuth fix (required for existing users)

**Avoids:** Pitfall 4 (Google OAuth `disallowed_useragent`), auth token eviction (store in Preferences)

**Key tasks:**
- Install `@capacitor/browser`
- Modify Supabase Google OAuth call: replace direct `signInWithOAuth` with `Browser.open()` → Chrome Custom Tabs
- Register `com.focusvalley.app://` custom URL scheme in `AndroidManifest.xml` as intent filter
- Add `App.addListener('appUrlOpen')` handler to receive OAuth callback and complete Supabase session
- Register `com.focusvalley.app://` as allowed redirect URL in Supabase dashboard
- Host `assetlinks.json` on the Focus Valley web domain for Android App Links (enables seamless share card → native app routing)
- Configure `CapacitorCookies: { enabled: true }` in `capacitor.config.ts` for OAuth session cookies
- Store Supabase session tokens via Preferences, not localStorage
- Open subscription/Stripe URLs via `@capacitor/browser` (Stripe blocks in-app WebView payments)
- Test full OAuth flow on physical Android device

### Phase 4: Play Store Assets and Submission

**Rationale:** All technical work must be complete and tested before starting submission prep. Store listing assets, policy compliance, and signing are one-way operations with no iterative loop — get them right once. The keystore must be backed up as the very first action in this phase.

**Delivers:** A signed `.aab` submitted to Google Play, a complete store listing, and a release process that can be repeated for every future update.

**Addresses:** App icon (P1), Play Store listing assets (P1), privacy policy (P1), Data Safety form (P1), content rating (P1), Target API 35 compliance (P1), feature graphic (P1)

**Avoids:** Pitfall 7 (`versionCode` not incremented), Pitfall 8 (keystore loss), Pitfall 10 (Play Store minimum functionality rejection)

**Key tasks:**
- Generate release keystore with `keytool`; immediately back up to password manager (base64); add to `.gitignore`
- Configure `android/app/build.gradle` signing with `keystore.properties` file pattern
- Establish `versionCode` convention (`major * 10000 + minor * 100 + patch`; v1.1.0 = 10100)
- Create release checklist with `versionCode` increment as Step 1
- Generate all icon sizes from 1024x1024 source using `@capacitor/assets`; verify adaptive icon in Android 12+ launcher
- Generate all splash screen sizes from 2732x2732 source
- Capture minimum 2 phone screenshots at 1080x1920 from emulator or device
- Design feature graphic (1024x500) using existing pixel art assets
- Write store listing: app title (13 chars, fits), short description (80 chars max), full description (4000 chars max; call out haptics + notifications explicitly)
- Publish privacy policy page on Focus Valley domain (covers email, session stats, audio preferences, Supabase sync)
- Complete Data Safety form (account data: email; app activity: session stats; audio settings; third-party: Supabase)
- Complete IARC content rating questionnaire (productivity timer = "Everyone")
- Build signed AAB: `cd android && ./gradlew bundleRelease`
- Submit to Play Console; enroll in Play App Signing (Google retains distribution key; upload key can be reset if lost)
- Monitor first-review cycle; be ready to resubmit with appeal noting functional Haptics + Notifications if rejected for minimum functionality

### Phase Ordering Rationale

- Phase 1 before all others: three CRITICAL pitfalls invalidate all plugin testing if not resolved first; no feature tested before Phase 1 produces a reliable result
- Phase 2 before Phase 3: notification and haptics are simpler integrations that build confidence with the Capacitor plugin pattern before tackling the more complex OAuth + URL scheme work
- Phase 3 before Phase 4: auth must be validated on device before the store submission; a broken sign-in flow would require a post-launch emergency hotfix
- Phase 4 last and atomic: all Play Store assets and compliance items must be complete simultaneously; partial submission is not possible

### Research Flags

Phases with standard, well-documented patterns — skip additional research:
- **Phase 1:** Capacitor project setup follows official docs exactly; all patterns are verified with confirmed GitHub issues
- **Phase 2:** Haptics and LocalNotifications APIs are straightforward; code examples included in ARCHITECTURE.md and PITFALLS.md
- **Phase 4:** Play Store submission requirements are fully documented; checklist covers all known rejection reasons

Phases that may need targeted research during planning:
- **Phase 3 (Deep Links / App Links):** `assetlinks.json` hosting and Android App Links verification can be finicky; official Android docs are the right source but real-world behavior on different Android versions varies. Recommend testing App Links on Android 12+ specifically.
- **Phase 3 (Supabase + Capacitor OAuth flow):** The exact Supabase `signInWithOAuth` + `@capacitor/browser` + custom scheme pattern should be validated against the current Supabase JS SDK docs at implementation time — Supabase auth APIs have changed in minor versions.
- **Phase 2 (Edge-to-edge on Android 15+):** Android 15 enforces edge-to-edge on apps targeting API 35; the `@capacitor/status-bar` interaction with this behavior may need testing on an Android 15 emulator. This is flagged as MEDIUM complexity in FEATURES.md.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official Capacitor 8 docs + npm registry version verification; all version requirements confirmed against Google Play API level requirements |
| Features | HIGH (table stakes) / MEDIUM (differentiators) | Play Store requirements are from official Google docs (HIGH); competitive feature analysis based on App Store observation (MEDIUM) |
| Architecture | HIGH | Core patterns verified via Capacitor official docs + confirmed GitHub issues (#636 localStorage, #6309 Web Worker boundary); build pipeline patterns from official Capacitor troubleshooting guide |
| Pitfalls | HIGH | Critical pitfalls backed by official documentation and confirmed GitHub issues with "not planned" or "known bug" status; signing pitfalls from Google Play Help + Ionic official blog |

**Overall confidence:** HIGH

### Gaps to Address

- **Foreground service implementation detail:** The `@capawesome-team/capacitor-android-foreground-service` plugin is MEDIUM confidence (widely-used community plugin, not official Capacitor). If Doze mode timer drift proves unacceptable in post-launch reviews, the foreground service implementation should be researched specifically at that time.

- **Edge-to-edge behavior on Android 15+:** Android 15's enforcement of edge-to-edge for apps targeting API 35 changes how status bar overlays work. The research flags this as an active GitHub issue (#7951) rather than a fully solved pattern. Plan to test on Android 15 emulator during Phase 1.

- **Supabase session + Capacitor Cookies interaction:** The correct configuration of `CapacitorCookies` for Supabase's session management (especially for OAuth callback handling) was inferred from general Capacitor patterns rather than a Supabase-specific verified source. Validate against current Supabase Capacitor integration docs during Phase 3.

- **Play Store first-review timeline:** Review duration for new apps ranges from hours to days; there is no reliable estimate. Factor buffer time into the v1.1 launch schedule.

---

## Sources

### Primary (HIGH confidence)
- [Capacitor 8 Getting Started](https://capacitorjs.com/docs/getting-started) — install workflow, init, add android
- [Capacitor 8 Migration Guide](https://capacitorjs.com/docs/updating/8-0) — API 36, Gradle 8.14.3, Android Studio 2025.2.1, JDK 21, Node 22
- [Capacitor Configuration Reference](https://capacitorjs.com/docs/config) — `webDir`, `androidScheme`, plugin config
- [Capacitor Android Troubleshooting](https://capacitorjs.com/docs/android/troubleshooting) — service worker + plugin injection conflict
- [Capacitor Storage Guide](https://capacitorjs.com/docs/guides/storage) — localStorage eviction behavior on Android
- [Capacitor Preferences API](https://capacitorjs.com/docs/apis/preferences) — SharedPreferences adapter
- [Capacitor Local Notifications API](https://capacitorjs.com/docs/apis/local-notifications) — `SCHEDULE_EXACT_ALARM`, channels, `allowWhileIdle`
- [Capacitor Haptics API](https://capacitorjs.com/docs/apis/haptics) — ImpactStyle, NotificationType
- [Capacitor Splash Screen & Icons Guide](https://capacitorjs.com/docs/guides/splash-screens-and-icons) — asset generation
- [Capacitor Deep Links Guide](https://capacitorjs.com/docs/guides/deep-links) — App Links, custom URL schemes
- [Capacitor Issue #636](https://github.com/ionic-team/capacitor/issues/636) — localStorage lost on Android (confirmed bug)
- [Capacitor Issue #6309](https://github.com/ionic-team/capacitor/issues/6309) — Web Worker + Capacitor plugins (closed "not planned")
- [Google Play Target API Level Requirements](https://support.google.com/googleplay/android-developer/answer/11926878) — API 35 minimum for new apps; API 36 in 2026
- [Google Play Data Safety Requirements](https://support.google.com/googleplay/android-developer/answer/10787469) — Data Safety form fields
- [Google Play Spam and Minimum Functionality Policy](https://play.google/developer-content-policy/) — WebView wrapper rejection criteria
- [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) — upload key vs distribution key
- [Google OAuth embedded WebView ban](https://developers.googleblog.com/upcoming-security-changes-to-googles-oauth-20-authorization-endpoint-in-embedded-webviews/) — `disallowed_useragent` policy

### Secondary (MEDIUM confidence)
- [Building and Releasing Capacitor Android](https://ionic.io/blog/building-and-releasing-your-capacitor-android-app) — AAB signing, keystore.properties, Gradle signing config
- [Capawesome Android Foreground Service Plugin](https://capawesome.io/plugins/android-foreground-service/) — community plugin for Doze prevention
- [Capacitor Android Edge-to-Edge Issue #7951](https://github.com/ionic-team/capacitor/issues/7951) — active behavior tracking for Android 15+
- [Android Doze Mode Documentation](https://developer.android.com/training/monitoring-device-state/doze-standby) — background execution restrictions
- [MDN Autoplay Policy for Web Audio](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — AudioContext suspension on mobile
- Forest App Play Store listing — competitive feature comparison

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
