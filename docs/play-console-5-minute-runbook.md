# Google Play Console 5-Minute Runbook

Last updated: 2026-03-30

This runbook is the fastest path to get `Focus Valley` into Google Play Console today.

## 1. Check release track eligibility first

Open Google Play Console and go to:

`Test and release > Production`

- If you can see `Create new release`, you can continue with a production submission.
- If you see `Apply for production access` or Production is unavailable, switch today’s goal to:
  - `Testing > Internal testing`, or
  - `Testing > Closed testing`

Important:
- For personal developer accounts created on or after November 13, 2023, Google requires a closed test with at least 12 opted-in testers for 14 consecutive days before production access is available.
- Official doc: <https://support.google.com/googleplay/android-developer/answer/14151465?hl=en>

## 2. Main store listing

Go to:

`Grow users > Store presence > Main store listing`

Use these values:

- App name: `Focus Valley - 집중 타이머`
- Default category: `Productivity`
- Privacy policy URL: `https://focus-valley.vercel.app/privacy.html`

Copy from these files:

- Short description (KO): `store-listing/short-description-ko.txt`
- Full description (KO): `store-listing/full-description-ko.txt`
- Short description (EN): `store-listing/short-description-en.txt`
- Full description (EN): `store-listing/full-description-en.txt`

Current limits verified against Google Play docs:

- App name: 30 characters
- Short description: 80 characters
- Full description: 4000 characters

## 3. Store settings

Go to:

`Grow users > Store presence > Store settings`

Fill:

- Category: `Productivity`
- Contact email: your live support email
- Website: optional
- Privacy policy: `https://focus-valley.vercel.app/privacy.html`

## 4. App content

Go to:

`Policy and programs > App content`

Complete every section until nothing shows `Needs attention`.

Recommended answers for this app:

- Privacy policy: `https://focus-valley.vercel.app/privacy.html`
- Ads: `No`
- App access:
  - Core timer features work without login.
  - Suggested note: `Google sign-in is only required for cloud sync. The core timer experience works without login.`
- Target audience and content:
  - Not directed to children
  - Choose the real audience range, typically `13+`
- Content rating:
  - Complete IARC questionnaire
- Financial features:
  - `My app doesn't provide any financial features`

## 5. Data safety

Only declare data that the shipped app actually collects or shares.

Use this as the review checklist before selecting answers:

- Email address: collected when user signs in for cloud sync
- App activity / session data: collected if garden, sessions, todos, or settings sync is enabled
- App info and performance: collected only if Sentry or analytics are enabled in the shipping build
- Approximate location: declare only if the weather feature is active in the shipping build

Do not over-declare or under-declare. The Play Console answers must match the real app behavior and the privacy policy.

Official doc: <https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-IN>

## 6. Upload the release

Use this file:

- `android/app/build/outputs/bundle/release/app-release.aab`

Go to one of these:

- Production: `Test and release > Production > Create new release`
- Internal testing: `Testing > Internal testing > Create new release`
- Closed testing: `Testing > Closed testing > Create new release`

## 7. Release notes

Suggested release notes for v1.1.0:

- English: `Initial Android release of Focus Valley. Stay focused, grow your pixel art garden, and keep your timer running accurately in the background.`
- Korean: `Focus Valley 안드로이드 첫 출시입니다. 집중하며 픽셀 아트 정원을 키우고, 백그라운드에서도 정확하게 흐르는 타이머를 경험해 보세요.`

## 8. Final checks before review

- Confirm the uploaded artifact is `android/app/build/outputs/bundle/release/app-release.aab`
- Confirm every required Play Console section is green
- Confirm screenshots use real app screens only
- Confirm privacy policy URL opens publicly
- Confirm the background-completion notification once more before a production launch

Known caution:

- Background completion notification was not confirmed as a clean pass in the latest release QA, so verify it once manually before production submission.

Latest QA evidence:

- `output/android-qa/20260330-135704`
- `output/android-qa/20260330-135846`

## Official references

- Create and set up your app: <https://support.google.com/googleplay/android-developer/answer/9859152?hl=en-sg>
- Prepare your app for review: <https://support.google.com/googleplay/android-developer/answer/9859455?hl=en>
- Data safety: <https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-IN>
- Personal account testing requirements: <https://support.google.com/googleplay/android-developer/answer/14151465?hl=en>
- Publish your app: <https://support.google.com/googleplay/android-developer/answer/9859751?hl=en-EN>
- Financial features declaration: <https://support.google.com/googleplay/android-developer/answer/13849271?hl=en-EN>
