# Codebase Concerns

**Analysis Date:** 2026-03-23

## Tech Debt

**Silent localStorage Quota Failures:**
- Issue: Multiple locations (timer state, weather cache, sync storage) catch quota-exceeded errors silently and ignore them
- Files: `src/hooks/useTimer.ts` (line 30), `src/hooks/useWeather.ts` (line 45), `src/lib/persist.ts` (lines 18-19), `src/lib/sync-storage.ts` (lines 28-38)
- Impact: State loss without user notification. Timer can lose resumed state, garden can lose focus sessions, settings can lose preferences. No feedback to user that storage is full
- Fix approach: Implement storage quota management with user-facing warnings. Use try-catch blocks to surface quota errors to user via notification system. Consider IndexedDB as fallback when localStorage quota is exceeded

**Deep Focus Streak Calculation Lacks Edge Case Handling:**
- Issue: Gap threshold (30 minutes) is hardcoded in `useGarden.ts` line 162 with no configurability or documentation
- Files: `src/hooks/useGarden.ts` (lines 162-166)
- Impact: Users may not understand why their deep focus streak resets. No way to adjust for different working styles
- Fix approach: Make gap threshold a configurable setting or document the 30-minute rule prominently in UI/help text

**Web Worker Timer Uses setInterval Without Drift Correction:**
- Issue: Timer worker relies on simple 1000ms intervals which drift over time. Browser event loop can delay TICK messages
- Files: `src/workers/timer.worker.ts` (lines 10-12)
- Impact: Long focus sessions (30+ minutes) can lose 1-5 seconds of accuracy. Users may question timer reliability
- Fix approach: Implement deadline-based timing using `performance.now()` instead of relying on setInterval. Client already tracks deadline in `useTimer.ts` line 178, but worker should validate against it

**Analytics Silently Fails Without User Notice:**
- Issue: Google Analytics event tracking wrapped in `if` conditions but no fallback or error handling
- Files: `src/lib/analytics.ts` (lines 43-46)
- Impact: Analytics misses data if gtag script fails to load or window is not available. Production metrics could be incomplete
- Fix approach: Add logging for analytics failures in non-production code. Implement graceful degradation when gtag unavailable

**No Recovery for Failed Cloud Sync:**
- Issue: Push/pull operations return boolean but don't persist intent to retry. If sync fails mid-operation, state could be inconsistent
- Files: `src/lib/sync.ts` (lines 35-51, 53-75), `src/hooks/useAppSyncFlow.ts` (lines 88-94)
- Impact: User data can become out-of-sync between browser and cloud. No automatic retry or user prompt to manually re-sync
- Fix approach: Implement exponential backoff retry logic. Store pending sync metadata in localStorage. Notify user when sync fails with option to retry

## Known Bugs

**Timer Recovery Prompt Can Appear After Manual Reset:**
- Symptoms: If user clicks reset while recovery modal is pending, state becomes inconsistent. Recovery prompt may still show
- Files: `src/hooks/useTimer.ts` (lines 80-81, 204-209), `src/App.tsx` (line 337-375)
- Trigger: (1) Timer running, tab closes, (2) tab reopens and recovery prompt appears, (3) user clicks reset before acknowledging prompt
- Workaround: Reload the page to clear state

**Garden Plant Type Can Be Undefined After Sync:**
- Symptoms: Plant renders with empty type, breaking plant display animations
- Files: `src/hooks/useGarden.ts` (lines 133, 139), `src/lib/sync-storage.ts` (line 50), `src/lib/sync-engine.ts` (line 25)
- Cause: Migration doesn't validate plant type against known types; randomPlantType can fail if unlocked plants array is corrupted
- Workaround: Clear app data in dev tools to reset garden

**Weather API Fetch Can Block UI If Geolocation Hangs:**
- Symptoms: User sees blank or stale weather until geolocation callback fires (can be delayed or denied)
- Files: `src/hooks/useWeather.ts` (lines 71-80)
- Cause: Geolocation request is synchronous and blocking; no timeout set
- Workaround: None; users must wait or deny geolocation permission

## Security Considerations

**Supabase Client Initialized Without Null Check in Sync Operations:**
- Risk: If supabase client initialization fails, sync silently returns success instead of failing gracefully
- Files: `src/lib/sync.ts` (lines 35-36, 53-54)
- Current mitigation: Early return with `false` if supabase is null
- Recommendations: Log warning when supabase is null. Provide explicit error result to caller with outcome: "error". Ensure offline mode is clearly signaled

**Backup File Restore Uses JSON.parse Without Size Validation:**
- Risk: Malicious or corrupted backup files could crash parser or cause excessive memory consumption
- Files: `src/lib/backup.ts` (line 37)
- Current mitigation: Try-catch wraps restore logic but backup file size is unchecked
- Recommendations: Validate file size before parsing (max 5MB). Implement streaming parser for large files. Validate restored data structure before applying to state

