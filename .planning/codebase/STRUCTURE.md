# Codebase Structure

**Analysis Date:** 2026-03-23

## Directory Layout

```
focus-valley/
├── src/
│   ├── main.tsx              # Entry point: React root, Sentry init, analytics init
│   ├── App.tsx               # Main component: hooks + layout, lazy AudioMixer
│   ├── index.css             # Tailwind globals + CSS variables (light/dark themes)
│   ├── components/           # Presentational React components
│   │   ├── TimerDisplay.tsx         # Timer UI: countdown, controls (start/pause/reset/skip)
│   │   ├── PlantGarden.tsx          # Garden SVG: stage-based plant rendering, particle effects
│   │   ├── AudioMixer.tsx           # Lazy-loaded: sound mixer with noise type toggles
│   │   ├── CategoryChips.tsx        # Category selector pills
│   │   ├── AppHeader.tsx            # Header: streak, dark mode toggle, sync status
│   │   ├── AppPanels.tsx            # Panel manager: todo, history, garden, settings
│   │   ├── AppOverlays.tsx          # Modal + overlay manager
│   │   ├── AppLazyOverlays.tsx      # Lazy-loaded overlays
│   │   ├── AuthModal.tsx            # Login/signup form
│   │   ├── TimerSettings.tsx        # Duration + preset configuration
│   │   ├── HistoryPanel.tsx         # Session history + statistics
│   │   ├── GardenCollection.tsx     # Unlocked plants display
│   │   ├── TodoPanel.tsx            # Active todo management
│   │   ├── BreathingGuide.tsx       # Break breathing exercise guide
│   │   ├── WeeklySummaryPopup.tsx   # Weekly stats popup
│   │   ├── UpgradeModal.tsx         # Pro subscription prompt
│   │   ├── ConfirmModal.tsx         # Generic confirmation dialog
│   │   ├── SessionRecoveryDialog.tsx # Interrupted session recovery
│   │   ├── Fireflies.tsx            # Background animation: particles
│   │   ├── AuroraBlob.tsx           # Animated background: audio-reactive blob
│   │   ├── PlantParticles.tsx       # Particle burst on plant stage advance
│   │   ├── ProgressRing.tsx         # Circular progress indicator
│   │   ├── Confetti.tsx             # Celebration confetti animation
│   │   ├── InstallBanner.tsx        # PWA install prompt
│   │   ├── ShortcutGuide.tsx        # Keyboard shortcut reference
│   │   ├── TourGuide.tsx            # Onboarding tour
│   │   ├── LandingScreen.tsx        # Initial welcome screen
│   │   ├── HelpButton.tsx           # Help icon + tooltip
│   │   ├── Toast.tsx                # Toast notification component
│   │   ├── ProGate.tsx              # Pro feature gate message
│   │   └── ui/
│   │       ├── BottomSheet.tsx      # Bottom sheet container (modals)
│   │       └── pixel-plants.tsx     # SVG plant assets: all stages + types
│   ├── hooks/                # Custom hooks: state, side effects, business logic
│   │   ├── useTimer.ts              # Timer state: countdown, mode, recovery, Web Worker
│   │   ├── useGarden.ts             # Garden Zustand store: stages, plants, history, streaks
│   │   ├── useTimerSettings.ts      # Timer settings Zustand: durations, presets, daily goal
│   │   ├── useTodos.ts              # Todos Zustand: tasks, active, completion
│   │   ├── useCategories.ts         # Categories Zustand: category list, active selection
│   │   ├── useAuth.ts               # Auth Zustand: user, login state
│   │   ├── useSubscription.ts       # Subscription Zustand: pro plan, expiry
│   │   ├── useAppSessionFlow.ts     # Session orchestration: timer+garden+notification flow
│   │   ├── useAppSyncFlow.ts        # Sync orchestration: Supabase push/pull, bootstrap
│   │   ├── useAppPanels.ts          # Panel state: which modal/panel is open
│   │   ├── useAppEnvironmentEffects.ts # Meta effects: music, title, recovery dialog
│   │   ├── useAudioMixer.ts         # Audio Zustand: noise types, volumes, Web Audio context
│   │   ├── useAudioReactivity.ts    # Audio intensity from analyser node
│   │   ├── useDarkMode.ts           # Dark mode Zustand: toggle + localStorage
│   │   ├── useNotification.ts       # Notification API + sound playback
│   │   ├── usePlantParticles.ts     # Particle trigger state on stage transition
│   │   ├── useWeather.ts            # Open-Meteo weather API: mood effects
│   │   ├── useKeyboardShortcuts.ts  # Keyboard event handlers (space, Shift+R, etc.)
│   │   ├── useDocumentTitle.ts      # Dynamic page title with timer countdown
│   │   ├── useInstallPrompt.ts      # PWA install prompt event handler
│   │   ├── useTour.ts               # Tour Zustand: onboarding steps
│   │   ├── useLanding.ts            # Landing screen state (show/dismiss)
│   │   ├── useWeeklySummary.ts      # Weekly summary popup state
│   │   ├── useUpgradeModal.ts       # Upgrade prompt state
│   │   ├── useShareTheme.ts         # Share card theme selection Zustand
│   │   ├── useSyncFeedback.ts       # Sync feedback messages Zustand
│   │   ├── useDialogA11y.ts         # Dialog accessibility utilities
│   │   ├── *.test.ts                # Hook unit tests (vitest)
│   │   └── *.test.ts                # Hook unit tests (vitest)
│   ├── lib/                  # Services, utilities, business logic
│   │   ├── sync.ts                  # Supabase sync orchestration: push, pull, bootstrap
│   │   ├── sync-engine.ts           # Merge logic: migrateSyncData, mergeSyncData, chooseNewer
│   │   ├── sync-storage.ts          # localStorage snapshot: save, load, normalize
│   │   ├── sync-normalize.ts        # Data normalization: history, sessions, todos, categories
│   │   ├── sync-contract.ts         # Type definitions: SyncableDataV2, SyncHistoryEntry, etc.
│   │   ├── analytics.ts             # Event tracking: trackSessionStart, trackPlantDied, etc.
│   │   ├── stats.ts                 # Statistics: heatmaps, category breakdowns, monthly bars
│   │   ├── i18n.ts                  # Translation lookup + locale management Zustand
│   │   ├── i18n-legacy.ts           # Legacy translations (backup)
│   │   ├── i18n-packs/
│   │   │   ├── core-shell.ts        # UI labels (buttons, headers, etc.)
│   │   │   └── feature-pack.ts      # Feature-specific text (achievements, etc.)
│   │   ├── share-card.ts            # Share card SVG generation: themes, stats formatting
│   │   ├── milestones.ts            # Milestone system: definitions, unlock logic
│   │   ├── backup.ts                # Data backup/export: JSON serialization
│   │   ├── constants.ts             # App constants: plant icons, animation durations, gesture thresholds
│   │   ├── date-utils.ts            # Utilities: getToday, getYesterday, groupByWeek, etc.
│   │   ├── timer-state.ts           # Timer deserialization, version migration
│   │   ├── notification-sound.ts    # Web Audio: play completion tone
│   │   ├── supabase.ts              # Supabase client initialization
│   │   ├── persist.ts               # localStorage helpers: createSafeStorage, isRecord, parseIsoTimestamp
│   │   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
│   └── workers/              # Web Workers
│       └── timer.worker.ts   # 1-second tick interval: START/PAUSE/STOP commands
├── e2e/                      # Playwright E2E tests
│   ├── demo.spec.ts          # Demo mode flow
│   ├── landing.spec.ts       # Landing screen
│   ├── modals.spec.ts        # Modal interactions
│   ├── recovery.spec.ts      # Session recovery
│   ├── sync-backup.spec.ts   # Sync + backup features
│   ├── helpers.ts            # E2E test utilities
│   └── fixtures/             # Test data fixtures
├── index.html                # HTML shell: div#root
├── vite.config.ts            # Vite: React, Tailwind, PWA, Web Worker support, code splitting
├── tsconfig.json             # TypeScript references
├── tsconfig.app.json         # App TypeScript config: strict mode, ES2022 target
├── tailwind.config.js        # Tailwind theming
├── package.json              # Dependencies: React 19, Zustand, Supabase, Sentry
├── eslint.config.js          # ESLint rules
├── playwright.config.ts      # E2E test config
└── README.md                 # Project documentation
```

