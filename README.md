# Focus Valley

집중하면 식물이 자라는 게이미피케이션 뽀모도로 타이머. 픽셀 아트 정원, 앰비언트 사운드, 오로라 비주얼과 함께 몰입하세요.

## 기능

### 핵심

- **뽀모도로 타이머** — 집중 / 짧은 휴식 / 긴 휴식, 4사이클 자동 전환, 시간 커스터마이징
- **픽셀 아트 정원** — 집중 중 식물이 5단계(씨앗 → 새싹 → 묘목 → 나무 → 꽃)로 성장, 포기 시 시들기
- **앰비언트 사운드** — 비, 불, 카페, 시냇물, 화이트 노이즈 (mp3 루프 + Web Audio API)
- **오로라 비주얼** — 타이머 모드/계절에 따라 색이 바뀌는 홀로그래픽 오로라

### 게이미피케이션

- **식물 컬렉션** — 10종 이상의 식물 (기본 4종 + 스트릭 해금 2종 + 딥 포커스 해금 2종 + Pro 2종)
- **스트릭 트래킹** — 일일 연속 기록으로 새로운 식물 해금 (3일: 장미, 7일: 난초)
- **딥 포커스 스트릭** — 연속 집중 세션 보너스 (3연속: 연꽃, 5연속: 크리스탈)
- **마일스톤 배지** — 누적 시간·수확·스트릭 기준 달성 배지 (새싹 정원사, 숙련된 농부 등)
- **수확 & 재배** — 다 자란 식물 수확, 실패 시 재심기
- **되돌리기** — 포기 시 5초 내 되돌리기 가능
- **축하 효과** — 세션 완료 및 성장 단계 전환 시 파티클 & 꽃가루
- **성장 프로그레스 바** — 집중 중 현재 성장 단계 실시간 % 표시

### 생산성

- **할 일 목록** — 집중 중 표시할 할 일 고정
- **카테고리 태그** — 커스텀 카테고리로 세션 분류, 카테고리별 통계 연동
- **타이머 설정** — 시간 조절, 모드 간 자동 전환
- **키보드 단축키** — Space, R, S, 1/2/3, M, ? 등
- **세션 복구** — 새로고침/이탈 시 미완료 세션 감지, "이어서 할까요?" 다이얼로그 표시
- **이탈 경고** — 집중 세션 중 페이지 이탈 시 beforeunload 경고

### 통계 & 기록

- **주간/월간 차트** — 7일 막대 차트 + 30일 월간 차트 탭 전환
- **13주 히트맵** — 일별 집중 강도 시각화
- **주간 요약 카드** — 총 시간, 일 평균, 최고 요일, 전주 대비 변화율
- **최장 세션 기록** — 가장 긴 단일 집중 세션 추적
- **카테고리별 통계** — 카테고리별 누적 시간 비율 (Stacked bar + 상세 행)
- **주간 요약 팝업** — 매주 월요일 첫 진입 시 지난주 요약 표시
- **CSV 내보내기** — 세션 데이터 내보내기
- **정원 컬렉션** — 모든 식물 종류, 성장 단계, 해금 조건 열람

### 온보딩 & 가이드

- **랜딩 페이지** — 첫 방문 시 식물 성장 애니메이션 + "3분 체험" 데모 CTA
- **5단계 온보딩** — 타이머=성장, 중단=시들기, 복구, 사운드&카테고리 안내
- **인터랙티브 투어** — 7단계 UI 요소별 가이드
- **도움말 버튼** — 온보딩 완료 후 언제든 재확인 가능

### 계정 & 동기화

- **로그인** — Supabase Auth (이메일/구글)
- **클라우드 동기화** — 자동 push/pull (충돌 해소 포함)
- **구독 관리** — 서버 권한 기반 플랜/엔타이틀먼트 관리

### UX

- **다크 모드** — 라이트/다크 테마 + 계절 오로라 효과
- **날씨 연동** — 집중 모드 중 현재 날씨에 맞춰 오로라 분위기 변경
- **호흡 가이드** — 휴식 시간에 안내되는 호흡 운동
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
| 오디오 | Web Audio API (mp3 루프 재생) |
| 인증 & DB | Supabase |
| 모니터링 | Sentry |
| PWA | vite-plugin-pwa |
| 영상 | Remotion (프로모 비디오 렌더링) |

## 시작하기