**localStorage Used for Sync Metadata Without Encryption:**
- Risk: Sync timestamps and local snapshots stored in plain text. No protection against XSS attacks reading sync state
- Files: `src/lib/sync-storage.ts` (lines 28-38, 107-108)
- Current mitigation: None; localStorage is plaintext
- Recommendations: This is low-risk for a Pomodoro app (no credentials stored). For future expansion, consider storing sensitive metadata in IndexedDB with encryption or Memory-only cache

**analyticsInitialized Flag Can Be Bypassed:**
- Risk: Multiple initAnalytics calls could register multiple gtag scripts if module loads twice
- Files: `src/lib/analytics.ts` (lines 6, 20, 38)
- Current mitigation: analyticsInitialized flag prevents re-initialization
- Recommendations: Ensure main.tsx calls initAnalytics only once. Consider module-level singleton pattern

## Performance Bottlenecks

**Plant Stage Calculations Trigger Every Timer Tick:**
- Problem: Garden.grow() called on every timer TICK (every 1 second during focus), causing re-renders
- Files: `src/hooks/useAppSessionFlow.ts` (lines 120-127)
- Cause: useEffect listens to timer.timeLeft which updates every second from worker
- Improvement path: Debounce grow() calls to once per 5 seconds or only when stage would change. Calculate next stage before render

**Audio Buffer Crossfading Applied at Every Mount:**
- Problem: applyLoopCrossfade() processes entire audio buffer on every useAudioMixer initialization
- Files: `src/hooks/useAudioMixer.ts` (lines 27-47)
- Cause: No memoization or caching of processed buffers
- Improvement path: Cache processed buffers by URL. Use AudioBuffer.slice() to avoid re-processing. Implement lazy loading

**Sync Storage Reads All Zustand Stores on Every getLocalSyncSnapshot:**
- Problem: Multiple localStorage reads and JSON parses on sync operations
- Files: `src/lib/sync-storage.ts` (lines 40-93)
- Cause: Each readPersistedState call parses JSON separately
- Improvement path: Batch localStorage reads. Cache parsed state with TTL. Consider single combined JSON blob instead of 4 separate keys

**Focus Sessions Array Grows Unbounded:**
- Problem: focusSessions array includes all historical sessions; no archival strategy
- Files: `src/hooks/useGarden.ts` (lines 145-146)
- Cause: Array append-only design; no pruning
- Improvement path: Archive sessions older than 90 days. Implement pagination in UI for history panel. Store aggregate stats separately

## Fragile Areas

**Session Flow Demo Mode State Machine:**
- Files: `src/hooks/useAppSessionFlow.ts` (lines 82-106, 97-106)
- Why fragile: Demo mode has multiple ref-based state pieces (demoRestoreFocusRef, shouldStartDemoSession, isDemoMode) that can desynchronize. Mode switching logic scattered across multiple handlers
- Safe modification: Consolidate demo state into single Zustand store. Add invariant checks. Write tests for all demo->normal transitions
- Test coverage: No tests for demo mode (only layout test). Missing: test demo timer acceleration, test demo restoration on mode switch, test demo + sync interaction

**Plant Unlock and Milestone Pending State:**
- Files: `src/hooks/useGarden.ts` (lines 73-77, 168-185), `src/App.tsx` (lines 204-227)
- Why fragile: pendingUnlock and pendingMilestone are cleared separately. If UI crashes between earning and clearing, user sees stale unlock. No deduplication if unlock earned twice in quick succession
- Safe modification: Make unlocks transactional; clear both pending values together. Deduplicate before setting pending. Add recovery logic to detect stale pending values on app start
- Test coverage: No tests for unlock edge cases

**Timer Reconciliation on Tab Visibility:**
- Files: `src/hooks/useTimer.ts` (lines 182-202)
- Why fragile: deadlineRef updated at multiple points (lines 178, 226, 232, etc). Reconciliation only runs on visibilitychange. If user switches tabs rapidly, deadline could become stale
- Safe modification: Create single place to update deadline. Add periodic deadline validation via Web Worker ping. Test with simulated tab switches
- Test coverage: No E2E tests for tab switching behavior

**Zustand Store Migrations Assume Backward Compatibility:**
- Files: `src/hooks/useGarden.ts` (lines 221-260), `src/hooks/useTodos.ts`, `src/hooks/useCategories.ts`
- Why fragile: Migrate functions are lenient (accept partial state) but don't validate required fields exist. If schema changes, old data could corrupt
- Safe modification: Add schema version per-field not just per-store. Pre-validate required fields before migration. Write integration tests for actual storage format changes
- Test coverage: Migration tested in unit tests but not with real localStorage corruptions

