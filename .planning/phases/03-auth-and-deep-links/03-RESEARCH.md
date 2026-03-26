# Phase 3: Auth and Deep Links - Research

**Researched:** 2026-03-26
**Domain:** Capacitor OAuth / Chrome Custom Tab / Supabase PKCE / Android Deep Links
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Custom URL scheme only: `focusvalley://`
- No Android App Links (domain verification) — keep it simple for v1.1
- OAuth callback URL: `focusvalley://auth/callback`
- Share card links use `focusvalley://` scheme
- Fallback for devices without app: redirect to web version (focusvalley.app PWA)
- Use `@capacitor/browser` to open Chrome Custom Tab for Google OAuth
- Replace current `signInWithOAuth({ redirectTo: window.location.origin })` with Chrome Custom Tab flow
- On success: auto-close AuthModal + trigger cloud sync (matches current web behavior)
- On failure/cancel: show error in existing AuthModal error UI (red banner, same pattern as email auth errors)
- Loading state stays true during Chrome Custom Tab flow, resets on callback or cancel
- Deep link from share card opens main screen (timer + plant view) — no special routing

### Claude's Discretion
- AndroidManifest intent-filter configuration details
- Supabase redirect URL configuration approach
- Token exchange mechanism between Chrome Custom Tab callback and Supabase client
- Error message wording for OAuth cancel vs network failure

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign in with Google OAuth via @capacitor/browser (Chrome Custom Tab) without 403 error | @capacitor/browser open() + PKCE signInWithOAuth + appUrlOpen exchangeCodeForSession pattern fully documented below |
</phase_requirements>

---

## Summary

The 403 `disallowed_useragent` error occurs because Google OAuth explicitly rejects requests from Android WebViews, which it identifies by the user-agent string. Chrome Custom Tabs present as a full Chrome browser session and are Google's approved mechanism for OAuth on Android. The fix requires two parts: (1) opening the OAuth URL in `@capacitor/browser` instead of letting `signInWithOAuth` redirect the WebView, and (2) listening for `App.addListener('appUrlOpen')` to capture the callback URL when Chrome Custom Tab redirects back to `focusvalley://auth/callback`, then calling `supabase.auth.exchangeCodeForSession()` to complete the PKCE handshake.

The share card deep link feature is a simpler addition on top of the same infrastructure: the `AndroidManifest.xml` intent-filter for `focusvalley://` handles both OAuth callbacks and share links. The `appUrlOpen` listener distinguishes by path — `/auth/callback` routes to session exchange, any other path is a share link (no-op in v1.1 since deep links open the main screen which is already the default).

This phase touches exactly three files: `useAuth.ts` (OAuth logic rewrite), `AndroidManifest.xml` (intent-filter addition), and `supabase.ts` (PKCE client config). No new UI components are needed.

**Primary recommendation:** Use PKCE flow (`flowType: 'pkce'`) with `exchangeCodeForSession()` — not the legacy implicit flow with hash tokens. PKCE is more secure, is the current Supabase default, and the code param arrives cleanly in the URL query string rather than the hash fragment.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@capacitor/browser` | `^8.0.0` (match other Capacitor 8 plugins) | Opens Chrome Custom Tab for OAuth | Google's approved OAuth flow on Android; avoids 403 WebView rejection |
| `@capacitor/app` | `^8.0.1` (already installed) | `addListener('appUrlOpen')` to receive deep link callbacks | Already in project; provides the URL when Chrome Custom Tab redirects back |
| `@supabase/supabase-js` | `^2.95.3` (already installed) | `exchangeCodeForSession()` to complete PKCE handshake | Already in project; PKCE exchange is a built-in auth method |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@capacitor/core` `Capacitor.isNativePlatform()` | `^8.2.0` (already installed) | Gate all native-only code paths | Maintain established project pattern — web OAuth continues working unchanged |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PKCE flow | Implicit flow (hash tokens) | Implicit is simpler but deprecated; hash fragments are fragile across redirects; PKCE is the Supabase default and more secure |
| Custom URL scheme `focusvalley://` | Android App Links (HTTPS) | App Links require domain verification and `.well-known/assetlinks.json` hosting; custom scheme is simpler for v1.1 |
| `@capacitor/browser` | `@capacitor-community/oauth2` | Community plugin adds dependency weight; `@capacitor/browser` is the official first-party plugin and sufficient for this use case |

**Installation:**
```bash
npm install @capacitor/browser
npx cap sync android
```

