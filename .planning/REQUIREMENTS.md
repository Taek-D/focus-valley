# Requirements: Focus Valley v1.1 Capacitor Android

**Defined:** 2026-03-24
**Core Value:** Accurate timer + rewarding plant growth feedback loop, now as a native Android app

## v1.1 Requirements

Requirements for Capacitor Android release. Each maps to roadmap phases.

### SETUP (Capacitor Foundation)

- [ ] **SETUP-01**: Capacitor 8 project initialized with Android platform added and working WebView render
- [ ] **SETUP-02**: VitePWA conditionally disabled when CAPACITOR_BUILD=true, web deploy unaffected
- [x] **SETUP-03**: Zustand persist storage replaced with @capacitor/preferences adapter on native (localStorage fallback on web)
- [x] **SETUP-04**: Splash screen, status bar, and adaptive icon configured for Android
- [x] **SETUP-05**: Timer resume drift corrected via App.addListener('appStateChange') on Capacitor

### NATIVE (Native UX)

- [x] **NATIVE-01**: User receives local notification when focus/break session completes
- [x] **NATIVE-02**: User feels haptic feedback on plant growth stage transition, harvest, and session complete
- [x] **NATIVE-03**: User can close BottomSheet panels with Android hardware back button, with app exit confirmation on main screen
- [x] **NATIVE-04**: Ambient sound playback starts correctly in WebView without autoplay policy blocking

### AUTH (Authentication)

- [x] **AUTH-01**: User can sign in with Google OAuth via @capacitor/browser (Chrome Custom Tab) without 403 error

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
| SETUP-01 | Phase 1 | Pending |
| SETUP-02 | Phase 1 | Pending |
| SETUP-03 | Phase 1 | Complete |
| SETUP-04 | Phase 1 | Complete |
| SETUP-05 | Phase 1 | Complete |
| NATIVE-01 | Phase 2 | Complete |
| NATIVE-02 | Phase 2 | Complete |
| NATIVE-03 | Phase 2 | Complete |
| NATIVE-04 | Phase 2 | Complete |
| AUTH-01 | Phase 3 | Complete |
| STORE-01 | Phase 4 | Pending |
| STORE-02 | Phase 4 | Pending |
| STORE-03 | Phase 4 | Pending |
| STORE-04 | Phase 4 | Pending |

**Coverage:**
- v1.1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after roadmap creation*
