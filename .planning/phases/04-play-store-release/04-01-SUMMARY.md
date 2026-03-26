---
phase: 04-play-store-release
plan: 01
subsystem: auth
tags: [supabase, edge-function, deno, android, gradle, signing, account-deletion, i18n]

requires:
  - phase: 03-auth-and-deep-links
    provides: useAuth store with signIn/signOut/Google OAuth, Chrome Custom Tab flow

provides:
  - deleteAccount() method on useAuth store calling Supabase Edge Function
  - supabase/functions/delete-account Deno Edge Function for server-side user deletion
  - Danger Zone section in TimerSettings with two-tap confirmation flow
  - Android release signing config in build.gradle (conditional on keystore.properties)
  - versionName bumped to 1.1.0
  - Privacy policy updated with Android disclosures and Section 8 Account Deletion

affects: [play-store-submission, supabase-edge-functions, android-build]

tech-stack:
  added: [Deno Edge Function (supabase/functions/delete-account)]
  patterns:
    - Edge Function server-side deletion (never exposes service_role key to client)
    - Two-tap confirmation UI pattern for destructive actions
    - Conditional Gradle signing config (no-op without keystore.properties)

key-files:
  created:
    - supabase/functions/delete-account/index.ts
  modified:
    - src/hooks/useAuth.ts
    - src/hooks/useAuth.test.ts
    - src/components/TimerSettings.tsx
    - src/lib/i18n-packs/feature-pack.ts
    - android/app/build.gradle
    - public/privacy.html
    - .gitignore

key-decisions:
  - "deleteAccount invokes Edge Function via supabase.functions.invoke() — SDK auto-includes auth header, no manual token passing needed"
  - "build.gradle signingConfig is conditional on keystorePropertiesFile.exists() — debug builds never break without keystore"
  - "keystore.properties is gitignored — template created locally as documentation but never committed"
  - "settings.reloadToApply i18n key was referenced in TimerSettings but missing from feature-pack — added as Rule 1 auto-fix"

patterns-established:
  - "Danger Zone pattern: rounded-2xl border border-destructive/20 p-4 with two-tap (show confirm → confirm/cancel)"
  - "Edge Function auth pattern: read Authorization header, call getUser(token), then auth.admin.deleteUser(userId)"

requirements-completed: [STORE-01, STORE-03]

duration: ~20min
completed: 2026-03-26
---

# Phase 4 Plan 1: Release Signing, Account Deletion, and Privacy Policy Summary

**Signed AAB config, in-app account deletion via Deno Edge Function, and updated privacy policy for Google Play Data Safety compliance**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-26T07:15:44Z
- **Completed:** 2026-03-26T07:26:44Z
- **Tasks:** 3 of 3
- **Files modified:** 7

## Accomplishments
- Account deletion flow: deleteAccount() on useAuth → Edge Function → signOut → user null; all 13 useAuth tests pass (8 existing + 5 new)
- Supabase Edge Function at supabase/functions/delete-account/index.ts handles server-side deletion using SUPABASE_SERVICE_ROLE_KEY
- Danger Zone section added to TimerSettings with two-tap confirmation (renders only when user is signed in)
- build.gradle updated with conditional signingConfigs block; versionName bumped to 1.1.0
- Privacy policy updated: Android SharedPreferences disclosure, account deletion section, Section 8 Account Deletion, updated date

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement account deletion (Edge Function + useAuth + UI)** - `f263872` (feat)
2. **Task 2: Configure release signing and update privacy policy** - `829b08c` (feat)
3. **Task 3: Generate keystore, deploy Edge Function, build signed AAB** - COMPLETE (human-action, resolved by user)

## Files Created/Modified
- `supabase/functions/delete-account/index.ts` - Deno Edge Function: reads JWT, calls auth.admin.deleteUser, returns 200/401/500
- `src/hooks/useAuth.ts` - Added deleteAccount() method with loading/error state management
- `src/hooks/useAuth.test.ts` - Added 5 deleteAccount tests (TDD); expanded mocks for getSession, signOut, functions.invoke
- `src/components/TimerSettings.tsx` - Added Danger Zone section with two-tap Delete Account confirmation (user !== null guard)
- `src/lib/i18n-packs/feature-pack.ts` - Added dangerZone, deleteAccount, deleteAccountConfirm, deleteAccountCancel, deleteAccountConfirmButton keys (en/ko/ja); also added missing reloadToApply key
- `android/app/build.gradle` - Added signingConfigs block, conditional keystorePropertiesFile loading, versionName 1.1.0
- `public/privacy.html` - Android disclosures, account deletion instructions, Section 8 Account Deletion, date updated
- `.gitignore` - Added android/keystore.properties, android/*.jks, android/*.keystore

## Decisions Made
- `deleteAccount` uses `supabase.functions.invoke("delete-account")` without manual headers — the JS SDK automatically attaches the active session's Authorization header
- Gradle signingConfig wrapped in `if (keystorePropertiesFile.exists())` — prevents build failures for CI and debug builds without keystore
- `android/keystore.properties` is gitignored; template file created locally for developer reference but not committed (contains placeholder passwords)
- Two-tap UI pattern: first tap shows warning text + confirm/cancel buttons; confirm calls deleteAccount() then onClose()

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added missing settings.reloadToApply i18n key**
- **Found during:** Task 1 (TimerSettings.tsx modifications)
- **Issue:** `t("settings.reloadToApply")` was called in TimerSettings.tsx (line 390) but the key was never defined in feature-pack.ts — would render as empty string at runtime
- **Fix:** Added `"settings.reloadToApply"` with en/ko/ja translations to feature-pack.ts
- **Files modified:** src/lib/i18n-packs/feature-pack.ts
- **Verification:** Key exists in feature-pack.ts, tsc -b passes
- **Committed in:** f263872 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - missing i18n key that would cause silent runtime bug)
**Impact on plan:** Fix was necessary for correctness — reloadToApply was already in use but silently broken. No scope creep.

## Issues Encountered
- TypeScript strict type checking required `as unknown as T` casts in test mocks for cases where null values are intentionally passed to typed mock functions (functionsInvoke returning null data, getSession returning null session)
- PowerShell on Windows doesn't support `&&` chaining in `-Command` flag — ran tsc and lint as separate commands

## User Setup Required

All manual steps completed:
- Upload keystore generated at `android/focusvalley-upload.jks`
- `android/keystore.properties` updated with real passwords
- Edge Function `delete-account` deployed to Supabase project (yidyxlwrongecctifiis)
- Signed AAB built successfully: `android/app/build/outputs/bundle/release/app-release.aab` (6.5 MB)

## Next Phase Readiness
- Plan 04-01 fully complete: account deletion implemented and tested, signing config wired, privacy policy updated, signed AAB produced
- Ready for 04-02: Play Store listing assets, Play Console submission

---
*Phase: 04-play-store-release*
*Completed: 2026-03-26*
