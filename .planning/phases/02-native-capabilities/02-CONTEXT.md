# Phase 2: Native Capabilities - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

The app feels native through timer-completion notifications and haptic feedback, and ambient audio starts correctly without user workarounds. Covers NATIVE-01 (local notifications), NATIVE-02 (haptic feedback), NATIVE-03 (back button enhancement), NATIVE-04 (audio autoplay fix).

</domain>

<decisions>
## Implementation Decisions

### Local Notifications (NATIVE-01)
- Notifications distinguish focus vs break: focus complete shows rest prompt ("휴식 시간이에요! 25분 집중했어요"), break complete shows resume prompt ("다시 집중할 시간이에요!")
- Use Android default system notification sound — no custom sound assets
- Tapping notification opens the app only — no auto-start of next session
- Do NOT show notification when app is in foreground — in-app UI is sufficient
- Notifications must fire even when screen is off or app is in background

### Haptic Feedback (NATIVE-02)
- Event-specific intensity levels:
  - Timer start/stop tap: light click (short, crisp)
  - Plant growth stage transition: medium pulse
  - Session complete: strong vibration
- Haptic toggle setting: provide on/off option in settings
- Dead plant (DEAD state): Claude's discretion on whether to include haptic
- Timer tap feel: light click — button-press sensation

### Back Button Behavior (NATIVE-03)
- Panel close order: stack-based (most recently opened panel closes first), press again to close next
- During active session with panel open: close panel first, then show "세션을 포기하시겠습니까?" confirmation
- During active session with no panel: show session give-up confirmation dialog
- Main screen (no panels, no session): show exit confirmation dialog — "앱을 종료하시겠습니까?" (concise, no motivational text)
- Reuse existing ConfirmModal component for all confirmation dialogs
- 8 panels tracked in useAppPanels: mixer, auth, history, garden, settings, todo, shortcuts, breathing

### Audio Autoplay Fix (NATIVE-04)
- On foreground resume (appStateChange): automatically call AudioContext.resume() — no user tap required
- On app launch with timer start as first tap: restore previous session's sound settings (if sounds were on, auto-resume them)
- AudioContext creation still requires first user gesture (existing pattern) — fix is about resume, not initial creation

### Claude's Discretion
- Dead plant haptic feedback decision
- Exact notification message wording (Korean)
- Loading skeleton or transition states during audio resume
- Notification channel configuration details (priority, category)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useNotification.ts`: Web Notification API hook — needs replacement with @capacitor/local-notifications for native, keep web fallback
- `useBackButton.ts`: Phase 1 back button hook with Capacitor App listener — extend with panel-aware logic and confirmation dialogs
- `ConfirmModal.tsx`: Framer Motion animated confirmation dialog — reuse for exit and session give-up confirmations
- `useAppPanels.ts`: 8 panel states with open/close callbacks — integrate with back button stack tracking
- `useAudioMixer.ts`: Web Audio API with AudioContext, initAudio() on user gesture — add resume logic on appStateChange
- `useGarden.ts`: PlantStage types (SEED/SPROUT/BUD/FLOWER/TREE/DEAD), getGrowthStage() — hook haptic triggers to stage transitions

### Established Patterns
- All Capacitor plugin calls gated by `isNativePlatform()` — zero web impact
- `App.addListener('appStateChange')` already used in useTimer.ts for drift correction — same pattern for audio resume
- Zustand persist with createSafeStorage — haptic toggle can use same store pattern
- Timer ephemeral state in localStorage — not Preferences

### Integration Points
- `useTimer.ts` onComplete callback: trigger both notification and haptic
- `useGarden.ts` stage transition: trigger haptic on growth
- `App.tsx`: back button listener needs access to panel state (useAppPanels) and session state (isRunning)
- `useAudioMixer.ts` initAudio/resumeAudio: appStateChange listener for resume

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for Capacitor plugin integration.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-native-capabilities*
*Context gathered: 2026-03-25*
