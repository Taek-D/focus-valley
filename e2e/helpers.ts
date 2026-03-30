import { expect, type Locator, type Page } from "@playwright/test";

type TimerStateSeed = {
    version: number;
    mode: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";
    isRunning: boolean;
    focusCount: number;
    startedAt: number;
    pausedTimeLeft: number;
};

type AppSetupOptions = {
    landingDone?: boolean;
    timerState?: TimerStateSeed | null;
};

type SyncFeedbackSeed = {
    outcome: "pushed" | "pulled" | "merged" | "noop" | "error";
    requiresReload: boolean;
    syncedAt: string | null;
};

const E2E_INIT_KEY = "focus-valley-e2e-initialized";
const GEO_ERROR = {
    code: 1,
    message: "Blocked by Playwright E2E",
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
};

function getMondayKey(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(monday.getDate() - diff);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

export async function prepareApp(page: Page, options: AppSetupOptions = {}) {
    const weeklySummaryKey = `focus-valley-weekly-summary-${getMondayKey()}`;

    await page.addInitScript(
        ({ landingDone, timerState, e2eInitKey, geoError, weeklySummaryStorageKey }) => {
            if (!sessionStorage.getItem(e2eInitKey)) {
                localStorage.clear();
                sessionStorage.clear();
                sessionStorage.setItem(e2eInitKey, "1");
                localStorage.setItem("focus-valley-install-dismissed", "1");
                localStorage.setItem(weeklySummaryStorageKey, "1");
                localStorage.setItem("focus-valley-locale", JSON.stringify({
                    state: { locale: "ko" },
                    version: 1,
                }));

                if (landingDone) {
                    localStorage.setItem("focus-valley-landing-done", "1");
                }

                if (timerState) {
                    localStorage.setItem("focus-valley-timer-state", JSON.stringify(timerState));
                }
            }

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
        },
        {
            landingDone: options.landingDone ?? false,
            timerState: options.timerState ?? null,
            e2eInitKey: E2E_INIT_KEY,
            geoError: GEO_ERROR,
            weeklySummaryStorageKey: weeklySummaryKey,
        },
    );
}

export async function openApp(page: Page) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(async () => {
        const registrations = await navigator.serviceWorker?.getRegistrations?.();
        await Promise.all((registrations ?? []).map((registration) => registration.unregister()));
    });
}

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

export async function setSyncFeedback(page: Page, detail: SyncFeedbackSeed | null) {
    await page.evaluate((value) => {
        window.dispatchEvent(new CustomEvent("focus-valley:e2e-sync-feedback", { detail: value }));
    }, detail);
}
