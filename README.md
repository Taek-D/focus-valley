# Focus Valley

집중 세션을 끝까지 마치면 픽셀 식물이 자라고, 중간에 포기하면 시드는 뽀모도로 타이머입니다.
웹(PWA)으로 배포되어 있고, 같은 코드를 Capacitor로 감싼 Android 프로젝트가 저장소에 함께 들어 있습니다.

- 라이브: https://focus-valley.vercel.app
- 개발 기간: 2026년 2월~3월
- 구성: React 19 + TypeScript 클라이언트, Supabase(인증·동기화·플랜 정보), Vercel 정적 배포

## 왜 만들었나

오래 집중하기 어렵고 주변 소음에 쉽게 흐트러진다는 문제에서 출발했습니다.
시간만 재는 타이머로는 세션을 끝까지 유지할 이유가 약하다고 보고, 집중 진행률을 식물 성장에 연결하고 배경음을 함께 제공했습니다.
만들면서 풀어야 했던 기술 문제는 세 가지입니다. 탭을 내려 두어도 타이머가 밀리지 않을 것, 계정 없이도 기록이 기기에 남을 것, 로그인하면 여러 기기의 기록이 서로 덮어쓰지 않고 합쳐질 것.

## 무엇을 하는가

- **뽀모도로 타이머**: 집중·짧은 휴식·긴 휴식 세 모드. 집중 4회마다 긴 휴식으로 넘어가며, 시간과 자동 전환 여부를 설정할 수 있습니다.
- **식물 성장**: 집중 진행률 10·40·70·100%를 경계로 `SEED → SPROUT → BUD → FLOWER → TREE` 단계가 바뀝니다. 세션을 포기하면 `DEAD`가 되고, 직후에는 되돌릴 수 있습니다.
- **해금**: 식물은 10종입니다. 기본 4종 외에 연속 일수와 연속 세션 조건으로 4종이 열립니다(나머지 2종은 Pro 표시, 아래 "알려진 제한" 참고).
- **세션 복구**: 새로고침이나 종료로 끊긴 세션을 다음 진입 때 감지해 이어서 할지 묻습니다.
- **배경음 믹서**: mp3 8종을 트랙별 음량으로 섞어 반복 재생합니다.
- **기록과 통계**: 세션을 카테고리로 분류하고, 통계 패널·CSV 내보내기·공유 카드 이미지를 제공합니다.
- **계정과 데이터**: 이메일·Google 로그인, 클라우드 동기화, JSON 백업 내보내기·복원, 계정 삭제.
- **기타**: 한국어·영어·일본어, 다크 모드, 키보드 단축키, 할 일 목록.

## 구조

```
브라우저 탭 / 설치형 PWA / Android WebView
  React UI (src/App.tsx, src/components/)
    ├─ useTimer ── postMessage ──> timer.worker.ts   1초마다 TICK
    │    └─ 마감 시각을 따로 보관하고, 화면에 돌아오면 남은 시간을 다시 계산
    ├─ Zustand 스토어 (정원 · 타이머 설정 · 카테고리 · 할 일)
    │    └─ persist ──> 웹: localStorage / Android: Capacitor Preferences
    └─ 동기화 (src/lib/sync*.ts)   로컬 스냅샷 → 클라우드와 병합 → 양쪽에 반영
              │ supabase-js (PKCE)
              v
Supabase
  Auth                 이메일, Google OAuth
  user_sync            사용자당 1행(jsonb). RLS로 본인 행만 읽기·쓰기
  user_subscriptions   플랜·상태·만료일. RLS로 본인 행 읽기만
  delete-account       Edge Function. 서버에서 계정 삭제
```

