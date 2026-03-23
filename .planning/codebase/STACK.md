# Technology Stack

**Analysis Date:** 2026-03-23

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code (`.ts`, `.tsx` files)

**Secondary:**
- JavaScript ES2022 - Build config, tooling scripts

## Runtime

**Environment:**
- Node.js (bundler resolution with ES2022 target)
- Browser (DOM, DOM.Iterable for client-side execution)

**Package Manager:**
- npm - Package management for all dependencies
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.0 - UI framework with React DOM
- TypeScript 5.9.3 - Type safety and development experience

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server (configured in `vite.config.ts`)
- @vitejs/plugin-react 5.1.1 - React refresh and JSX support
- @tailwindcss/vite 4.1.18 - Tailwind CSS Vite integration

**Animation & UI:**
- Framer Motion 12.34.0 - Animation library for smooth transitions
- Lucide React 0.563.0 - Icon library
- class-variance-authority 0.7.1 - Type-safe component variants
- clsx 2.1.1 - Utility for conditional classnames
- tailwind-merge 3.4.0 - Merge Tailwind class utilities

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- tailwindcss-animate 1.0.7 - Animation utilities for Tailwind

**State Management:**
- Zustand 5.0.11 - Lightweight state management with persist middleware

**Testing:**
- Vitest 4.0.18 - Unit test framework (config: `vitest/config`)
- @playwright/test 1.58.2 - E2E testing framework

**PWA:**
- vite-plugin-pwa 1.2.0 - Progressive Web App support with Workbox

**Video/Media:**
- Remotion 4.0.422 - Video creation library
- @remotion/cli 4.0.422 - Remotion CLI for video rendering
- @remotion/player 4.0.422 - Video player component

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.95.3 - Backend as a service for auth and database
- @sentry/react 10.38.0 - Error tracking and monitoring

**Infrastructure:**
- Web Audio API (native) - Ambient soundscape generation
- Web Workers (native) - Timer logic to avoid browser tab throttling

## Configuration

**Environment:**
- Built on Vite environment variables with `VITE_` prefix
- `.env` file (secrets - not tracked)
- `.env.example` - Template with required variables

**Key Configuration Files:**
- `vite.config.ts` - Vite build and PWA configuration
- `tsconfig.json` - TypeScript monorepo references
- `tsconfig.app.json` - Application TypeScript settings (target: ES2022, strict mode enabled)
- `tsconfig.node.json` - Node.js tooling TypeScript settings
- `tailwind.config.js` - Tailwind CSS customization with CSS variables
- `eslint.config.js` - ESLint rules (flat config format)
- `playwright.config.ts` - Playwright E2E test configuration

**Required Environment Variables:**
```
VITE_SUPABASE_URL              # Supabase project URL
VITE_SUPABASE_ANON_KEY         # Supabase public/anon key
VITE_GA_MEASUREMENT_ID         # Google Analytics 4 ID
VITE_ENABLE_ANALYTICS          # Analytics toggle (true/false)
VITE_SENTRY_DSN                # Sentry error tracking DSN
```

## Build Configuration

**Build Output:**
- Vite manual chunks for code splitting:
  - `sentry`: @sentry/react
  - `supabase`: @supabase/supabase-js
  - `framer-motion`: framer-motion

**TypeScript Build:**
- Monorepo-style build with references to `tsconfig.app.json` and `tsconfig.node.json`
- Strict mode enabled in `tsconfig.app.json` (no unused locals/parameters)
- JSX: `react-jsx` (automatic runtime)

**Rollup/Vite Aliases:**
- `@/` → `./src/` (path alias for imports)

## Platform Requirements

**Development:**
- Node.js with npm
- Modern browser with Web Audio API, Web Workers, localStorage support
- TypeScript 5.9 compatible environment

**Production:**
- Vercel deployment (configured in `vercel.json`)
- CSP headers configured for safe content delivery
- PWA support with service worker caching

**Browser Support:**
- ES2022 target (modern browsers)
- Web Audio API for audio generation
- Localstorage for Zustand persist

## Development Workflow Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # Type check with tsc, then build with Vite
npm run lint             # Run ESLint
npm test                 # Run Vitest unit tests
npm run test:watch      # Run Vitest in watch mode
npm run test:e2e        # Build and run Playwright E2E tests
npm run test:e2e:headed # Run E2E tests with headed browser
npm run test:ci         # Full CI pipeline (type check, lint, unit, e2e)
npm run preview         # Preview production build locally
npm run video:render    # Render intro video with Remotion
```

## Special Features

**Ambient Soundscapes:**
- Procedurally generated using Web Audio API
- No external audio files
- Real-time mixing via audio analyzer

**Timer System:**
- Web Worker-based (`src/workers/timer.worker.ts`)
- Avoids browser tab throttling
- Sends TICK messages every 1 second

**Plant Garden:**
- Zustand store with localStorage persistence (`focus-valley-garden` key)
- SVG pixel art stages in `src/components/ui/pixel-plants.tsx`

**Service Worker:**
- PWA configured with Workbox
- Caches Google Fonts, static pages, app shell
- Cache-busting for immutable assets

---

*Stack analysis: 2026-03-23*
