# Focus Valley - PDCA Plan

## 1. Project Overview

**Focus Valley**는 포모도로 타이머와 픽셀아트 정원을 결합한 집중력 관리 웹앱입니다.
집중 세션 동안 식물이 자라고, 포기하면 시들며, 완료하면 수확하는 게임화 메커니즘을 제공합니다.

| 항목 | 내용 |
|------|------|
| 기술 스택 | React 19 + TypeScript 5.9 + Vite 7 |
| 스타일링 | Tailwind CSS 4 + CSS Variables (shadcn/ui 패턴) |
| 상태관리 | Zustand 5 (persist) |
| 애니메이션 | Framer Motion 12 (설치됨, 미사용) |
| 타이머 | Web Worker (브라우저 탭 스로틀링 방지) |
| 오디오 | Web Audio API (절차적 노이즈 생성) |

---

## 2. Current Implementation Status

### 2.1 Implemented Features

| Feature | 파일 | 상태 | 비고 |
|---------|------|------|------|
| Pomodoro Timer | `useTimer.ts`, `timer.worker.ts` | ✅ 동작 | FOCUS 25min, SHORT_BREAK 5min, LONG_BREAK 15min |
| Timer UI | `TimerDisplay.tsx` | ✅ 동작 | Start/Pause/Reset 컨트롤 |
| Garden System | `useGarden.ts` | ✅ 동작 | Zustand + localStorage 영속화 |
| Plant Growth | `useGarden.ts` → `grow()` | ✅ 동작 | 진행률 기반 단계 변화 |
| Pixel Art Plants | `pixel-plants.tsx` | ✅ 동작 | 5개 단계 SVG 컴포넌트 |
| Audio Mixer | `useAudioMixer.ts` | ⚠️ 부분 | rain, fire만 고유 알고리즘, cafe/stream은 white 노이즈와 동일 |
| Audio Mixer UI | `AudioMixer.tsx` | ✅ 동작 | 5개 트랙 슬라이더 + 뮤트 |
| Timer-Garden 연동 | `App.tsx` useEffect | ✅ 동작 | FOCUS 모드에서만 식물 성장 |
| Give Up 메커니즘 | `App.tsx` handleReset | ✅ 동작 | confirm → 식물 사망 + 타이머 리셋 |
| Harvest 메커니즘 | `App.tsx` onClick | ✅ 동작 | TREE/FLOWER 단계에서 클릭 → 수확 |
| History 저장 | `useGarden.ts` | ✅ 동작 | 수확 시 history 배열에 기록 |

### 2.2 Identified Issues

#### Critical (기능 결함)

| # | Issue | 파일:라인 | 설명 |
|---|-------|----------|------|
| C1 | 성장 단계 갭 | `useGarden.ts:47-50` | 80-99% 구간에서 단계 변화 없음. BUD는 40-79%, TREE는 100%에서만 전환. **80-99%가 BUD에 머무름** |
| C2 | FLOWER 단계 미사용 | `useGarden.ts:50` | `PlantStage`에 FLOWER 정의되어 있으나 `grow()`에서 FLOWER로 전환되는 조건 없음 |
| C3 | 커스텀 애니메이션 미정의 | `pixel-plants.tsx:12,32` | `animate-bounce-slow`, `animate-sway`, `animate-pulse-slow` 클래스가 Tailwind config에 정의되지 않음 |
| C4 | `font-min` 클래스 미정의 | `App.tsx:97` | `font-min` 클래스가 어디에도 정의되지 않음 (텍스트 렌더링 안 됨) |

#### Major (미구현 핵심 기능)

| # | Issue | 설명 |
|---|-------|------|
| M1 | 모드 전환 UI 없음 | `switchMode()`가 useTimer에 있지만 UI에서 FOCUS/SHORT_BREAK/LONG_BREAK 전환 불가 |
| M2 | 자동 모드 전환 없음 | FOCUS 완료 후 자동으로 BREAK로 전환되지 않음 |
| M3 | 완료 알림 없음 | 타이머 완료 시 사운드/시각적 알림 없음 (timeLeft=0에서 조용히 멈춤) |
| M4 | History UI 없음 | History 버튼이 있지만 클릭 시 아무 동작 없음 (`App.tsx:69-71`) |
| M5 | 다크모드 토글 없음 | CSS variables로 light/dark 정의되어 있지만 `.dark` 클래스 토글 메커니즘 없음 |
| M6 | cafe/stream 사운드 미분화 | cafe, stream이 white noise와 동일한 알고리즘 사용 |

