# Phase 1: Capacitor Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize Capacitor 8 with Android platform, resolve three CRITICAL infrastructure pitfalls (service worker blocking, localStorage eviction, timer drift), and configure branded splash/status bar. The web app on Vercel remains completely unchanged.

</domain>

<decisions>
## Implementation Decisions

### App Branding
- App icon: Use existing `favicon.svg` (pixel tree art) converted to adaptive icon via @capacitor/assets
- Splash screen: System theme-aware — dark (#0a0f1a) for dark mode, light (#f5f5f7) for light mode, both versions configured
- Play Store app name: "Focus Valley - 집중 타이머"
- Package name convention: follow standard reverse-domain (e.g., `app.focusvalley.android`)

### Data Migration Strategy
- Native app starts fresh — no migration from PWA localStorage
- Web and native data are completely separate
- Users connect data via Supabase cloud sync (login → pull)
- No localStorage-to-Preferences migration logic needed

### Build Workflow
- Two separate build scripts: `npm run build` (web/Vercel) and `npm run build:android` (Capacitor)
- `CAPACITOR_BUILD=true` env var disables VitePWA in the Capacitor build
- Development testing via Android Studio emulator
- Physical device testing before Play Store submission (Phase 4)

### Timer Resume Behavior
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `favicon.svg`: Pixel tree art, can be source for adaptive icon
- `pwa-192x192.png`, `pwa-512x512.png`: Existing raster icons
- `apple-touch-icon.png`: 180x180 icon asset
- Inline splash in `index.html` (lines 59-70): Pattern for branded loading state

### Established Patterns
- Zustand persist: All stores use `persist` middleware with `localStorage` — need platform-conditional storage adapter
- `useTimer.ts`: Web Worker + Page Visibility API correction — needs `appStateChange` supplement
- `vite-plugin-pwa` in `vite.config.ts` (if exists) or via `@config` in index.css — needs conditional disable
- Existing `MotionConfig reducedMotion="user"` in App.tsx wraps all animations

### Integration Points
- `src/lib/supabase.ts`: Already conditionally creates Supabase client — same pattern for Capacitor detection
- `src/hooks/useTimer.ts`: Timer state management — add Capacitor lifecycle hook
- `package.json` scripts section: Add `build:android` script
- `index.html`: Entry point consumed by Capacitor's `webDir: 'dist'`

</code_context>

<specifics>
## Specific Ideas

- Web deploy on Vercel must remain 100% unchanged — Capacitor is purely additive
- The user explicitly wants separate folders/builds, not a unified build
- Emulator-first development, physical device for final validation

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-capacitor-foundation*
*Context gathered: 2026-03-24*
