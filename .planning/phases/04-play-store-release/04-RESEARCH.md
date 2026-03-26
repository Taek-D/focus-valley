# Phase 4: Play Store Release - Research

**Researched:** 2026-03-26
**Domain:** Android release signing, Google Play Store submission, privacy policy hosting
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- App name: "Focus Valley - 포모도로 타이머" (Korean subtitle for search keywords)
- Listing languages: English + Korean (both registered in Play Console)
- Category: Productivity
- Tone: Casual & friendly — matches pixel art aesthetic ("집중할수록 정원이 자라요" style)
- Key selling points: (1) Pixel art garden growth gamification, (2) Accurate timer (Web Worker based, works in background)
- Content rating: Everyone (E) — no violence, sexual content, or gambling elements
- Screenshots: Real device captures (emulator or physical device), minimum 4 screenshots
- Screenshot screens: Timer + plant growth (main), Garden collection, Dark mode, plus one more at Claude's discretion
- Feature graphic (1024x500): Pixel art centered — arrange pixel plants from the app on themed background
- No mockup frames — raw device captures for screenshots
- Privacy policy hosted on Vercel at the same domain (e.g., /privacy route or static page)
- Data Safety form declares ALL of: Email+name (Google OAuth), App activity (Garden/session/todo Supabase), GA4 analytics, Sentry crash logs
- Data deletion: In-app account deletion button in settings (requires implementation)
- Data encryption in transit: Yes (HTTPS for all services)
- Data sharing: None
- Use Google Play App Signing (Google manages deploy key; upload key stays local)
- Generate upload keystore locally, enroll in Play App Signing during first upload
- versionCode: 1, versionName: "1.1.0"
- ProGuard/R8 minification: Disabled (minifyEnabled=false)
- applicationId: app.focusvalley.android

### Claude's Discretion
- Exact privacy policy wording and structure
- 4th screenshot choice (sound mixer, statistics, or other)
- Feature graphic exact layout and color palette
- Short description and full description copywriting (within decided tone and selling points)
- Gradle signing config structure
- Account deletion UI placement and flow within existing Settings panel

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STORE-01 | Signed AAB built with release keystore and Gradle signing config | signingConfigs block in build.gradle, keystore.properties pattern, `./gradlew bundleRelease` command |
| STORE-02 | Play Store listing complete with screenshots, feature graphic, descriptions, and category | Asset dimension specs, screenshot requirements, feature graphic 1024x500 |
| STORE-03 | Privacy policy hosted and Data Safety form submitted | privacy.html already exists in public/, Data Safety categories identified, account deletion via Supabase Edge Function |
| STORE-04 | App submitted to Google Play Store and passes review | Play Console submission checklist, content rating questionnaire, review timeline expectations |
</phase_requirements>

---

## Summary

Phase 4 is a release infrastructure phase with no new app features, except one required code change: implementing in-app account deletion (Google Play policy mandate for apps with account creation). The phase has four tracks running in sequence: (1) build signing setup, (2) asset production, (3) compliance (privacy policy update + Data Safety form), and (4) Play Console submission.

The existing codebase is well-prepared: `android/app/build.gradle` has `minifyEnabled false` already set, `public/privacy.html` exists but needs updating for the Android-specific data disclosures, and `useAuth.ts` has Supabase initialized with PKCE — account deletion requires a Supabase Edge Function because `auth.admin.deleteUser()` requires `service_role` key (cannot run client-side). The `vercel.json` catch-all rewrite `/(.*) -> /index.html` does NOT intercept `privacy.html` because Vercel serves static files from the filesystem before applying rewrites — this is the default "filesystem-first" behavior.

**Primary recommendation:** Work sequentially — keystore generation first (blocking all else), then asset production, then privacy policy update, then Play Console form filling and submission.

## Standard Stack

