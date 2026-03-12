import { describe, expect, it } from "vitest";
import { getToday, getYesterday } from "@/lib/date-utils";
import { mergeSyncData, migrateSyncData, type SyncableDataV2 } from "@/lib/sync";

function createSnapshot(overrides?: Partial<SyncableDataV2>): SyncableDataV2 {
    return {
        schemaVersion: 2,
        garden: {
            stage: "SEED",
            type: "DEFAULT",
            history: [],
            totalFocusMinutes: 0,
            focusSessions: [],
            currentStreak: 0,
            bestStreak: 0,
            lastFocusDate: null,
            unlockedPlants: [],
            deepFocusStreak: 0,
            lastFocusTimestamp: 0,
            earnedMilestones: [],
            updatedAt: "2026-03-12T00:00:00.000Z",
        },
        settings: {
            focus: 25,
            shortBreak: 5,
            longBreak: 15,
            dailyGoal: 120,
            autoAdvance: false,
            presetId: "classic",
            updatedAt: "2026-03-12T00:00:00.000Z",
        },
        categories: {
            categories: [{ id: "study", label: "Study", emoji: "📘", color: "#7dd3fc" }],
            activeCategoryId: "study",
            updatedAt: "2026-03-12T00:00:00.000Z",
        },
        todos: {
            todos: [],
            activeTodoId: null,
            updatedAt: "2026-03-12T00:00:00.000Z",
        },
        ...overrides,
    };
}

describe("sync", () => {
    it("migrates legacy cloud payloads into schema version 2", () => {
        const fallbackUpdatedAt = "2026-03-12T09:30:00.000Z";
        const migrated = migrateSyncData(
            {
                garden: {
                    stage: "FLOWER",
                    type: "ROSE",
                    history: [{ type: "ROSE", date: "2026-03-11" }],
                    focusSessions: [{ date: "2026-03-12", minutes: 25, categoryId: "study" }],
                    totalFocusMinutes: 25,
                    unlockedPlants: ["ROSE"],
                },
                settings: {
                    focus: 50,
                    shortBreak: 10,
                },
                categories: {
                    categories: [{ id: "study", label: "Study", emoji: "📘", color: "#7dd3fc" }],
                    activeCategoryId: "study",
                },
                todos: {
                    todos: [{ id: "todo-1", text: "Write tests", completed: false, createdAt: fallbackUpdatedAt }],
                    activeTodoId: "todo-1",
                },
            },
            fallbackUpdatedAt,
        );

        expect(migrated.schemaVersion).toBe(2);
        expect(migrated.garden.updatedAt).toBe(fallbackUpdatedAt);
        expect(migrated.garden.stage).toBe("FLOWER");
        expect(migrated.garden.focusSessions).toHaveLength(1);
        expect(migrated.garden.focusSessions[0]?.id).toMatch(/^legacy:/);
        expect(migrated.settings.focus).toBe(50);
        expect(migrated.todos.activeTodoId).toBe("todo-1");
    });

    it("merges local and cloud data without dropping sessions, history, or unlocks", () => {
        const today = getToday();
        const yesterday = getYesterday();

        const local = createSnapshot({
            garden: {
                stage: "FLOWER",
                type: "ROSE",
                history: [{ type: "ROSE", date: yesterday }],
                totalFocusMinutes: 25,
                focusSessions: [
                    { id: "local-1", date: yesterday, minutes: 25, categoryId: "study" },
                    { id: "shared", date: today, minutes: 50, categoryId: "deep" },
                ],
                currentStreak: 2,
                bestStreak: 2,
                lastFocusDate: today,
                unlockedPlants: ["ROSE"],
                deepFocusStreak: 2,
                lastFocusTimestamp: Date.UTC(2026, 2, 12, 8, 0, 0),
                earnedMilestones: ["firstHarvest"],
                updatedAt: "2026-03-12T08:00:00.000Z",
            },
            settings: {
                focus: 25,
                shortBreak: 5,
                longBreak: 15,
                dailyGoal: 120,
                autoAdvance: false,
                presetId: "classic",
                updatedAt: "2026-03-12T08:00:00.000Z",
            },
            categories: {
                categories: [{ id: "study", label: "Study", emoji: "📘", color: "#7dd3fc" }],
                activeCategoryId: "study",
                updatedAt: "2026-03-12T09:00:00.000Z",
            },
            todos: {
                todos: [{ id: "todo-local", text: "Local task", completed: false, createdAt: "2026-03-12T08:00:00.000Z" }],
                activeTodoId: "todo-local",
                updatedAt: "2026-03-12T08:00:00.000Z",
            },
        });

        const cloud = createSnapshot({
            garden: {
                stage: "TREE",
                type: "ORCHID",
                history: [
                    { type: "ROSE", date: yesterday },
                    { type: "ORCHID", date: today },
                ],
                totalFocusMinutes: 85,
                focusSessions: [
                    { id: "shared", date: today, minutes: 50, categoryId: "deep" },
                    { id: "cloud-1", date: today, minutes: 35, categoryId: "study" },
                ],
                currentStreak: 4,
                bestStreak: 4,
                lastFocusDate: today,
                unlockedPlants: ["ORCHID"],
                deepFocusStreak: 4,
                lastFocusTimestamp: Date.UTC(2026, 2, 12, 9, 0, 0),
                earnedMilestones: ["weekWarrior"],
                updatedAt: "2026-03-12T10:00:00.000Z",
            },
            settings: {
                focus: 50,
                shortBreak: 10,
                longBreak: 20,
                dailyGoal: 180,
                autoAdvance: true,
                presetId: "deep",
                updatedAt: "2026-03-12T10:00:00.000Z",
            },
            categories: {
                categories: [
                    { id: "study", label: "Study", emoji: "📘", color: "#7dd3fc" },
                    { id: "deep", label: "Deep Work", emoji: "🧠", color: "#f9a8d4" },
                ],
                activeCategoryId: "deep",
                updatedAt: "2026-03-12T07:00:00.000Z",
            },
            todos: {
                todos: [{ id: "todo-cloud", text: "Cloud task", completed: false, createdAt: "2026-03-12T09:30:00.000Z" }],
                activeTodoId: "todo-cloud",
                updatedAt: "2026-03-12T11:00:00.000Z",
            },
        });

        const merged = mergeSyncData(local, cloud);

        expect(merged.garden.focusSessions.map((session) => session.id).sort()).toEqual(["cloud-1", "local-1", "shared"]);
        expect(merged.garden.history).toHaveLength(2);
        expect(merged.garden.totalFocusMinutes).toBe(110);
        expect(merged.garden.unlockedPlants.sort()).toEqual(["ORCHID", "ROSE"]);
        expect(merged.garden.earnedMilestones.sort()).toEqual(["firstHarvest", "weekWarrior"]);
        expect(merged.garden.lastFocusTimestamp).toBe(Date.UTC(2026, 2, 12, 9, 0, 0));
        expect(merged.garden.currentStreak).toBeGreaterThanOrEqual(2);
        expect(merged.settings.focus).toBe(50);
        expect(merged.categories.activeCategoryId).toBe("study");
        expect(merged.categories.categories).toHaveLength(2);
        expect(merged.todos.activeTodoId).toBe("todo-cloud");
        expect(merged.todos.todos).toHaveLength(2);
    });
});
