# Feature Research

**Domain:** Capacitor Android wrapping — Pomodoro/productivity native app (Play Store release)
**Researched:** 2026-03-24
**Confidence:** HIGH (Play Store requirements), MEDIUM (native feature UX patterns), HIGH (Capacitor plugin APIs)

## Context

This research covers ONLY the new features needed for the v1.1 Capacitor Android milestone. The existing web app already ships: Web Worker timer, pixel art garden (10 plants x 6 stages), 8-channel ambient audio, stats/heatmaps, cloud sync (Supabase), i18n (ko/en/ja), PWA, dark mode, onboarding/tour, and WCAG accessibility. Features below are what the Android wrapping layer must add.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels broken or unprofessional on Android.

| Feature | Why Expected | Complexity | Depends On Existing Web Feature |
|---------|--------------|------------|--------------------------------|
| **Local notifications — timer complete** | Every native Pomodoro app alerts when the session ends; without it the app is unusable if the screen turns off | MEDIUM | Web Worker timer (provides session-end event to trigger notification) |
| **App icon (launcher + adaptive)** | Play Store requires it; adaptive icon is Android 8+ standard; missing adaptive = ugly on modern launchers | LOW | None (new asset) |
| **Splash screen** | Every native app has one; Android 12+ enforces OS-managed splash; missing = jarring blank white screen | LOW | None (new asset, `@capacitor/assets` generates it) |
| **Target API level 35 compliance** | Play Store mandates API 35 for new apps submitted after August 2025; Capacitor 7 targets this by default | LOW | None (Capacitor project setup) |
| **Privacy policy URL in store listing** | Google Play requires a privacy policy for all apps, mandatory for Data Safety section | LOW | Existing Supabase auth (already collects email) |
| **Data Safety form completed** | Play Console blocks publish without it; must accurately declare what data is collected | LOW | Existing Supabase auth data model |
| **Content rating questionnaire (IARC)** | Play Console requires it for every app; productivity timer = "Everyone" rating, trivial to complete | LOW | None |
| **Status bar theming** | Matching the app's dark/light mode in the native status bar; mismatched bar looks broken | LOW | Existing dark mode system (passes theme to `@capacitor/status-bar`) |
| **Back button handling (Android)** | Android hardware/gesture back should not exit the app unexpectedly mid-session | LOW | Existing React Router / app navigation |
| **Minimum 2 phone screenshots** | Play Store listing requires at least 2 screenshots at 1080x1920; without them listing is incomplete | LOW | Existing UI (capture from emulator/device) |
| **Short description (80 chars max)** | Play Store listing field; users read this in search results | LOW | None (copywriting) |
| **Full description (4000 chars max)** | Play Store listing field; required for discoverability | LOW | None (copywriting) |

### Differentiators (Competitive Advantage)

Features that elevate the native experience beyond the web app. These align with the core value of "rewarding focus feedback."

