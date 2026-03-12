import { expect, test } from "@playwright/test";
import { openApp, prepareApp } from "./helpers";

test("settings, auth, and upgrade preview modals behave as smoke flows", async ({ page }) => {
    await prepareApp(page, { landingDone: true });
    await openApp(page);

    await page.getByTestId("header-settings").click();
    await expect(page.getByTestId("settings-dialog")).toBeVisible();
    await expect(page.getByTestId("settings-presets")).toBeVisible();
    await expect(page.getByTestId("settings-backup")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("settings-dialog")).toBeHidden();

    await page.getByTestId("header-auth").click();
    await expect(page.getByTestId("auth-dialog")).toBeVisible();

    if (await page.getByTestId("auth-config-missing").isVisible().catch(() => false)) {
        await expect(page.getByTestId("auth-config-missing")).toBeVisible();
    } else {
        await expect(page.getByTestId("auth-google")).toBeVisible();
        await expect(page.getByTestId("auth-email")).toBeVisible();
        await expect(page.getByTestId("auth-password")).toBeVisible();
    }

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("auth-dialog")).toBeHidden();

    await page.getByTestId("sound-toggle").click();
    await expect(page.getByTestId("audio-slider-thunder")).toBeVisible();
    await page.getByTestId("audio-slider-thunder").dispatchEvent("mousedown");
    await expect(page.getByTestId("upgrade-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("upgrade-modal")).toBeHidden();
});