#### Minor (코드 품질)

| # | Issue | 설명 |
|---|-------|------|
| m1 | `App.css` Vite 기본 템플릿 잔존 | `.logo`, `.card`, `.read-the-docs` 등 사용하지 않는 스타일 |
| m2 | `window.confirm` / `alert` 사용 | UX 품질 저하. 커스텀 모달로 교체 필요 |
| m3 | Framer Motion 미사용 | 의존성에 설치되어 있으나 코드에서 사용하지 않음 |
| m4 | `PlantType` 미활용 | DEFAULT 외 CACTUS, SUNFLOWER, PINE 타입 미구현 |
| m5 | `react.svg` 잔존 | `src/assets/react.svg` Vite 템플릿 파일 |

---

## 3. Architecture Analysis

### 3.1 Data Flow

```
[timer.worker.ts]
    │ TICK (every 1s)
    ▼
[useTimer] ──timeLeft, isRunning──▶ [App.tsx]
                                       │
                                  progress = (elapsed / total) * 100
                                       │
                                       ▼
                                  [useGarden.grow(progress)]
                                       │
                                  stage update (Zustand)
                                       │
                                       ▼
                                  [pixel-plants] (SVG render)
```

### 3.2 State Architecture

```
Local State (resets on refresh):
├── useTimer: mode, timeLeft, isRunning
├── useAudioMixer: volumes, isMuted, AudioContext refs
└── App: showMixer

Persistent State (localStorage):
└── useGardenStore: stage, type, history
```

### 3.3 Dependency Graph

```
App.tsx
├── useTimer (hook) → timer.worker.ts (Web Worker)
├── useAudioMixer (hook) → Web Audio API
├── useGarden (hook) → Zustand store
├── TimerDisplay (component) → lucide-react icons
├── AudioMixer (component) → useAudioMixer type import
└── pixel-plants (component) → pure SVG
```

---

## 4. Improvement Roadmap

### Phase 1: Bug Fix (Critical Issues)

**목표**: 현재 기능이 정상 동작하도록 수정

| Task | 대상 | 예상 작업 |
|------|------|----------|
| P1-1. 성장 단계 갭 수정 | `useGarden.ts` | 80-99%에 FLOWER 단계 추가, 100%에서 TREE 전환 |
| P1-2. 커스텀 애니메이션 정의 | `tailwind.config.js` | `bounce-slow`, `sway`, `pulse-slow` keyframes 추가 |
| P1-3. `font-min` 수정 | `App.tsx` | `font-min` → `font-mono` 또는 적절한 클래스로 변경 |
| P1-4. `App.css` 정리 | `App.css` | Vite 기본 템플릿 스타일 제거 |
| P1-5. `react.svg` 제거 | `src/assets/` | 미사용 파일 삭제 |

### Phase 2: Core UX (Major Features)

**목표**: 포모도로 앱으로서 핵심 UX 완성

| Task | 대상 | 예상 작업 |
|------|------|----------|
| P2-1. 모드 전환 UI | `TimerDisplay.tsx` | FOCUS / SHORT_BREAK / LONG_BREAK 탭 UI 추가 |
| P2-2. 자동 모드 전환 | `useTimer.ts`, `App.tsx` | FOCUS → SHORT_BREAK 자동 전환 + 4회째 LONG_BREAK |
| P2-3. 완료 알림 | `useTimer.ts`, `App.tsx` | 타이머 완료 시 사운드 + 화면 플래시 알림 |
| P2-4. 다크모드 토글 | 새 컴포넌트 | 헤더에 다크모드 토글 버튼 + localStorage 영속화 |
| P2-5. alert/confirm 교체 | 새 컴포넌트 | 커스텀 모달/토스트 컴포넌트 (Framer Motion 활용) |