| Feature | Value Proposition | Complexity | Depends On Existing Web Feature |
|---------|-------------------|------------|--------------------------------|
| **Haptic feedback on plant growth** | Forest (main competitor) does not offer haptics; tactile confirmation of growth milestone makes the gamification loop visceral and memorable | LOW | Garden Zustand store (growth event callbacks already exist) |
| **Haptic feedback on timer start/stop** | Feels native; differentiates from "just a web page in a frame" experience | LOW | Timer Web Worker tick/state events |
| **Foreground service for timer continuity** | Prevents Android Doze mode from killing the timer; reliable timer = core value promise kept; Forest is frequently reviewed negatively for killed timers | HIGH | Web Worker timer (complementary — worker handles JS timing, foreground service keeps process alive) |
| **Notification with session progress** | Show elapsed/remaining time in the notification; lets users glance at progress without unlocking; competitive with native apps | MEDIUM | Local notifications + timer state |
| **Feature graphic (1024x500)** | Displayed prominently in Play Store search; high-quality graphic dramatically increases click-through rate | LOW | Existing pixel art assets (compose a graphic from them) |
| **Deep links for shared stats** | Existing stats share cards can open the native app instead of the web; bridges web audience to native app | MEDIUM | Existing share card feature + Supabase domain |
| **Edge-to-edge layout** | Modern Android (15+) enforces edge-to-edge; proper inset handling makes the app feel polished vs competitors that have broken layouts | MEDIUM | Existing CSS layout (needs safe-area-inset variables wired to Capacitor plugin) |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Push notifications from server (FCM)** | "Notify users to start a session" or "streak reminder" | Requires FCM setup, server-side scheduling, and notification permission UX redesign; dramatically increases scope; users typically disable these aggressively for productivity apps | Use local scheduled notifications for break reminders instead — same UX value, zero server infrastructure |
| **Always-on display / lock screen widget** | Power users want timer visible without unlocking | Requires `android.permission.WAKE_LOCK` + custom notification style + testing on 50+ OEM skins; high complexity, low conversion impact for v1.1 | Foreground service notification shows timer progress on lock screen already |
| **Android widget (home screen)** | Users want a timer widget | Capacitor has no first-party widget plugin; requires native Kotlin code; major scope increase; does not use existing web UI | Defer to v2 after validating app-market fit |
| **App-to-app blocking (Forest-style)** | Forest blocks other apps during sessions | Requires `PACKAGE_USAGE_STATS` permission + Accessibility Service — Google Play policies flag these as high-risk; frequent policy rejections; OEM differences make it unreliable | In-scope gamification (plant dying on exit) already creates social accountability without needing OS-level blocking |
| **Custom notification sounds** | Users want their own audio for timer end | Requires audio file management, storage permissions, complex UX; very low return for complexity cost | Use system default notification sound; existing Web Audio API ambient sounds play while app is active |
| **In-app purchases (Play Billing)** | Monetize Pro tier natively | PROJECT.md explicitly defers IAP to post-v1.1; Play Billing integration requires Google Play Billing Library, policy compliance, and subscription management | Existing Supabase subscription system + web checkout covers Pro monetization |

---

## Feature Dependencies

```
[Capacitor project setup]
    └──requires──> [Local notifications]
    └──requires──> [Haptic feedback]
    └──requires──> [Status bar theming]
    └──requires──> [Splash screen assets]
    └──requires──> [App icon (adaptive)]

[Local notifications]
    └──requires──> [Timer session-end event] (already exists in Web Worker)
    └──enhances──> [Foreground service]

[Foreground service]
    └──requires──> [Local notifications] (service notification uses same channel)
    └──enhances──> [Timer reliability] (prevents Doze mode kill)

[Play Store listing]
    └──requires──> [App icon]
    └──requires──> [Screenshots (min 2)]
    └──requires──> [Privacy policy URL]
    └──requires──> [Data Safety form]
    └──requires──> [Content rating (IARC)]
    └──requires──> [Target API 35 compliance]

[Deep links]
    └──requires──> [Capacitor project setup]
    └──requires──> [assetlinks.json hosted on focus-valley domain]
    └──enhances──> [Existing share card feature]

[Edge-to-edge layout]
    └──requires──> [Capacitor project setup]
    └──requires──> [@capacitor-community/safe-area OR @capawesome/capacitor-android-edge-to-edge-support]
    └──enhances──> [Status bar theming]
```

### Dependency Notes

- **Foreground service requires local notifications:** Android foreground services must display a persistent notification; this notification channel is shared with the timer-complete local notification, so local notifications must be set up first.
- **Play Store listing requires everything:** No listing item can be published until ALL Play Store requirements are complete (icon, screenshots, privacy policy, data safety, content rating). All must land in the same phase.
- **Edge-to-edge conflicts with naive status bar handling:** Android 15+ forces edge-to-edge on apps targeting API 35; the status bar color/overlay approach changes. These must be handled together, not separately.
- **Haptics and local notifications are independent:** They share only the Capacitor project setup as a prerequisite; can be implemented in parallel.

---

## MVP Definition

This is a subsequent milestone, not a greenfield product. The web app is already feature-complete. The MVP for v1.1 is: "a Play Store listing that passes review and provides a noticeably more native experience than the PWA."

### Launch With (v1.1)