## Directory Purposes

**`src/components/`:**
- Purpose: React presentation components
- Contains: UI layouts, animations, form inputs, modals
- Key files: `TimerDisplay.tsx`, `PlantGarden.tsx`, `AppHeader.tsx`, `AudioMixer.tsx`

**`src/hooks/`:**
- Purpose: Custom hooks managing state + side effects
- Contains: Zustand stores (with `create()` + `persist`), React hooks, business logic
- Key files: `useGarden.ts`, `useTimer.ts`, `useAppSessionFlow.ts`, `useAppSyncFlow.ts`

**`src/lib/`:**
- Purpose: Business logic, services, utilities
- Contains: Sync engine, analytics, i18n, statistics, data transformation
- Key files: `sync-engine.ts`, `analytics.ts`, `stats.ts`, `i18n.ts`

**`src/workers/`:**
- Purpose: Off-main-thread processing
- Contains: Web Worker for timer tick generation
- Key files: `timer.worker.ts` (1 file)

**`e2e/`:**
- Purpose: End-to-end tests via Playwright
- Contains: Feature flow tests, helper utilities, fixtures
- Key files: `demo.spec.ts`, `sync-backup.spec.ts`

**`public/`:**
- Purpose: Static assets: PWA icons, manifest, fonts
- Contains: `favicon.svg`, `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root initialization, Sentry error boundary, analytics setup
- `src/App.tsx`: Main component composition, hook initialization, layout
- `index.html`: HTML shell with div#root

**Configuration:**
- `vite.config.ts`: Build config, code splitting, PWA plugin, Web Worker bundling
- `tsconfig.app.json`: TypeScript strict mode, path aliases (`@/*` → `./src/*`), ES2022 target
- `tailwind.config.js`: Tailwind theme customization
- `package.json`: Dependencies (React 19, Zustand, Supabase, Sentry, Framer Motion)

**Core Logic:**
- `src/lib/sync-engine.ts`: Bidirectional sync merge algorithm
- `src/hooks/useAppSessionFlow.ts`: Session lifecycle orchestration (timer start → garden update → sync)
- `src/hooks/useGarden.ts`: Plant growth state machine, unlock system
- `src/workers/timer.worker.ts`: Reliable 1-second tick via Web Worker

**Testing:**
- `e2e/*.spec.ts`: Playwright tests for user flows
- `src/hooks/*.test.ts`: Hook unit tests (vitest)

## Naming Conventions

**Files:**
- Components: PascalCase + `.tsx` (e.g., `TimerDisplay.tsx`, `PlantGarden.tsx`)
- Hooks: camelCase, `use` prefix + `.ts` (e.g., `useTimer.ts`, `useGarden.ts`)
- Services/utilities: camelCase + `.ts` (e.g., `analytics.ts`, `sync-engine.ts`)
- Tests: `.test.ts` or `.spec.ts` suffix (e.g., `useGarden.test.ts`, `demo.spec.ts`)
- Workers: `.worker.ts` suffix (e.g., `timer.worker.ts`)

**Directories:**
- lowercase, plural when containing many files (e.g., `components/`, `hooks/`, `lib/`)
- Feature-grouped (e.g., `i18n-packs/` for translation modules)

**Exports:**
- Type definitions use `export type` (not `interface` per project convention)
- Store creators export constants directly: `export const useGarden = create<GardenState>(...)`
- Utility functions exported as named exports

**Type Naming:**
- State types: `[Domain]State` (e.g., `GardenState`, `TimerSettingsState`, `AuthState`)
- Union types: descriptive names (e.g., `PlantStage`, `TimerMode`, `ShareCardTheme`)
- Props types: `[Component]Props` (e.g., `TimerDisplayProps`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/hooks/use[FeatureName].ts` (Zustand store + custom hook)
- UI: `src/components/[FeatureName].tsx` or multiple component files
- Tests: `src/hooks/use[FeatureName].test.ts` and `e2e/feature.spec.ts`

**New Component/Module:**
- Implementation: `src/components/[ComponentName].tsx`
- If reusable UI primitive: `src/components/ui/[ComponentName].tsx`
- If modal/panel: reference in `src/components/AppPanels.tsx` or `src/components/AppOverlays.tsx`

**Utilities:**
- Shared helpers: `src/lib/[domain].ts` (grouped by domain)
- Date/time: `src/lib/date-utils.ts`
- Hooks utilities: new file in `src/hooks/` or existing utility hooks
- Types: defined in same file as usage, or in `src/lib/[domain]-contract.ts` for shared contracts

**Services/Integrations:**
- API clients: `src/lib/[service].ts`
- Data transformation: `src/lib/[domain]-normalize.ts` or `[domain]-engine.ts`
- Supabase integration: `src/lib/sync.ts` and related sync files

## Special Directories

**`src/lib/i18n-packs/`:**
- Purpose: Translation packs loaded dynamically
- Generated: No (hand-maintained)
- Committed: Yes
- Files: `core-shell.ts` (UI labels), `feature-pack.ts` (feature text)
- Pattern: `Record<TranslationKey, Record<Locale, string>>`

**`src/components/ui/`:**
- Purpose: Reusable UI primitives (not full features)
- Generated: No
- Committed: Yes
- Files: `BottomSheet.tsx` (modal container), `pixel-plants.tsx` (SVG plant assets)

**`e2e/`:**
- Purpose: End-to-end tests
- Generated: No (test output in `.playwright-mcp/` not committed)
- Committed: Yes (test source files)
- Pattern: Playwright tests with `helpers.ts` utilities

**`.omc/`:**
- Purpose: OMC orchestration state
- Generated: Yes
- Committed: No
- Contents: Plans, research, state snapshots

**`out/`:**
- Purpose: Build artifacts (Remotion video renders)
- Generated: Yes
- Committed: No

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-03-23*