### Phase 3: Feature Complete (Enhanced UX)

**목표**: 차별화된 앱 경험 완성

| Task | 대상 | 예상 작업 |
|------|------|----------|
| P3-1. History 패널 | 새 컴포넌트 | 수확 기록 목록, 날짜별 그룹핑, 슬라이드 패널 UI |
| P3-2. cafe/stream 사운드 | `useAudioMixer.ts` | 고유 노이즈 알고리즘 구현 (cafe: filtered burst, stream: modulated) |
| P3-3. 식물 타입 다양화 | `pixel-plants.tsx`, `useGarden.ts` | CACTUS, SUNFLOWER, PINE 픽셀아트 + 랜덤 배정 |
| P3-4. 통계 대시보드 | 새 컴포넌트 | 일/주/월별 집중 시간, 수확 횟수 차트 |
| P3-5. Framer Motion 활용 | 전체 | 페이지 전환, 식물 성장 애니메이션, 모달 트랜지션 |

### Phase 4: Polish & Deploy

**목표**: 배포 준비

| Task | 대상 | 예상 작업 |
|------|------|----------|
| P4-1. SEO + 메타태그 | `index.html` | OG 태그, description, favicon 교체 |
| P4-2. PWA 지원 | `vite.config.ts` | Service Worker, manifest.json, 오프라인 지원 |
| P4-3. 접근성 개선 | 전체 | aria-label, keyboard navigation, focus management |
| P4-4. 성능 최적화 | 전체 | 번들 분석, lazy loading, memo 적용 |
| P4-5. 배포 | Vercel/Netlify | CI/CD 설정, 프로덕션 빌드 검증 |

---

## 5. Priority Matrix

```
           높은 영향
              │
   P2-1 ●    │    ● P1-1 (성장 갭)
   (모드전환)  │    ● P1-2 (애니메이션)
   P2-3 ●    │    ● P2-2 (자동전환)
   (완료알림)  │
──────────────┼──────────────
              │    ● P1-3 (font-min)
   P3-1 ●    │    ● P1-4 (CSS 정리)
   (History)  │    ● P2-4 (다크모드)
   P3-3 ●    │
   (식물타입)  │
              │
           낮은 영향

   낮은 노력 ◄──────────► 높은 노력
```

**추천 실행 순서**: P1 (버그 수정) → P2 (핵심 UX) → P3 (기능 확장) → P4 (배포)

---

## 6. File Inventory

| 파일 | 라인 수 | 역할 | 상태 |
|------|--------|------|------|
| `src/App.tsx` | 142 | 메인 앱 레이아웃 + 상태 연동 | 리팩토링 필요 |
| `src/main.tsx` | 10 | 엔트리 포인트 | 정상 |
| `src/index.css` | 77 | Tailwind + CSS Variables | 정상 |
| `src/App.css` | 43 | Vite 기본 템플릿 | 삭제 대상 |
| `src/lib/utils.ts` | 6 | cn() 유틸리티 | 정상 |
| `src/hooks/useTimer.ts` | 73 | 타이머 로직 | 기능 추가 필요 |
| `src/hooks/useGarden.ts` | 66 | 정원 상태 관리 | 버그 수정 필요 |
| `src/hooks/useAudioMixer.ts` | 157 | 오디오 믹서 | 사운드 추가 필요 |
| `src/components/TimerDisplay.tsx` | 66 | 타이머 UI | 모드 전환 UI 추가 필요 |
| `src/components/AudioMixer.tsx` | 53 | 오디오 믹서 UI | 정상 |
| `src/components/ui/pixel-plants.tsx` | 58 | 픽셀아트 식물 | 식물 타입 추가 필요 |
| `src/workers/timer.worker.ts` | 22 | Web Worker 타이머 | 정상 |
| `tailwind.config.js` | 56 | Tailwind 설정 | 애니메이션 추가 필요 |
| `vite.config.ts` | 13 | Vite 설정 | 정상 |