### Core
| Tool/Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| keytool (JDK) | bundled with JDK 21 | Generate upload keystore (.jks) | Standard Android tool, already available via AGP |
| `./gradlew bundleRelease` | AGP 8.x | Build signed AAB | Official Capacitor/Android release build command |
| keystore.properties | N/A | Store keystore path + passwords outside VCS | Official Android developer.android.com pattern |
| Supabase Edge Function | Supabase CLI | Server-side user deletion | Required because `auth.admin.deleteUser()` needs service_role key |
| Play Console | N/A | Store listing + review submission | Required — no alternative |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Android Studio "Generate Signed Bundle" | GUI alternative to command-line signing | One-time keystore generation (optional) |
| `keytool -list -v` | Verify keystore contents | Confirm keystore before uploading to Play |
| `./gradlew signingReport` | Verify signing config is wired correctly | Pre-submission sanity check |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| keystore.properties in root | Environment variables in CI | keystore.properties simpler for manual builds; no CI in v1.1 scope |
| Supabase Edge Function | Supabase RPC with service_role in `.env` | Edge Function is more secure; never exposes service_role to client |

**Installation / Setup:**
```bash
# Keystore generation (run once, save output securely)
keytool -genkey -v -keystore focusvalley-upload.jks \
  -alias focusvalley-upload \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Create keystore.properties (gitignored — add to .gitignore)
# storeFile=../focusvalley-upload.jks
# storePassword=<your-password>
# keyAlias=focusvalley-upload
# keyPassword=<your-password>
```

## Architecture Patterns

### Recommended Project Structure Changes
```
android/
  app/
    build.gradle          # Add signingConfigs block (Task 1)
  keystore.properties     # NEW - gitignored, store path + passwords
  focusvalley-upload.jks  # NEW - gitignored, upload keystore

public/
  privacy.html            # EXISTS - update with Android data disclosures

supabase/
  functions/
    delete-account/       # NEW - Edge Function for user self-deletion
      index.ts

src/
  hooks/
    useAuth.ts            # ADD deleteAccount() method
  components/
    TimerSettings.tsx     # ADD "Delete Account" button section
```

### Pattern 1: Gradle signingConfigs with keystore.properties (Groovy DSL)
**What:** Load credentials from a gitignored properties file, wire to release buildType
**When to use:** All production release builds — the standard Android pattern

```groovy
// Source: developer.android.com/studio/publish/app-signing
// android/app/build.gradle — add BEFORE the android{} block

def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    namespace = "app.focusvalley.android"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "app.focusvalley.android"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.1.0"        // <-- update from "1.0"
        // ... existing aaptOptions ...
    }
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release   // <-- wire signing
        }
    }
}
```

**keystore.properties** (at `android/keystore.properties`, gitignored):
```properties
storeFile=focusvalley-upload.jks
storePassword=<your-keystore-password>
keyAlias=focusvalley-upload
keyPassword=<your-key-password>
```

Note: `storeFile` path is relative to the file that calls `file(keystoreProperties['storeFile'])` — i.e., relative to `android/app/build.gradle`, so `../focusvalley-upload.jks` if the .jks is in `android/`.

### Pattern 2: AAB Build Command
**What:** Full build sequence to produce a signed AAB ready for Play Console upload
**When to use:** Release preparation

```bash
# 1. Build web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build signed AAB
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Pattern 3: Supabase Edge Function for Account Deletion
**What:** Server-side function that deletes the authenticated caller's account
**When to use:** Required for Google Play account deletion policy compliance

```typescript
// supabase/functions/delete-account/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify the JWT and get user
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }

  // Delete user (cascades to all user data per RLS policies)
  const { error } = await supabaseClient.auth.admin.deleteUser(user.id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

Client call from `useAuth.ts`:
```typescript
deleteAccount: async () => {
    if (!supabase) return;
    set({ loading: true, error: null });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { set({ loading: false }); return; }

    const { error } = await supabase.functions.invoke("delete-account");
    if (error) {
        set({ loading: false, error: "Account deletion failed. Please try again." });
        return;
    }
    // Sign out locally after server-side deletion
    await supabase.auth.signOut();
    set({ user: null, loading: false });
},
```

### Pattern 4: Vercel Static File + SPA Rewrite Coexistence
**What:** Vercel serves static files from filesystem BEFORE applying rewrites
**When to use:** Serving `privacy.html` (and other static HTML) alongside SPA

The existing `vercel.json` catch-all rewrite `/(.*) -> /index.html` does NOT affect files that physically exist in `dist/` — Vercel's filesystem-first behavior means `privacy.html` is served directly when the file exists. No `vercel.json` changes are needed.

The privacy policy URL will be: `https://focus-valley.vercel.app/privacy.html`

### Anti-Patterns to Avoid
- **Committing keystore.properties or .jks to git:** Irreversible exposure of signing credentials. Add both to `.gitignore` before creating them.
- **Using `minifyEnabled true` for Capacitor WebView apps:** The JS bundle is the real payload; R8 on Android's Java wrapper causes no benefit and can break Capacitor plugin reflection.
- **Calling `supabase.auth.admin.deleteUser()` from client code:** Requires service_role key which must never be in client. Always use an Edge Function.
- **Forgetting `npx cap sync android` before `./gradlew bundleRelease`:** The AAB will contain stale web assets if web build is not synced first.
- **Uploading APK instead of AAB:** Google Play has required AAB format for new apps since August 2021.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keystore generation | Custom key generation | `keytool` (JDK bundled) | Standard tool, correct key format for Android |
| Server-side user deletion | Custom auth middleware | Supabase Edge Function | Keeps service_role key server-side; Supabase handles auth validation |
| Release signing | Manual `jarsigner` calls | Gradle signingConfigs | Gradle integrates with AAB build pipeline automatically |
| Privacy policy page | New React route | Update existing `public/privacy.html` | Static HTML already exists, deployed to Vercel as-is |

**Key insight:** `public/privacy.html` already exists and is deployed. The task is to update its content for Android data disclosures, not build new infrastructure.

## Common Pitfalls

### Pitfall 1: storeFile path resolution
**What goes wrong:** `storeFile=focusvalley-upload.jks` resolves relative to where `file()` is called — inside `android/app/build.gradle` — so the .jks must be at `android/app/focusvalley-upload.jks`, OR use `../focusvalley-upload.jks` if .jks is in `android/`.
**Why it happens:** Gradle `file()` is relative to the subproject directory, not the root.
**How to avoid:** Use absolute path in keystore.properties OR explicitly test with `./gradlew signingReport` before building the AAB.
**Warning signs:** `FileNotFoundException` during `bundleRelease`.

### Pitfall 2: Missing `npx cap sync` before bundleRelease
**What goes wrong:** The AAB contains old web assets (previous `dist/` contents).
**Why it happens:** Capacitor copies web assets during `cap sync`, not during `bundleRelease`.
**How to avoid:** Always run `npm run build && npx cap sync android` before `./gradlew bundleRelease`.
**Warning signs:** App looks outdated when installed from AAB despite code changes.

### Pitfall 3: Play Console "upload key not matching" on re-upload
**What goes wrong:** Second AAB upload fails signature verification.
**Why it happens:** Using a different keystore than the first upload, or keystore lost.
**How to avoid:** Back up `focusvalley-upload.jks` and `keystore.properties` to a secure location (password manager, encrypted external storage) IMMEDIATELY after creation. Google Play App Signing allows upload key reset if compromised, but requires support ticket.
**Warning signs:** Play Console error "Your Android App Bundle is signed with the wrong key."

### Pitfall 4: Data Safety form / privacy policy mismatch
**What goes wrong:** Review rejection or post-publication enforcement action.
**Why it happens:** Privacy policy does not explicitly mention all data types declared in the Data Safety form.
**How to avoid:** Update `privacy.html` to explicitly name: (1) email+name via Google OAuth, (2) garden/session/todo data synced to Supabase, (3) GA4 analytics, (4) Sentry crash logs. The existing privacy.html covers analytics and Sentry but uses "browser" framing — needs Android-specific section.
**Warning signs:** Play Console review comment requesting privacy policy update.

### Pitfall 5: Account deletion — in-app path is mandatory
**What goes wrong:** Submitting the app without in-app account deletion triggers policy violation.
**Why it happens:** Google Play policy (effective Dec 2023, enforced May 2024) requires BOTH: in-app path AND a web URL.
**How to avoid:** Implement the "Delete Account" button in `TimerSettings.tsx` (shown only when `user !== null`) AND provide a web delete URL in the Data Safety form. The Supabase Edge Function handles the actual deletion.
**Warning signs:** Play Console policy violation warning on App content page.

### Pitfall 6: proguard-android.txt vs proguard-android-optimize.txt
**What goes wrong:** Build warning or failure on AGP 9+ (not immediately relevant but worth noting).
**Why it happens:** AGP 9 removed `proguard-android.txt`; only `proguard-android-optimize.txt` exists.
**How to avoid:** Current `build.gradle` uses `proguard-android.txt` — this is fine for AGP 8.x (current). If AGP is upgraded later, change to `proguard-android-optimize.txt`.
**Warning signs:** Build error `File not found: proguard-android.txt`.

## Code Examples

### Keytool command for upload keystore generation
```bash
# Source: developer.android.com/studio/publish/app-signing
keytool -genkey -v \
  -keystore focusvalley-upload.jks \
  -alias focusvalley-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Focus Valley, OU=Dev, O=FocusValley, L=Seoul, ST=Seoul, C=KR"
```

### Verify keystore before use
```bash
keytool -list -v -keystore focusvalley-upload.jks -alias focusvalley-upload
```

### Full release build sequence
```bash
# From project root
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
# AAB output: android/app/build/outputs/bundle/release/app-release.aab
```

### Verify signing config is wired
```bash
cd android
./gradlew signingReport
# Should show: release: focusvalley-upload.jks / focusvalley-upload alias
```

### Account deletion button in TimerSettings.tsx (placement)
```tsx
// Source: useAuth.ts pattern — add at bottom of settings dialog, gated by user state
import { useAuth } from "@/hooks/useAuth";
import { Trash2 } from "lucide-react";

// Inside TimerSettings component:
const user = useAuth((s) => s.user);
const deleteAccount = useAuth((s) => s.deleteAccount);

// Render after resetDefaults button, only when signed in:
{user && (
  <div className="space-y-2 rounded-2xl border border-destructive/20 p-4">
    <span className="font-body text-[10px] font-medium uppercase tracking-[0.1em] text-destructive/60">
      {t("settings.dangerZone")}
    </span>
    <button
      onClick={handleDeleteAccount}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-2.5 font-body text-[10px] font-medium tracking-wide text-destructive/60 transition-all hover:border-destructive/50 hover:text-destructive"
    >
      <Trash2 size={10} />
      {t("settings.deleteAccount")}
    </button>
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| APK upload to Play Store | AAB (Android App Bundle) required | August 2021 | Must use `bundleRelease`, not `assembleRelease` |
| Opt-in account deletion | Mandatory in-app + web deletion path | Dec 2023 (enforced May 2024) | Must implement before submission |
| Manual Data Safety | Required form in Play Console | 2022 | All apps must complete before submission |
| Google manages signing key | Play App Signing (upload key separate from deploy key) | 2019, mandatory for AAB | Upload key loss is recoverable via Play Console support |

**Deprecated/outdated:**
- APK uploads for new apps: replaced by AAB — do not use `./gradlew assembleRelease` for Play Store submission
- `proguard-android.txt`: removed in AGP 9+, use `proguard-android-optimize.txt` when upgrading

## Open Questions

1. **Supabase Edge Function deployment environment**
   - What we know: `supabase/` directory exists (per STATE.md references to `supabase/.temp/`), Supabase CLI is available
   - What's unclear: Whether Edge Functions are already deployed/configured in the Supabase project
   - Recommendation: Plan should include `supabase functions deploy delete-account` step and verify Edge Function URL matches expected Supabase project URL

2. **Privacy policy canonical URL**
   - What we know: `privacy.html` links to `https://focus-valley.vercel.app/privacy.html` in its `<link rel="canonical">`
   - What's unclear: Whether the Vercel deployment URL is `focus-valley.vercel.app` or a custom domain
   - Recommendation: Use the URL as-is; planner should include a step to verify the URL is live and accessible before submitting the Data Safety form

3. **Data Safety form — "account deletion web URL"**
   - What we know: Google requires a web URL where users can request deletion without reinstalling the app
   - What's unclear: Whether `privacy.html` serves as this URL (it mentions account deletion) or a separate `/delete-account` page is needed
   - Recommendation: The privacy policy URL is acceptable as the "account deletion web URL" in the Data Safety form if it explicitly describes how to request deletion (e.g., "contact privacy@focusvalley.app or use the in-app Delete Account button"). Update `privacy.html` to include this.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (inferred from existing `useHaptic.test.ts`) |
| Config file | Existing vitest config in project |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORE-01 | `./gradlew bundleRelease` produces signed AAB | manual — build artifact verification | `cd android && ./gradlew bundleRelease && ls app/build/outputs/bundle/release/app-release.aab` | N/A |
| STORE-02 | Play Store listing assets present | manual-only — visual review in Play Console | N/A | N/A |
| STORE-03 | Account deletion works end-to-end | integration | `npx vitest run src/hooks/useAuth.test.ts` | ❌ Wave 0 |
| STORE-03 | Privacy policy URL is live | manual smoke | `curl -I https://focus-valley.vercel.app/privacy.html` | N/A |
| STORE-04 | App submitted and passes review | manual-only — Play Console | N/A | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/useAuth.test.ts` — covers STORE-03 account deletion behavior (mock Supabase functions.invoke, verify signOut called after deletion, verify error state on failure)

## Sources

### Primary (HIGH confidence)
- [developer.android.com/studio/publish/app-signing](https://developer.android.com/studio/publish/app-signing) — signingConfigs block, keystore.properties pattern, Play App Signing enrollment steps
- [support.google.com/googleplay/android-developer/answer/13327111](https://support.google.com/googleplay/android-developer/answer/13327111) — account deletion policy requirements
- [support.google.com/googleplay/android-developer/answer/10787469](https://support.google.com/googleplay/android-developer/answer/10787469) — Data Safety form requirements
- [supabase.com/docs/reference/javascript/auth-admin-deleteuser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser) — admin deleteUser requires service_role key (server-side only)

### Secondary (MEDIUM confidence)
- [capgo.app/blog/how-to-resolve-android-build-errors-in-capacitor/](https://capgo.app/blog/how-to-resolve-android-build-errors-in-capacitor/) — Capacitor-specific bundleRelease pitfalls
- [appradar.com/blog/android-app-screenshot-sizes-and-guidelines-for-google-play](https://appradar.com/blog/android-app-screenshot-sizes-and-guidelines-for-google-play) — screenshot dimensions, feature graphic 1024x500 confirmed
- [android-developers.googleblog.com/2024/03/designing-your-account-deletion-experience-google-play.html](https://android-developers.googleblog.com/2024/03/designing-your-account-deletion-experience-google-play.html) — official Android dev blog on account deletion UX requirements

### Tertiary (LOW confidence, marked for validation)
- [blog.mansueli.com/supabase-user-self-deletion-empower-users-with-edge-functions](https://blog.mansueli.com/supabase-user-self-deletion-empower-users-with-edge-functions) — Edge Function implementation pattern (community blog, verify against official Supabase docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — sourced from official Android developer docs and Capacitor docs
- Architecture: HIGH — build.gradle pattern from official docs; Edge Function pattern matches Supabase's own guidance
- Pitfalls: HIGH — storeFile path and cap sync ordering are well-documented; account deletion policy sourced from official Play Console help
- Asset requirements: HIGH — feature graphic 1024x500 confirmed by multiple sources matching official spec

**Research date:** 2026-03-26
**Valid until:** 2026-09-26 (stable release processes; Play Store policy changes slowly)
