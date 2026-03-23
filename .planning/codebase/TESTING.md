# Testing Patterns

**Analysis Date:** 2026-03-23

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vite.config.ts` with `test.environment: "node"`
- Vitest excludes e2e tests from unit test runs

**Assertion Library:**
- Vitest's built-in `expect()` from `vitest` package
- Playwright's `expect()` for e2e tests

**E2E Framework:**
- Playwright 1.58.2
- Config: `playwright.config.ts`
- Headless Chrome by default
- Locale: `ko-KR` (Korean)
- Service Workers blocked for testing
- Screenshots/videos on failure

**Run Commands:**
```bash
npm test              # Run all unit tests (vitest run)
npm run test:watch   # Watch mode (vitest)
npm run test:e2e     # Build and run Playwright tests
npm run test:e2e:headed  # Playwright in headed mode (visible browser)
npm run test:ci       # Full CI pipeline (type check, lint, unit tests, e2e)
```

## Test File Organization

**Location:**
- Unit tests: co-located with source files in `src/`
- E2E tests: separate `e2e/` directory
- Test files follow source naming: `src/hooks/useGarden.ts` → `src/hooks/useGarden.test.ts`

**Naming:**
- Pattern: `{module}.test.ts` or `{module}.test.tsx`
- Examples: `useGarden.test.ts`, `useAppSessionFlow.test.ts`, `sync.test.ts`

**E2E Structure:**
```
e2e/
├── helpers.ts           # Shared test setup and utilities
├── fixtures/            # Test data and fixtures
├── demo.spec.ts         # Demo mode tests
├── landing.spec.ts      # Landing screen tests
├── modals.spec.ts       # Modal interaction tests
├── recovery.spec.ts     # Session recovery tests
└── sync-backup.spec.ts  # Sync/backup feature tests
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from "vitest";

describe("useGarden helpers", () => {
    it("only shows an active streak for today or yesterday", () => {
        expect(getDisplayStreak(3, getToday())).toBe(3);
        expect(getDisplayStreak(3, getYesterday())).toBe(3);
        expect(getDisplayStreak(3, "2026-03-01")).toBe(0);
        expect(getDisplayStreak(0, getToday())).toBe(0);
    });

    it("maps growth progress to the correct visual stage", () => {
        expect(getGrowthStage(0)).toBe("SEED");
        expect(getGrowthStage(10)).toBe("SPROUT");
        expect(getGrowthStage(40)).toBe("BUD");
        expect(getGrowthStage(70)).toBe("FLOWER");
        expect(getGrowthStage(99)).toBe("FLOWER");
        expect(getGrowthStage(100)).toBe("TREE");
    });
});
```

**Patterns:**
- Uses `describe()` for test suites
- Uses `it()` for individual test cases
- Descriptive test names: "only shows...", "maps growth...", "migrates legacy..."
- Each `it()` tests a single behavior

## E2E Test Structure

**Pattern:**
```typescript
import { expect, test } from "@playwright/test";
import { expectTimerToDecrease, openApp, prepareApp, readTimerSeconds } from "./helpers";

