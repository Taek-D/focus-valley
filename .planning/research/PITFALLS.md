# Pitfalls Research

**Domain:** Capacitor Android — wrapping existing React 19 + Vite 7 PWA for Google Play Store
**Researched:** 2026-03-24
**Confidence:** HIGH (critical pitfalls verified via official docs + GitHub issues; signing pitfalls verified via Google Play Help + Ionic Blog)

---

## Critical Pitfalls

### Pitfall 1: Service Worker Blocks All Capacitor Plugin Injection

**What goes wrong:**
`vite-plugin-pwa` registers a service worker that intercepts all fetch requests. On Android WebView, this prevents Capacitor's bridge from injecting plugin JavaScript into the page. Every Capacitor plugin call (Haptics, LocalNotifications, Preferences, Browser) silently fails or throws "Plugin not implemented" — with no error in the JS console indicating *why*.

**Why it happens:**
Developers leave `vite-plugin-pwa` fully enabled because it works fine in the web build. When Capacitor wraps the app and loads assets from `capacitor://localhost`, the service worker intercepts requests before Capacitor's bridge can inject. The two systems conflict over request interception.

**How to avoid:**
Use Vite's `mode` / environment detection to conditionally disable the PWA plugin during the Capacitor build. The standard pattern:

```ts
// vite.config.ts
const isCapacitor = process.env.CAPACITOR_PLATFORM != null;

export default defineConfig({
  plugins: [
    react(),
    !isCapacitor && VitePWA({ ... }),
  ].filter(Boolean),
});
```

Set `CAPACITOR_PLATFORM=android` in the npm script that feeds Capacitor: `"build:android": "CAPACITOR_PLATFORM=android npm run build && npx cap sync"`. The native bundle already ships all assets locally — service workers provide zero benefit inside Capacitor and are actively harmful.

**Warning signs:**
- Capacitor plugin calls return no result and no error
- `@capacitor/haptics` or `@capacitor/preferences` appear installed but do nothing on device
- Chrome DevTools (via `chrome://inspect`) shows plugin JS is missing from page sources

**Phase to address:** Phase 1 — Capacitor project setup. Must be resolved before any native plugin work begins.

**Severity:** CRITICAL — blocks all native functionality

---

### Pitfall 2: Capacitor Plugins Cannot Be Called From Inside a Web Worker

**What goes wrong:**
Focus Valley's timer runs inside a `timer.worker.ts` Web Worker. If any native Capacitor call (e.g., triggering a local notification when the timer ends, or firing haptics) is placed inside the worker, it will silently fail. The Capacitor bridge detects the execution context as "Web" (not Android) inside a Worker thread, so native calls never reach the Android layer.

**Why it happens:**
Capacitor's plugin injection attaches to `window` on the main thread. Web Workers have no `window`. The platform detection logic in Capacitor's JS bridge evaluates the wrong context inside a worker. This was reported as a known issue (ionic-team/capacitor#6309) and closed as "not planned."

**How to avoid:**
Keep all Capacitor plugin calls strictly on the **main thread**. The Web Worker's role is limited to time-keeping (posting TICK messages). When the worker signals a session completion, the main thread (App.tsx or the useTimer hook) is responsible for invoking `@capacitor/local-notifications`, `@capacitor/haptics`, etc.

The existing architecture already separates concerns correctly: the worker posts messages, the hook handles state. Add native calls in the message handler, not in the worker itself.

**Warning signs:**
- Haptics fire on web but not on Android device
- Local notifications never appear after session completes
- Calling `Haptics.vibrate()` inside `timer.worker.ts` causes no crash but has no effect

**Phase to address:** Phase 2 — Native plugin integration (Haptics + LocalNotifications). Architectural constraint must be documented before plugin work starts.

**Severity:** CRITICAL — guaranteed silent failure, hard to diagnose

---

### Pitfall 3: localStorage Is Evicted by Android OS — Zustand Persist Store Data Is Lost

**What goes wrong:**
Zustand's `persist` middleware uses `localStorage` by default. On Android WebView, the OS treats WebView `localStorage` as reclaimable storage. When the device is low on space, Android can silently wipe it. The user's plant garden, streak data, settings, and progress disappear. The app appears to have "reset itself."

**Why it happens:**
Developers test on desktop browsers and assume localStorage is durable. On Android, WebView storage is not given the same protection as native `SharedPreferences`. The Capacitor documentation explicitly states: "the OS will reclaim local storage from Web Views if a device is running low on space."

**How to avoid:**
Replace the Zustand persist storage engine with `@capacitor/preferences` for all critical state. Create a custom storage adapter:

```ts
import { Preferences } from '@capacitor/preferences';
import { createJSONStorage, StateStorage } from 'zustand/middleware';

const CapacitorStorage: StateStorage = {
  getItem: async (name) => {
    const { value } = await Preferences.get({ key: name });
    return value;
  },
  setItem: async (name, value) => {
    await Preferences.set({ key: name, value });
  },
  removeItem: async (name) => {
    await Preferences.remove({ key: name });
  },
};

// In your store:
persist(storeCreator, {
  name: 'focus-valley-garden',
  storage: createJSONStorage(() => CapacitorStorage),
})
```

Note: Preferences API is string-only. JSON serialization via `createJSONStorage` handles this automatically.

**Warning signs:**
- User reports "app reset" after a period of inactivity or on low-storage devices
- Garden state reverts to empty after app is backgrounded and returned to

**Phase to address:** Phase 1 — Capacitor project setup. Migrate storage before any testing on device to establish correct baseline.

**Severity:** CRITICAL — causes irreversible data loss for users; silent until it happens

---

### Pitfall 4: Google OAuth ("disallowed_useragent") Blocks Sign-In in WebView

**What goes wrong:**
Focus Valley uses Supabase Google OAuth. When launched inside Capacitor's WebView, Google's OAuth endpoint detects the embedded WebView user agent and returns a `403 disallowed_useragent` error. The Google sign-in button appears to do nothing, or shows a brief error screen and closes.

**Why it happens:**
Google explicitly banned OAuth flows inside embedded WebViews in 2021 due to security risks (keylogging, session cookie theft). Capacitor's `window.open()` default behavior opens a WebView, which is rejected. This applies to Supabase `signInWithOAuth({ provider: 'google' })` unless the redirect is handled natively.

**How to avoid:**
Use `@capacitor/browser` to open the OAuth flow in the system browser (Chrome Custom Tabs on Android), then handle the deep link redirect back into the app:

```ts
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

// Open OAuth in system browser
await Browser.open({ url: supabaseOAuthUrl });

// Listen for deep link callback
App.addListener('appUrlOpen', async ({ url }) => {
  if (url.startsWith('com.focusvalley.app://')) {
    await Browser.close();
    // Handle session from URL
  }
});
```

Register the custom URL scheme `com.focusvalley.app://` in `AndroidManifest.xml` and Supabase's allowed redirect URLs.

**Warning signs:**
- Google sign-in works on web but immediately fails on Android device
- Error message "This browser or app may not be secure" appears briefly
- Supabase auth callback URL is never reached

**Phase to address:** Phase 3 — Auth and deep link handling. Must be addressed before any QA of sign-in flow.

**Severity:** CRITICAL — completely breaks Google OAuth for all Android users

---

### Pitfall 5: Web Audio API AudioContext Requires User Gesture — Ambient Sounds Silenced on App Launch

**What goes wrong:**
Focus Valley's 8-channel ambient soundscape uses `Web Audio API`. On Android WebView, the `AudioContext` starts in `suspended` state and requires an explicit user gesture to resume. If the app attempts to start ambient sounds on mount (e.g., resuming a previous session's audio state), the audio context never starts and all sounds are silenced with no error thrown.

**Why it happens:**
Chrome's autoplay policy (which Android WebView inherits) blocks audio contexts that start without user interaction. The Web PWA in a browser has the same restriction, but desktop users often interact with the page before audio starts. On mobile, the app may resume directly from a background state without a fresh gesture.

**How to avoid:**
Always gate `audioContext.resume()` behind a confirmed user interaction. On app focus/resume events from Capacitor's `App.addListener('appStateChange')`, do not auto-resume audio — wait for the user to tap the play/sound button. Add a single `resume()` call in the audio mixer's first play action:

```ts
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

For the `appStateChange` foreground transition, only resume if the user had audio explicitly playing before backgrounding (store that intent flag in Preferences, not in memory).

**Warning signs:**
- Audio mixer UI shows active channels but no sound plays
- `audioContext.state` logs as `'suspended'` after app launch
- Works in desktop browser, fails on first open in Android

**Phase to address:** Phase 2 — Audio integration testing on device. Add an explicit gate during audio mixer initialization.

**Severity:** HIGH — silently breaks a core feature; confusing for users

---

### Pitfall 6: Android Doze Mode Kills the Web Worker Timer — Sessions Appear to Pause

**What goes wrong:**
When the Android device screen turns off, Doze mode restricts CPU and JavaScript execution. The Web Worker timer stops posting TICK messages. When the user returns to the app, the timer appears frozen at the point it was when the screen turned off, even though real time has passed.

**Why it happens:**
Doze mode aggressively restricts background execution in WebViews. While Focus Valley already uses `Page Visibility API` for tab-switch correction on web, this doesn't cover the deeper Android Doze freeze. The timer.worker.ts interval is simply not executed by the JS runtime while frozen.

**How to avoid:**
On `App.addListener('appStateChange', { isActive: true })`, compare `Date.now()` against the last known timer timestamp stored in Preferences. Apply a drift correction equivalent to the elapsed wall-clock time. This is the same pattern as the existing Page Visibility correction — extend it to the Capacitor app state event.

```ts
App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    const now = Date.now();
    const elapsed = now - lastTickTimestamp;
    // Apply correction to timer state
    timerStore.applyDriftCorrection(elapsed);
  }
});
```

Do not attempt to use WorkManager or native background services to keep the timer running — this is unnecessary complexity and risks Play Store rejection for excessive battery use.

**Warning signs:**
- Timer shows 2 minutes remaining but real time shows session should be over
- Behavior is consistent after locking the screen for 2+ minutes then returning to app

**Phase to address:** Phase 1 — Capacitor setup + timer integration testing on physical device. Verify with screen-off test before any other feature work.

**Severity:** HIGH — core timer accuracy is the product's primary value proposition

---

### Pitfall 7: versionCode Not Incremented — Play Store Update Rejected

**What goes wrong:**
Capacitor does not sync `package.json`'s `version` field to Android's `versionCode`. Developers bump `package.json` version, build a new `.aab`, and submit to Play Store — only to get an immediate rejection because the `versionCode` integer in `android/app/build.gradle` was never changed. Google Play requires strictly increasing integer `versionCode` for every uploaded build; `versionName` (the human-readable string) is secondary.

**Why it happens:**
There is no automatic sync between npm package version and Android `versionCode`. They are managed in completely separate places. First-time deployers discover this only when the Play Console rejects the bundle.

**How to avoid:**
Establish a single-source-of-truth process from the start:

1. Keep `versionName` aligned with `package.json` version manually (or via `capacitor-sync-version-cli`).
2. Treat `versionCode` as a monotonically increasing integer — never reuse or skip values.
3. Add a pre-release checklist item: "Did you increment `versionCode` in `android/app/build.gradle`?"

A simple convention: use `versionCode = major * 10000 + minor * 100 + patch` (e.g., v1.1.0 = 10100).

**Warning signs:**
- Play Console upload immediately shows "Version code X has already been used" error
- `android/app/build.gradle` `versionCode` is still `1` after multiple builds

**Phase to address:** Phase 4 — Play Store submission preparation. Create the release checklist before first submission.

**Severity:** HIGH — blocks every release until discovered; costs hours of re-signing and re-uploading

---

### Pitfall 8: Keystore Not Backed Up — App Can Never Be Updated

**What goes wrong:**
The developer generates the upload keystore once, submits the app, and the keystore file exists only on their local machine. The machine dies, the file is deleted, or the developer leaves the team. The app on Play Store can never receive an update — Google requires every update to be signed with the same upload key. The app is effectively abandoned on the store.

**Why it happens:**
The keystore is generated once as a local file (`release.keystore`). Most guides say "keep this safe" but developers, especially solo developers, do not treat it as a first-class artifact requiring backup.

**How to avoid:**
- Immediately after generating the keystore, store it in a password manager as a base64-encoded attachment (Bitwarden, 1Password).
- Store keystore password, key alias, and key password in the same secure location.
- Add `.keystore` and `.jks` to `.gitignore` — never commit keystores to version control.
- Consider enrolling in Play App Signing: Google holds the actual distribution key, your upload key becomes a secondary credential that can be reset if lost.

**Warning signs:**
- Keystore file exists only in one location (`android/` or home directory)
- No documented record of keystore password or key alias

**Phase to address:** Phase 4 — Play Store setup. Generate and back up the keystore as the first step, before any submission work.

**Severity:** CRITICAL — unrecoverable data loss; app permanently orphaned without a keystore reset request to Google

---

### Pitfall 9: `webDir` Points to Wrong Path — Android App Shows Blank Screen

**What goes wrong:**
`capacitor.config.ts` sets `webDir: 'dist'` but `npm run build` outputs assets to a different directory (e.g., a future Vite config change moves output to `dist/client`). Running `npx cap sync` copies the wrong (or nonexistent) directory. The app installs but shows a blank screen or `ERR_FILE_NOT_FOUND`.

**Why it happens:**
`webDir` is set once during project initialization and rarely revisited. Any Vite `build.outDir` change silently breaks Capacitor sync — there is no validation at sync time that the directory contains a valid `index.html` (beyond a basic existence check).

**How to avoid:**
Lock `build.outDir` in `vite.config.ts` explicitly to `'dist'` and never change it without updating `capacitor.config.ts` simultaneously. Add a build script that validates the output before sync:

```json
"build:android": "npm run build && node -e \"require('fs').existsSync('dist/index.html') || process.exit(1)\" && npx cap sync android"
```

**Warning signs:**
- App installs but immediately shows white screen with no JavaScript errors
- `npx cap sync` completes without error even with an empty or stale `dist/`

**Phase to address:** Phase 1 — Capacitor project setup. Validate during initial setup and add to build script.

**Severity:** MEDIUM — immediately visible but wastes device/emulator test cycles

---

### Pitfall 10: Google Play Minimum Functionality Rejection for "WebView Wrapper"

**What goes wrong:**
Google Play reviewers reject apps that appear to be a "thin wrapper" around a website with no native value-add. An app that is identical to opening the PWA in Chrome, with no native features, may be rejected under the Spam and Minimum Functionality policy.

**Why it happens:**
Google explicitly prohibits apps whose "primary purpose is to provide a WebView of a website." Review is partly automated and partly manual. Apps with no native permissions, no native APIs called, no splash screen, and no distinct app icon fail the native value test.

**How to avoid:**
Focus Valley is well-positioned here because it uses: Haptics, LocalNotifications, and has distinct app icon/splash — these signal native integration to reviewers. Ensure these are functional before submission, not just installed as dead code. The store listing should explicitly call out native features ("haptic feedback," "native notifications") in the description.

Additional signals reviewers look for:
- A proper splash screen (not a white flash)
- A custom app icon (not a generic web icon)
- Target SDK 35 (Android 15) as of August 2025
- Privacy policy URL in the Play Console

**Warning signs:**
- No `@capacitor/haptics`, `@capacitor/local-notifications` permissions in `AndroidManifest.xml`
- App icon is the generic Capacitor placeholder
- Store description says nothing about native features

**Phase to address:** Phase 4 — Play Store submission prep. Audit native feature list and store listing copy before first submission.

**Severity:** HIGH — can delay launch by weeks if rejected; requires resubmission cycle

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep localStorage for Zustand persist | No migration work needed | User data wiped on low-storage devices | Never — migrate before first Play Store release |
| Leave vite-plugin-pwa fully enabled in Capacitor build | Fewer build configurations | All Capacitor plugins fail silently | Never |
| Skip keystore backup | Saves 10 minutes | App can never be updated if keystore is lost | Never |
| Auto-increment versionCode manually per release | Simple | Guaranteed human error on every release | Only for v1; automate before v1.2 |
| Defer Doze timer correction to post-launch | Faster first ship | Core timer feature broken on screen-lock | Never — test with screen-off before launch |
| Ship without Privacy Policy URL | Faster setup | Play Console submission blocked | Never — required field |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Google OAuth | Call `signInWithOAuth` directly — opens WebView — 403 error | Use `@capacitor/browser` to open system Chrome Custom Tab; handle deep link callback |
| `vite-plugin-pwa` + Capacitor | Leave service worker active in native build | Disable PWA plugin via env var for `build:android` script |
| Zustand `persist` | Default `localStorage` storage engine | Implement custom `CapacitorStorage` adapter using `@capacitor/preferences` |
| Web Worker + native plugins | Call `Haptics.vibrate()` from inside `timer.worker.ts` | Call all Capacitor APIs from main thread message handlers only |
| Android Page Visibility / Doze | Use only browser's `visibilitychange` for drift correction | Add `App.addListener('appStateChange')` with wall-clock drift correction |
| Google Play AAB upload | Submit without incrementing `versionCode` | Maintain release checklist with `versionCode` increment as step 1 |
| Splash screen | Leave Capacitor default white splash | Use `@capacitor/splash-screen` with branded pixel art splash matching app aesthetic |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Framer Motion heavy animations in WebView | Jank on mid-range Android devices (< 4GB RAM) during plant growth transitions | Use `useReducedMotion` for animation complexity; test on Samsung Galaxy A-series (budget tier) | Present on first load |
| Large SVG pixel plant assets loaded all at once | Long initial render; memory spikes | Lazy-load plant stage SVGs; only load stages relevant to current garden | Apps with 5+ active plants |
| AudioContext nodes accumulating without cleanup | Memory grows over long sessions; audio distorts | Disconnect and garbage-collect AudioNodes when channels are muted or sessions end | After 2+ hour focus sessions |
| Unregistered Capacitor event listeners on component unmount | Memory leak; duplicate events fired | Always call `listener.remove()` in `useEffect` cleanup for `App.addListener()` calls | After navigating between views repeatedly |
| WebView out-of-memory crash | App crashes silently on low-RAM devices; no JS error | Profile with Android Studio Memory Profiler on a 2GB RAM test device | On devices with < 3GB RAM under memory pressure |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing keystore file to git | Upload key exposed; attacker can publish malicious updates as your app | Add `*.keystore`, `*.jks`, `keystore.properties` to `.gitignore` immediately; rotate if committed |
| Hardcoding Supabase `anon` key in Capacitor build | Key visible in extracted APK (`dist/assets/*.js`) | Acceptable for Supabase `anon` key (it is designed to be public); do not include service role key |
| Storing auth session tokens in `localStorage` | Tokens evicted with WebView data; or accessible to other WebView origins | Store Supabase session via `@capacitor/preferences`; configure `CapacitorCookies: { enabled: true }` for OAuth callbacks |
| Using plain WebView for OAuth | Google `disallowed_useragent` rejection; also enables JS injection attacks against user credentials | Always use `@capacitor/browser` (Chrome Custom Tabs) for all OAuth flows |
| Broad `AndroidManifest.xml` permissions | Play Store flags excessive permissions during review | Request only what is used: `VIBRATE` (haptics), `RECEIVE_BOOT_COMPLETED` + `POST_NOTIFICATIONS` (notifications) |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| White flash before app loads | Feels like a broken web page, not an app | Configure `@capacitor/splash-screen` with `launchAutoHide: false`; hide programmatically after app is ready |
| Back button exits app mid-session | User accidentally destroys a focus session | Intercept Android hardware back button; show "End session?" confirmation during active timer |
| System status bar overlaps app header | UI elements hidden behind clock/battery indicators on notched devices | Set `backgroundColor` in `capacitor.config.ts`; use `@capacitor/status-bar` to configure overlay behavior |
| Keyboard pushes timer off screen | On Android, soft keyboard resizes the WebView; timer layout breaks | Set `android:windowSoftInputMode="adjustPan"` in `AndroidManifest.xml` for timer screens |
| No "open in browser" for Pro subscription | User cannot access Stripe checkout from inside Capacitor | Open subscription/billing URLs with `@capacitor/browser` to system browser; Stripe blocks in-app WebView payments |

---

## "Looks Done But Isn't" Checklist

- [ ] **Capacitor sync:** `npx cap sync` was run after every `npm run build` — verify `dist/` matches what is in `android/app/src/main/assets/public/`
- [ ] **Service worker disabled:** Confirm no `sw.js` or `workbox-*.js` files in the Capacitor Android assets directory
- [ ] **localStorage migration:** Verify Zustand `focus-valley-garden` store uses `@capacitor/preferences` — check with `Preferences.get({ key: 'focus-valley-garden' })` on device
- [ ] **Plugin injection:** Open `chrome://inspect` during app run; confirm `Capacitor` object exists on `window` in the WebView console
- [ ] **versionCode incremented:** Confirm `android/app/build.gradle` `versionCode` is higher than the previous Play Store submission
- [ ] **Keystore backed up:** Keystore file, password, key alias, and key password are all stored in password manager
- [ ] **OAuth deep link registered:** `com.focusvalley.app://` scheme registered in both `AndroidManifest.xml` and Supabase redirect URLs
- [ ] **Doze correction tested:** Lock screen for 5 minutes during active session; confirm timer shows correct elapsed time on return
- [ ] **Audio starts on gesture:** Confirm `AudioContext.state !== 'suspended'` after first user tap; confirm sounds play without additional interaction
- [ ] **Privacy policy URL:** Added to Play Console store listing (required field; submission blocked without it)
- [ ] **targetSdkVersion:** Set to API 35 in `android/variables.gradle` (required for new app submissions as of August 2025)

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Service worker blocking plugins | LOW | Delete `dist/sw.js`, disable plugin in build config, rebuild + sync + reinstall |
| localStorage data lost in production | HIGH | Cannot recover lost user data; add Capacitor Preferences storage immediately; announce "data may have been affected" in release notes |
| Keystore lost before first upload | LOW | Generate new keystore; use it for first submission (no prior key to conflict) |
| Keystore lost after first upload | HIGH | Request upload key reset via Play Console (requires identity verification, takes days); Google retains app signing key so distribution continues, only new uploads blocked |
| Google OAuth 403 error | MEDIUM | Add `@capacitor/browser` + deep link intent filter; rebuild and resubmit to Play Store for review |
| Play Store rejection: WebView spam | MEDIUM | Ensure Haptics + Notifications are functional; update store description; resubmit with appeal noting native APIs in use |
| versionCode collision on Play Store | LOW | Increment `versionCode`, rebuild `.aab`, re-upload; no store listing change required |
| Doze timer drift discovered post-launch | MEDIUM | Hotfix release with `appStateChange` wall-clock correction; low user-visible impact since timer UI will correct itself on app resume |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Service worker blocks plugin injection | Phase 1: Capacitor setup | `chrome://inspect` shows `window.Capacitor` in WebView; `Haptics.vibrate()` fires on device tap |
| Web Worker + Capacitor plugin boundary | Phase 2: Native plugin integration | Timer completion triggers haptic from main thread, not worker |
| localStorage eviction | Phase 1: Capacitor setup | `Preferences.get()` on fresh app install returns persisted garden data |
| Google OAuth disallowed_useragent | Phase 3: Auth integration | Google sign-in completes on physical Android device; deep link returns to app |
| Web Audio autoplay suspension | Phase 2: Audio on device testing | Ambient sound plays after first user tap on sound button; no tap-twice required |
| Doze mode timer drift | Phase 1: Timer on device testing | Screen-off for 5 min then resume shows correct elapsed time |
| versionCode not incremented | Phase 4: Release preparation | Release checklist item; Play Console accepts upload |
| Keystore not backed up | Phase 4: Release preparation | Keystore verified in password manager before first `cap build` |
| webDir wrong path | Phase 1: Capacitor setup | Validated by build script `index.html` existence check |
| Play Store minimum functionality rejection | Phase 4: Play Store submission | Haptics + notifications confirmed functional; store listing calls out native features |
| Android hardware back button | Phase 2: Native UX polish | During active session, back button shows confirmation dialog, not exit |
| Splash screen flash | Phase 1: Capacitor setup | No white flash visible on app launch; branded splash shown until app ready |

---

## Sources

- Capacitor Android Troubleshooting: https://capacitorjs.com/docs/android/troubleshooting
- Capacitor Storage Guide: https://capacitorjs.com/docs/guides/storage
- Capacitor Preferences API: https://capacitorjs.com/docs/apis/preferences
- Capacitor Web Worker issue (closed "not planned"): https://github.com/ionic-team/capacitor/issues/6309
- Google OAuth in embedded WebViews policy: https://developers.googleblog.com/upcoming-security-changes-to-googles-oauth-20-authorization-endpoint-in-embedded-webviews/
- Google OAuth remediation guide: https://support.google.com/faqs/answer/12284343
- Google Play target API level requirements (API 35 by Aug 2025): https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play Spam and Minimum Functionality policy: https://play.google/developer-content-policy/
- Play App Signing (upload key vs app signing key): https://support.google.com/googleplay/android-developer/answer/9842756
- Building and releasing Capacitor Android apps (Ionic Blog): https://ionic.io/blog/building-and-releasing-your-capacitor-android-app
- Zustand + Capacitor Preferences integration: https://github.com/pmndrs/zustand/discussions/2418
- Android Doze mode and background restrictions: https://developer.android.com/training/monitoring-device-state/doze-standby
- vite-plugin-pwa + Capacitor service worker conflict: https://github.com/quasarframework/quasar/issues/10934
- Capacitor Android customScheme issue: https://ionic.io/blog/capacitor-android-customscheme-issue-with-chrome-117
- MDN Autoplay policy for Web Audio: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- Will Google Play approve my WebView app: https://median.co/blog/will-google-play-approve-my-webview-app

---
*Pitfalls research for: Capacitor Android deployment — Focus Valley (React 19 + Vite 7 + Zustand + Web Workers + Web Audio API)*
*Researched: 2026-03-24*
