# Focus Valley - Development Guide

## Project Overview
Pomodoro timer app with pixel art garden. Plants grow during focus sessions, wither on give-up.

## Package Manager
- **Always use `npm`**

## Development Workflow
1. Make changes
2. Type check: `npx tsc -b`
3. Lint: `npm run lint`
4. Build: `npm run build`
5. Preview: `npm run preview`

## Tech Stack
- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Tailwind CSS 4** with CSS variables (shadcn/ui pattern)
- **Zustand 5** for state management (with persist middleware)
- **Framer Motion 12** for animations
- **Lucide React** for icons
- **Web Workers** for timer (avoids tab throttling)
- **Web Audio API** for ambient soundscape

## Project Structure
```
src/
  App.tsx                         # Main app layout
  main.tsx                        # Entry point
  index.css                       # Tailwind + CSS variables (light/dark)
  lib/utils.ts                    # cn() utility (clsx + tailwind-merge)
  hooks/
    useTimer.ts                   # Timer logic (Web Worker based)
    useGarden.ts                  # Garden state (Zustand + persist)
    useAudioMixer.ts              # Audio mixer (Web Audio API)
  components/
    TimerDisplay.tsx              # Timer UI with controls
    AudioMixer.tsx                # Ambient sound mixer UI
    ui/pixel-plants.tsx           # SVG pixel art plant stages
  workers/
    timer.worker.ts               # Web Worker for accurate intervals
```

## Coding Conventions
- Use `type` over `interface` for new type definitions
- Never use `enum` - use string literal unions instead
- Path alias: `@/` maps to `./src/`
- Component files use PascalCase, hooks use camelCase with `use` prefix
- CSS: Use Tailwind utility classes, customize via CSS variables in index.css
- State: Use Zustand stores for shared state, React hooks for local state

## Key Patterns
- **Timer**: Web Worker posts TICK messages every 1s, main thread updates state
- **Garden**: Zustand store with persist to localStorage (`focus-valley-garden`)
- **Audio**: Procedural noise generation (pink/brown/white) via Web Audio API
- **Styling**: shadcn/ui color system with HSL CSS variables, dark mode via `.dark` class

## Do NOT
- Use `console.log` for debugging in production code
- Use `any` type (except in worker self-reference workaround)
- Install additional UI libraries without discussion
- Modify the Web Worker timer pattern (it exists to avoid browser tab throttling)

---

## Apps in Toss 마이그레이션 (feature/apps-in-toss 브랜치)

### 목표
Focus Valley를 앱인토스(Apps in Toss) WebView 미니앱으로 전환한다.
SDK: `@apps-in-toss/web-framework`

### 변경 규칙
- **main.tsx**: `AppsInToss.registerApp()`으로 앱 래핑
- **다크모드 제거**: 앱인토스는 라이트 모드만 지원 → `useDarkMode` 및 다크 토글 UI 비활성화
- **PWA 제거**: `InstallBanner`, `useInstallPrompt` 비활성화 (미니앱에서는 PWA 불필요)
- **인증 교체**: Supabase Auth UI → 토스 로그인 (`appLogin()` 사용)
  - Supabase DB, cloud sync는 유지 — 인증 레이어만 교체
  - 인가 코드 → userKey 교환은 Supabase Edge Function으로 서버사이드 처리
- **결제 교체**: 현재 waitlist 버튼 → `IAP.createOneTimePurchaseOrder()`
  - 앱인토스는 반복 구독 미지원, 단건 결제(1개월/3개월/1년 SKU)만 사용

### 플랫폼 제약
- iOS에서 서드파티 쿠키 차단 → 쿠키 기반 인증 사용 금지 (localStorage 기반으로 유지)
- 외부 로깅 제한 → Sentry 사용 가능 여부 확인 전까지 ErrorBoundary 내부에만 유지
- 토스 로그인/IAP는 사업자 등록 후 활성화됨 (개발 중에는 sandbox 사용)

### 변경 대상 파일
| 파일 | 변경 내용 |
|------|-----------|
| `main.tsx` | `AppsInToss.registerApp()` 래핑 |
| `App.tsx` | 다크 토글 제거, PWA 배너 제거 |
| `hooks/useAuth.ts` | `signInWithToss()` 추가, 기존 이메일/구글 로그인 유지 |
| `components/AuthModal.tsx` | Supabase UI → 토스 로그인 버튼으로 교체 |
| `components/UpgradeModal.tsx` | waitlist 버튼 → IAP 결제 플로우 연결 |
| `hooks/useSubscription.ts` | IAP 상태 조회 API 연동 |
| `supabase/functions/toss-auth` | (신규) 토스 인가 코드 → Supabase 세션 교환 Edge Function |
