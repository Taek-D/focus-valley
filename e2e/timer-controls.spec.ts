import { expect, test } from "@playwright/test";
import { expectTimerToDecrease, openApp, prepareApp, readTimerSeconds } from "./helpers";

test("timer can pause, resume, and reset through the confirmation flow", async ({ page }) => {
    await prepareApp(page, { landingDone: true });
    await openApp(page);

    const timer = page.getByTestId("timer-display");
    const startButton = page.getByTestId("timer-start");

    await startButton.click();
    await expect(page.getByTestId("timer-pause")).toBeVisible();
    await expectTimerToDecrease(timer);

    const pauseButton = page.getByTestId("timer-pause");
    await pauseButton.click();
    await expect(startButton).toBeVisible();

    const pausedSeconds = await readTimerSeconds(timer);
    await page.waitForTimeout(1500);
    expect(await readTimerSeconds(timer)).toBe(pausedSeconds);

    await startButton.click();
    await expect(page.getByTestId("timer-reset")).toBeVisible();
    await expectTimerToDecrease(timer);

    await page.getByTestId("timer-reset").click();
    await expect(page.getByTestId("session-giveup-dialog")).toBeVisible();

    await page.getByTestId("session-giveup-cancel").click();
    await expect(page.getByTestId("session-giveup-dialog")).toBeHidden();
    await expect(page.getByTestId("timer-pause")).toBeVisible();

    await page.getByTestId("timer-reset").click();
    await page.getByTestId("session-giveup-confirm").click();

    await expect(page.getByTestId("session-giveup-dialog")).toBeHidden();
    await expect(startButton).toBeVisible();
    await expect(timer).toContainText("25:00");
});