---

## Architecture Patterns

### Recommended Project Structure
No new files or folders needed. Modifications are isolated to:
```
src/
  hooks/useAuth.ts          # signInWithGoogle() rewrite + appUrlOpen listener
  lib/supabase.ts           # Add flowType: 'pkce' to createClient options
android/app/src/main/
  AndroidManifest.xml       # Add intent-filter for focusvalley:// scheme
```

### Pattern 1: PKCE OAuth via Chrome Custom Tab

**What:** `signInWithOAuth` generates the OAuth URL (does not redirect). We pass that URL to `Browser.open()` which opens Chrome Custom Tab. On callback, `appUrlOpen` fires with `focusvalley://auth/callback?code=...`. We call `exchangeCodeForSession(code)` to get the session.

**When to use:** Always on native platform (`isNativePlatform() === true`). Web path keeps existing behavior unchanged.

**Key insight:** `signInWithOAuth` with `skipBrowserRedirect: true` returns `{ data: { url } }` — the OAuth URL to open. Without `skipBrowserRedirect`, Supabase tries to redirect the WebView directly, which triggers the 403.

**Example:**
```typescript
// Source: Supabase docs + capacitorjs.com/docs/apis/browser + verified community patterns

// --- supabase.ts ---
export const supabase = isSupabaseConfigured
    ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
        auth: {
            flowType: 'pkce',
            detectSessionInUrl: false, // We handle the URL manually via appUrlOpen
        },
    })
    : null;

// --- useAuth.ts signInWithGoogle() ---
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

signInWithGoogle: async () => {
    if (!supabase) {
        set({ loading: false, error: SUPABASE_CONFIG_ERROR });
        return;
    }
    set({ loading: true, error: null });

    if (!Capacitor.isNativePlatform()) {
        // Web: existing behavior unchanged
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin },
        });
        if (error) set({ loading: false, error: friendlyError(error) });
        // Loading stays true — redirect will happen
        return;
    }

    // Native: open Chrome Custom Tab
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'focusvalley://auth/callback',
            skipBrowserRedirect: true,
        },
    });
    if (error || !data.url) {
        set({ loading: false, error: friendlyError(error ?? new Error('No OAuth URL returned')) });
        return;
    }

    await Browser.open({ url: data.url });
    // loading stays true — appUrlOpen listener will complete or reset it
},
```

### Pattern 2: `appUrlOpen` Handler in App.tsx

**What:** A `useEffect` in `App.tsx` (gated by `isNativePlatform()`) listens for all deep link opens. It dispatches to auth completion or share link handling based on URL path.

**When to use:** Once, on app mount. Lives in `App.tsx` alongside the other Capacitor effect hooks.

**Example:**
```typescript
// Source: capacitorjs.com/docs/apis/app + supabase.com/docs/reference/javascript/auth-exchangecodeforsession

import { App as CapacitorApp } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Inside App() component:
useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const subscription = CapacitorApp.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
        const url = new URL(event.url);

        if (url.pathname === '/auth/callback') {
            // PKCE: code is in query param, not hash
            const code = url.searchParams.get('code');
            if (code && supabase) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    useAuth.setState({ loading: false, error: 'Sign-in failed. Please try again.' });
                } else {
                    // onAuthStateChange fires automatically — closes modal via useAuth
                    useAuth.setState({ loading: false });
                }
            } else {
                // No code — user cancelled or error
                useAuth.setState({ loading: false, error: null });
            }
        }
        // focusvalley:// share links: no routing needed — main screen is already shown
    });

    return () => { subscription.then((h) => h.remove()); };
}, []);
```

### Pattern 3: AndroidManifest.xml Intent-Filter for Custom URL Scheme

**What:** Declares `focusvalley://` as a scheme this app handles. Android routes any URL starting with `focusvalley://` to this app.

**When to use:** Required for both OAuth callback and share card deep links.

**Example:**
```xml
<!-- Source: capacitorjs.com/docs/guides/deep-links -->
<!-- Add inside the existing <activity android:name=".MainActivity"> element -->
<!-- launchMode="singleTask" is already set — required for deep links to work correctly -->

<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="focusvalley" />
</intent-filter>
```

Note: For custom URL schemes (non-HTTPS), `android:autoVerify="true"` is NOT needed and should be omitted — it only applies to App Links (HTTPS scheme).

### Pattern 4: Auth State Cleanup on `browserFinished`