- **클라이언트 상태**: 영속 상태는 영역별 Zustand 스토어가 가지고, 저장소 어댑터([`src/lib/persist.ts`](src/lib/persist.ts))가 실행 환경에 따라 저장 위치를 고릅니다. 깨진 JSON은 읽을 때 지웁니다.
- **Supabase 없이도 동작**: 환경 변수가 없으면 클라이언트를 만들지 않고([`src/lib/supabase.ts`](src/lib/supabase.ts)) 로그인·동기화만 꺼집니다. 인증·동기화 모듈은 첫 화면이 뜬 뒤 여유 시점에 동적으로 불러옵니다([`src/hooks/useAppSyncFlow.ts`](src/hooks/useAppSyncFlow.ts)).
- **PWA**: 웹 빌드에서 `vite-plugin-pwa`가 매니페스트와 서비스 워커를 만듭니다. Capacitor 빌드(`CAPACITOR_BUILD=true`)에서는 이 플러그인을 뺍니다([`vite.config.ts`](vite.config.ts)).
- **Android**: 알림은 로컬 알림 플러그인, Google 로그인은 브라우저 플러그인과 `focusvalley://` 딥링크로 처리하고, 뒤로가기 버튼과 햅틱을 따로 다룹니다([`src/hooks/useNotification.ts`](src/hooks/useNotification.ts), [`src/hooks/useAuth.ts`](src/hooks/useAuth.ts), [`capacitor.config.ts`](capacitor.config.ts)).

## 설계 결정

### 1. 타이머는 Worker 틱과 마감 시각 재계산을 함께 쓴다

비활성 탭에서는 메인 스레드의 `setInterval`이 늦어지므로 1초 틱을 Web Worker에서 보냅니다. 다만 틱 횟수만 세면 탭이나 앱이 멈춘 동안의 시간이 빠지므로, 실행 중에는 마감 시각을 따로 들고 있다가 `visibilitychange`와 Capacitor `appStateChange`에서 남은 시간을 시계 기준으로 다시 계산합니다. 돌아왔을 때 이미 마감이 지났으면 완료로 처리합니다.
근거: [`src/workers/timer.worker.ts`](src/workers/timer.worker.ts), [`src/hooks/useTimer.ts`](src/hooks/useTimer.ts)

### 2. 끊긴 세션은 자동으로 재개하지 않고 묻는다

타이머 상태(모드, 시작 시각, 남은 시간)를 변경 때마다 `localStorage`에 남깁니다. 다시 열었을 때 시간이 남아 있으면 자동으로 이어 가지 않고 복구 창을 띄우며, 자리를 비운 사이 끝났으면 되살리지 않고 완료로 처리합니다. 다시 연 순간 타이머가 사용자 확인 없이 돌기 시작하지 않게 하려는 것입니다.
근거: [`src/hooks/useTimer.ts`](src/hooks/useTimer.ts)의 `resolveInitialState`, [`e2e/recovery.spec.ts`](e2e/recovery.spec.ts)

### 3. 로컬에 먼저 저장하고, 동기화는 덮어쓰기가 아니라 병합으로 한다

기록은 항상 기기에 먼저 저장하고, 동기화 때 로컬과 클라우드 스냅샷을 합칩니다. 한쪽으로 덮어쓰면 다른 기기에서 쌓은 세션이 사라지기 때문입니다.

- 집중 세션은 id 기준 합집합, 해금 식물과 배지도 합집합입니다.
- 누적 시간과 스트릭은 저장된 값을 믿지 않고 합쳐진 세션 목록에서 다시 계산합니다.
- 설정·카테고리·할 일은 영역마다 `updatedAt`을 두고 더 최근 쪽을 우선합니다.
- 이전 형식의 데이터는 읽을 때 현재 스키마(v2)로 옮기며, 백업 복원도 같은 경로를 탑니다.
- 병합 결과가 로컬과 다르면 저장소에 쓰고 새로고침을 안내합니다. 타이머가 도는 동안에는 안내를 띄우지 않습니다.

