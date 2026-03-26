# Focus Valley - Google Play Store 제출 가이드

> 최종 업데이트: 2026-03-26
> 대상: Focus Valley v1.1.0 (Capacitor Android)

---

## 목차

1. [사전 확인 체크리스트](#1-사전-확인-체크리스트)
2. [Play Console에서 앱 생성](#2-play-console에서-앱-생성)
3. [스토어 등록정보 입력](#3-스토어-등록정보-입력)
4. [스크린샷 및 그래픽 자산](#4-스크린샷-및-그래픽-자산)
5. [콘텐츠 등급 (IARC)](#5-콘텐츠-등급-iarc)
6. [데이터 안전 (Data Safety)](#6-데이터-안전-data-safety)
7. [금융 기능 선언](#7-금융-기능-선언)
8. [앱 콘텐츠 설정](#8-앱-콘텐츠-설정)
9. [Google Play App Signing](#9-google-play-app-signing)
10. [릴리스 트랙 선택 및 AAB 업로드](#10-릴리스-트랙-선택-및-aab-업로드)
11. [검토 제출 및 출시](#11-검토-제출-및-출시)
12. [자주 발생하는 거절 사유](#12-자주-발생하는-거절-사유)
13. [참고 링크](#13-참고-링크)

---

## 1. 사전 확인 체크리스트

제출 전에 아래 항목이 모두 준비되었는지 확인하세요.

### 빌드 아티팩트
- [ ] 서명된 AAB 파일: `android/app/build/outputs/bundle/release/app-release.aab` (6.5MB)
- [ ] versionCode: 1, versionName: "1.1.0"
- [ ] targetSdkVersion: 36 (Android 15+ 요구사항 충족 - 2025년 8월 기준 API 35 이상 필수)
- [ ] minSdkVersion: 24

### 코드 및 기능
- [ ] 계정 삭제 기능 구현됨 (Settings > Delete Account)
- [ ] Supabase Edge Function `delete-account` 배포됨
- [ ] 개인정보처리방침 페이지 라이브: https://focus-valley.vercel.app/privacy.html

### 스토어 등록정보 텍스트
- [ ] `store-listing/short-description-en.txt` (영어)
- [ ] `store-listing/short-description-ko.txt` (한국어)
- [ ] `store-listing/full-description-en.txt` (영어)
- [ ] `store-listing/full-description-ko.txt` (한국어)

### 그래픽 자산 (직접 준비 필요)
- [ ] 폰 스크린샷 최소 4장 (1080x1920px 이상)
- [ ] Feature graphic 1장 (1024x500px, JPEG/PNG, 알파 채널 없음)
- [ ] 앱 아이콘 (512x512px, 32-bit PNG) — `android/` 빌드에서 자동 포함되지만 Play Console에도 별도 업로드 필요

---

## 2. Play Console에서 앱 생성

1. https://play.google.com/console 접속
2. 우측 상단 **"앱 만들기"** 클릭
3. 아래 정보 입력:

| 항목 | 값 |
|------|-----|
| 앱 이름 | `Focus Valley - 포모도로 타이머` |
| 기본 언어 | English (United States) - en-US |
| 앱 또는 게임 | 앱 |
| 유료 또는 무료 | 무료 |
| 연락처 이메일 | (개발자 이메일 입력) |

4. **선언 사항** 3개 모두 체크:
   - Developer Program Policies 동의
   - US 수출법 동의
   - Play App Signing 서비스 약관 동의
5. **"앱 만들기"** 클릭

> **주의:** 무료→유료 전환은 출시 후 불가. 유료→무료도 불가.

---

## 3. 스토어 등록정보 입력

**Play Console > 스토어 등록정보 > 기본 스토어 등록정보**

### 영어 (기본 언어)

| 필드 | 내용 | 제한 |
|------|------|------|
| 앱 이름 | `Focus Valley - 포모도로 타이머` | 최대 50자 |
| 짧은 설명 | `store-listing/short-description-en.txt` 내용 복사 | 최대 80자 |
| 자세한 설명 | `store-listing/full-description-en.txt` 내용 복사 | 최대 4,000자 |

### 한국어 번역 추가

1. 스토어 등록정보 페이지 상단 > **번역 관리 > 번역 추가**
2. 한국어 (ko) 선택
3. 아래 내용 입력:

| 필드 | 내용 |
|------|------|
| 짧은 설명 | `store-listing/short-description-ko.txt` 내용 복사 |
| 자세한 설명 | `store-listing/full-description-ko.txt` 내용 복사 |

### 카테고리 및 연락처

| 항목 | 값 |
|------|-----|
| 카테고리 | 생산성 (Productivity) |
| 이메일 주소 | (공개 연락처 이메일) |
| 개인정보처리방침 URL | `https://focus-valley.vercel.app/privacy.html` |

---

## 4. 스크린샷 및 그래픽 자산

### 필수 자산 사양

| 자산 | 크기 | 형식 | 용량 제한 | 수량 |
|------|------|------|-----------|------|
| **폰 스크린샷** | 짧은 변 최소 1080px, 긴 변 최대 3840px, 비율 9:16~16:9 | JPEG/24-bit PNG | 8MB/장 | 최소 2장, 최대 8장 |
| **Feature graphic** | 정확히 1024x500px | JPEG/24-bit PNG (알파 없음) | 1MB | 1장 |
| **앱 아이콘** | 512x512px | 32-bit PNG (알파 가능) | 1MB | 1장 |
| 7인치 태블릿 스크린샷 | 짧은 변 최소 1080px | JPEG/24-bit PNG | 8MB/장 | 최소 4장 (선택) |
| 10인치 태블릿 스크린샷 | 짧은 변 최소 1080px | JPEG/24-bit PNG | 8MB/장 | 최소 4장 (선택) |

### Focus Valley 스크린샷 계획 (최소 4장)

| # | 화면 | 모드 | 핵심 포인트 |
|---|------|------|-------------|
| 1 | 타이머 + 식물 성장 | 라이트 모드 | 메인 UX — 집중 중 식물이 자라는 모습 |
| 2 | 정원 컬렉션 | 라이트 모드 | 수집 요소 — 다양한 픽셀 식물들 |
| 3 | 타이머 화면 | 다크 모드 | 야간 사용 UX |
| 4 | 사운드 믹서 또는 통계 | 어느 모드든 | 부가 기능 소개 |

**스크린샷 캡처 방법:**
```bash
# 에뮬레이터에서 캡처 (Android Studio)
# 1. 에뮬레이터 실행 후 앱 설치
adb install android/app/build/outputs/bundle/release/app-release.aab
# 또는 debug APK로 캡처 후 사용

# 2. 에뮬레이터 사이드바 > 카메라 아이콘 (Screenshot) 클릭
# 또는 터미널에서:
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./store-listing/screenshot-1.png
```

**주의사항:**
- 목업 프레임 사용하지 않음 (CONTEXT.md 결정사항)
- 실제 기기/에뮬레이터 캡처 사용
- 스크린샷에 보이는 기능이 실제 앱에 있어야 함 (없으면 거절 사유)

### Feature Graphic (1024x500)

- 픽셀 아트 식물들을 중심에 배치
- 앱의 픽셀 아트 미학과 일치하는 배경 사용
- 텍스트 최소화 (Play Store가 자동으로 앱 이름 표시)
- **알파 채널 없는** JPEG 또는 24-bit PNG로 저장

---

## 5. 콘텐츠 등급 (IARC)

**Play Console > 앱 콘텐츠 > 콘텐츠 등급**

### 설정 절차

1. **이메일 입력** — IARC 등급 관련 연락처
2. **카테고리 선택** — "유틸리티, 생산성, 커뮤니케이션 또는 기타" 선택
3. **설문지 응답:**

| 질문 | Focus Valley 답변 | 이유 |
|------|-------------------|------|
| 폭력적인 콘텐츠? | 아니오 | 픽셀 식물만 있음 |
| 성적/선정적 콘텐츠? | 아니오 | 해당 없음 |
| 욕설/저속한 유머? | 아니오 | 해당 없음 |
| 규제 물질 관련? | 아니오 | 해당 없음 |
| 사용자 간 상호작용? | 아니오 | 멀티플레이어/채팅 없음 |
| 위치 공유? | 아니오 | 위치 수집 없음 |
| 디지털 구매? | 아니오 | 인앱 결제 없음 (v1.1) |
| 사용자 생성 콘텐츠? | 아니오 | UGC 없음 |

4. **예상 등급**: Everyone (E) / PEGI 3 / GRAC 전체이용가

> 등급은 ESRB(미주), PEGI(유럽), USK(독일), ClassInd(브라질), GRAC(한국), OFLC(호주/뉴질랜드) 등 국가별로 자동 산출됩니다.

---

## 6. 데이터 안전 (Data Safety)

**Play Console > 앱 콘텐츠 > 데이터 안전**

이 섹션은 Google Play의 데이터 안전 라벨에 표시됩니다. 개인정보처리방침과 반드시 일치해야 합니다.

### Section 1: 개요 질문

| 질문 | 답변 |
|------|------|
| 앱이 필수 사용자 데이터 유형을 수집하거나 공유하나요? | **예** |
| 앱이 사용자 데이터를 제3자에게 공유하나요? | **아니오** |
| 앱이 사용자 데이터를 전송 시 암호화하나요? | **예** (HTTPS) |
| 사용자가 데이터 삭제를 요청할 수 있나요? | **예** (인앱 삭제 버튼 + 이메일) |

### Section 2: 데이터 유형 선언

Focus Valley에서 수집하는 데이터를 정확히 선언합니다:

#### 개인 정보 (Personal info)

| 데이터 유형 | 수집 여부 | 공유 여부 | 수집 목적 | 필수 여부 |
|-------------|-----------|-----------|-----------|-----------|
| **이메일 주소** | 수집 | 비공유 | 앱 기능 (계정 인증) | 필수 (로그인 시) |
| **이름** | 수집 | 비공유 | 앱 기능 (프로필 표시) | 선택 |

> Google OAuth를 통해 수집. Supabase Auth에 저장.

#### 앱 활동 (App activity)

| 데이터 유형 | 수집 여부 | 공유 여부 | 수집 목적 | 필수 여부 |
|-------------|-----------|-----------|-----------|-----------|
| **앱 상호작용** | 수집 | 비공유 | 앱 기능 (정원/세션/할일 데이터 동기화) | 필수 |

> 정원 상태, 세션 기록, 할일 목록이 Supabase에 동기화됨.

#### 앱 정보 및 성능 (App info & performance)

| 데이터 유형 | 수집 여부 | 공유 여부 | 수집 목적 | 필수 여부 |
|-------------|-----------|-----------|-----------|-----------|
| **비정상 종료 로그** | 수집 | 비공유 | 분석 (Sentry) | 필수 |
| **기타 앱 성능 데이터** | 수집 | 비공유 | 분석 (Google Analytics 4) | 필수 |

> Sentry: 기기/OS 정보 + 에러 스택트레이스 수집
> GA4: 세션 이벤트 추적

### Section 3: 보안 관행

| 항목 | 답변 |
|------|------|
| 전송 시 암호화 | **예** |
| 데이터 삭제 요청 경로 | **예** — 인앱 삭제 버튼 (Settings > Delete Account) |
| 데이터 삭제 웹 URL | `https://focus-valley.vercel.app/privacy.html` (삭제 방법 안내 포함) |
| 아동용 앱인가요? | **아니오** |

### 주의사항

- **SDK 제3자 공개 규칙 (2025 강화)**: SDK 제공자가 여러 앱의 데이터를 사용해 광고 프로필을 구축하는 경우 "공유"로 선언해야 합니다. Focus Valley의 경우 GA4와 Sentry는 앱 기능/분석 목적으로만 사용하며 광고 프로필을 구축하지 않으므로 "비공유"가 적절합니다.
- **개인정보처리방침과 일치**: Data Safety 폼에 선언한 모든 데이터 유형이 `privacy.html`에도 명시되어 있어야 합니다. 불일치 시 검토 거절됩니다.

---

## 7. 금융 기능 선언

**Play Console > 앱 콘텐츠 > 금융 기능**

> **2025년 10월 30일부터 필수**: 금융 기능이 없는 앱을 포함하여 **모든 앱**이 이 선언을 완료해야 합니다. 미완료 시 앱 업데이트가 차단됩니다.

### Focus Valley 설정

| 질문 | 답변 |
|------|------|
| 앱에 금융 기능이 있나요? | **아니오** |
| 앱이 디지털 화폐, 암호화폐를 다루나요? | **아니오** |
| 앱이 대출, 보험, 투자 서비스를 제공하나요? | **아니오** |

금융 기능이 없으므로 "없음"으로 선언하면 됩니다.

---

## 8. 앱 콘텐츠 설정

**Play Console > 앱 콘텐츠** 에서 추가로 설정해야 하는 항목들:

### 광고 선언
| 질문 | 답변 |
|------|------|
| 앱에 광고가 포함되어 있나요? | **아니오** |

### 대상 연령층
| 질문 | 답변 |
|------|------|
| 앱이 아동을 대상으로 하나요? | **아니오** |
| 대상 연령층 | 13세 이상 (Google 계정 로그인 필요) |

### 뉴스 앱 선언
| 질문 | 답변 |
|------|------|
| 뉴스 앱인가요? | **아니오** |

### 건강 앱 선언
| 질문 | 답변 |
|------|------|
| 건강/피트니스 앱인가요? | **아니오** |

> 포모도로 타이머는 생산성 도구이지 건강/피트니스 앱이 아닙니다.

---

## 9. Google Play App Signing

### 개요

2025년 기준 **모든 신규 앱**은 Play App Signing이 필수입니다. AAB 형식만 제출 가능합니다.

### 작동 방식

```
[개발자] upload key로 AAB 서명 → [Google Play] app signing key로 최종 APK 서명 → [사용자] 디바이스에 설치
```

- **Upload key**: 개발자가 보유 (`focusvalley-upload.jks`)
- **App signing key**: Google이 보안 인프라(HSM)에서 관리

### Focus Valley 설정

| 항목 | 값 |
|------|-----|
| Upload keystore | `android/focusvalley-upload.jks` |
| Key alias | `focusvalley-upload` |
| Keystore 비밀번호 | `android/keystore.properties`에 저장 |
| 등록 방식 | 첫 AAB 업로드 시 자동 등록 (Google 생성 키 권장) |

### 키 관리 주의사항

- **Upload key 분실**: Play Console 고객 지원을 통해 재설정 가능 (본인 인증 필요)
- **App signing key**: Google이 관리하므로 분실 불가
- Upload key 유효기간이 **2033년 10월 22일 이후**까지여야 함 (10000일 유효기간으로 충분)

> **반드시 `focusvalley-upload.jks`를 안전한 곳에 백업하세요** (비밀번호 관리자, 암호화된 외부 저장소 등)

---

## 10. 릴리스 트랙 선택 및 AAB 업로드

### 릴리스 트랙 옵션

| 트랙 | 대상 | 검토 필요 | 특징 |
|------|------|-----------|------|
| **내부 테스트** | 최대 100명 (이메일 지정) | 아니오 (수분 내 배포) | 스토어 등록정보 불필요, 빠른 테스트용 |
| **비공개 테스트 (Alpha)** | 이메일 초대 그룹 | 예 | 여러 트랙 동시 운영 가능 |
| **공개 테스트 (Beta)** | Play Store에서 옵트인 | 예 | 스토어에 "베타 참여" 표시 |
| **프로덕션** | 모든 사용자 | 예 | 단계적 출시 지원 (1%~100%) |

### 개인 개발자 계정 중요 요구사항 (2025~)

> **개인 개발자 계정**의 경우, 프로덕션 출시 전에 **비공개 테스트에서 최소 12명의 테스터가 14일 연속** 옵트인해야 합니다.
> - 조직(회사) 계정은 이 요구사항이 적용되지 않습니다.
> - 이 규정은 사기/저품질 앱 방지를 위해 도입되었습니다.

### 권장 출시 경로

```
내부 테스트 (기능 확인)
    ↓
비공개 테스트 (12명+ 14일, 개인 계정인 경우)
    ↓
프로덕션 (단계적 출시 20% → 50% → 100%)
```

### AAB 업로드 절차

1. **Play Console > 테스트 및 출시 > 프로덕션** (또는 선택한 트랙)
2. **"새 릴리스 만들기"** 클릭
3. App Signing 등록 안내가 나오면 **"Google에서 생성된 키 사용" 선택 (권장)**
4. AAB 파일 업로드:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```
5. 릴리스 정보 입력:

| 항목 | 값 |
|------|-----|
| 릴리스 이름 | `1.1.0` |
| 릴리스 노트 (EN) | `Initial release of Focus Valley for Android. Grow your pixel art garden while staying focused!` |
| 릴리스 노트 (KO) | `Focus Valley 안드로이드 첫 출시. 집중하며 픽셀 아트 정원을 가꿔보세요!` |

6. **"릴리스 검토"** 클릭

---

## 11. 검토 제출 및 출시

### 제출 전 최종 확인

Play Console 대시보드에서 **모든 섹션이 녹색 체크** 표시인지 확인:

- [ ] 스토어 등록정보 (텍스트 + 그래픽)
- [ ] 콘텐츠 등급 완료
- [ ] 데이터 안전 폼 완료
- [ ] 금융 기능 선언 완료
- [ ] 앱 콘텐츠 설정 (광고, 대상 연령, 뉴스 등)
- [ ] 개인정보처리방침 URL 입력
- [ ] 앱 액세스 (로그인 필요 시 테스트 계정 제공)
- [ ] AAB 업로드 완료

### 앱 액세스 설정 (중요!)

**Play Console > 앱 콘텐츠 > 앱 액세스**

Focus Valley는 Google 로그인이 필요하므로:
- "앱의 기능이 전부 또는 일부 제한됨" 선택
- **테스트 계정 정보 제공**: 검토자가 로그인할 수 있는 Google 계정 (이메일 + 비밀번호) 또는 "로그인 없이도 핵심 기능(타이머) 사용 가능" 설명

> 로그인 없이 타이머를 사용할 수 있다면 "모든 기능 사용 가능, 특별한 액세스 불필요"로 선택해도 됩니다. 단, 정원 동기화 등 로그인 필요 기능이 있다면 테스트 방법을 명시하세요.

### 검토 프로세스

| 항목 | 내용 |
|------|------|
| 검토 소요 시간 | 보통 **1~7일** (신규 앱은 더 걸릴 수 있음) |
| 검토 방식 | 자동 검사 + 휴먼 리뷰 병행 |
| 사전 검토 (Pre-review) | 2025년 추가 — 제출 전 정책 위반 자동 감지 |
| 거절 시 | 정책 센터에서 이의 제기 가능, 계정 상태에 영향 없음 |

### 단계적 출시 (권장)

프로덕션 출시 시 전체 사용자에게 바로 배포하지 않고 단계적으로 진행할 수 있습니다:

```
20% → 3~5일 모니터링 → 50% → 3~5일 → 100%
```

Play Console에서 비정상 종료율, ANR 비율을 모니터링하며 문제 시 출시를 중단할 수 있습니다.

> **2025년 신규 기능**: 100% 출시 후에도 "출시 중단"으로 신규 사용자 배포를 멈출 수 있습니다.

---

## 12. 자주 발생하는 거절 사유

### Focus Valley에 해당할 수 있는 사유

| 거절 사유 | 예방 방법 | Focus Valley 상태 |
|-----------|-----------|-------------------|
| 개인정보처리방침 누락 | URL 입력 + 라이브 확인 | ✓ `privacy.html` 라이브 |
| Data Safety 폼 미완료 | 모든 섹션 작성 | 작성 필요 |
| 금융 기능 선언 미완료 | "없음"으로 선언 | 작성 필요 |
| 스크린샷에 없는 기능 표시 | 실제 앱 캡처만 사용 | 실기기 캡처 예정 |
| 계정 삭제 경로 없음 | 인앱 + 웹 삭제 경로 제공 | ✓ 구현됨 |
| 앱 비정상 종료 | 릴리스 빌드 테스트 | 테스트 필요 |
| Target SDK 미달 | API 35 이상 | ✓ API 36 |
| 테스트 계정 미제공 | 앱 액세스에 계정 정보 입력 | 입력 필요 |

### 일반적인 거절 사유 전체 목록

| 카테고리 | 세부 사유 |
|----------|-----------|
| 기능 오류 | 앱 크래시, 스크린샷 기능 미작동, 테스트 계정 미제공 |
| 메타데이터 위반 | 설명과 실제 기능 불일치, 오해 유발 스크린샷 |
| 정책 위반 | 개인정보처리방침 누락, 미선언 데이터 수집, 권한 정책 위반 |
| 콘텐츠 정책 | 등급 미설정, 부적절한 콘텐츠 |
| 선언 누락 | Data Safety 미완료, 금융 기능 미선언 |
| 서명 문제 | AAB 서명 오류, upload key 유효기간 만료 |

---

## 13. 참고 링크

### 공식 문서
- [앱 만들기 및 설정](https://support.google.com/googleplay/android-developer/answer/9859152)
- [미리보기 자산 추가 (스크린샷/그래픽)](https://support.google.com/googleplay/android-developer/answer/9866151)
- [데이터 안전 섹션 정보 제공](https://support.google.com/googleplay/android-developer/answer/10787469)
- [콘텐츠 등급](https://support.google.com/googleplay/android-developer/answer/9898843)
- [Play App Signing 사용](https://support.google.com/googleplay/android-developer/answer/9842756)
- [앱 서명 (Android Studio)](https://developer.android.com/studio/publish/app-signing)
- [테스트 트랙 설정](https://support.google.com/googleplay/android-developer/answer/9845334)
- [개인 개발자 계정 테스트 요구사항](https://support.google.com/googleplay/android-developer/answer/14151465)
- [릴리스 준비 및 출시](https://support.google.com/googleplay/android-developer/answer/9859348)
- [검토 준비](https://support.google.com/googleplay/android-developer/answer/9859455)
- [사전 검토 확인](https://support.google.com/googleplay/android-developer/answer/14807773)
- [Target API level 요구사항](https://support.google.com/googleplay/android-developer/answer/11926878)

### 2025-2026 정책 변경
- [2025년 4월 정책 업데이트](https://support.google.com/googleplay/android-developer/answer/15899442)
- [2025년 10월 정책 업데이트 (금융 기능)](https://support.google.com/googleplay/android-developer/answer/16550159)
- [Android 개발자 인증 프로그램](https://developer.android.com/developer-verification/guides/google-play-console)
- [I/O 2025: Google Play 새 소식](https://android-developers.googleblog.com/2025/05/io-2025-whats-new-in-google-play.html)

---

*이 가이드는 Focus Valley v1.1.0 Capacitor Android 출시를 위해 작성되었습니다.*
*2026년 3월 기준 최신 Google Play Console 정책을 반영합니다.*
