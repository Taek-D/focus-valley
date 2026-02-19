# Focus Valley

집중하면 식물이 자라는 게이미피케이션 뽀모도로 타이머. 픽셀 아트 정원, 앰비언트 사운드, 오로라 비주얼과 함께 몰입하세요.

## 기능

### 핵심
- **뽀모도로 타이머** — 집중 / 짧은 휴식 / 긴 휴식, 시간 커스터마이징 가능
- **픽셀 아트 정원** — 집중 중 식물이 5단계(씨앗 → 새싹 → 묘목 → 나무 → 꽃)로 성장
- **앰비언트 사운드** — 비, 불, 카페, 시냇물, 화이트 노이즈 (Web Audio API)
- **오로라 비주얼** — 타이머 모드/계절에 따라 색이 바뀌는 홀로그래픽 오로라

### 게이미피케이션
- **스트릭 트래킹** — 일일 연속 기록으로 새로운 식물 해금
- **딥 포커스 스트릭** — 연속 집중 세션 시 보너스 보상
- **식물 컬렉션** — 10종 이상의 식물을 발견하고 키우기
- **수확 & 재배** — 다 자란 식물 수확, 실패 시 재심기
- **되돌리기** — 포기 시 5초 내 되돌리기 가능
- **축하 효과** — 세션 완료 및 성장 단계 전환 시 파티클 & 꽃가루

### 생산성
- **할 일 목록** — 집중 중 표시할 할 일 고정
- **카테고리 태그** — 커스텀 카테고리로 세션 분류
- **타이머 설정** — 시간 조절, 모드 간 자동 전환
- **키보드 단축키** — Space, R, 1/2/3, M, ? 등

### 통계 & 기록
- **주간 통계** — 막대 차트, 히트맵, CSV 내보내기
- **정원 컬렉션** — 모든 식물 종류, 성장 단계, 해금 조건 열람
- **세션 기록** — 카테고리별, 시간별 완료 세션 추적

### 계정 & 동기화
- **로그인** — Supabase Auth (이메일/구글) 또는 토스 로그인
- **클라우드 동기화** — 자동 push/pull (충돌 해소 포함)
- **구독 관리** — 서버 권한 기반 플랜/엔타이틀먼트 관리

### UX
- **다크 모드** — 라이트/다크 테마 + 계절 오로라 효과
- **날씨 연동** — 집중 모드 중 현재 날씨에 맞춰 오로라 분위기 변경
- **호흡 가이드** — 휴식 시간에 안내되는 호흡 운동
- **인터랙티브 투어** — 신규 사용자를 위한 단계별 온보딩
- **다국어** — 한국어, 영어, 일본어 지원
- **PWA** — 독립 앱으로 설치, 오프라인 지원
- **알림** — 세션 완료 시 브라우저 알림
- **에러 트래킹** — Sentry 연동

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | React 19 + TypeScript 5.9 |
| 빌드 | Vite 7 |
| 스타일링 | Tailwind CSS 4 + CSS 변수 (shadcn/ui 패턴) |
| 상태 관리 | Zustand 5 (localStorage persist) |
| 애니메이션 | Framer Motion 12 |
| 아이콘 | Lucide React |
| 타이머 | Web Workers (탭 쓰로틀링 방지) |
| 오디오 | Web Audio API (절차적 노이즈 생성) |
| 인증 & DB | Supabase |
| 모니터링 | Sentry |
| PWA | vite-plugin-pwa |
| 영상 | Remotion (프로모 비디오 렌더링) |

## 시작하기

```bash
npm install
npm run dev
```

## Supabase 설정

`supabase/migrations` 디렉토리의 SQL을 적용하세요:

- `public.user_sync` — 클라우드 동기화 데이터
- `public.user_subscriptions` — 서버 권한 구독/플랜 정보 (클라이언트 RLS select only)

`user_subscriptions`는 클라이언트에서 읽기 전용입니다. 쓰기는 Supabase service role을 사용하는 신뢰할 수 있는 백엔드/웹훅에서 처리해야 합니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run preview` | 프로덕션 빌드 미리보기 |
| `npm run lint` | ESLint 실행 |
| `npm run video:studio` | Remotion Studio 열기 |
| `npm run video:render` | 인트로 비디오 렌더링 (`out/intro.mp4`) |
| `npm run video:render:all` | 전체 비디오 컴포지션 렌더링 |

## 프로젝트 구조

```
src/
  App.tsx                          # 메인 앱 레이아웃
  main.tsx                         # 진입점
  index.css                        # Tailwind + CSS 변수 (라이트/다크/오로라)
  lib/
    utils.ts                       # cn() 유틸리티
    i18n.ts                        # 번역 (ko/en/ja)
    analytics.ts                   # 이벤트 트래킹
    sync.ts                        # 클라우드 동기화
    supabase.ts                    # Supabase 클라이언트
    stats.ts                       # 통계 계산
    notification-sound.ts          # 완료 사운드
    constants.ts                   # 애니메이션 & 타이밍 상수
    date-utils.ts                  # 날짜 헬퍼
  hooks/
    useTimer.ts                    # 타이머 로직 (Web Worker)
    useGarden.ts                   # 정원 상태 (Zustand + persist)
    useAudioMixer.ts               # 오디오 믹서 (Web Audio API)
    useAuth.ts                     # 인증
    useSubscription.ts             # 구독 상태
    useTodos.ts                    # 할 일 목록
    useCategories.ts               # 카테고리 태그
    useDarkMode.ts                 # 다크 모드 토글
    useWeather.ts                  # 날씨 연동 오로라
    useTour.ts                     # 인터랙티브 투어
    useOnboarding.ts               # 온보딩
    ...
  components/
    TimerDisplay.tsx               # 타이머 UI
    AudioMixer.tsx                 # 앰비언트 사운드 믹서
    PlantGarden.tsx                # 식물 디스플레이 + 파티클
    AppHeader.tsx                  # 상단 네비게이션
    AuroraBlob.tsx                 # 오로라 비주얼
    HistoryPanel.tsx               # 통계 & 기록 패널
    GardenCollection.tsx           # 식물 컬렉션
    TodoPanel.tsx                  # 할 일 목록 패널
    TimerSettings.tsx              # 타이머 설정
    CategoryChips.tsx              # 카테고리 셀렉터
    BreathingGuide.tsx             # 호흡 가이드
    TourGuide.tsx                  # 인터랙티브 투어
    AuthModal.tsx                  # 로그인
    UpgradeModal.tsx               # 구독 업그레이드
    ui/pixel-plants.tsx            # SVG 픽셀 아트 식물
    ...
  workers/
    timer.worker.ts                # Web Worker (정확한 타이머)
```

## 브랜치

| 브랜치 | 설명 |
|--------|------|
| `master` | 웹 버전 (PWA, 이메일/구글 로그인) |
| `feature/apps-in-toss` | 앱인토스 미니앱 버전 ([가이드](./APPS_IN_TOSS.md)) |

## 라이선스

MIT
