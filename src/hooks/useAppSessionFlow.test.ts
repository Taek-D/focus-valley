import { describe, expect, it } from "vitest";
import { getBreathCycle, getGrowthPercent, getIsBreakActive } from "@/hooks/useAppSessionFlow";

describe("useAppSessionFlow helpers", () => {
    it("scales plant breathing cycle with focus progress", () => {
        expect(getBreathCycle(false, 1500, 25)).toBe(4);
        expect(getBreathCycle(true, 1500, 25)).toBe(4);
        expect(getBreathCycle(true, 750, 25)).toBe(6);
        expect(getBreathCycle(true, 0, 25)).toBe(8);
    });

    it("returns growth percentage only for active focus sessions", () => {
        expect(getGrowthPercent(false, "FOCUS", 1200, 25)).toBeUndefined();
        expect(getGrowthPercent(true, "SHORT_BREAK", 1200, 25)).toBeUndefined();
        expect(getGrowthPercent(true, "FOCUS", 750, 25)).toBe(50);
    });

    it("detects whether a break is actively running", () => {
        expect(getIsBreakActive(false, "SHORT_BREAK")).toBe(false);
        expect(getIsBreakActive(true, "FOCUS")).toBe(false);
        expect(getIsBreakActive(true, "SHORT_BREAK")).toBe(true);
        expect(getIsBreakActive(true, "LONG_BREAK")).toBe(true);
    });
});
