---
phase: 03-auth-and-deep-links
plan: "02"
subsystem: auth
tags: [capacitor, supabase, pkce, oauth, chrome-custom-tab, deep-links, android]

requires:
  - phase: 03-01
    provides: pkce-supabase-client, android-deep-link-scheme, auth-test-scaffold

provides:
  - chrome-custom-tab-oauth-flow
  - handleAuthCallback-pkce-code-exchange
  - appUrlOpen-deep-link-listener

affects: [src/hooks/useAuth.ts, src/App.tsx]

tech-stack:
  added: []
  patterns: [capacitor-platform-gate, browser-addlistener-before-open, appUrlOpen-cleanup-pattern]

key-files:
  created: []
  modified:
    - src/hooks/useAuth.ts
    - src/App.tsx

key-decisions:
  - "Custom URL scheme host='auth' pathname='/callback' for focusvalley://auth/callback — URL API parses custom scheme differently from HTTPS"
  - "browserFinished listener registered BEFORE Browser.open() to ensure cancellation is always caught"
  - "handleAuthCallback checks host+pathname (not full path) due to custom scheme URL parsing behavior"
  - "appUrlOpen listener gated by isNativePlatform() — web OAuth flow is completely unchanged"

patterns-established:
  - "Platform gate: Capacitor.isNativePlatform() to branch native vs web auth paths"
  - "Listener cleanup: subscription.then(h => h.remove()) matches existing appStateChange pattern in App.tsx"
  - "browserFinished guard: check useAuth.getState().loading before resetting — avoids overwriting state if auth already resolved"

requirements-completed: [AUTH-01]

duration: ~10min
completed: 2026-03-26
---

# Phase 3 Plan 02: Chrome Custom Tab OAuth and Deep Link Wiring Summary

**Chrome Custom Tab OAuth via Browser.open() replaces WebView redirect, PKCE code exchange via handleAuthCallback wired into App.tsx appUrlOpen listener — fixes Android 403 error (AUTH-01)**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-26T05:46:42Z
- **Completed:** 2026-03-26T05:57:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `signInWithGoogle()` now branches on `Capacitor.isNativePlatform()`: native uses Chrome Custom Tab via `Browser.open()` with `skipBrowserRedirect: true` and `focusvalley://auth/callback` redirectTo; web path is unchanged
- `handleAuthCallback(url)` exported as standalone function — parses `focusvalley://auth/callback?code=X`, exchanges PKCE code via `exchangeCodeForSession`, handles cancellations and share link no-ops
- `appUrlOpen` listener added to `App.tsx` — calls `handleAuthCallback` for all deep link URLs, gated by `isNativePlatform()`, follows established cleanup pattern
- All 8 useAuth tests turn GREEN; full suite (59 tests) passes; production build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite signInWithGoogle and extract handleAuthCallback** - `05e695a` (feat)
2. **Task 2: Wire appUrlOpen deep link listener in App.tsx** - `57f36a9` (feat)

**Plan metadata:** (docs commit — see state updates)

## Files Created/Modified

- `src/hooks/useAuth.ts` - Rewrote `signInWithGoogle()` with native/web gate; replaced stub `handleAuthCallback` with full PKCE code exchange implementation
- `src/App.tsx` - Added `appUrlOpen` useEffect listener and `handleAuthCallback` import

## Decisions Made

1. **Custom URL scheme URL parsing** — `new URL("focusvalley://auth/callback")` parses with `host: "auth"`, `pathname: "/callback"` (not `/auth/callback`). Fixed `handleAuthCallback` to check `parsed.host === "auth" && parsed.pathname === "/callback"`.
2. **browserFinished before Browser.open()** — Listener must be registered before opening the tab; if registered after, a very fast cancellation could be missed.
3. **No routing for share links** — `handleAuthCallback` is a no-op for non-auth URLs; main screen already shown per plan decision.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed URL pathname check for custom scheme**
- **Found during:** Task 1 verification (Test 4 failed)
- **Issue:** `new URL("focusvalley://auth/callback")` yields `pathname: "/callback"` not `"/auth/callback"` — custom schemes don't follow HTTPS URL authority parsing
- **Fix:** Changed condition from `parsed.pathname === "/auth/callback"` to `parsed.host === "auth" && parsed.pathname === "/callback"`
- **Files modified:** `src/hooks/useAuth.ts`
- **Verification:** Test 4 (exchangeCodeForSession call) turned GREEN; all 8 tests pass
- **Committed in:** `05e695a` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — incorrect URL parsing assumption)
**Impact on plan:** Required for correctness — without this fix, auth callbacks would never be processed. No scope creep.

## Issues Encountered

None beyond the auto-fixed URL parsing bug above.

## User Setup Required

**External services require manual configuration before native OAuth works end-to-end:**

- **Supabase Dashboard:** Add `focusvalley://auth/callback` to Redirect URLs
  - Location: Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs
  - This is required for the PKCE flow to complete — Supabase rejects callbacks to unlisted URLs

This was documented in the plan's `user_setup` frontmatter. No code changes needed.

## Next Phase Readiness

- AUTH-01 fully implemented: Chrome Custom Tab OAuth flow + PKCE code exchange + deep link listener
- Ready for Phase 4 (release): signing, Play Store submission, release keystore backup
- Supabase dashboard redirect URL must be configured before native OAuth testing

---
*Phase: 03-auth-and-deep-links*
*Completed: 2026-03-26*

## Self-Check: PASSED

- FOUND: src/hooks/useAuth.ts
- FOUND: src/App.tsx
- FOUND: .planning/phases/03-auth-and-deep-links/03-02-SUMMARY.md
- FOUND commit: 05e695a (feat(03-02): rewrite signInWithGoogle for Chrome Custom Tab and add handleAuthCallback)
- FOUND commit: 57f36a9 (feat(03-02): wire appUrlOpen deep link listener in App.tsx)
