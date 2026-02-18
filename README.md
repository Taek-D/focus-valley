# Focus Valley

A beautiful Pomodoro timer where plants grow as you focus. Ambient soundscapes, streak tracking, and a growing garden to keep you motivated.

## Features

- **Pomodoro Timer** — Focus / Short Break / Long Break with customizable durations
- **Pixel Art Garden** — Plants grow through 5 stages as you complete focus sessions
- **Ambient Soundscapes** — Rain, wind, fire, birds, and more via Web Audio API
- **Streak Tracking** — Daily streaks unlock new plant types
- **To-do List** — Pin a focus task to stay on track
- **Weekly Stats** — Bar charts, activity heatmap, and CSV export
- **Garden Collection** — Browse all plant types and growth stages
- **Keyboard Shortcuts** — Space, R, 1/2/3, M, ? and more
- **Dark Mode** — Light and dark themes with seasonal aurora effects
- **PWA** — Install as a standalone app, works offline

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7 + Tailwind CSS 4
- Zustand 5 (state management)
- Framer Motion 12 (animations)
- Web Workers (timer accuracy)
- Web Audio API (procedural sounds)

## Getting Started

```bash
npm install
npm run dev
```

## Supabase Setup

Apply migrations in `supabase/migrations` to create:

- `public.user_sync` (user cloud sync data)
- `public.user_subscriptions` (server-authoritative plan/entitlement row)

`user_subscriptions` is intentionally read-only from client sessions (RLS select only).
Write access should be handled by trusted backend/webhook logic using Supabase service role.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT
