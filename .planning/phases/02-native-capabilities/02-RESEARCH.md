# Phase 2: Native Capabilities - Research

**Researched:** 2026-03-25
**Domain:** Capacitor native plugins — local-notifications, haptics, back-button, Web Audio autoplay
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Local Notifications (NATIVE-01)**
- Notifications distinguish focus vs break: focus complete shows "휴식 시간이에요! 25분 집중했어요", break complete shows "다시 집중할 시간이에요!"
- Use Android default system notification sound — no custom sound assets
- Tapping notification opens the app only — no auto-start of next session
- Do NOT show notification when app is in foreground — in-app UI is sufficient
- Notifications must fire even when screen is off or app is in background

**Haptic Feedback (NATIVE-02)**
- Timer start/stop tap: light click (ImpactStyle.Light)
- Plant growth stage transition: medium pulse (ImpactStyle.Medium)
- Session complete: strong vibration (ImpactStyle.Heavy)
- Haptic toggle: on/off setting in Zustand store

**Back Button (NATIVE-03)**
- Panel close order: stack-based (most recently opened panel closes first)
- During active session with panel open: close panel first
- During active session with no panel: show "세션을 포기하시겠습니까?" confirmation
- Main screen (no panels, no session): show "앱을 종료하시겠습니까?" exit confirmation
- Reuse existing ConfirmModal component
- 8 panels tracked: mixer, auth, history, garden, settings, todo, shortcuts, breathing

**Audio Autoplay Fix (NATIVE-04)**
- On foreground resume (appStateChange): automatically call AudioContext.resume()
- On app launch with timer start as first tap: restore previous session's sound settings
- AudioContext creation still requires first user gesture (keep existing pattern)

### Claude's Discretion
- Dead plant haptic feedback decision
- Exact notification message wording (Korean)
- Loading skeleton or transition states during audio resume
- Notification channel configuration details (priority, category)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NATIVE-01 | User receives local notification when focus/break session completes, even with screen off or app in background | @capacitor/local-notifications schedule() with allowWhileIdle, SCHEDULE_EXACT_ALARM permission, channel setup |
| NATIVE-02 | User feels haptic feedback on plant growth stage transition, harvest, and session complete | @capacitor/haptics Haptics.impact() with ImpactStyle enum, gated by isNativePlatform() |
| NATIVE-03 | User can close BottomSheet panels with Android hardware back button, with exit confirmation on main screen | App.addListener('backButton') + panel open-stack tracking + ConfirmModal reuse |
| NATIVE-04 | Ambient sound playback starts correctly in WebView without autoplay policy blocking | AudioContext.resume() on appStateChange isActive:true, mirrors existing visibilitychange pattern |
</phase_requirements>

---

## Summary

Phase 2 adds four native-feeling UX enhancements on top of the Capacitor foundation from Phase 1. The tech is well-understood: `@capacitor/local-notifications` and `@capacitor/haptics` are the two new npm packages needed. The other two requirements (back button, audio autoplay) extend existing code — `useBackButton.ts` and `useAudioMixer.ts` — without new packages.

The critical Android-specific gotchas are: (1) foreground notification suppression is iOS-only in the plugin API, so the hook must check app active state before scheduling; (2) `ImpactStyle` translates to Android VibrationEffect but Android devices that lack a vibrator resolve silently — the API is graceful; (3) exact alarms require `SCHEDULE_EXACT_ALARM` in AndroidManifest for Android 12+ and `POST_NOTIFICATIONS` runtime permission for Android 13+; (4) AudioContext autoplay restriction in Android WebView is resolved by calling `context.resume()` on the `appStateChange` foreground event, which already exists in `useTimer.ts` as a pattern.

**Primary recommendation:** Install `@capacitor/local-notifications` and `@capacitor/haptics`, extend the three existing hooks (`useNotification`, `useBackButton`, `useAudioMixer`), add a panel-open stack inside `useAppPanels`, and add a `hapticEnabled` toggle to the Zustand settings store.

---

## Standard Stack

### Core (new packages for Phase 2)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @capacitor/local-notifications | ^8.x (match existing Capacitor 8.2.0) | Schedule device notifications, fire in background | Official Capacitor plugin, zero web impact with isNativePlatform() gate |
| @capacitor/haptics | ^8.x | Trigger vibration/haptic feedback | Official Capacitor plugin, gracefully no-ops on devices without vibrator |

### Already Installed (no new install needed)
| Library | Version | Purpose |
|---------|---------|---------|
| @capacitor/core | ^8.2.0 | isNativePlatform(), Capacitor base |
| @capacitor/app | ^8.0.1 | App.addListener('backButton'), App.addListener('appStateChange'), App.exitApp() |
| zustand | ^5.0.11 | hapticEnabled toggle in settings store |

**Installation (new packages only):**
```bash
npm install @capacitor/local-notifications @capacitor/haptics
npx cap sync
```

---

## Architecture Patterns

### Recommended File Changes
```
src/
  hooks/
    useNotification.ts       # REPLACE: Web Notification → @capacitor/local-notifications
    useBackButton.ts         # EXTEND: add panel stack + confirmation dialogs
    useAppPanels.ts          # EXTEND: add openStack[] for back-button ordering
    useAudioMixer.ts         # EXTEND: add resumeAudio() called on appStateChange
  App.tsx                    # WIRE: pass panels to useBackButton, add audio resume effect
android/
  app/src/main/AndroidManifest.xml   # ADD: permissions for notifications
capacitor.config.ts          # ADD: LocalNotifications channel config
```

### Pattern 1: Notification — schedule immediately, suppress in foreground

**What:** `@capacitor/local-notifications` fires a scheduled notification. On Android, the plugin does NOT suppress notifications when the app is in the foreground (that feature is iOS-only). The foreground suppression must be done in JS by checking whether the app is currently active before calling `schedule()`.

**When to use:** At the `onComplete` callback in `useTimer.ts` / `useAppSessionFlow.ts`.

**Foreground detection strategy:** Track app active state via `App.addListener('appStateChange')`. If `isAppActive` is true when the session completes, skip the notification — the in-app completion UI handles it. If false (background), call `schedule()`.

```typescript
// Source: https://capacitorjs.com/docs/apis/local-notifications
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Request permission once on app init (Android 13+)
async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { display } = await LocalNotifications.checkPermissions();
  if (display === 'granted') return true;
  if (display === 'denied') return false;
  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
}

// Schedule a notification that fires immediately (1s delay to avoid timing edge cases)
// Only call this when app is in BACKGROUND (isAppActive === false)
async function sendSessionCompleteNotification(isFocus: boolean): Promise<void> {
  const title = isFocus ? '집중 완료!' : '휴식 완료!';
  const body = isFocus
    ? '휴식 시간이에요! 25분 집중했어요'
    : '다시 집중할 시간이에요!';

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now() % 2147483647, // must be 32-bit int
        title,
        body,
        channelId: 'focus-valley-timer',
        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
      },
    ],
  });
}
```

### Pattern 2: Notification Channel Setup

**What:** Android 8+ requires a notification channel before scheduling. Create the channel once in `useNotification.ts` initialization. The channel maps to the `LocalNotifications` plugin config in `capacitor.config.ts`.

```typescript
// Source: https://capacitorjs.com/docs/apis/local-notifications
import { LocalNotifications } from '@capacitor/local-notifications';

async function createTimerChannel(): Promise<void> {
  await LocalNotifications.createChannel({
    id: 'focus-valley-timer',
    name: 'Timer Notifications',
    description: 'Focus and break session completion alerts',
    importance: 4, // HIGH — causes heads-up notification
    visibility: 1, // PUBLIC
    vibration: true,
    sound: undefined, // use system default
  });
}
```

**capacitor.config.ts addition:**
```typescript
plugins: {
  LocalNotifications: {
    smallIcon: 'ic_stat_icon_config_sample',
    iconColor: '#488AFF',
    sound: undefined, // system default
  },
  // ...existing SplashScreen, StatusBar
}
```

### Pattern 3: Haptic Feedback hook

**What:** A thin utility hook that calls `@capacitor/haptics`, always gated by `isNativePlatform()`. Reads `hapticEnabled` from Zustand settings store before triggering.

```typescript
// Source: https://capacitorjs.com/docs/apis/haptics
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// Called from useAppSessionFlow / TimerDisplay / useGarden
function useHaptic() {
  const hapticEnabled = useTimerSettings((s) => s.hapticEnabled); // new field

  const light = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || !hapticEnabled) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  }, [hapticEnabled]);

  const medium = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || !hapticEnabled) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  }, [hapticEnabled]);

  const strong = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || !hapticEnabled) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }, [hapticEnabled]);

  return { light, medium, strong };
}
```

**Android behavior note:** On Android, `ImpactStyle.Light/Medium/Heavy` map to `VibrationEffect.createOneShot()` with different durations/amplitudes. Devices without a Vibrator silently no-op — no crash, no error thrown.

### Pattern 4: Back Button — panel open stack

**What:** `useAppPanels` needs to expose which panels are open, ordered by recency, so `useBackButton` can close them in LIFO order. The cleanest approach is to maintain a `string[]` open-stack alongside existing boolean state.

```typescript
// Extended useAppPanels — add to existing hook
const [openStack, setOpenStack] = useState<string[]>([]);

// When opening a panel, push to stack
const openHistory = useCallback(() => {
  setShowHistory(true);
  setOpenStack((prev) => [...prev.filter((p) => p !== 'history'), 'history']);
}, []);

// When closing a panel, pop from stack
const closeHistory = useCallback(() => {
  setShowHistory(false);
  setOpenStack((prev) => prev.filter((p) => p !== 'history'));
}, []);

// Close the topmost panel
const closeTopPanel = useCallback((): boolean => {
  const top = openStack[openStack.length - 1];
  if (!top) return false;
  // call the appropriate close function by name
  closeByName(top);
  return true;
}, [openStack]);

// Expose for useBackButton
return { ...existing, openStack, closeTopPanel };
```

**Updated useBackButton.ts:**
```typescript
// Source: https://capacitorjs.com/docs/apis/app
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function useBackButton(
  isRunning: boolean,
  panels: AppPanelsState,
  onShowExitConfirm: () => void,
  onShowSessionGiveUpConfirm: () => void,
): void {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const subscription = App.addListener('backButton', () => {
      const hasOpenPanel = panels.openStack.length > 0;

      if (hasOpenPanel) {
        // Always close topmost panel first, regardless of session state
        panels.closeTopPanel();
        return;
      }

      if (isRunning) {
        // No panels, but session active → give-up confirmation
        onShowSessionGiveUpConfirm();
        return;
      }

      // Main screen, no session → exit confirmation
      onShowExitConfirm();
    });

    return () => { subscription.then((h) => h.remove()); };
  }, [isRunning, panels, onShowExitConfirm, onShowSessionGiveUpConfirm]);
}
```

### Pattern 5: Audio Autoplay Fix — resume on foreground

**What:** The existing `useAudioMixer.ts` `initAudio()` already calls `context.resume()` if state is `"suspended"`. The fix is to call `initAudio()` (or a dedicated `resumeAudio()`) in an `appStateChange` effect that mirrors the existing timer pattern in `useTimer.ts`. This runs only on native.

```typescript
// Added to useAudioMixer.ts — new export
const resumeAudio = useCallback(() => {
  const ctx = contextRef.current;
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
}, []);

// Added to App.tsx (or useAudioMixer itself)
// Mirrors the pattern in useTimer.ts lines 207-228
useEffect(() => {
  if (!Capacitor.isNativePlatform()) return;

  const subscription = App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      mixer.resumeAudio();
    }
  });

  return () => { subscription.then((h) => h.remove()); };
}, [mixer.resumeAudio]);
```

**Note on "restore previous session's sound settings":** The sound volumes are already persisted in Zustand (`focus-valley-garden` store or similar). When `resumeAudio()` is called, active tracks are already playing (their `gainNode.gain` is already set). If the context was suspended, `resume()` unblocks playback without any re-loading. If tracks were fully stopped (unlikely — only volume=0 triggers stop), the user's next tap to a volume slider triggers `loadAndPlayTrack()`. No additional persistence change is needed for NATIVE-04.

### Anti-Patterns to Avoid

- **Calling `Haptics.impact()` without `isNativePlatform()` gate:** The web implementation is a no-op but importing the plugin in web context causes console warnings in some Capacitor versions.
- **Scheduling notification at `Date.now()` exactly (at: new Date(Date.now())):** Some Android versions skip same-millisecond triggers. Always add a 500-1000ms buffer.
- **Checking `document.visibilityState` to suppress foreground notifications:** On Capacitor Android, the WebView is always "visible" — `visibilityState` is unreliable. Track app active state via `appStateChange` instead.
- **Calling `LocalNotifications.schedule()` without creating the channel first:** On Android 8+, notifications without a valid `channelId` are silently dropped.
- **Registering multiple `backButton` listeners:** The existing `useBackButton` hook must be completely replaced (not supplemented) in Phase 2 — two listeners would fire in undefined order.
- **Managing panel open-stack in `useBackButton`:** The stack belongs in `useAppPanels` because that hook owns panel state. Back button only reads/acts on it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Device vibration/haptics | Custom navigator.vibrate() wrapper | @capacitor/haptics | ImpactStyle maps to platform-optimized VibrationEffect on Android; graceful no-op |
| Local notifications | Web Notification API on native | @capacitor/local-notifications | Web Notification API does not fire with screen off on Android; requires SCHEDULE_EXACT_ALARM |
| Foreground notification suppression | Plugin config | JS-side check of `isActive` state before scheduling | iOS-only `suppressInForeground` plugin option; must handle Android in JS |
| Permission request flow | Manual Android permission dialog | LocalNotifications.requestPermissions() | Correct Android 13+ POST_NOTIFICATIONS runtime permission flow |
| Notification channel | Direct Java code | LocalNotifications.createChannel() | Capacitor plugin handles API level detection (Android 8+ only) |

---

## Common Pitfalls

### Pitfall 1: Foreground Notifications Always Show on Android
**What goes wrong:** `suppressInForeground: true` only works on iOS. On Android, the notification appears even while the user is actively using the app.
**Why it happens:** Android's notification system does not have a native foreground-suppression API equivalent to iOS's UNNotificationPresentationOptions.
**How to avoid:** Track `isAppActive` via `App.addListener('appStateChange')` in the notification hook. Only call `LocalNotifications.schedule()` when `isAppActive === false`.
**Warning signs:** Notification appears while app is visible; user gets both in-app completion UI and a system notification simultaneously.

### Pitfall 2: Notifications Don't Fire with Screen Off (Doze Mode)
**What goes wrong:** On Android 6+ with Doze mode, scheduled alarms are batched and delayed.
**Why it happens:** Standard `AlarmManager.set()` is deferred; requires `setExactAndAllowWhileIdle()`.
**How to avoid:** Set `allowWhileIdle: true` in the schedule object. Add `SCHEDULE_EXACT_ALARM` to AndroidManifest. Note: `allowWhileIdle` notifications can only fire once per 9 minutes per app — acceptable for a timer app since sessions are 25+ minutes.
**Warning signs:** Notification fires 2-10 minutes late when phone is in pocket.

### Pitfall 3: Missing SCHEDULE_EXACT_ALARM and POST_NOTIFICATIONS Permissions
**What goes wrong:** Notifications either don't fire exactly (Android 12+) or don't fire at all (Android 13+).
**Why it happens:** Android 12 changed alarm scheduling to require explicit permission; Android 13 requires runtime notification permission.
**How to avoid:** Add both to AndroidManifest.xml; call `requestPermissions()` on app startup.
**AndroidManifest additions required:**
```xml
<!-- Android 12+: exact alarm scheduling -->
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<!-- Android 13+: show notifications (runtime permission, also declared here) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Pitfall 4: Back Button Listener Not Cleaned Up
**What goes wrong:** Stale listener from Phase 1 `useBackButton` remains registered; two listeners fire, causing double-confirmation dialogs or missed panel closes.
**Why it happens:** The Phase 1 hook registered a listener that must be completely replaced in Phase 2, not supplemented.
**How to avoid:** The updated `useBackButton.ts` must be a complete replacement. Verify `useEffect` cleanup properly removes the old listener. The `subscription.then(h => h.remove())` pattern is already used in Phase 1 — carry it through.

### Pitfall 5: AudioContext State After App Backgrounding
**What goes wrong:** Audio plays when app first loads (user tapped to start it), app goes to background, comes back to foreground — audio is silent.
**Why it happens:** Android WebView suspends the AudioContext when the app is backgrounded. The context state becomes `"suspended"` and tracks do not auto-resume.
**How to avoid:** Call `context.resume()` inside the `appStateChange` handler when `isActive` becomes `true`. This is the exact same pattern used in `useTimer.ts` lines 207-228 for drift correction.
**Warning signs:** Ambient sounds stop when user switches apps and returns.

### Pitfall 6: Notification ID Collision
**What goes wrong:** Two rapid session completions use the same `id` and the second notification replaces the first before the user sees it.
**Why it happens:** `id` must be a 32-bit signed integer; using `Date.now()` directly overflows.
**How to avoid:** Use `Date.now() % 2147483647` for the notification ID. For a timer app this is sufficient — at most one notification fires per session.

### Pitfall 7: useAppPanels toggleMixer/toggleShortcuts lose stack tracking
**What goes wrong:** `toggleMixer` and `toggleShortcuts` are toggle functions, not open/close pairs. If added to the stack on toggle-open but not removed on toggle-close, the stack corrupts.
**Why it happens:** These two panels use toggle semantics (one function for both open and close).
**How to avoid:** In the toggle functions, check the current boolean state before deciding to push or pop from the stack. If currently open (true → closing), pop. If currently closed (false → opening), push.

---

## Code Examples

### Complete useNotification.ts replacement skeleton
```typescript
// Source: https://capacitorjs.com/docs/apis/local-notifications
import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotification() {
  const [permission, setPermission] = useState<'default' | 'denied' | 'granted'>('default');
  const isAppActiveRef = useRef(true); // track foreground state

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Create channel once
    void LocalNotifications.createChannel({
      id: 'focus-valley-timer',
      name: 'Timer Notifications',
      importance: 4,
      visibility: 1,
      vibration: true,
    });

    // Track app active state for foreground suppression
    const sub = App.addListener('appStateChange', ({ isActive }) => {
      isAppActiveRef.current = isActive;
    });

    return () => { sub.then((h) => h.remove()); };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback (existing logic kept)
      if (typeof Notification === 'undefined') return false;
      if (Notification.permission === 'granted') { setPermission('granted'); return true; }
      if (Notification.permission === 'denied') return false;
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') { setPermission('granted'); return true; }
    if (display === 'denied') { setPermission('denied'); return false; }
    const result = await LocalNotifications.requestPermissions();
    setPermission(result.display === 'granted' ? 'granted' : 'denied');
    return result.display === 'granted';
  }, []);

  const notify = useCallback((title: string, body?: string) => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback (existing logic)
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') return;
      if (document.visibilityState === 'visible') return;
      new Notification(title, { body });
      return;
    }
    // Native: suppress if app is in foreground
    if (isAppActiveRef.current) return;

    void LocalNotifications.schedule({
      notifications: [{
        id: Date.now() % 2147483647,
        title,
        body: body ?? '',
        channelId: 'focus-valley-timer',
        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
      }],
    });
  }, []);

  return { permission, requestPermission, notify };
}
```

### Haptics utility
```typescript
// Source: https://capacitorjs.com/docs/apis/haptics
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

