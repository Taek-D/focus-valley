# Phase 4: Play Store Release - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a signed AAB, prepare complete Play Store listing assets (screenshots, feature graphic, descriptions), host a privacy policy, submit the Data Safety form, and submit the app to Google Play for review. No new app features — this phase is purely release infrastructure and store compliance.

</domain>

<decisions>
## Implementation Decisions

### Store Listing Content
- App name: "Focus Valley - 포모도로 타이머" (Korean subtitle for search keywords)
- Listing languages: English + Korean (both registered in Play Console)
- Category: Productivity
- Tone: Casual & friendly — matches pixel art aesthetic ("집중할수록 정원이 자라요" style)
- Key selling points to emphasize: (1) Pixel art garden growth gamification, (2) Accurate timer (Web Worker based, works in background)
- Content rating: Everyone (E) — no violence, sexual content, or gambling elements

### Visual Assets
- Screenshots: Real device captures (emulator or physical device), minimum 4 screenshots
- Screenshot screens: Timer + plant growth (main), Garden collection, Dark mode, plus one more at Claude's discretion
- Feature graphic (1024x500): Pixel art centered — arrange pixel plants from the app on themed background
- No mockup frames — raw device captures for screenshots

### Privacy Policy & Data Safety
- Privacy policy hosted on Vercel at the same domain (e.g., /privacy route or static page)
- Data Safety form declares ALL of the following:
  - Personal info: Email + name (collected via Google OAuth, stored in Supabase)
  - App activity: Garden/session/todo data synced to Supabase
  - App usage analytics: Session events tracked via Google Analytics 4
  - Crash logs: Device/OS info + error stacks collected by Sentry
- Data deletion: In-app account deletion button in settings (requires implementation)
- Data encryption in transit: Yes (HTTPS for all services)
- Data sharing: None — all data used only for app functionality and crash reporting

### Signing & Versioning
- Use Google Play App Signing (Google manages deploy key; upload key stays local)
- Generate upload keystore locally, enroll in Play App Signing during first upload
- versionCode: 1 (first release)
- versionName: "1.1.0" (aligns with milestone v1.1 Capacitor Android)
- ProGuard/R8 minification: Disabled (minifyEnabled=false) — Capacitor WebView app, JS bundle is the payload

### Claude's Discretion
- Exact privacy policy wording and structure
- 4th screenshot choice (sound mixer, statistics, or other)
- Feature graphic exact layout and color palette
- Short description and full description copywriting (within decided tone and selling points)
- Gradle signing config structure
- Account deletion UI placement and flow within existing Settings panel

</decisions>

<specifics>
## Specific Ideas

- App name uses Korean subtitle for domestic search discoverability while keeping "Focus Valley" as the global brand
- Privacy policy should cover all 4 data categories clearly: auth data, sync data, analytics, crash logs
- Account deletion button is a NEW implementation requirement for Data Safety compliance — add to Settings panel
- Keystore backup is flagged as HIGH concern in STATE.md — Google Play App Signing mitigates this risk

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Adaptive icon already configured: `ic_launcher` + `ic_launcher_round` + background PNGs in mipmap directories
- Pixel plant SVGs in `src/components/ui/pixel-plants.tsx` — could be exported for feature graphic
- App already has dark mode toggle (`useDarkMode` hook) — screenshot both themes

### Established Patterns
- applicationId: `app.focusvalley.android` (set in build.gradle)
- Current versionCode=1, versionName="1.0" in build.gradle — needs update to "1.1.0"
- Vercel deployment configured (`vercel.json`) — privacy policy can be added as a route
- Supabase auth via `useAuth.ts` — account deletion needs Supabase user.delete() call
- Settings accessible via `AppPanels.tsx` panel system with `BottomSheet.tsx` container

### Integration Points
- `android/app/build.gradle`: Add signingConfigs block for release keystore
- `android/gradle.properties` or `keystore.properties`: Store keystore path/passwords (gitignored)
- Vercel project: Add privacy policy page/route
- `src/hooks/useAuth.ts`: Add account deletion method
- Settings UI in `AppPanels.tsx` or `TimerSettings.tsx`: Add delete account button

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-play-store-release*
*Context gathered: 2026-03-26*
