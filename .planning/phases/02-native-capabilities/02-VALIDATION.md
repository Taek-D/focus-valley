---
phase: 2
slug: native-capabilities
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | vite.config.ts (test block) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test:ci` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test:ci`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | NATIVE-01 | unit | `npm test -- src/hooks/useNotification.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | NATIVE-02 | unit | `npm test -- src/hooks/useHaptic.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | NATIVE-03 | unit | `npm test -- src/hooks/useBackButton.test.ts` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 0 | NATIVE-04 | unit | `npm test -- src/hooks/useAudioMixer.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-01 | 01 | 1 | NATIVE-01 | unit | `npm test -- src/hooks/useNotification.test.ts` | ❌ W0 | ⬜ pending |
| 2-02-02 | 01 | 1 | NATIVE-02 | unit | `npm test -- src/hooks/useHaptic.test.ts` | ❌ W0 | ⬜ pending |
| 2-03-01 | 02 | 1 | NATIVE-03 | unit | `npm test -- src/hooks/useBackButton.test.ts` | ❌ W0 | ⬜ pending |
| 2-04-01 | 02 | 1 | NATIVE-04 | unit | `npm test -- src/hooks/useAudioMixer.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/useNotification.test.ts` — stubs for NATIVE-01 (mock `@capacitor/local-notifications` and `@capacitor/app`)
- [ ] `src/hooks/useHaptic.test.ts` — stubs for NATIVE-02 (mock `@capacitor/haptics` and `@capacitor/core`)
- [ ] `src/hooks/useBackButton.test.ts` — stubs for NATIVE-03 (extract pure back-button logic, test state transitions)
- [ ] `src/hooks/useAudioMixer.test.ts` — stubs for NATIVE-04 (mock AudioContext, test resumeAudio behavior)

*Mocking pattern: vi.mock Capacitor plugins consistent with existing project tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Notification fires with screen off | NATIVE-01 | Requires real Android device with screen off | 1. Start focus session 2. Lock screen 3. Wait for timer completion 4. Verify notification appears |
| Haptic pulse felt on plant growth | NATIVE-02 | Physical haptic sensation cannot be automated | 1. Start session 2. Wait for plant growth stage change 3. Verify haptic felt |
| Back button closes bottom sheet | NATIVE-03 | Requires native Android back gesture | 1. Open a panel 2. Press hardware back 3. Verify panel closes |
| Audio resumes after app foreground | NATIVE-04 | Requires real app lifecycle transition | 1. Start session with audio 2. Switch to another app 3. Return to Focus Valley 4. Verify audio resumes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
