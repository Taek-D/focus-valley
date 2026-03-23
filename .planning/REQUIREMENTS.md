# Requirements: Focus Valley v1.1 Capacitor Android

**Defined:** 2026-03-24
**Core Value:** Accurate timer + rewarding plant growth feedback loop, now as a native Android app

## v1.1 Requirements

Requirements for Capacitor Android release. Each maps to roadmap phases.

### SETUP (Capacitor Foundation)

- [ ] **SETUP-01**: Capacitor 8 project initialized with Android platform added and working WebView render
- [ ] **SETUP-02**: VitePWA conditionally disabled when CAPACITOR_BUILD=true, web deploy unaffected
- [ ] **SETUP-03**: Zustand persist storage replaced with @capacitor/preferences adapter on native (localStorage fallback on web)
- [ ] **SETUP-04**: Splash screen, status bar, and adaptive icon configured for Android
- [ ] **SETUP-05**: Timer resume drift corrected via App.addListener('appStateChange') on Capacitor

### NATIVE (Native UX)

- [ ] **NATIVE-01**: User receives local notification when focus/break session completes
- [ ] **NATIVE-02**: User feels haptic feedback on plant growth stage transition, harvest, and session complete
- [ ] **NATIVE-03**: User can close BottomSheet panels with Android hardware back button, with app exit confirmation on main screen
- [ ] **NATIVE-04**: Ambient sound playback starts correctly in WebView without autoplay policy blocking

### AUTH (Authentication)

- [ ] **AUTH-01**: User can sign in with Google OAuth via @capacitor/browser (Chrome Custom Tab) without 403 error

### STORE (Play Store Release)

- [ ] **STORE-01**: Signed AAB built with release keystore and Gradle signing config
- [ ] **STORE-02**: Play Store listing complete with screenshots, feature graphic, descriptions, and category
- [ ] **STORE-03**: Privacy policy hosted and Data Safety form submitted
- [ ] **STORE-04**: App submitted to Google Play Store and passes review

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### iOS

- **IOS-01**: Capacitor iOS platform added and App Store submission
- **IOS-02**: iOS-specific adaptations (notch, Dynamic Island, etc.)

### Advanced Native

- **ADV-01**: Android Foreground Service for background timer (Doze prevention)
- **ADV-02**: Share intent to receive shared URLs/text
- **ADV-03**: Home screen widget showing current timer status
- **ADV-04**: In-app review prompt after N sessions

## Out of Scope

| Feature | Reason |
|---------|--------|
| React Native rewrite | Capacitor wraps existing web app — no rewrite needed |
| In-app purchases | Pro tier uses existing Supabase subscription, no native billing |
| iOS deployment | Deferred to v1.2 after Android validation |
| Foreground Service | High complexity, defer until user reviews confirm timer reliability issue |
| App-blocking (Forest-style) | Requires Accessibility Services, high Play Store rejection risk |
| CI/CD pipeline | Manual builds sufficient for v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | TBD | Pending |
| SETUP-02 | TBD | Pending |
| SETUP-03 | TBD | Pending |
| SETUP-04 | TBD | Pending |
| SETUP-05 | TBD | Pending |
| NATIVE-01 | TBD | Pending |
| NATIVE-02 | TBD | Pending |
| NATIVE-03 | TBD | Pending |
| NATIVE-04 | TBD | Pending |
| AUTH-01 | TBD | Pending |
| STORE-01 | TBD | Pending |
| STORE-02 | TBD | Pending |
| STORE-03 | TBD | Pending |
| STORE-04 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 14 total
- Mapped to phases: 0
- Unmapped: 14

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after initial definition*
