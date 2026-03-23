# External Integrations

**Analysis Date:** 2026-03-23

## APIs & External Services

**Authentication:**
- Supabase Auth - User sign-up, email/password, Google OAuth
  - SDK: @supabase/supabase-js 2.95.3
  - Client initialization: `src/lib/supabase.ts`
  - Auth hook: `src/hooks/useAuth.ts`

**Analytics:**
- Google Analytics 4 - Event tracking and session monitoring
  - Measurement ID: Configured via `VITE_GA_MEASUREMENT_ID`
  - Enabled conditionally: Production-only when `VITE_ENABLE_ANALYTICS=true`
  - Implementation: `src/lib/analytics.ts`
  - Script source: `https://www.googletagmanager.com/gtag/js`

**Error Tracking & Monitoring:**
- Sentry - Real-time error tracking and performance monitoring
  - SDK: @sentry/react 10.38.0
  - DSN: `VITE_SENTRY_DSN` environment variable
  - Initialization: `src/main.tsx`
  - Integrations: Browser tracing, session replay (masked)
  - Sampling: 10% session traces, 100% on-error replays

## Data Storage

**Databases:**
- Supabase PostgreSQL - User profiles, garden states, sync data
  - Client: @supabase/supabase-js (official SDK)
  - Connection: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Initialization: `src/lib/supabase.ts` (conditional - optional configuration)

**Local Storage:**
- Browser localStorage - Garden state persistence
  - Key: `focus-valley-garden` (Zustand persist middleware)
  - Fallback when Supabase not configured

**File Storage:**
- Local filesystem only - No cloud file storage
- CSV export via browser download API

**Caching:**
- Service Worker with Workbox - PWA caching strategy
  - Google Fonts: `CacheFirst` (365-day expiration)
  - Static pages: `NetworkFirst` (7-day expiration)
  - Configured in `vite.config.ts`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Handles all user authentication
  - Implementation: `src/hooks/useAuth.ts` (Zustand store)
  - Methods:
    - Email/password sign-up: `signUpWithEmail(email, password)`
    - Email/password sign-in: `signInWithEmail(email, password)`
    - Google OAuth: `signInWithGoogle()` (redirects to origin)
    - Sign-out: `signOut()`
  - Session management: Real-time auth state changes via `onAuthStateChange`
  - Error handling: User-friendly error messages for common scenarios

**Session State:**
- Zustand store with auth state (user, loading, error, initialized)
- Persisted via Supabase session management

## Monitoring & Observability

**Error Tracking:**
- Sentry (@sentry/react 10.38.0)
  - Captures unhandled errors via Error Boundary
  - Browser tracing integration enabled
  - Session replay on errors (masked text/media)
  - Sample rate: 10% of sessions for traces, 100% on-error for replays
  - Environment-aware (production/staging/development)

**Logs:**
- Custom analytics events via Google Analytics 4
  - Session lifecycle: `session_start`, `session_complete`, `session_abandon`
  - Garden events: `plant_harvested`, `plant_died`, `seed_planted`
  - Audio events: `sound_toggle` (type, volume)
  - Sync events: `sync_result`, `sync_reload_prompt_shown`
  - Settings: `settings_changed`
  - Errors: Captured via Sentry

**Performance:**
- Sentry browser tracing for API calls and page transitions

## CI/CD & Deployment

**Hosting:**
- Vercel deployment
  - Configuration: `vercel.json`
  - PWA support with manifest
  - Security headers enforced (CSP, X-Frame-Options, X-Content-Type-Options)

**CI Pipeline:**
- npm scripts defined in `package.json`
  - `npm run test:ci`: Full pipeline (type check → lint → unit tests → e2e tests)
  - Type checking: `tsc -b` (TypeScript builds)
  - Linting: `eslint .`
  - Unit tests: `vitest run`
  - E2E tests: Playwright after production build

**Build System:**
- Vite 7.3.1 with TypeScript compilation
- Code splitting for Sentry, Supabase, Framer Motion (manual chunks)

## Environment Configuration

**Required Environment Variables:**
```
VITE_SUPABASE_URL              # Supabase project endpoint
VITE_SUPABASE_ANON_KEY         # Supabase public/anon key
VITE_GA_MEASUREMENT_ID         # Google Analytics 4 measurement ID
VITE_ENABLE_ANALYTICS          # Boolean to enable/disable GA4
VITE_SENTRY_DSN                # Sentry project DSN for error tracking
```

**Secrets Location:**
- `.env` file (local development, excluded from git)
- Vercel environment variables (production deployment)

**Configuration:**
- All sensitive keys stored as environment variables
- Conditional initialization based on environment and configuration presence
- CSP headers in Vercel config allow trusted third-party domains

## Content Security Policy

**CSP Header (vercel.json):**
```
default-src 'self'
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com data:
img-src 'self' data: blob: https:
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://*.ingest.sentry.io
media-src 'self' data: blob:
worker-src 'self' blob:
```

**Allowed Domains:**
- `*.supabase.co` - Supabase API and WebSocket
- `www.googletagmanager.com` - Google Analytics
- `region1.google-analytics.com` - GA regional endpoint
- `*.ingest.sentry.io` - Sentry error ingestion
- `fonts.googleapis.com`, `fonts.gstatic.com` - Google Fonts

## Webhooks & Callbacks

**Incoming:**
- Supabase auth redirects: OAuth callback to `window.location.origin`
- No traditional webhook endpoints (frontend-only app)

**Outgoing:**
- Supabase real-time subscriptions (not currently implemented)
- Google Analytics events (client-side tracking)
- Sentry error reports (HTTP POST)

## Feature Flags & Configuration

**Conditional Features:**
- Supabase integration: Optional (graceful fallback if not configured)
  - Message: `"Cloud sync is not configured for this build. Add Supabase environment variables to enable sign-in and sync."`
- Google Analytics: Production-only, gated by `VITE_ENABLE_ANALYTICS`
- Sentry: Production-only, requires valid `VITE_SENTRY_DSN`

---

*Integration audit: 2026-03-23*
