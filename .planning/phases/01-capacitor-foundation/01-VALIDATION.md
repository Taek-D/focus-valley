---
phase: 1
slug: capacitor-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + manual APK testing |
| **Config file** | vitest.config.ts (existing) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npx tsc -b` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npx tsc -b`
- **Before `/gsd:verify-work`:** Full suite must be green + manual APK install test
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01 | 01 | 1 | SETUP-01 | manual | APK install + WebView render | N/A | pending |
| 01-02 | 01 | 1 | SETUP-02 | unit | `npm test` (VitePWA conditional) | pending W0 | pending |
| 01-03 | 02 | 1 | SETUP-03 | unit | `npm test` (storage adapter) | pending W0 | pending |
| 01-04 | 03 | 2 | SETUP-04 | manual | Emulator cold start visual check | N/A | pending |
| 01-05 | 03 | 2 | SETUP-05 | unit | `npm test` (timer drift correction) | exists | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] Storage adapter unit test stub (SETUP-03)
- [ ] VitePWA conditional build test stub (SETUP-02)
- [ ] Timer appStateChange handler test stub (SETUP-05)

*Existing infrastructure: vitest configured, timer-state.test.ts exists for extension*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| APK loads SPA in WebView | SETUP-01 | Requires Android emulator | Build APK, install on emulator, verify SPA renders |
| Splash screen theming | SETUP-04 | Visual verification | Cold start emulator, check splash color matches theme |
| Back button doesn't exit | SETUP-05 | Requires emulator interaction | Start timer session, press back button, verify no exit |
| Data survives app kill | SETUP-03 | Requires emulator lifecycle | Add plant data, force-stop app, relaunch, verify data |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
