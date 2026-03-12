import { expect, test } from "@playwright/test";
import { expectTimerToDecrease, openApp, prepareApp } from "./helpers";

function createRecoverySeed() {
    return {
        version: 1,
        mode: "FOCUS" as const,
        isRunning: true,
        focusCount: 1,
        startedAt: Date.now() - 15_000,
        pausedTimeLeft: 180,
    };
}

test("recovery dialog resumes a running timer", async ({ page }) => {
    await prepareApp(page, {
        landingDone: true,
        timerState: createRecoverySeed(),
    });
    await openApp(page);

    await expect(page.getByTestId("recovery-dialog")).toBeVisible();
    await page.getByTestId("recovery-resume").click();
    await expect(page.getByTestId("recovery-dialog")).toBeHidden();
    await expectTimerToDecrease(page.getByTestId("timer-display"));
});

test("recovery dialog can discard the stale session", async ({ page }) => {
    await prepareApp(page, {
        landingDone: true,
        timerState: createRecoverySeed(),
    });
    await openApp(page);

    await expect(page.getByTestId("recovery-dialog")).toBeVisible();
    await page.getByTestId("recovery-discard").click();
    await expect(page.getByTestId("recovery-dialog")).toBeHidden();
    await expect(page.getByTestId("timer-display")).toContainText("25:00");
});
