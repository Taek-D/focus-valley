# Apps in Toss 마이그레이션 가이드

Focus Valley를 앱인토스(Apps in Toss) WebView 미니앱으로 전환하기 위한 가이드입니다.

SDK: `@apps-in-toss/web-framework`

## 웹 버전과의 차이

| 항목 | 웹 (`master`) | 앱인토스 (`feature/apps-in-toss`) |
|------|---------------|----------------------------------|
| 인증 | 이메일/구글 (Supabase Auth) | 토스 로그인 (`appLogin()`) |
| 결제 | Waitlist | IAP 단건 결제 (1개월/3개월/1년) |
| 다크 모드 | 라이트/다크 지원 | 라이트 모드 고정 |
| PWA | 지원 (오프라인, 설치) | 제거 (미니앱에서 불필요) |
| Sentry | 전체 (tracing + replay) | 최소 (에러 캡처만) |
| 진입점 | `createRoot().render()` | 동일 + `granite.config.ts` |

## 변경된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `granite.config.ts` | **(신규)** 앱인토스 프로젝트 설정 (appName, brand, web) |
| `package.json` | `@apps-in-toss/web-framework` 의존성 추가 |
| `vite.config.ts` | `vite-plugin-pwa` 제거 |
| `src/main.tsx` | Sentry 최소 설정, ErrorBoundary 라이트 모드 색상 |
| `src/App.tsx` | `useDarkMode`, `useInstallPrompt`, `InstallBanner` 제거 |
| `src/components/AppHeader.tsx` | 다크 토글 버튼 제거 |
| `src/hooks/useAuth.ts` | 이메일/구글 로그인 → `signInWithToss()` |
| `src/components/AuthModal.tsx` | Supabase Auth UI → 토스 로그인 버튼 |
| `src/hooks/useSubscription.ts` | IAP 주문 내역 조회 추가 (Supabase DB와 병렬) |
| `src/components/UpgradeModal.tsx` | Waitlist → IAP 결제 플로우 (3종 SKU 선택) |
| `supabase/functions/toss-auth/` | **(신규)** 토스 인가 코드 → Supabase 세션 교환 |
| `supabase/functions/iap-grant/` | **(신규)** IAP 결제 성공 → 구독 상태 upsert |

## 인증 플로우

```
사용자 → 토스 로그인 버튼 클릭
       → appLogin() 호출 (토스 앱 인증 화면)
       → { authorizationCode, referrer } 반환
       → Supabase Edge Function (toss-auth) 호출
           → 토스 API: 인가 코드 → access token
           → 토스 API: access token → userKey 조회
           → Supabase: toss_{userKey}@focus-valley.app 유저 생성/조회
           → Supabase: 세션 토큰 발급
       → 클라이언트: setSession(access_token, refresh_token)
```

## 결제 플로우 (IAP)

```
사용자 → Pro 업그레이드 버튼 클릭
       → SKU 선택 (1개월 / 3개월 / 1년)
       → IAP.createOneTimePurchaseOrder() 호출
           → 토스 결제 화면 표시
           → processProductGrant 콜백:
               → Supabase Edge Function (iap-grant) 호출
               → user_subscriptions 테이블 upsert (plan: pro)
       → 구독 상태 갱신
```

### IAP SKU

| SKU | 기간 | 설명 |
|-----|------|------|
| `focus_valley_pro_1m` | 30일 | 1개월 |
| `focus_valley_pro_3m` | 90일 | 3개월 |
| `focus_valley_pro_1y` | 365일 | 1년 |

> 앱인토스는 반복 구독을 지원하지 않으므로 단건 결제만 사용합니다.

## Edge Functions 배포

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase functions deploy toss-auth --no-verify-jwt
npx supabase functions deploy iap-grant --no-verify-jwt
```

`toss-auth`는 인증 전 호출이므로 `--no-verify-jwt`가 필요합니다.

## 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 앱인토스 샌드박스 테스트

**iOS:**
- 앱인토스 샌드박스 앱에서 `intoss://focus-valley` 스킴으로 접속

**Android:**
```bash
adb reverse tcp:5173 tcp:5173
# 샌드박스 앱에서 동일 스킴으로 접속
```

## 플랫폼 제약 사항

- **iOS 서드파티 쿠키 차단** — 쿠키 기반 인증 사용 금지 (localStorage 기반으로 유지)
- **외부 로깅 제한** — Sentry 사용 가능 여부 확인 전까지 ErrorBoundary 내부에만 유지
- **토스 로그인/IAP** — 사업자 등록 후 활성화됨 (개발 중에는 sandbox 사용)

## 배포 전 체크리스트

- [ ] 앱인토스 콘솔에서 앱 등록
- [ ] IAP SKU 3종 등록 (콘솔)
- [ ] 사업자 등록 완료
- [ ] Supabase Edge Functions 배포 (`toss-auth`, `iap-grant`)
- [ ] 토스 로그인 sandbox → live 전환
- [ ] IAP sandbox → live 전환
- [ ] `granite.config.ts`의 brand 정보 확인 (icon URL 등)
