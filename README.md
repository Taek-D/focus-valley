# Focus Valley

A gamified Pomodoro timer with a pixel art garden, ambient soundscapes, and aurora visuals. Plants grow as you focus — stay consistent and watch your garden flourish.

## Features

### Core
- **Pomodoro Timer** — Focus / Short Break / Long Break with customizable durations
- **Pixel Art Garden** — Plants grow through 5 stages (Seed → Sprout → Sapling → Tree → Flower) during focus sessions
- **Ambient Soundscapes** — Rain, fire, cafe, stream, white noise via Web Audio API
- **Aurora Visuals** — Holographic aurora blob that shifts colors per timer mode, with seasonal themes

### Gamification
- **Streak Tracking** — Daily streaks unlock new plant types
- **Deep Focus Streak** — Consecutive focus sessions without breaks earn bonus rewards
- **Plant Collection** — 10+ plant types to discover and grow
- **Harvest & Replant** — Harvest mature plants, replant after failures
- **Undo Plant Death** — 5-second undo window when giving up a session
- **Confetti & Particles** — Visual celebrations on session completion and stage transitions

### Productivity
- **To-do List** — Pin a focus task to the plant display
- **Category Tags** — Organize sessions by custom categories with horizontal scrolling chips
- **Timer Settings** — Customize durations, auto-advance between modes
- **Keyboard Shortcuts** — Space, R, 1/2/3, M, ? and more

### Stats & History
- **Weekly Stats** — Bar charts, activity heatmap, and CSV export
- **Garden Collection** — Browse all plant types, growth stages, and unlock conditions
- **Session History** — Track completed sessions with category and duration breakdown

### Account & Sync
- **Supabase Auth** — Sign in to sync data across devices
- **Cloud Sync** — Automatic push/pull with conflict resolution
- **Subscription Management** — Server-authoritative plan and entitlement tracking

### UX
- **Dark Mode** — Light/dark themes with seasonal aurora effects (spring/summer/autumn/winter)
- **Weather-Aware** — Aurora mood adapts to local weather during focus
- **Breathing Guide** — Guided breathing exercise during break sessions
- **Interactive Tour** — Step-by-step onboarding tour for new users
- **i18n** — English, Korean, Japanese language support
- **PWA** — Install as a standalone app, works offline
- **Notifications** — Browser notifications on session completion
- **Error Tracking** — Sentry integration for production monitoring

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + CSS variables (shadcn/ui pattern) |
| State | Zustand 5 (with localStorage persist) |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Timer | Web Workers (avoids tab throttling) |
| Audio | Web Audio API (procedural noise generation) |
| Auth & DB | Supabase |
| Monitoring | Sentry |
| PWA | vite-plugin-pwa |
| Video | Remotion (promo video rendering) |

## Getting Started

```bash
npm install
npm run dev
```

## Supabase Setup

Apply migrations in `supabase/migrations` to create:

- `public.user_sync` — user cloud sync data
- `public.user_subscriptions` — server-authoritative plan/entitlement row

`user_subscriptions` is read-only from client sessions (RLS select only). Write access should be handled by trusted backend/webhook logic using Supabase service role.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run video:studio` | Open Remotion Studio for promo videos |
| `npm run video:render` | Render intro video to `out/intro.mp4` |
| `npm run video:render:all` | Render all video compositions |

## Project Structure

```
src/
  App.tsx                          # Main app layout
  main.tsx                         # Entry point
  index.css                        # Tailwind + CSS variables (light/dark/aurora)
  lib/
    utils.ts                       # cn() utility (clsx + tailwind-merge)
    i18n.ts                        # Translations (en/ko/ja)
    analytics.ts                   # Event tracking
    sync.ts                        # Cloud sync logic
    supabase.ts                    # Supabase client
    stats.ts                       # Stats computation
    share-card.ts                  # Share card generation
    notification-sound.ts          # Completion sound
    constants.ts                   # Animation & timing constants
    date-utils.ts                  # Date helpers
  hooks/
    useTimer.ts                    # Timer logic (Web Worker based)
    useGarden.ts                   # Garden state (Zustand + persist)
    useAudioMixer.ts               # Audio mixer (Web Audio API)
    useTodos.ts                    # To-do list state
    useCategories.ts               # Category tags state
    useAuth.ts                     # Supabase auth
    useSubscription.ts             # Subscription state
    useDarkMode.ts                 # Dark mode toggle
    useWeather.ts                  # Weather-aware aurora
    useTour.ts                     # Interactive tour state
    useOnboarding.ts               # First-time onboarding
    ...
  components/
    TimerDisplay.tsx               # Timer UI with controls
    AudioMixer.tsx                 # Ambient sound mixer UI
    PlantGarden.tsx                # Plant display with particles
    AppHeader.tsx                  # Top navigation bar
    AuroraBlob.tsx                 # Central aurora visual
    HistoryPanel.tsx               # Stats & history panel
    GardenCollection.tsx           # Plant collection browser
    TodoPanel.tsx                  # To-do list panel
    TimerSettings.tsx              # Timer configuration
    CategoryChips.tsx              # Category tag selector
    BreathingGuide.tsx             # Breathing exercise overlay
    TourGuide.tsx                  # Interactive tour
    Onboarding.tsx                 # First-time onboarding
    AuthModal.tsx                  # Sign in / sign up
    UpgradeModal.tsx               # Subscription upgrade
    ui/pixel-plants.tsx            # SVG pixel art plant stages
    ...
  workers/
    timer.worker.ts                # Web Worker for accurate intervals
```

## License

MIT
