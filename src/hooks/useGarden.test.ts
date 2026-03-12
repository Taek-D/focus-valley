import { describe, expect, it } from "vitest";
import { getToday, getYesterday } from "@/lib/date-utils";
import { getDisplayStreak, getGrowthStage } from "@/hooks/useGarden";

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
