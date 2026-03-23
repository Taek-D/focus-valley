# Architecture

**Analysis Date:** 2026-03-23

## Pattern Overview

**Overall:** Layered React application with Zustand state management, separated concerns across hooks, components, and utilities.

**Key Characteristics:**
- React hooks-based architecture with custom hooks for each domain (timer, garden, audio, sync)
- Zustand stores for persistent, cross-component state (garden, settings, todos, categories)
- Web Worker for background timer to avoid browser tab throttling
- Modular component layers with lazy loading for heavy components
- Service layer in `lib/` for business logic (sync, analytics, stats, i18n)
- Separation between UI presentation and state/business logic

## Layers

**Presentation (UI Components):**
- Purpose: Render visual output, handle user interactions
- Location: `src/components/`
- Contains: React components (TimerDisplay, PlantGarden, AudioMixer, CategoryChips, modal overlays)
- Depends on: Custom hooks, Zustand stores, utility functions
- Used by: App.tsx entry point and other components

**Hooks (State & Logic):**
- Purpose: Manage component state, side effects, business logic
- Location: `src/hooks/`
- Contains: Custom hooks (useTimer, useGarden, useAppSessionFlow, useAudioMixer, etc.)
- Depends on: Zustand stores, lib utilities, Web Worker, browser APIs
- Used by: Components and other hooks

**State Management (Zustand):**
- Purpose: Persistent cross-component state with localStorage
- Location: Within hooks files (e.g., `useGarden.ts` exports `useGarden` store)
- Stores: Garden state, Timer settings, Todos, Categories, Auth, Share theme, Subscription, Tour, Sync feedback
- Pattern: `create()` with `persist` middleware for localStorage
- Used by: All hooks and components

**Services (Business Logic):**
- Purpose: Domain-specific logic, data transformation, external integrations
- Location: `src/lib/`
- Contains:
  - `sync.ts`, `sync-engine.ts`, `sync-storage.ts`, `sync-normalize.ts` - Cloud sync logic
  - `analytics.ts` - Event tracking
  - `stats.ts` - Session statistics and heatmap generation
  - `i18n.ts`, `i18n-packs/` - Internationalization
  - `share-card.ts` - Social share card generation
  - `date-utils.ts`, `timer-state.ts` - Utility functions
  - `milestones.ts` - Achievement system
  - `backup.ts` - Data backup/restore
- Depends on: Supabase, constants, types
- Used by: Hooks and components

**Background Workers:**
- Purpose: Off-main-thread processing
- Location: `src/workers/`
- Contains: `timer.worker.ts` - 1-second tick interval via setInterval
- Pattern: Receives `START`/`PAUSE`/`STOP` commands, posts `TICK` messages
- Used by: `useTimer` hook

## Data Flow

**Session Lifecycle (Focus → Plant Growth):**

1. User starts timer via `TimerDisplay` component
2. `useAppSessionFlow` hook receives start event
3. `useTimer` starts Web Worker (posts `START` command)
4. Worker posts `TICK` message every 1 second
5. `useTimer` processes TICK, updates state (timeLeft countdown)
6. Components read timer state via `useTimer()` hook
7. On completion, `useAppSessionFlow` detects and triggers:
   - Plant stage advancement via `useGarden().addSession()`
   - Analytics tracking
   - Notification/sound
   - Milestone unlocks
8. `useGarden` updates Zustand store → triggers component re-renders
9. `useAppSyncFlow` detects changes, queues sync to Supabase

**State Management:**
- Local component state via `useState` for temporary UI state (modals, toasts)
- Zustand persistent stores for global state (garden history, settings, todos)
- localStorage via persist middleware for data recovery across sessions
- Zustand getState() for synchronous access outside React components

**Garden Growth:**
- Controlled by focus session completion and time elapsed
- Growth stages: SEED (0-10%) → SPROUT (10-40%) → BUD (40-70%) → FLOWER (70-100%) → TREE (100%)
- Stage percentage derived from cumulative minutes in current session
- Stage updates stored in `garden.stage` and synced to cloud
- History entries track plant type × date for statistics

**Audio Reactivity:**
- Web Audio API context analyzes ambient sounds in real-time
- `useAudioMixer` manages mixer state (volume, enabled noise types)
- `useAudioReactivity` reads analyserRef from mixer, returns intensity 0-1
- Intensity drives aurora blob animation and visual feedback

