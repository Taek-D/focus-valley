import { expect, test } from "@playwright/test";
import { openApp, prepareApp } from "./helpers";

test("first visit landing is dismissible and stays dismissed after reload", async ({ page }) => {
    await prepareApp(page);
    await openApp(page);

    const landing = page.getByTestId("landing-screen");
    await expect(landing).toBeVisible();

    await page.getByTestId("landing-get-started").click();
    await expect(landing).toBeHidden();

    await page.reload();
    await expect(landing).toBeHidden();
});
