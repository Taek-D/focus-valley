---
phase: 4
slug: play-store-release
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | existing vitest config |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STORE-01 | manual | `cd android && ./gradlew bundleRelease && ls app/build/outputs/bundle/release/app-release.aab` | N/A | ⬜ pending |
| 04-02-01 | 02 | 2 | STORE-02 | manual-only | N/A — visual review in Play Console | N/A | ⬜ pending |
| 04-03-01 | 03 | 1 | STORE-03 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 1 | STORE-03 | manual smoke | `curl -I https://focus-valley.vercel.app/privacy.html` | N/A | ⬜ pending |
| 04-04-01 | 04 | 3 | STORE-04 | manual-only | N/A — Play Console submission | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/useAuth.test.ts` — add account deletion tests (mock Supabase functions.invoke, verify signOut called after deletion, verify error state on failure)

*Covers STORE-03 account deletion behavior.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Signed AAB installs and runs on device | STORE-01 | Physical device/emulator install required | Build AAB, install via `bundletool`, launch app, verify timer works |
| Play Store listing assets complete | STORE-02 | Visual review in Play Console | Check title, descriptions, screenshots (4+), feature graphic in Console |
| Privacy policy URL is accessible | STORE-03 | External URL liveness check | `curl -I https://focus-valley.vercel.app/privacy.html` — expect 200 |
| Data Safety form submitted | STORE-03 | Play Console form submission | Verify all 4 data categories declared in Console |
| App passes Play review | STORE-04 | Google review process | Monitor Play Console for review status change to "Published" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