## Scaling Limits

**localStorage Quota Approaching on Large Datasets:**
- Current capacity: ~5-10MB typical browser quota
- Limit: With 1000+ focus sessions, garden history, todos, categories, and sync metadata, could reach 2-4MB
- Scaling path: (1) Archive old sessions to IndexedDB or server, (2) Implement storage quota monitoring, (3) Offer auto-cleanup option, (4) Use compression for history array

**Focus Sessions Array Linearly Scales Memory:**
- Current: 1000 sessions ≈ 100KB in memory
- Limit: 10,000+ sessions causes slowdowns in history panel, sync operations
- Scaling path: Implement pagination (fetch 100 sessions at a time). Add date range filtering. Use virtual scrolling in history panel

**Analytics Events Can Queue if Network Slow:**
- Current: gtag buffers events in dataLayer
- Limit: Long offline periods or slow network can cause dataLayer to grow unbounded
- Scaling path: Implement event batching with max queue size. Drop oldest non-critical events if queue exceeds limit

## Dependencies at Risk

**@supabase/supabase-js No Version Pinning:**
- Risk: Minor version bump could break sync contract or introduce breaking changes
- Impact: Automatic updates could silently break cloud sync
- Migration plan: Pin to exact version (currently ^2.95.3). Subscribe to supabase changelog. Test before upgrading

**Remotion Video Generation Has Unused SDK:**
- Risk: Large dependency bundle bloat (4.0.422) included in build but main app doesn't use it
- Impact: Build size increased 500KB+ unnecessarily
- Migration plan: Move Remotion to separate build target or remove if no video features planned. Consider lazy-loading only if user clicks video export

**@sentry/react Auto-Initialization Risk:**
- Risk: Sentry SDK initializes globally if environment variables set, no opt-out at runtime
- Impact: Cannot disable error tracking without env var change; always sends to Sentry endpoint
- Migration plan: Add Sentry initialization guard. Implement user opt-in for error tracking. Document telemetry clearly

## Missing Critical Features

**No Offline Mode Indicator:**
- Problem: Users cannot tell if app is offline or if sync is just slow
- Blocks: Cannot guarantee data safety during airplane mode; users may close tab thinking app crashed

**No Data Export Besides JSON Backup:**
- Problem: Users cannot export focus history to CSV/spreadsheet format
- Blocks: Cannot integrate with external analytics tools, cannot share statistics with coaches

**No Multi-Device Sync Conflict Resolution UI:**
- Problem: If user focuses on multiple devices simultaneously, last-write-wins could lose data
- Blocks: Users with multiple devices cannot reliably sync data

## Test Coverage Gaps

**Web Worker Timer Behavior:**
- What's not tested: Worker accuracy over 30+ minute sessions, worker restart on errors, worker-to-main thread messaging reliability
- Files: `src/workers/timer.worker.ts`, `src/hooks/useTimer.ts`
- Risk: Timer drift or worker crashes would go unnoticed until production
- Priority: High — timer is core feature

**Cloud Sync Edge Cases:**
- What's not tested: Partial sync failures, concurrent sync requests, sync with corrupted cloud data, network timeout retries
- Files: `src/lib/sync.ts`, `src/hooks/useAppSyncFlow.ts`
- Risk: Data loss or corruption in multi-device scenarios
- Priority: High — affects data safety

**localStorage Quota Exceeded:**
- What's not tested: Behavior when quota exceeded, recovery after quota is freed, fallback to session storage
- Files: `src/hooks/useTimer.ts`, `src/lib/sync-storage.ts`, multiple Zustand stores
- Risk: Silent data loss when storage full
- Priority: High — affects all state persistence

**Plant Animation and Rendering:**
- What's not tested: Plant SVG rendering correctness, stage transitions, particles on harvest
- Files: `src/components/PlantGarden.tsx`, `src/components/ui/pixel-plants.tsx`
- Risk: Visual glitches unreported in production
- Priority: Medium — visual polish

**Audio Mixer Initialization and Playback:**
- What's not tested: Audio context state transitions (suspended/running), multiple audio tracks mixed, buffer loading failures
- Files: `src/hooks/useAudioMixer.ts`
- Risk: Audio features silently fail on some devices
- Priority: Medium — user-facing feature

**Geolocation and Weather API:**
- What's not tested: Denied permission handling, timeout handling, stale cache edge case
- Files: `src/hooks/useWeather.ts`
- Risk: Weather feature hangs or shows stale data without warning
- Priority: Low — non-critical feature

---

*Concerns audit: 2026-03-23*
