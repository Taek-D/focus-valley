import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    outputDir: "output/playwright/test-results",
    timeout: 30_000,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:4173",
        locale: "ko-KR",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        serviceWorkers: "block",
        testIdAttribute: "data-testid",
    },
    webServer: {
        command: "npm run preview -- --host 127.0.0.1 --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