**What:** If the user closes Chrome Custom Tab without completing auth, `browserFinished` fires on Android. Reset `loading` to prevent the UI from being stuck in loading state.

**When to use:** Only on native. Add listener alongside `Browser.open()` call.

**Example:**
```typescript
// Source: capacitorjs.com/docs/apis/browser
import { Browser } from '@capacitor/browser';

// When opening the browser:
const browserHandle = await Browser.addListener('browserFinished', () => {
    // User closed the tab without completing OAuth
    // Only reset if still loading (appUrlOpen may have already resolved)
    if (useAuth.getState().loading) {
        useAuth.setState({ loading: false, error: null });
    }
    void browserHandle.remove();
});
await Browser.open({ url: data.url });
```

### Anti-Patterns to Avoid

- **Using `skipBrowserRedirect: false` (default) on native:** Supabase redirects the WebView directly, triggering the 403.
- **Using implicit flow (hash fragment tokens):** `setSession({ access_token, refresh_token })` from hash params is the old pattern. PKCE uses `exchangeCodeForSession(code)` from query params — do not mix them.
- **Setting `detectSessionInUrl: true` without a router:** This tells Supabase to automatically handle URL params on page load. On Capacitor native (no page reload), this is a no-op or causes double-processing. Set it to `false` and handle manually.
- **Putting the `appUrlOpen` listener inside `useAuth.ts`:** The listener lives in `App.tsx` alongside the other Capacitor lifecycle hooks, matching the existing codebase pattern. `useAuth.ts` exposes state setters; `App.tsx` wires the Capacitor event.
- **Adding `android:autoVerify="true"` for custom scheme:** This attribute is for HTTPS App Links only. For `focusvalley://`, omit it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Opening external browser | Custom intent via WebView JS bridge | `@capacitor/browser` Browser.open() | Handles Chrome Custom Tab lifecycle, `browserFinished` event, cross-platform fallback |
| PKCE code verifier/challenge | Custom crypto + storage | `supabase.auth.signInWithOAuth` + `exchangeCodeForSession` | Supabase client handles PKCE code verifier generation, storage, and exchange automatically |
| URL parsing for deep link | Manual string splitting | `new URL(event.url)` + `.searchParams.get('code')` | Native URL API — available in all modern WebViews, handles encoding |
| Loading state reset on cancel | Polling or timeout | `Browser.addListener('browserFinished')` | Official event from `@capacitor/browser`, fires reliably on tab close |

**Key insight:** Supabase's PKCE implementation stores the code verifier in the configured storage adapter (localStorage/Preferences) automatically. The entire cryptographic handshake is handled — you only supply the `code` from the callback URL.

---

## Common Pitfalls

### Pitfall 1: `detectSessionInUrl: true` Double-Processing
**What goes wrong:** If `detectSessionInUrl` is left `true` (Supabase default), the client tries to parse `focusvalley://auth/callback?code=...` from the current URL on page load. On native this does nothing (no real URL bar), but it can cause race conditions with the manual `exchangeCodeForSession` call.
**Why it happens:** Supabase's default client config assumes a web SPA where URL changes are meaningful.
**How to avoid:** Set `detectSessionInUrl: false` in the Supabase client config when targeting Capacitor native.
**Warning signs:** Auth state flickers, or `exchangeCodeForSession` returns "code already used" error.

### Pitfall 2: `loading` State Stuck After Tab Close
**What goes wrong:** User opens Chrome Custom Tab, closes it without signing in. `loading` remains `true` in `useAuth` — the Google button stays disabled, the spinner spins indefinitely.
**Why it happens:** The `appUrlOpen` listener only fires on successful redirect. A cancelled flow produces no callback.
**How to avoid:** Register `Browser.addListener('browserFinished')` before `Browser.open()`. In the handler, check `useAuth.getState().loading` and reset to `false` if still loading.
**Warning signs:** After tapping the back button in Chrome Custom Tab, the auth modal shows a permanent loading spinner.

### Pitfall 3: Supabase Dashboard Redirect URL Not Configured
**What goes wrong:** OAuth flow completes in Chrome Custom Tab but Google redirects to a "redirect_uri_mismatch" error page instead of `focusvalley://auth/callback`.
**Why it happens:** Supabase's OAuth relay only allows redirect URLs that are explicitly allowlisted in the Supabase dashboard under Authentication > URL Configuration.
**How to avoid:** Add `focusvalley://auth/callback` to the "Redirect URLs" list in the Supabase project dashboard before testing. This is a manual dashboard step, not a code change.
**Warning signs:** Chrome Custom Tab shows a Supabase error page with "Invalid redirect URI".