근거: [`src/lib/sync-engine.ts`](src/lib/sync-engine.ts), [`src/lib/sync-normalize.ts`](src/lib/sync-normalize.ts), [`src/lib/sync.ts`](src/lib/sync.ts), [`src/lib/sync.test.ts`](src/lib/sync.test.ts), [`src/components/AppOverlays.tsx`](src/components/AppOverlays.tsx)

### 4. 플랜 정보는 서버 테이블에 두고 클라이언트는 읽기만 한다

`user_subscriptions`에는 조회 정책만 있고 삽입·수정·삭제 정책은 일부러 만들지 않았습니다. 로그인한 사용자가 자기 플랜을 직접 바꿀 수 없게 하려는 것입니다. 클라이언트는 플랜·상태·만료일을 읽어 Pro 여부를 계산합니다. 이 테이블에 쓰는 일은 service role을 쓰는 서버 쪽 몫인데, 결제와 웹훅은 아직 구현하지 않았습니다.
근거: [`supabase/migrations/002_user_subscriptions.sql`](supabase/migrations/002_user_subscriptions.sql), [`src/hooks/useSubscription.ts`](src/hooks/useSubscription.ts)

### 5. 계정 삭제는 Edge Function에서 처리한다

계정 삭제에는 관리자 권한이 필요하므로 클라이언트에서 하지 않습니다. 함수가 호출자의 토큰으로 본인을 확인한 뒤 삭제하고, service role 키는 함수 환경에만 둡니다. 동기화·플랜 테이블은 `on delete cascade`로 함께 지워집니다.
근거: [`supabase/functions/delete-account/index.ts`](supabase/functions/delete-account/index.ts), [`supabase/migrations/001_user_sync.sql`](supabase/migrations/001_user_sync.sql)

## 검증

2026-10-13에 로컬(Node 24, Windows)에서 실행한 결과입니다.

| 항목 | 명령 | 결과 |
|---|---|---|
| 단위 테스트 (Vitest) | `npm test` | 11개 파일, 65건 통과 |
| 타입 검사 | `npx tsc -b` | 오류 없음 |
| 린트 (ESLint) | `npm run lint` | 오류 0, 경고 2 (`react-hooks/exhaustive-deps`) |

- **단위 테스트 범위**: 동기화 스키마 이전과 병합, 타이머 복구·남은 시간 재계산, 저장소 어댑터(웹/네이티브 경로), 네이티브 Google 로그인 흐름과 계정 삭제 호출, 알림, Android 뒤로가기, 햅틱, 오디오 믹서.
- **E2E (Playwright, Chromium)**: [`e2e/`](e2e/)에 6개 파일, 7개 시나리오가 있고 프로덕션 빌드 미리보기를 대상으로 합니다. 랜딩 닫기 유지, 데모 모드, 타이머 일시정지·재개·초기화, 세션 복구(이어 하기 / 버리기), 설정·로그인·업그레이드 창, 동기화 새로고침 안내와 백업 내보내기·복원. 통과 건수는 이 표에 적지 않습니다.
- E2E의 동기화 시나리오는 실제 Supabase에 연결하지 않고 화면 상태만 주입해 확인합니다. 실제 백엔드를 상대로 한 자동화 테스트는 없습니다.
- **CI**: 없습니다. `npm run test:ci`(타입 검사 → 린트 → 단위 → E2E)를 로컬에서 실행합니다.

## 기술 스택

| 구분 | 내용 (`package.json` 기준) |
|---|---|
| UI | React 19.2, TypeScript 5.9, Tailwind CSS 4.1, Framer Motion 12.34 |
| 빌드 | Vite 7.3, vite-plugin-pwa 1.2 |
| 상태 | Zustand 5.0 (persist) |
| 백엔드 | Supabase (`@supabase/supabase-js` 2.95): Auth, Postgres + RLS, Edge Function(Deno) |
| 네이티브 | Capacitor 8.2 (Android, minSdk 24 / targetSdk 36) |
| 테스트 | Vitest 4.0, Playwright 1.58, Testing Library |
| 운영 | Vercel(정적 배포, 보안 헤더는 [`vercel.json`](vercel.json)), Sentry 10.38(선택) |
| 기타 | Remotion 4.0 (소개 영상 렌더링, `remotion/`) |