// Usage: haptic.light() on timer tap, haptic.medium() on plant growth, haptic.strong() on session complete
export function useHaptic(enabled: boolean) {
  const fire = useCallback(async (style: ImpactStyle) => {
    if (!Capacitor.isNativePlatform() || !enabled) return;
    await Haptics.impact({ style });
  }, [enabled]);

  return {
    light:  useCallback(() => fire(ImpactStyle.Light), [fire]),
    medium: useCallback(() => fire(ImpactStyle.Medium), [fire]),
    strong: useCallback(() => fire(ImpactStyle.Heavy), [fire]),
  };
}
```

### Zustand settings store addition (hapticEnabled)
```typescript
// Add to existing useTimerSettings store (same createSafeStorage pattern)
hapticEnabled: true, // default on
setHapticEnabled: (v: boolean) => set({ hapticEnabled: v }),
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Web Notification API for native notifications | @capacitor/local-notifications with schedule() | Capacitor 1.0 (2019) | Fires with screen off, exact alarms, Android channel support |
| navigator.vibrate() for haptics | @capacitor/haptics ImpactStyle | Capacitor 1.0 (2019) | Platform-optimized VibrationEffect on Android; graceful no-op |
| AudioContext resume via click only | audioContext.resume() on appStateChange | Capacitor 2+ pattern | Eliminates double-tap-to-unmute after backgrounding |
| Single back-button handler | Stack-based LIFO panel-close handler | Phase 2 (this phase) | Each panel independently closeable in open order |

**Deprecated/outdated in this codebase:**
- `useNotification.ts` Web Notification API path: becomes web-only fallback, not primary
- `useBackButton.ts` Phase 1 stub: complete replacement in Phase 2

---

## Open Questions

1. **Haptic for DEAD plant state**
   - What we know: CONTEXT.md marks this as Claude's discretion
   - What's unclear: Does destroying a plant deserve a haptic? If yes, which intensity?
   - Recommendation: Use `strong` (ImpactStyle.Heavy) for DEAD state — the same as session complete. The emotional weight is equivalent. This is a one-line addition in the haptic trigger map.

2. **Notification permission timing**
   - What we know: Android 13+ requires runtime permission via `requestPermissions()`
   - What's unclear: When is the best moment to ask — app launch, or first session complete?
   - Recommendation: Ask on first session start (not launch). Users understand "I'm about to focus" as a natural moment to grant notification permission. This avoids the cold-start permission dialog that users tend to deny.

3. **Android exact alarm user revocation**
   - What we know: Even with `SCHEDULE_EXACT_ALARM` in manifest, users can revoke exact alarms in Android 12+ settings
   - What's unclear: How to gracefully handle revocation
   - Recommendation: Call `LocalNotifications.checkExactNotificationSetting()` before scheduling. If not granted, fall back to `allowWhileIdle: true` without exact scheduling (notification may be slightly delayed in Doze, acceptable for timer).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.x |
| Config file | vitest.config.ts (or vite.config.ts with test block) |
| Quick run command | `npm test` |
| Full suite command | `npm run test:ci` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| NATIVE-01 | `notify()` skips schedule when `isAppActive === true` | unit | `npm test -- --reporter=verbose src/hooks/useNotification.test.ts` | ❌ Wave 0 |
| NATIVE-01 | `notify()` calls `LocalNotifications.schedule()` when `isAppActive === false` | unit | same | ❌ Wave 0 |
| NATIVE-01 | `notify()` falls back to Web Notification API on non-native platform | unit | same | ❌ Wave 0 |
| NATIVE-02 | `useHaptic().light/medium/strong` no-ops when `enabled === false` | unit | `npm test -- src/hooks/useHaptic.test.ts` | ❌ Wave 0 |
| NATIVE-02 | `useHaptic()` no-ops when `isNativePlatform() === false` | unit | same | ❌ Wave 0 |
| NATIVE-03 | Back button closes top panel before showing exit dialog | unit (pure logic) | `npm test -- src/hooks/useBackButton.test.ts` | ❌ Wave 0 |
| NATIVE-03 | Back button shows session give-up when running + no panels | unit | same | ❌ Wave 0 |
| NATIVE-03 | Back button shows exit confirm on main screen (no session, no panels) | unit | same | ❌ Wave 0 |
| NATIVE-04 | `resumeAudio()` calls `context.resume()` only when context is `suspended` | unit | `npm test -- src/hooks/useAudioMixer.test.ts` | ❌ Wave 0 |

