import path from "node:path";
import { expect, test } from "@playwright/test";
import { openApp, prepareApp, setSyncFeedback } from "./helpers";

test("sync reload banner and backup actions work in smoke flow", async ({ page }) => {
    await prepareApp(page, { landingDone: true });
    await openApp(page);

    await setSyncFeedback(page, {
        outcome: "pulled",
        requiresReload: true,
        syncedAt: new Date().toISOString(),
    });
    await expect(page.getByTestId("sync-reload-banner")).toBeVisible();
    await expect(page.getByTestId("sync-reload-button")).toBeVisible();

    await setSyncFeedback(page, null);
    await expect(page.getByTestId("sync-reload-banner")).toBeHidden();

    await page.getByTestId("timer-start").click();
    await setSyncFeedback(page, {
        outcome: "merged",
        requiresReload: true,
        syncedAt: new Date().toISOString(),
    });
    await expect(page.getByTestId("sync-reload-banner")).toBeHidden();
    await page.getByTestId("timer-pause").click();
    await setSyncFeedback(page, null);

    await page.getByTestId("header-settings").click();
    await expect(page.getByTestId("settings-dialog")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("backup-export").click();
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toContain("focus-valley-backup-");

    const fixturePath = path.join(process.cwd(), "e2e", "fixtures", "backup.json");
    await page.getByTestId("backup-import-input").setInputFiles(fixturePath);
    await expect(page.getByTestId("settings-backup-notice")).toBeVisible();
    await expect(page.getByTestId("settings-backup-reload")).toBeVisible();
});
