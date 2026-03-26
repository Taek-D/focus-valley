---
phase: 3
slug: auth-and-deep-links
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x |
| **Config file** | `vite.config.ts` (test section, `environment: "node"`) |
| **Quick run command** | `npx vitest run src/hooks/useAuth.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/hooks/useAuth.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-06 | 01 | 1 | AUTH-01 | unit | `npx vitest run src/hooks/useAuth.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/useAuth.test.ts` — stubs for all AUTH-01 test cases
- [ ] Vitest mock: `vi.mock('@capacitor/browser', ...)` with `Browser.open`, `addListener`
- [ ] Vitest mock: `vi.mock('@supabase/supabase-js', ...)` with `signInWithOAuth` returning URL

*All are new — no existing useAuth.test.ts in codebase*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full OAuth flow via Chrome Custom Tab | AUTH-01 | Requires real Google OAuth + physical device | 1. Tap "Sign in with Google" 2. Complete OAuth in Chrome Custom Tab 3. Verify app returns authenticated |
| Share card deep link opens app | AUTH-01 | Requires Android intent system + installed app | 1. Open `focusvalley://` link from another app 2. Verify Focus Valley opens to main screen |
| Web fallback for non-installed devices | AUTH-01 | Requires device without app + browser | 1. Open share link on device without app 2. Verify redirect to focusvalley.app PWA |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