All tests are unit tests against pure logic extracted from hooks — same pattern as existing `useAppSessionFlow.test.ts` and `useGarden.test.ts`. Capacitor plugin calls are vi.mock'd.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm run test:ci` (includes tsc + lint + all tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/useNotification.test.ts` — covers NATIVE-01 (mock `@capacitor/local-notifications` and `@capacitor/app`)
- [ ] `src/hooks/useHaptic.test.ts` — covers NATIVE-02 (mock `@capacitor/haptics` and `@capacitor/core`)
- [ ] `src/hooks/useBackButton.test.ts` — covers NATIVE-03 (extract pure back-button logic function, test state transitions)
- [ ] `src/hooks/useAudioMixer.test.ts` — covers NATIVE-04 (mock AudioContext, test resumeAudio behavior)

**Mocking pattern** (consistent with existing tests that mock Capacitor):
```typescript
// vitest mock pattern — matches existing project test style
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => true) },
}));
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn(),
    createChannel: vi.fn(),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  },
}));
```

---

## Sources

### Primary (HIGH confidence)
- https://capacitorjs.com/docs/apis/local-notifications — schedule(), createChannel(), permissions, allowWhileIdle, AndroidManifest requirements
- https://capacitorjs.com/docs/apis/haptics — ImpactStyle enum, impact(), Android behavior
- https://capacitorjs.com/docs/apis/app — backButton listener, appStateChange, exitApp()
- Existing codebase: `useTimer.ts` lines 207-228 — appStateChange pattern already in use
- Existing codebase: `useAudioMixer.ts` — initAudio() already calls context.resume() on suspended state

### Secondary (MEDIUM confidence)
- https://github.com/ionic-team/capacitor-haptics/blob/main/README.md — confirmed install command, ImpactStyle options
- https://github.com/ionic-team/capacitor-plugins/blob/main/local-notifications/README.md — AndroidManifest permissions, channel setup
- https://github.com/ionic-team/capacitor/discussions/3660 — confirmed Android foreground notification behavior (does NOT auto-suppress; must handle in JS)
- https://developer.chrome.com/blog/web-audio-autoplay — AudioContext autoplay policy and resume() requirement
- https://forum.ionicframework.com/t/android-capacitor-local-notifications-issues/229733 — Doze mode scheduling issues, allowWhileIdle confirmation

### Tertiary (LOW confidence — needs validation on device)
- Android haptics ImpactStyle → VibrationEffect mapping: documented behavior but untested on physical device; vibrate() is the known working fallback
- `once per 9 minutes` allowWhileIdle limit: documented in Capacitor docs; real-world impact minimal for 25-min sessions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official Capacitor plugin versions match existing @capacitor/core 8.2.0; install pattern confirmed
- Architecture: HIGH — all patterns are extensions of existing Phase 1 code; appStateChange pattern is a direct copy of useTimer.ts
- Pitfalls: HIGH — foreground suppression and Doze mode are documented Android limitations confirmed by multiple sources
- Notification foreground suppression mechanism: MEDIUM — JS-side `isAppActive` tracking is the correct workaround, confirmed by community; not officially documented as the pattern

**Research date:** 2026-03-25
**Valid until:** 2026-06-25 (Capacitor 8.x is stable; no breaking changes expected in 90 days)
