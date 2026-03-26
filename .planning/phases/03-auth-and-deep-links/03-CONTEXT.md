# Phase 3: Auth and Deep Links - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix Google OAuth 403 error by switching from WebView redirect to Chrome Custom Tab via @capacitor/browser. Set up custom URL scheme deep links so share card links open the native app, with web fallback for non-installed devices.

</domain>

<decisions>
## Implementation Decisions

### Deep link strategy
- Custom URL scheme only: `focusvalley://`
- No Android App Links (domain verification) — keep it simple for v1.1
- OAuth callback URL: `focusvalley://auth/callback`
- Share card links use `focusvalley://` scheme
- Fallback for devices without app: redirect to web version (focusvalley.app PWA)

### OAuth flow
- Use `@capacitor/browser` to open Chrome Custom Tab for Google OAuth
- Replace current `signInWithOAuth({ redirectTo: window.location.origin })` with Chrome Custom Tab flow
- On success: auto-close AuthModal + trigger cloud sync (matches current web behavior)
- On failure/cancel: show error in existing AuthModal error UI (red banner, same pattern as email auth errors)
- Loading state stays true during Chrome Custom Tab flow, resets on callback or cancel

### Share link destination
- Deep link from share card opens main screen (timer + plant view)
- No special routing to stats or other views — keep it simple

### Claude's Discretion
- AndroidManifest intent-filter configuration details
- Supabase redirect URL configuration approach
- Token exchange mechanism between Chrome Custom Tab callback and Supabase client
- Error message wording for OAuth cancel vs network failure

</decisions>

<specifics>
## Specific Ideas

- OAuth callback should feel seamless — Chrome Custom Tab closes, user is back in app, logged in
- Web fallback for share links means the existing PWA at focusvalley.app handles the URL gracefully

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useAuth.ts` (Zustand store): Has `signInWithGoogle()` — needs modification to use Chrome Custom Tab instead of WebView redirect
- `AuthModal.tsx`: Already has error display (red banner), loading spinner, Google button — UI changes minimal
- `capacitor.config.ts`: `androidScheme: 'https'` already set, `appId: app.focusvalley.android`
- `supabase` client: Already configured with `signInWithOAuth` — needs redirect URL change

### Established Patterns
- All Capacitor plugin calls gated by `isNativePlatform()` — maintain this pattern
- Web fallback preserved for all native features — Google OAuth on web must continue working
- Error handling via `friendlyError()` in useAuth.ts — extend for OAuth-specific errors

### Integration Points
- `useAuth.ts signInWithGoogle()` — primary modification point
- `AndroidManifest.xml` — add intent-filter for `focusvalley://` scheme
- `capacitor.config.ts` — may need deep link plugin config
- Supabase dashboard — redirect URL must include `focusvalley://auth/callback`

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-auth-and-deep-links*
*Context gathered: 2026-03-26*