```bash
npm install
npm run dev
```

## 환경 변수

Supabase 연동 시 `.env` 파일에 다음 값을 설정하세요:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=your-sentry-dsn          # 선택
```

## Supabase 설정

`supabase/migrations` 디렉토리의 SQL을 적용하세요:

- `001_user_sync.sql` — 클라우드 동기화 데이터
- `002_user_subscriptions.sql` — 서버 권한 구독/플랜 정보 (클라이언트 RLS select only)

`user_subscriptions`는 클라이언트에서 읽기 전용입니다. 쓰기는 Supabase service role을 사용하는 신뢰할 수 있는 백엔드/웹훅에서 처리해야 합니다.

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입 체크 + 프로덕션 빌드 |
| `npm run preview` | 프로덕션 빌드 미리보기 |
| `npm run lint` | ESLint 실행 |
| `npm run video:preview` | Remotion Studio 열기 |
| `npm run video:studio` | Remotion Studio 열기 (별칭) |
| `npm run video:render` | 인트로 비디오 렌더링 (`out/intro.mp4`) |
| `npm run video:render:all` | 전체 비디오 컴포지션 렌더링 |

## 프로젝트 구조

```
src/
  App.tsx                          # 메인 앱 레이아웃 & 상태 통합
  main.tsx                         # 진입점
  index.css                        # Tailwind + CSS 변수 (라이트/다크/오로라)

  components/
    LandingScreen.tsx              # 첫 방문 랜딩 페이지 (식물 애니메이션 + 데모 CTA)
    Onboarding.tsx                 # 5단계 온보딩 모달
    TourGuide.tsx                  # 7단계 인터랙티브 투어
    HelpButton.tsx                 # 도움말 재오픈 버튼
    TimerDisplay.tsx               # 타이머 UI + 컨트롤
    PlantGarden.tsx                # 식물 디스플레이 + 성장 프로그레스 바
    AudioMixer.tsx                 # 앰비언트 사운드 믹서
    AppHeader.tsx                  # 상단 네비게이션 (스트릭, 다크모드 등)
    AuroraBlob.tsx                 # 오로라 비주얼
    HistoryPanel.tsx               # 통계 & 기록 (주간/월간 차트, 히트맵, 카테고리)
    GardenCollection.tsx           # 식물 컬렉션 패널
    TodoPanel.tsx                  # 할 일 목록 패널
    TimerSettings.tsx              # 타이머 설정 패널
    CategoryChips.tsx              # 카테고리 셀렉터 + 힌트
    WeeklySummaryPopup.tsx         # 주간 요약 팝업 (월요일)
    SessionRecoveryDialog.tsx      # 세션 복구 다이얼로그
    BreathingGuide.tsx             # 호흡 가이드
    AuthModal.tsx                  # 로그인 모달
    UpgradeModal.tsx               # 구독 업그레이드 모달
    ConfirmModal.tsx               # 범용 확인 모달
    ShortcutGuide.tsx              # 키보드 단축키 가이드
    PlantParticles.tsx             # 성장/수확/사망 파티클
    Confetti.tsx                   # 축하 꽃가루
    Fireflies.tsx                  # 반딧불 이펙트
    ProgressRing.tsx               # 원형 프로그레스
    Toast.tsx                      # 토스트 알림
    ProGate.tsx                    # Pro 기능 게이트
    InstallBanner.tsx              # PWA 설치 배너
    ErrorBoundary.tsx              # 에러 바운더리
    ui/
      BottomSheet.tsx              # 바텀 시트 UI
      pixel-plants.tsx             # SVG 픽셀 아트 식물 (10종 × 6단계)

  hooks/
    useTimer.ts                    # 타이머 로직 (Web Worker + 세션 복구 + Visibility API)
    useTimerSettings.ts            # 타이머 시간 설정 (Zustand)
    useGarden.ts                   # 정원 상태 (Zustand + persist + 마일스톤)
    useAudioMixer.ts               # 오디오 믹서 (Web Audio API)
    useAudioReactivity.ts          # 오디오 반응형 비주얼
    useAuth.ts                     # 인증 (이메일/구글)
    useSubscription.ts             # 구독 상태
    useTodos.ts                    # 할 일 목록
    useCategories.ts               # 카테고리 태그
    useDarkMode.ts                 # 다크 모드 토글
    useWeather.ts                  # 날씨 연동 오로라
    useTour.ts                     # 인터랙티브 투어
    useOnboarding.ts               # 온보딩 상태
    useLanding.ts                  # 랜딩 페이지 상태
    useWeeklySummary.ts            # 주간 요약 팝업 (월요일 1회)
    usePlantParticles.ts           # 파티클 이펙트 트리거
    useKeyboardShortcuts.ts        # 키보드 단축키
    useNotification.ts             # 브라우저 알림
    useDocumentTitle.ts            # 동적 페이지 타이틀
    useInstallPrompt.ts            # PWA 설치 프롬프트
    useUpgradeModal.ts             # 업그레이드 모달 상태

  lib/
    i18n.ts                        # 번역 (ko/en/ja, ~380개 키)
    stats.ts                       # 통계 계산 (주간/월간/히트맵/카테고리/CSV)
    milestones.ts                  # 마일스톤 배지 시스템
    constants.ts                   # 애니메이션 & 타이밍 상수
    date-utils.ts                  # 날짜 헬퍼
    utils.ts                       # cn() 유틸리티 (clsx + tailwind-merge)
    analytics.ts                   # 이벤트 트래킹
    sync.ts                        # 클라우드 동기화
    supabase.ts                    # Supabase 클라이언트
    notification-sound.ts          # 완료 사운드
    share-card.ts                  # 공유 카드 생성

  workers/
    timer.worker.ts                # Web Worker (1초 인터벌 TICK)