test("demo mode starts cleanly, decreases time, and restores the default timer", async ({ page }) => {
    await prepareApp(page);
    await openApp(page);

    await page.getByTestId("landing-try-demo").click();

    await expect(page.getByTestId("landing-screen")).toBeHidden();
    await expect(page.getByTestId("demo-badge")).toBeVisible();

    const timer = page.getByTestId("timer-display");
    const initialSeconds = await readTimerSeconds(timer);
    expect(initialSeconds).toBeGreaterThanOrEqual(175);
    expect(initialSeconds).toBeLessThanOrEqual(180);

    await expectTimerToDecrease(timer);

    await page.getByTestId("demo-end").click();
    await expect(page.getByTestId("demo-badge")).toBeHidden();
    await expect(timer).toContainText("25:00");
});
```

**Setup Pattern:**
- Call `prepareApp(page, options)` to initialize localStorage and mocks
- Call `openApp(page)` to open app and unregister service workers
- Use `page.getByTestId()` to query elements (attribute: `data-testid`)

## Mocking

**Framework:** Playwright's built-in mock capabilities

**Patterns:**

**Geolocation Mock:**
```typescript
const geolocation = {
    getCurrentPosition: (_success: unknown, error?: (positionError: unknown) => void) => {
        error?.(geoError);
    },
    watchPosition: (_success: unknown, error?: (positionError: unknown) => void) => {
        error?.(geoError);
        return 0;
    },
    clearWatch: () => undefined,
};

Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: geolocation,
});
```

**Notification Mock:**
```typescript
if (typeof window.Notification === "function") {
    window.Notification.requestPermission = () => Promise.resolve("granted");
} else {
    class NotificationStub {
        static permission: NotificationPermission = "granted";
        static requestPermission() {
            return Promise.resolve<NotificationPermission>("granted");
        }
    }
    Object.defineProperty(window, "Notification", {
        configurable: true,
        writable: true,
        value: NotificationStub,
    });
}
```

**What to Mock:**
- Geolocation (permission denied by default)
- Notification API (always grant permission)
- Service Workers (blocked via config)
- localStorage/sessionStorage (clear before test)

**What NOT to Mock:**
- Timer logic (test actual Web Worker behavior)
- State/Zustand stores (test through components)
- API calls to Supabase (use fixtures or e2e staging)
- DOM events (use Playwright's `.click()`, `.fill()`)

## Fixtures and Factories

**Test Data Pattern:**
```typescript
function createSnapshot(overrides?: Partial<SyncableDataV2>): SyncableDataV2 {
    return {
        schemaVersion: 2,
        garden: {
            stage: "SEED",
            type: "DEFAULT",
            history: [],
            totalFocusMinutes: 0,
            focusSessions: [],
            currentStreak: 0,
            bestStreak: 0,
            lastFocusDate: null,
            unlockedPlants: [],
            deepFocusStreak: 0,
            lastFocusTimestamp: 0,
            earnedMilestones: [],
            updatedAt: "2026-03-12T00:00:00.000Z",
        },
        // ... more fields
        ...overrides,
    };
}
```

**Location:**
- Fixtures in `e2e/fixtures/` directory
- Inline factories in test files for unit tests
- Use spread operator for overrides: `createSnapshot({ garden: { stage: "FLOWER" } })`

## Coverage

**Requirements:** Not enforced (no coverage threshold in config)

**View Coverage:**
- Command not configured
- Run `npm test` for pass/fail only

**Current Coverage:**
- Unit tests for exported helper functions (getDuration, getDisplayStreak, getGrowthStage, etc.)
- Unit tests for state/sync logic (`useGarden.test.ts`, `useAppSessionFlow.test.ts`, `sync.test.ts`)
- E2E smoke tests for critical user flows (demo mode, landing, recovery)
- No component snapshot tests

## Test Types

**Unit Tests:**
- Scope: Pure functions, helper functions, state selectors
- Location: `src/hooks/*.test.ts`, `src/lib/*.test.ts`
- Example: `useGarden.test.ts` tests `getDisplayStreak()` and `getGrowthStage()`
- Approach: Test inputs and expected outputs; no mocking of React internals
- Test helpers from modules: import and test directly
  ```typescript
  import { getDisplayStreak, getGrowthStage } from "@/hooks/useGarden";
  ```

**Integration Tests:**
- Scope: Sync logic that combines multiple modules (garden + settings + categories + todos)
- Location: `src/lib/sync.test.ts`
- Approach: Create test snapshots, call merge/migrate functions, verify results
- Example: `mergeSyncData()` tests merging of local and cloud data

**E2E Tests:**
- Framework: Playwright
- Scope: User workflows from landing through timer, plant interaction, modals
- Location: `e2e/*.spec.ts`
- Approach: Navigate app, click buttons, wait for state changes, assert visibility
- Examples:
  - `demo.spec.ts`: Demo mode starts, timer decreases, restore works
  - `landing.spec.ts`: Landing screen interactions
  - `recovery.spec.ts`: Session recovery after tab background
  - `sync-backup.spec.ts`: Cloud sync and data merge flows

## Common Patterns

**Async Testing:**

Unit tests with async helpers:
```typescript
export async function readTimerSeconds(locator: Locator) {
    const text = (await locator.textContent()) ?? "";
    const match = text.match(/(\d{2}):(\d{2})/);
    if (!match) {
        throw new Error(`Unable to parse timer value from "${text}"`);
    }
    return Number(match[1]) * 60 + Number(match[2]);
}

export async function expectTimerToDecrease(locator: Locator, timeout = 8_000) {
    const initial = await readTimerSeconds(locator);
    await expect
        .poll(async () => readTimerSeconds(locator), { timeout })
        .toBeLessThan(initial);
}
```

E2E tests with `async ({ page }) => { ... }`:
```typescript
test("timer counts down", async ({ page }) => {
    await prepareApp(page);
    await openApp(page);
    const timer = page.getByTestId("timer-display");
    await expectTimerToDecrease(timer);
});
```

**Error Testing:**

Validation of parse errors in unit tests:
```typescript
function loadTimerState(): PersistedTimerState | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        // ... validation
        if (parsed.version !== TIMER_STATE_VERSION) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return parsed;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}
```

No separate error test cases; errors are side effects of normal flow (clear invalid state).

## Accessibility Testing

**Patterns (E2E):**
- Use semantic HTML (role attributes, aria-labels)
- Test interactive elements with `getByTestId()` or role queries
- Reduced motion: `page.emulateMedia({ reducedMotion: "reduce" })`

**Example from `helpers.ts`:**
```typescript
export async function openApp(page: Page) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    // ... rest of setup
}
```

## E2E Configuration Details

**Playwright Config (`playwright.config.ts`):**
- `browserName: "chromium"`
- `baseURL: "http://127.0.0.1:4173"` (Vite preview server)
- `locale: "ko-KR"` (Korean)
- `testIdAttribute: "data-testid"`
- `trace: "on-first-retry"` - record traces only on failure
- `screenshot: "only-on-failure"`
- `video: "retain-on-failure"`
- `serviceWorkers: "block"` - disable service workers
- `timeout: 30_000` (30 seconds per test)
- `fullyParallel: false` - run tests sequentially
- `retries: 1 in CI, 0 locally`
- `webServer`: starts Vite preview on `4173` before tests

**Setup Helper (`e2e/helpers.ts`):**
```typescript
export async function prepareApp(page: Page, options: AppSetupOptions = {}) {
    await page.addInitScript(
        ({ landingDone, timerState, e2eInitKey, geoError }) => {
            // Initialize localStorage with test data
            // Mock geolocation to fail
            // Mock Notification API to grant permission
        },
        { landingDone, timerState, e2eInitKey, geoError }
    );
}
```

---

*Testing analysis: 2026-03-23*