## Key Abstractions

**Timer State Machine:**
- Purpose: Manage timer mode (FOCUS/SHORT_BREAK/LONG_BREAK) and time progression
- Examples: `src/hooks/useTimer.ts`, `src/lib/timer-state.ts`
- Pattern: Web Worker for tick generation, localStorage for recovery, derived state (elapsed/remaining)

**Garden Domain:**
- Purpose: Represent plant growth lifecycle and focus session history
- Examples: `src/hooks/useGarden.ts`
- Pattern: Zustand store with persist, typed plant stages/types, unlock system for new plant variants
- State includes: stage, type, history (plant type + date per completion), streak counters, milestones

**Sync Engine:**
- Purpose: Bidirectional sync between local state and Supabase cloud
- Examples: `src/lib/sync-engine.ts`, `src/lib/sync-storage.ts`, `src/lib/sync-contract.ts`
- Pattern:
  - `migrateSyncData()` - handles schema versioning and data normalization
  - `mergeSyncData()` - combines local and remote changes (timestamp-based)
  - `chooseNewer()` - conflict resolution (newer timestamp wins)
  - Local state snapshot stored with `updated_at` timestamp

**Internationalization:**
- Purpose: Multi-language support (en, ko, ja)
- Examples: `src/lib/i18n.ts`, `src/lib/i18n-packs/`
- Pattern: Translation key lookups via `useTranslation()`, dynamic pack loading, fallback to default

**Analytics:**
- Purpose: Event tracking for session milestones
- Examples: `src/lib/analytics.ts`
- Pattern: Functions like `trackSessionStart()`, `trackPlantDied()` integrate with Sentry
- Events: plant state changes, session lifecycle, shares, etc.

## Entry Points

**Main App (`src/App.tsx`):**
- Location: `src/App.tsx`
- Triggers: Page load (rendered in `src/main.tsx`)
- Responsibilities:
  - Initializes all global hooks (timer, garden, settings, auth, etc.)
  - Composes major UI sections (header, plant garden, timer, modals)
  - Orchestrates inter-hook communication (e.g., session flow ties timer+garden+notification)
  - Manages lazy-loaded AudioMixer via Suspense

**Main Entry (`src/main.tsx`):**
- Location: `src/main.tsx`
- Triggers: HTML load
- Responsibilities:
  - Initializes Sentry error boundary
  - Initializes analytics
  - Mounts React root

**Web Worker Entry (`src/workers/timer.worker.ts`):**
- Location: `src/workers/timer.worker.ts`
- Triggers: `useTimer` instantiates worker via `new TimerWorker()`
- Responsibilities: Post TICK message every 1 second on START command

## Error Handling

**Strategy:** Try-catch with fallback values, localStorage validation, Sentry error reporting

**Patterns:**
- `localStorage` read/write wrapped in try-catch with `/* quota exceeded — ignore */` comments
- Type guards (`typeof`, `isRecord`, `parseIsoTimestamp`) validate deserialized data
- Sentry.ErrorBoundary at root catches unhandled exceptions
- localStorage removal on parse failure to reset to clean state
- Sync failures caught and reported without breaking local state

## Cross-Cutting Concerns

**Logging:** Console methods used selectively; production errors sent to Sentry via `@sentry/react`

**Validation:**
- Input validation in Zustand action creators (e.g., `setDuration()` checks min/max)
- Type guards for deserialized data (e.g., `typeof`, `isRecord()`)
- Timer state validation (version check, mode validation, timestamp checks)

**Authentication:**
- `useAuth` Zustand store manages user + login state
- `useAppSyncFlow` handles OAuth flow and token management
- Supabase integration via `@supabase/supabase-js` client
- Auth modal component (`AuthModal.tsx`) displays login UI

**State Persistence:**
- Zustand `persist` middleware → localStorage
- Custom storage adapter (`createSafeStorage`) wraps localStorage with error handling
- Recovery dialog (`SessionRecoveryDialog.tsx`) prompts if timer interrupted
- Sync timestamp ensures cloud data is not overwritten by stale local state

---

*Architecture analysis: 2026-03-23*