- [ ] **Capacitor project setup + Android build pipeline** — nothing else is possible without this
- [ ] **App icon (adaptive) + splash screen** — required for Play Store and first-launch polish
- [ ] **Local notifications for timer completion** — core native value-add; the #1 user complaint about web-based Pomodoro apps is "I can't hear it ring if the tab is backgrounded"
- [ ] **Haptic feedback on plant growth + timer controls** — LOW complexity, HIGH perceived-native value; makes the app feel non-web
- [ ] **Status bar theming** — LOW complexity; mismatched bar breaks the visual polish
- [ ] **Play Store listing assets** — screenshots, feature graphic, descriptions (all required to publish)
- [ ] **Privacy policy + Data Safety form** — mandatory for Play Console submission
- [ ] **Content rating (IARC questionnaire)** — mandatory; productivity timer = Everyone, 5 minutes to complete
- [ ] **Target API 35 compliance** — mandatory for new app submissions post-August 2025
- [ ] **Back button handling** — prevents accidental app exit during a focus session

### Add After Validation (v1.x)

- [ ] **Foreground service for timer continuity** — HIGH complexity but HIGH value; add when user reviews report timer unreliability (Doze mode kill); not guaranteed to affect all devices
- [ ] **Deep links** — add once share card usage data shows web-to-native referral potential
- [ ] **Edge-to-edge layout hardening** — address if reviews mention layout issues on Android 15+ devices

### Future Consideration (v2+)

- [ ] **Home screen widget** — requires native Kotlin; defer until Capacitor community plugin matures
- [ ] **iOS (Capacitor)** — PROJECT.md defers iOS until Android validation complete
- [ ] **Server push notifications (FCM)** — only justified if retention data shows drop-off without session reminders

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Capacitor project setup | HIGH | MEDIUM | P1 |
| Local notifications (timer complete) | HIGH | MEDIUM | P1 |
| App icon + splash screen | HIGH | LOW | P1 |
| Haptic feedback (growth + controls) | MEDIUM | LOW | P1 |
| Status bar theming | MEDIUM | LOW | P1 |
| Play Store listing (screenshots, copy) | HIGH | LOW | P1 |
| Privacy policy + Data Safety | HIGH | LOW | P1 |
| Content rating (IARC) | HIGH | LOW | P1 |
| Target API 35 compliance | HIGH | LOW | P1 |
| Back button handling | MEDIUM | LOW | P1 |
| Foreground service (Doze prevention) | HIGH | HIGH | P2 |
| Deep links | LOW | MEDIUM | P2 |
| Edge-to-edge layout hardening | MEDIUM | MEDIUM | P2 |
| Feature graphic (store listing) | MEDIUM | LOW | P1 |
| Home screen widget | MEDIUM | HIGH | P3 |
| FCM push notifications | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for v1.1 Play Store launch
- P2: Should have, add when Play Store feedback warrants it
- P3: Defer until v2 or product-market fit confirmed

---

## Play Store Listing Requirements (Comprehensive)

### Technical

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| Target API level | API 35 (Android 15) minimum | Mandatory for new apps submitted after August 2025; Capacitor 7 targets this by default |
| App bundle format | `.aab` (Android App Bundle) | APK no longer accepted for new apps |
| Signing | Upload key + Play App Signing | Google manages distribution key; developer retains upload key |
| Min SDK | API 22 (Android 5.1) or higher | Capacitor 7 default minSdk is 22 |

### Store Listing Assets

