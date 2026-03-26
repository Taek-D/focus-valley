# Roadmap: Focus Valley v1.1 Capacitor Android

## Overview

Wrap the existing Focus Valley PWA in Capacitor 8 and ship to Google Play Store. The web app is feature-complete — this milestone adds only a thin native integration layer. Four phases deliver the work in strict dependency order: foundation infrastructure that makes all plugin testing valid, native capability integration (notifications + haptics), OAuth fix and deep link wiring, then Play Store submission.

## Milestones

- 🚧 **v1.1 Capacitor Android** - Phases 1-4 (in progress)

## Phases

### 🚧 v1.1 Capacitor Android (In Progress)

**Milestone Goal:** Wrap Focus Valley in Capacitor 8, add essential native capabilities (notifications, haptics), fix Google OAuth, and publish a signed AAB to Google Play Store.

- [x] **Phase 1: Capacitor Foundation** - Initialize Capacitor 8, fix critical infrastructure pitfalls (service worker, storage, timer drift), configure splash/status bar
- [ ] **Phase 2: Native Capabilities** - Local notifications for session completion, haptic feedback on plant growth, audio autoplay fix for Android WebView
- [x] **Phase 3: Auth and Deep Links** - Google OAuth via Chrome Custom Tab (fixes 403 disallowed_useragent), custom URL scheme for deep link routing
- [ ] **Phase 4: Play Store Release** - Signed AAB, store listing assets, privacy policy, Data Safety form, submission and review

## Phase Details

### Phase 1: Capacitor Foundation
**Goal**: The existing SPA runs correctly inside Android WebView with reliable storage, accurate timer, and polished launch experience
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, SETUP-05
**Success Criteria** (what must be TRUE):
  1. Running `npm run build:android` produces a working APK that loads the app in Android WebView without white flash or service worker conflicts
  2. User data (garden, streaks, settings) survives app kill and relaunch — Zustand persist reads from SharedPreferences, not localStorage
  3. Timer continues counting accurately after the screen locks for 5+ minutes and the device resumes — drift is corrected via wall-clock comparison
  4. Splash screen displays branded background color on cold start; status bar matches current light/dark theme
  5. Pressing the Android hardware back button during an active session does not exit the app
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Initialize Capacitor 8 with Android platform, conditionally disable VitePWA for native builds
- [x] 01-02-PLAN.md — Platform-conditional storage adapter (Preferences on native) and timer drift correction (appStateChange)
- [x] 01-03-PLAN.md — Splash screen, status bar theming, and adaptive icon configuration

### Phase 2: Native Capabilities
**Goal**: The app feels native through timer-completion notifications and haptic feedback, and ambient audio starts correctly without user workarounds
**Depends on**: Phase 1
**Requirements**: NATIVE-01, NATIVE-02, NATIVE-03, NATIVE-04
**Success Criteria** (what must be TRUE):
  1. User receives a local notification when a focus or break session completes, even when the screen is off or the app is in the background
  2. User feels a distinct haptic pulse when a plant advances to the next growth stage, when a session completes, and when tapping timer start/stop
  3. Pressing the Android hardware back button closes open BottomSheet panels; pressing it on the main screen shows an exit confirmation dialog
  4. Ambient sounds begin playing on the first user tap without requiring the user to interact a second time to unmute
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — Install notification and haptics packages, replace useNotification with native support, create useHaptic hook
- [x] 02-02-PLAN.md — Extend useAppPanels with LIFO open-stack, rewrite useBackButton with confirmations, add resumeAudio to useAudioMixer
- [x] 02-03-PLAN.md — Wire haptics, back button, and audio resume into App.tsx and session flow; verify on device

### Phase 3: Auth and Deep Links
**Goal**: Existing Google-signed users can log in without error and share card links open the native app instead of the browser
**Depends on**: Phase 2
**Requirements**: AUTH-01
**Success Criteria** (what must be TRUE):
  1. User can tap "Sign in with Google", complete the OAuth flow in Chrome Custom Tab, and return to the app authenticated — no 403 disallowed_useragent error
  2. Tapping a Focus Valley share card link on an Android device that has the app installed opens the native app directly
**Plans:** 2/2 plans executed

Plans:
- [x] 03-01-PLAN.md — Install @capacitor/browser, configure Supabase PKCE flow, add focusvalley:// intent-filter, create auth test scaffold
- [x] 03-02-PLAN.md — Rewrite signInWithGoogle for Chrome Custom Tab, extract handleAuthCallback, wire appUrlOpen listener

### Phase 4: Play Store Release
**Goal**: A signed AAB is submitted to Google Play and the listing passes review with complete assets, privacy policy, and Data Safety form
**Depends on**: Phase 3
**Requirements**: STORE-01, STORE-02, STORE-03, STORE-04
**Success Criteria** (what must be TRUE):
  1. `./gradlew bundleRelease` produces a signed AAB that installs and runs correctly on a physical device
  2. Play Store listing has app title, short description, full description, minimum 2 phone screenshots, and feature graphic
  3. Privacy policy is live at a public URL and the Data Safety form is submitted in Play Console
  4. App passes Google Play review and reaches "Published" status in the Play Console
**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — Release signing config, account deletion (Edge Function + UI), privacy policy update
- [ ] 04-02-PLAN.md — Store listing text assets, Play Console submission

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Capacitor Foundation | 3/3 | Complete | 2026-03-25 |
| 2. Native Capabilities | 3/3 | Complete | 2026-03-26 |
| 3. Auth and Deep Links | 2/2 | Complete | 2026-03-26 |
| 4. Play Store Release | 0/2 | Not started | - |

---
*Roadmap created: 2026-03-24*
*Milestone: v1.1 Capacitor Android*
