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
