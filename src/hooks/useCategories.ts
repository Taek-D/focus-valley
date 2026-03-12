import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/constants";
import { createSafeStorage, isRecord, parseIsoTimestamp } from "@/lib/persist";

type CategoryState = {
    categories: Category[];
    activeCategoryId: string;
    updatedAt: string;
    addCategory: (label: string, emoji: string, color: string) => void;
    addCategoryAt: (cat: Category, index: number) => void;
    removeCategory: (id: string) => void;
    reorderCategories: (fromIndex: number, toIndex: number) => void;
    setActiveCategory: (id: string) => void;
};

type PersistedCategoryState = Pick<CategoryState, "categories" | "activeCategoryId" | "updatedAt">;

const STORAGE_VERSION = 1;
const DEFAULT_UPDATED_AT = new Date().toISOString();

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set) => ({
            categories: DEFAULT_CATEGORIES,
            activeCategoryId: DEFAULT_CATEGORIES[0].id,
            updatedAt: DEFAULT_UPDATED_AT,
            addCategory: (label, emoji, color) => set((state) => {
                const id = label.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
                return {
                    categories: [...state.categories, { id, label, emoji, color }],
                    updatedAt: new Date().toISOString(),
                };
            }),
            addCategoryAt: (cat, index) => set((state) => {
                const next = [...state.categories];
                next.splice(index, 0, cat);
                return { categories: next, updatedAt: new Date().toISOString() };
            }),
            removeCategory: (id) => set((state) => {
                if (state.categories.length <= 1) return state;
                const next = state.categories.filter((c) => c.id !== id);
                return {
                    categories: next,
                    activeCategoryId: state.activeCategoryId === id
                        ? next[0].id
                        : state.activeCategoryId,
                    updatedAt: new Date().toISOString(),
                };
            }),
            reorderCategories: (fromIndex, toIndex) => set((state) => {
                if (fromIndex === toIndex) return state;
                const next = [...state.categories];
                const [moved] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);
                return { categories: next, updatedAt: new Date().toISOString() };
            }),
            setActiveCategory: (id) => set({ activeCategoryId: id, updatedAt: new Date().toISOString() }),
        }),
        {
            name: "focus-valley-categories",
            version: STORAGE_VERSION,
            storage: createSafeStorage<PersistedCategoryState>(),
            migrate: (persistedState) => {
                const state = isRecord(persistedState) ? persistedState : {};
                const categories = Array.isArray(state.categories) && state.categories.length > 0
                    ? state.categories.filter((entry): entry is Category => isRecord(entry) && typeof entry.id === "string" && typeof entry.label === "string" && typeof entry.emoji === "string" && typeof entry.color === "string")
                    : DEFAULT_CATEGORIES;
                const activeCategoryId = typeof state.activeCategoryId === "string" && categories.some((entry) => entry.id === state.activeCategoryId)
                    ? state.activeCategoryId
                    : categories[0].id;

                return {
                    categories,
                    activeCategoryId,
                    updatedAt: parseIsoTimestamp(state.updatedAt, DEFAULT_UPDATED_AT),
                };
            },
        }
    )
);

export function useCategories() {
    return useCategoryStore();
}
