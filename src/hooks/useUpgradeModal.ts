import { create } from "zustand";

type UpgradeModalState = {
    isOpen: boolean;
    source: string | null;
    open: (source?: string) => void;
    close: () => void;
};

export const useUpgradeModal = create<UpgradeModalState>((set) => ({
    isOpen: false,
    source: null,
    open: (source?: string) => set({ isOpen: true, source: source ?? null }),
    close: () => set({ isOpen: false, source: null }),
}));
