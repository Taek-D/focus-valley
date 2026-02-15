import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/constants";

type CategoryState = {
    categories: Category[];
    activeCategoryId: string;
    addCategory: (label: string, emoji: string, color: string) => void;
    addCategoryAt: (cat: Category, index: number) => void;
    removeCategory: (id: string) => void;
    reorderCategories: (fromIndex: number, toIndex: number) => void;
    setActiveCategory: (id: string) => void;
};

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set) => ({
            categories: DEFAULT_CATEGORIES,
            activeCategoryId: DEFAULT_CATEGORIES[0].id,
            addCategory: (label, emoji, color) => set((state) => {
                const id = label.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
                return {
                    categories: [...state.categories, { id, label, emoji, color }],
                };
            }),
            addCategoryAt: (cat, index) => set((state) => {
                const next = [...state.categories];
                next.splice(index, 0, cat);
                return { categories: next };
            }),
            removeCategory: (id) => set((state) => {
                if (state.categories.length <= 1) return state;
                const next = state.categories.filter((c) => c.id !== id);
                return {
                    categories: next,
                    activeCategoryId: state.activeCategoryId === id
                        ? next[0].id
                        : state.activeCategoryId,
                };
            }),
            reorderCategories: (fromIndex, toIndex) => set((state) => {
                if (fromIndex === toIndex) return state;
                const next = [...state.categories];
                const [moved] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);
                return { categories: next };
            }),
            setActiveCategory: (id) => set({ activeCategoryId: id }),
        }),
        { name: "focus-valley-categories" }
    )
);

export function useCategories() {
    return useCategoryStore();
}