## 로컬 실행

```bash
npm install
npm run dev        # 개발 서버
npm test           # 단위 테스트
npm run test:e2e   # 빌드 후 Playwright
npm run build      # 타입 검사 + 프로덕션 빌드
```

환경 변수 없이도 타이머·정원·통계는 동작합니다. 로그인과 동기화를 쓰려면 [`.env.example`](.env.example)을 `.env`로 복사해 값을 채웁니다.

| 이름 | 용도 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 주소 |
| `VITE_SUPABASE_ANON_KEY` | Supabase 공개(anon) 키 |
| `VITE_SENTRY_DSN` | 오류 수집 (선택) |
| `VITE_GA_MEASUREMENT_ID`, `VITE_ENABLE_ANALYTICS` | 사용 분석 (선택, 프로덕션 빌드에서만) |

Supabase 쪽은 [`supabase/migrations/`](supabase/migrations/)의 SQL 두 개를 순서대로 적용하고, `delete-account` 함수를 배포합니다. Android는 `CAPACITOR_BUILD=true`로 빌드한 뒤 `npx cap sync android`로 옮깁니다.

## 알려진 제한

- **결제가 없습니다.** Pro는 미리보기 상태입니다. 업그레이드 창은 준비 중이라는 안내만 보여 주고, 결제·웹훅 코드는 저장소에 없습니다. Pro로 표시된 항목(일부 배경음·식물·공유 카드 테마 등)은 잠겨 있습니다.
- **동기화는 실시간이 아닙니다.** 로그인 직후, 집중 세션 완료 직후, 수동 실행 때만 돕니다. 병합 결과를 화면에 반영하려면 새로고침이 필요합니다.
- **삭제는 동기화로 전파되지 않습니다.** 삭제 표식이 없어서, 한 기기에서 지운 할 일이나 카테고리가 다른 기기 데이터와 합쳐지며 되살아날 수 있습니다. 최신 판정은 기기 시계에 의존합니다.
- **Android에서 저장 경로가 둘로 나뉘어 있습니다.** 스토어는 Capacitor Preferences에 저장하지만 동기화·백업 스냅샷은 `localStorage`를 직접 읽고 씁니다([`src/lib/sync-storage.ts`](src/lib/sync-storage.ts)). 둘을 맞추는 코드가 없어 Android에서의 동기화와 백업 복원은 웹과 같은 동작을 보장하지 못합니다.
- **완료 알림은 미리 예약하지 않습니다.** 타이머가 0에 도달한 것을 앱이 감지한 시점에 알림을 냅니다. 브라우저를 닫았거나 OS가 앱 실행을 멈춘 동안에는 알림이 오지 않거나 늦을 수 있습니다.
- **오프라인에서 배경음은 보장되지 않습니다.** 서비스 워커 사전 캐시 대상에 mp3가 들어 있지 않습니다.
- **타이머 복구 로직이 두 군데 있습니다.** 단위 테스트는 [`src/lib/timer-state.ts`](src/lib/timer-state.ts)를 대상으로 하고, [`src/hooks/useTimer.ts`](src/hooks/useTimer.ts)에는 같은 내용의 사본이 있습니다. 훅이 쓰는 쪽은 E2E 복구 시나리오로만 확인됩니다.
- **Android 빌드·QA 스크립트 일부가 저장소에 없습니다.** `build:android`, `qa:android` 계열 명령은 추적하지 않는 `scripts/` 폴더의 파일을 호출합니다. 새로 받은 저장소에서는 위 "로컬 실행"의 Capacitor 명령을 직접 실행해야 합니다.
- 단위 테스트는 순수 함수와 훅 로직 중심이며, 컴포넌트 렌더링 테스트는 없습니다.