| Asset | Specification | Notes |
|-------|---------------|-------|
| App icon | 512x512 PNG, 32-bit, no alpha rounding | Play Store listing icon (different from launcher adaptive icon) |
| Feature graphic | 1024x500 JPG or 24-bit PNG | Shown in search and top-of-listing; high conversion impact |
| Phone screenshots | 1080x1920 min (9:16), JPEG or PNG, min 2, max 8 | Landscape also valid at 1920x1080 |
| Tablet screenshots (7") | 1200x1920 min | Optional but recommended |
| Short description | 80 characters max | Shown in search results |
| Full description | 4000 characters max | Supports basic HTML formatting |
| App title | 30 characters max | "Focus Valley" fits (13 chars) |

### Policy Compliance

| Requirement | What's Needed | Complexity |
|-------------|--------------|------------|
| Privacy policy | Publicly accessible URL; must cover email, sync data, audio prefs | LOW (add page to existing web domain) |
| Data Safety form | Declare: account data (email), app activity (session stats), audio settings; Supabase sync = data shared with third party | LOW (15-minute form) |
| Content rating (IARC) | Complete questionnaire; productivity timer = "Everyone" across all regions | LOW (5 minutes) |
| Developer account | $25 one-time Google Play registration fee | LOW (one-time) |
| CSAE policy (Jan 2026) | Child Safety: app does not target children; no UGC; standard disclosure | LOW (checkbox in policy) |

### App Category

**Recommended category:** Productivity (primary)
Pomodoro/focus timers consistently list under Productivity on Play Store. "Everyone" content rating is standard for this category.

---

## Competitor Feature Analysis

| Feature | Forest (cc.forestapp) | Pomofocus (web-only) | Focus Valley Android v1.1 |
|---------|-----------------------|---------------------|--------------------------|
| Timer reliability (background) | Foreground service | N/A (browser) | Local notification + optional foreground service |
| Gamification | Tree growth, real tree planting | None | Pixel plant garden (10 species, 6 stages) |
| Native notifications | Yes | No | Yes (v1.1 core feature) |
| Haptic feedback | No | No | Yes (differentiator) |
| Ambient sounds | Paid/limited | No | 8 channels, free + Pro |
| Stats/tracking | Basic | Session count | Weekly/monthly charts, heatmap, CSV export |
| Free tier | Paid upfront ($1.99) | Free | Free (Pro preview model) |
| Widget | Yes | No | Deferred to v2 |
| App blocking | Yes | No | Explicitly deferred (policy risk) |
| i18n | Yes | English only | ko/en/ja |
| Play Store listing | Mature, 5M+ installs | N/A | New listing |

---

## Sources

- [Capacitor Local Notifications API](https://capacitorjs.com/docs/apis/local-notifications) — HIGH confidence (official docs)
- [Capacitor Haptics API](https://capacitorjs.com/docs/apis/haptics) — HIGH confidence (official docs)
- [Capacitor Status Bar API](https://capacitorjs.com/docs/apis/status-bar) — HIGH confidence (official docs)
- [Capacitor Splash Screen & Icons Guide](https://capacitorjs.com/docs/guides/splash-screens-and-icons) — HIGH confidence (official docs)
- [Capacitor Deep Links Guide](https://capacitorjs.com/docs/guides/deep-links) — HIGH confidence (official docs)
- [Capawesome Android Foreground Service Plugin](https://capawesome.io/plugins/android-foreground-service/) — MEDIUM confidence (third-party plugin, widely used)
- [Google Play Target API Level Requirements](https://support.google.com/googleplay/android-developer/answer/11926878) — HIGH confidence (official Google docs)
- [Google Play Data Safety Section Requirements](https://support.google.com/googleplay/android-developer/answer/10787469) — HIGH confidence (official Google docs)
- [Google Play Screenshot Requirements 2026 — MobileAction Guide](https://www.mobileaction.co/guide/app-screenshot-sizes-and-guidelines-for-the-google-play-store/) — MEDIUM confidence (third-party, corroborated by multiple sources)
- [App Store Requirements 2026 — Natively.dev](https://natively.dev/articles/app-store-requirements) — MEDIUM confidence (third-party summary)
- [Android Edge-to-Edge Capacitor Issue #7951](https://github.com/ionic-team/capacitor/issues/7951) — MEDIUM confidence (active bug tracker, reflects real behavior)
- Forest App Play Store listing (competitive analysis) — MEDIUM confidence (observed features)
- [Capacitor Target SDK Documentation](https://capacitorjs.com/docs/android/setting-target-sdk) — HIGH confidence (official docs)

---

*Feature research for: Capacitor Android wrapping of Focus Valley Pomodoro app*
*Researched: 2026-03-24*
