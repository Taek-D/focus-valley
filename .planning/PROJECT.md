# Focus Valley

## What This Is

Focus Valley is a gamified Pomodoro timer web app where pixel art plants grow as users focus. It combines a Web Worker-based accurate timer, 10 types of pixel art plants with growth/death mechanics, 8-channel ambient soundscapes, streak/milestone gamification, cloud sync via Supabase, and 3-language i18n (ko/en/ja). Built with React 19 + Vite 7 + Tailwind CSS 4 + Zustand 5, deployed as a PWA.

## Core Value

The timer must be accurate even when the browser tab is inactive, and the plant growth feedback loop must feel rewarding enough to sustain long-term focus habits.

## Requirements

### Validated

- Timer: Web Worker-based 1s TICK with Page Visibility API correction
- Garden: 10 plant types x 6 stages, streak/deep-focus/milestone unlocks
- Audio: 8-channel Web Audio API mixer with crossfade loops (5 free + 3 Pro)
- Stats: Weekly/monthly charts, 13-week heatmap, category breakdown, CSV export, share cards
- Onboarding: Landing screen, 5-step onboarding, 7-step interactive tour
- Auth: Supabase email/Google OAuth + cloud sync with conflict merge
- UX: Dark mode, seasonal/weather aurora, breathing guide, keyboard shortcuts
- i18n: ko/en/ja (380+ keys), PWA with offline support
- Accessibility: WCAG focus-visible, reduced motion, ARIA roles
- Testing: Vitest unit + Playwright E2E

### Active

- [ ] Capacitor Android wrapping and Google Play Store release
- [ ] Native push notifications for session completion
- [ ] Haptic feedback on plant growth stages
- [ ] Native local notifications (timer complete)

### Out of Scope

- iOS deployment — deferred to next milestone after Android validation
- In-app purchases — Pro tier uses existing Supabase subscription system
- React Native rewrite — Capacitor wraps existing web app as-is
- Offline-first native storage — existing localStorage + Supabase sync is sufficient

## Context

- Current deployment: Static site on Vercel (PWA)
- Safari iOS localStorage purge risk identified (7-day inactivity eviction)
- Competitive landscape: Forest (mobile-only, paid), Pomofocus (web-only), 5+ new gamified timers in 2025-2026
- Reddit research indicates strong demand for "Forest alternative" that's free and web-based
- Android first because: lower barrier to Play Store, no Apple Developer Program fee needed initially

## Constraints

- **Tech stack**: Capacitor wrapping existing Vite SPA — no rewrite
- **Platform**: Android first, Google Play Store target
- **Monetization**: No in-app purchases in v1.1, existing Pro preview model
- **Package manager**: npm (project convention)
- **Build**: Must maintain existing `npm run build` + Vite pipeline

## Current Milestone: v1.1 Capacitor Android

**Goal:** Wrap Focus Valley in Capacitor, add essential native capabilities, and publish to Google Play Store.

**Target features:**
- Capacitor project setup and Android build pipeline
- Native push/local notifications for timer completion
- Haptic feedback on key interactions
- App icon, splash screen, store listing assets
- Google Play Store submission and review

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Capacitor over React Native | Preserves existing codebase, minimal changes needed | -- Pending |
| Android first | Lower barrier (no $99/yr Apple fee), faster validation | -- Pending |
| No in-app purchases v1.1 | Validate native UX first, monetize after | -- Pending |

---
*Last updated: 2026-03-24 after milestone v1.1 initialization*
