---
phase: 03-auth-and-deep-links
plan: "01"
subsystem: auth-infrastructure
tags: [capacitor, supabase, pkce, deep-links, tdd, android]
dependency_graph:
  requires: []
  provides: [pkce-supabase-client, android-deep-link-scheme, auth-test-scaffold]
  affects: [src/hooks/useAuth.ts, src/lib/supabase.ts, android/app/src/main/AndroidManifest.xml]
tech_stack:
  added: ["@capacitor/browser@8.0.3"]
  patterns: [pkce-oauth-flow, custom-url-scheme, vi.hoisted-mock-pattern, tdd-red-phase]
key_files:
  created:
    - src/hooks/useAuth.test.ts
  modified:
    - src/lib/supabase.ts
    - android/app/src/main/AndroidManifest.xml
    - package.json
    - package-lock.json
    - src/hooks/useAuth.ts
decisions:
  - "@capacitor/browser installed for Chrome Custom Tab OAuth (avoids WebView 403)"
  - "PKCE flow with detectSessionInUrl: false prevents race with manual exchangeCodeForSession in Plan 02"
  - "Custom URL scheme (focusvalley://) only — no android:autoVerify (App Links require HTTPS domain)"
  - "handleAuthCallback stub exported from useAuth.ts for compile-time safety; full implementation deferred to Plan 02"
metrics:
  duration: "~6 min"
  completed_date: "2026-03-26"
  tasks_completed: 2
  files_changed: 6
---

# Phase 3 Plan 01: Auth Infrastructure Setup Summary

PKCE-configured Supabase client, focusvalley:// Android deep link scheme, and RED-phase TDD test scaffold for Chrome Custom Tab OAuth flow.

## What Was Built

### Task 1: Install @capacitor/browser, configure PKCE, add intent-filter

- Installed `@capacitor/browser@8.0.3` and synced to Android (now shows in 7 Capacitor plugins list)
- Updated `src/lib/supabase.ts` to pass `{ auth: { flowType: "pkce", detectSessionInUrl: false } }` to `createClient`
- Added second `<intent-filter>` inside `MainActivity` with `android:scheme="focusvalley"` — handles `focusvalley://auth/callback` deep links on Android

### Task 2: Create useAuth.test.ts test scaffold (TDD RED phase)

- Created `src/hooks/useAuth.test.ts` with 8 test cases covering all AUTH-01 behaviors
- Mock pattern follows established `vi.hoisted()` convention (same as `useHaptic.test.ts`)
- Added `handleAuthCallback` stub export to `useAuth.ts` so test file compiles without errors

**RED phase test results (expected):**
- FAILING (5): Tests 1, 2, 4, 6, 7 — require Plan 02 PKCE/Browser implementation
- PASSING (3): Tests 3 (web fallback), 5 (non-auth URL ignore), 8 (error state)

## Decisions Made

1. `detectSessionInUrl: false` — prevents Supabase auto-intercepting the deep link URL before the Plan 02 `handleAuthCallback` function runs (Research Pitfall 1)
2. Custom URL scheme only (`focusvalley://`) — no `android:autoVerify="true"` since that requires HTTPS App Links with domain ownership verification
3. `handleAuthCallback` stub added to `useAuth.ts` now rather than leaving a TS error in the test file — zero runtime impact, stub is replaced entirely in Plan 02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added handleAuthCallback stub to useAuth.ts**
- **Found during:** Task 2 TypeScript compile check
- **Issue:** Test file imports `handleAuthCallback` from `./useAuth` but the function didn't exist, causing `TS2305` compile error
- **Fix:** Added stub `export async function handleAuthCallback(_url: string): Promise<void>` with comment pointing to Plan 02
- **Files modified:** `src/hooks/useAuth.ts`
- **Commit:** fdf49ba

**2. [Rule 1 - Bug] Fixed mock type mismatches in useAuth.test.ts**
- **Found during:** Task 2 TypeScript compile check
- **Issue:** `vi.fn()` infers signature from initial value — `browserAddListener` and `signInWithOAuth` mock overrides had incompatible types
- **Fix:** Used `(mocks.x as any).mockImplementation(...)` pattern to bypass inference conflicts; follows project precedent (eslint-disable comment)
- **Files modified:** `src/hooks/useAuth.test.ts`
- **Commit:** fdf49ba

## Verification Evidence

```
TSC: PASS
PKG: @capacitor/browser found  (@^8.0.3)
SUPABASE: flowType pkce found
SUPABASE: detectSessionInUrl false found
MANIFEST: focusvalley scheme found
TEST: useAuth.test.ts exists (170 lines, 8 test cases)
```

## Self-Check: PASSED

All files verified present on disk. Both task commits confirmed in git log.