### Pitfall 4: `npx cap sync` Not Run After Installing `@capacitor/browser`
**What goes wrong:** `Browser` is imported in JS but Android throws `Plugin not found: Browser` at runtime.
**Why it happens:** Capacitor native bridges must be synced after installing new plugins.
**How to avoid:** Always run `npm install @capacitor/browser && npx cap sync android` together. The `build:android` script in package.json already runs `cap sync` — use it.
**Warning signs:** Runtime error in Android Logcat: `No plugin found for selector Browser`.

### Pitfall 5: Intent-Filter Added Outside `<activity>` Element
**What goes wrong:** Deep links not recognized — Android does not route `focusvalley://` URLs to the app.
**Why it happens:** Intent-filters must be children of an `<activity>` element, not `<application>`.
**How to avoid:** Add the intent-filter inside the existing `<activity android:name=".MainActivity">` block, as a sibling to the existing MAIN/LAUNCHER intent-filter.
**Warning signs:** Tapping a `focusvalley://` link on the device opens the browser or shows "No app to handle this URL".

---

## Code Examples

Verified patterns from official sources:

### Install and Sync
```bash
# Source: capacitorjs.com/docs/apis/browser
npm install @capacitor/browser
npx cap sync android
```

### Supabase Client with PKCE
```typescript
// Source: supabase.com/docs/guides/auth/sessions/pkce-flow
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
    },
});
```

### signInWithOAuth with skipBrowserRedirect
```typescript
// Source: supabase.com/docs/reference/javascript/auth-signinwithoauth
const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: 'focusvalley://auth/callback',
        skipBrowserRedirect: true,  // Returns URL instead of redirecting
    },
});
// data.url is the full Google OAuth URL to open
await Browser.open({ url: data.url });
```

### exchangeCodeForSession
```typescript
// Source: supabase.com/docs/reference/javascript/auth-exchangecodeforsession
const code = new URL(event.url).searchParams.get('code');
if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // data.session contains the user session
}
```

### Browser.open and browserFinished
```typescript
// Source: capacitorjs.com/docs/apis/browser
import { Browser } from '@capacitor/browser';

const handle = await Browser.addListener('browserFinished', () => {
    // Chrome Custom Tab was closed
    void handle.remove();
});
await Browser.open({ url: oauthUrl });
```

### AndroidManifest.xml Custom Scheme Intent-Filter
```xml
<!-- Source: capacitorjs.com/docs/guides/deep-links -->
<!-- Inside <activity android:name=".MainActivity"> -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="focusvalley" />
</intent-filter>
```

### URLOpenListenerEvent type (from installed @capacitor/app)
```typescript
// Source: node_modules/@capacitor/app/dist/esm/definitions.d.ts
interface URLOpenListenerEvent {
    url: string;               // Full URL, e.g. "focusvalley://auth/callback?code=..."
    iosSourceApplication?: any;
    iosOpenInPlace?: boolean;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Implicit flow: `setSession({ access_token, refresh_token })` from hash fragment | PKCE flow: `exchangeCodeForSession(code)` from query param | Supabase JS v2 (2022), PKCE default in v2.x | Tokens never exposed in URL, more secure, better for mobile |
| `signInWithOAuth` redirects WebView | `signInWithOAuth` with `skipBrowserRedirect: true` + `Browser.open()` | Google policy enforcement (2019+) | Eliminates 403 disallowed_useragent; Google requires external browser for OAuth |
| App Links (HTTPS deep links) | Custom URL scheme (`focusvalley://`) for v1.1 | N/A (choice) | No domain verification needed; simpler setup; works offline |

**Deprecated/outdated:**
- Implicit OAuth flow via hash tokens: functional but not recommended; PKCE is the Supabase standard
- `window.location.origin` as `redirectTo` on native: does not produce a URL the native app can intercept

---

## Open Questions

1. **Supabase dashboard access**
   - What we know: `focusvalley://auth/callback` must be added as an allowed redirect URL
   - What's unclear: Whether this has already been added during previous development
   - Recommendation: Verify as first step in Wave 0; if missing, add it before any testing