remotion/
  index.ts                         # Remotion 진입점
  Root.tsx                         # 컴포지션 등록
  FocusValleyIntro.tsx             # 인트로 비디오
  compositions/
    Full.tsx                       # 풀 버전 비디오
    Teaser.tsx                     # 티저 비디오
    Shorts.tsx                     # 숏폼 비디오
  scenes/                          # 비디오 씬 (Logo, Timer, Garden, Sounds 등)

public/
  sounds/                          # 앰비언트 사운드 (rain, fire, cafe, stream, white)
  privacy.html                     # 개인정보처리방침
  terms.html                       # 이용약관
  offline.html                     # 오프라인 폴백
  landing.html                     # 정적 랜딩 페이지
  guide.html                       # 사용 가이드
  robots.txt / sitemap.xml         # SEO

supabase/
  migrations/
    001_user_sync.sql              # 클라우드 동기화 테이블
    002_user_subscriptions.sql     # 구독 테이블
```

## 핵심 아키텍처

### 타이머 (Web Worker)

브라우저 탭 비활성 시 `setInterval`이 쓰로틀링되는 문제를 Web Worker로 해결. Worker가 1초마다 `TICK` 메시지를 전송하고, 메인 스레드가 상태를 갱신합니다.

- **Page Visibility API**: 탭 복귀 시 `startedAt` 기준으로 경과 시간 재계산
- **세션 복구**: `localStorage`에 타이머 상태 실시간 저장, 재진입 시 복구 다이얼로그 표시
- **4사이클 패턴**: 집중 → 짧은 휴식 → (×3) → 긴 휴식 → 반복

### 상태 관리 (Zustand)

모든 영속 상태는 Zustand + `persist` 미들웨어로 `localStorage`에 저장됩니다.

| 키 | 용도 |
|----|------|
| `focus-valley-garden` | 식물, 세션, 스트릭, 마일스톤 |
| `focus-valley-timer-state` | 타이머 실행 상태 |
| `focus-valley-locale` | 언어 설정 |
| `focus-valley-landing-done` | 랜딩 페이지 완료 |
| `focus-valley-onboarding-done` | 온보딩 완료 |

### 식물 성장 시스템

집중 세션 진행률에 따라 식물 단계가 결정됩니다:

| 진행률 | 단계 |
|--------|------|
| < 10% | 씨앗 (SEED) |
| < 40% | 새싹 (SPROUT) |
| < 70% | 묘목 (BUD) |
| < 100% | 나무 (FLOWER) |
| 100% | 꽃 (TREE) |

세션 포기 시 식물은 사망(DEAD) 상태가 되며, 탭하여 새 씨앗을 심을 수 있습니다.

### 오디오 시스템

Web Audio API를 사용한 mp3 오디오 루프 재생. 5개 트랙(rain, fire, cafe, stream, white) 개별 볼륨 조절 + 마스터 뮤트.

## 라이선스

MIT