2. **`detectSessionInUrl: false` — web impact**
   - What we know: Setting `detectSessionInUrl: false` disables automatic URL-based session restoration on web
   - What's unclear: Whether the current web OAuth flow relies on this (web redirects to `window.location.origin` which contains the hash/code)
   - Recommendation: On web, Supabase handles the implicit flow from the hash automatically even with `detectSessionInUrl: false` because `signInWithOAuth` triggers a full page redirect. Verify the web flow still works after the supabase.ts change. If broken, use platform-conditional client config.

3. **Share card link format**
   - What we know: Share links use `focusvalley://` scheme; no routing to specific views
   - What's unclear: What the exact URL format is (e.g., `focusvalley://share/card-id` vs `focusvalley://`)
   - Recommendation: Since the decision is "open main screen only", a bare `focusvalley://` is sufficient. Any `focusvalley://` URL that doesn't match `/auth/callback` is treated as a share link no-op.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vite.config.ts` (test section, `environment: "node"`) |
| Quick run command | `npx vitest run src/hooks/useAuth.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `signInWithGoogle()` calls `supabase.signInWithOAuth` with `skipBrowserRedirect: true` on native | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |
| AUTH-01 | `signInWithGoogle()` calls `Browser.open()` with the returned OAuth URL on native | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |
| AUTH-01 | `signInWithGoogle()` uses web fallback (`window.location.origin` redirectTo) on non-native | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |
| AUTH-01 | `appUrlOpen` with `/auth/callback?code=X` calls `exchangeCodeForSession('X')` | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |
| AUTH-01 | `browserFinished` resets `loading` to false when still loading | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |
| AUTH-01 | `appUrlOpen` with non-auth URL (share link) does not call `exchangeCodeForSession` | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |

Note: The `appUrlOpen` handler lives in `App.tsx` — the unit tests for that integration belong in `useAuth.test.ts` (testing the exposed `signInWithGoogle` and any extracted handler function), following the `resolveBackAction` extractable-pure-function pattern from `useBackButton.ts`.

### Sampling Rate
- **Per task commit:** `npx vitest run src/hooks/useAuth.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/useAuth.test.ts` — covers all AUTH-01 test cases above
- [ ] Vitest mock pattern: `vi.mock('@capacitor/browser', () => ({ Browser: { open: vi.fn(), addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })) } }))`
- [ ] Vitest mock pattern: `vi.mock('@supabase/supabase-js', ...)` with `signInWithOAuth` returning `{ data: { url: 'https://mock-oauth-url' }, error: null }`

*(All are new — no existing useAuth.test.ts in codebase)*

---

## Sources

### Primary (HIGH confidence)
- `capacitorjs.com/docs/apis/browser` — Browser.open(), addListener('browserFinished'), install command, platform notes
- `capacitorjs.com/docs/guides/deep-links` — AndroidManifest intent-filter pattern, App.addListener('appUrlOpen'), launchMode note
- `supabase.com/docs/reference/javascript/auth-exchangecodeforsession` — method signature, authCode parameter
- `supabase.com/docs/guides/auth/sessions/pkce-flow` — flowType: 'pkce', detectSessionInUrl config
- `node_modules/@capacitor/app/dist/esm/definitions.d.ts` — URLOpenListenerEvent type definition (local, authoritative)

### Secondary (MEDIUM confidence)
- `forum.ionicframework.com/t/setting-up-supabase-google-oauth-with-capacitor-android/234165` — Confirmed appUrlOpen pattern for Supabase+Capacitor; note: some advice is for older implicit flow
- `cjweed.com/capacitor-supabase-social-auth-react/` — Practical implementation walkthrough; aligned with official docs
- `supabase.com/docs/reference/javascript/auth-signinwithoauth` — `skipBrowserRedirect` option confirmed

### Tertiary (LOW confidence)
- WebSearch community patterns (2024-2025): multiple sources confirm the PKCE + Browser.open() + appUrlOpen pattern is the current standard approach

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `@capacitor/browser` is official first-party plugin; APIs verified against official docs
- Architecture: HIGH — PKCE pattern confirmed by Supabase docs; `appUrlOpen` type verified against installed package; pattern matches existing codebase conventions
- Pitfalls: HIGH — `detectSessionInUrl`, `browserFinished` cancel handling, and Supabase dashboard config are directly derived from official API behavior
- Deep link XML: HIGH — exact pattern from official Capacitor deep links guide; `launchMode="singleTask"` already present in project

**Research date:** 2026-03-26
**Valid until:** 2026-06-26 (Capacitor 8 APIs stable; Supabase auth API stable)
