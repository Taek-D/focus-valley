import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { trackCategoryAdded, trackCategoryRemoved } from "@/lib/analytics";
import { useTranslation, type TranslationKey } from "@/lib/i18n";

const PRESET_IDS = new Set(["study", "code", "read", "work", "design", "exercise"]);

const PRESET_COLORS = [
    "220 70% 55%",
    "160 70% 45%",
    "35 70% 55%",
    "270 60% 55%",
    "330 70% 55%",
    "140 65% 45%",
    "0 65% 55%",
    "200 70% 50%",
];

const PRESET_EMOJIS = ["\u{1F3AF}", "\u{1F4DD}", "\u{1F3B5}", "\u{1F52C}", "\u{1F4F7}", "\u{1F9D8}", "\u{1F3B2}", "\u{2615}"];

// Minimum drag distance (px) before initiating reorder (mouse only)
const DRAG_THRESHOLD = 8;
// Long-press duration (ms) before initiating reorder (touch only)
const LONG_PRESS_MS = 300;
// Movement tolerance during long-press (px) — cancel if finger moves more
const LONG_PRESS_MOVE_TOLERANCE = 5;

export const CategoryChips: React.FC = React.memo(() => {
    const { categories, activeCategoryId, setActiveCategory, addCategory, addCategoryAt, removeCategory, reorderCategories } = useCategories();
    const { t } = useTranslation();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newEmoji, setNewEmoji] = useState(PRESET_EMOJIS[0]);
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

    // Undo state for category removal
    const [undoInfo, setUndoInfo] = useState<{ cat: { id: string; label: string; emoji: string; color: string }; index: number } | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleRemove = useCallback((catId: string) => {
        const index = categories.findIndex((c) => c.id === catId);
        const cat = categories[index];
        if (!cat) return;
        trackCategoryRemoved(cat.label);
        removeCategory(catId);
        // Clear previous undo timer
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoInfo({ cat, index });
        undoTimerRef.current = setTimeout(() => setUndoInfo(null), 4000);
    }, [categories, removeCategory]);

    const handleUndo = useCallback(() => {
        if (!undoInfo) return;
        addCategoryAt(undoInfo.cat, undoInfo.index);
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoInfo(null);
    }, [undoInfo, addCategoryAt]);

    // Drag state — all refs to avoid stale closures
    const [, forceRender] = useState(0);
    const dragIndexRef = useRef<number | null>(null);
    const overIndexRef = useRef<number | null>(null);
    const isDragging = useRef(false);
    const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleAdd = () => {
        if (!newLabel.trim()) return;
        addCategory(newLabel.trim(), newEmoji, newColor);
        trackCategoryAdded(newLabel.trim());
        setNewLabel("");
        setNewEmoji(PRESET_EMOJIS[0]);
        setNewColor(PRESET_COLORS[0]);
        setShowAddModal(false);
    };

    const handlePointerDown = useCallback((e: React.PointerEvent, index: number) => {
        if (e.button !== 0) return;

        const el = e.currentTarget as HTMLElement;
        const pointerId = e.pointerId;
        const startX = e.clientX;
        const startY = e.clientY;
        const isTouch = e.pointerType === "touch";
        isDragging.current = false;

        const startDrag = () => {
            isDragging.current = true;
            dragIndexRef.current = index;
            el.setPointerCapture(pointerId);
            forceRender((n) => n + 1);
            if (isTouch && navigator.vibrate) navigator.vibrate(30);
        };

        // Touch: long-press to enter drag mode; Mouse: immediate threshold drag
        if (isTouch) {
            longPressTimerRef.current = setTimeout(() => {
                longPressTimerRef.current = null;
                startDrag();
            }, LONG_PRESS_MS);
        }

        const handleMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            if (!isDragging.current) {
                if (isTouch) {
                    // Touch moved before long-press fired → user is scrolling, cancel
                    if (Math.abs(dx) + Math.abs(dy) > LONG_PRESS_MOVE_TOLERANCE && longPressTimerRef.current) {
                        clearTimeout(longPressTimerRef.current);
                        longPressTimerRef.current = null;
                        handleUp();
                        return;
                    }
                } else {
                    // Mouse: start drag after threshold
                    if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
                        startDrag();
                    }
                }
            }

            if (isDragging.current) {
                moveEvent.preventDefault();
                for (let i = 0; i < chipRefs.current.length; i++) {
                    const chip = chipRefs.current[i];
                    if (!chip) continue;
                    const rect = chip.getBoundingClientRect();
                    if (
                        moveEvent.clientX >= rect.left &&
                        moveEvent.clientX <= rect.right &&
                        moveEvent.clientY >= rect.top &&
                        moveEvent.clientY <= rect.bottom
                    ) {
                        const newOver = i !== index ? i : null;
                        if (overIndexRef.current !== newOver) {
                            overIndexRef.current = newOver;
                            forceRender((n) => n + 1);
                        }
                        break;
                    }
                }
            }
        };

        const handleUp = () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            if (isDragging.current && dragIndexRef.current !== null && overIndexRef.current !== null) {
                reorderCategories(dragIndexRef.current, overIndexRef.current);
            }
            isDragging.current = false;
            dragIndexRef.current = null;
            overIndexRef.current = null;
            forceRender((n) => n + 1);
            el.removeEventListener("pointermove", handleMove);
            el.removeEventListener("pointerup", handleUp);
            el.removeEventListener("pointercancel", handleUp);
        };

        el.addEventListener("pointermove", handleMove);
        el.addEventListener("pointerup", handleUp);
        el.addEventListener("pointercancel", handleUp);
    }, [reorderCategories]);

    // Compute display order during drag
    const dragIndex = dragIndexRef.current;
    const overIndex = overIndexRef.current;
    const displayCategories = (() => {
        if (dragIndex === null || overIndex === null) return categories;
        const items = [...categories];
        const [moved] = items.splice(dragIndex, 1);
        items.splice(overIndex, 0, moved);
        return items;
    })();

    return (
        <>
            <div className="relative w-full">
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 sm:hidden" />
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 sm:hidden" />
                <div className="overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1.5 w-max mx-auto px-4 sm:px-1">
                    {displayCategories.map((cat, i) => {
                        const isActive = cat.id === activeCategoryId;
                        const isBeingDragged = dragIndex !== null && categories[dragIndex]?.id === cat.id;
                        const showDropIndicator = overIndex !== null && i === overIndex && dragIndex !== null && dragIndex !== overIndex;
                        return (
                            <div
                                key={cat.id}
                                ref={(el) => { chipRefs.current[i] = el; }}
                                className={`relative group flex items-center ${isBeingDragged ? "opacity-50" : ""}`}
                            >
                                {showDropIndicator && dragIndex !== null && dragIndex > i && (
                                    <div className="absolute -left-1 top-1 bottom-1 w-0.5 rounded-full bg-foreground/30" />
                                )}
                                <button
                                    onPointerDown={(e) => handlePointerDown(e, categories.findIndex((c) => c.id === cat.id))}
                                    onClick={() => {
                                        if (!isDragging.current) setActiveCategory(cat.id);
                                    }}
                                    className={`
                                        relative flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                        font-body text-[11px] tracking-wide whitespace-nowrap
                                        transition-all duration-200 select-none
                                        ${isActive
                                            ? "bg-foreground/8 text-foreground font-medium"
                                            : "text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-foreground/3"
                                        }
                                    `}
                                >
                                    <span className="text-sm leading-none">{cat.emoji}</span>
                                    <span>{PRESET_IDS.has(cat.id) ? t(`category.${cat.id}` as TranslationKey) : cat.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="category-indicator"
                                            className="absolute inset-0 rounded-full border border-foreground/8"
                                            style={{ boxShadow: `0 0 8px hsl(${cat.color} / 0.12)` }}
                                            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                                        />
                                    )}
                                </button>
                                {!isActive && categories.length > 1 && (
                                    <button
                                        onClick={() => handleRemove(cat.id)}
                                        className="opacity-0 group-hover:opacity-100 -ml-1 p-0.5 rounded-full hover:bg-foreground/10 transition-opacity"
                                        aria-label={`${t("category.removeLabel")} ${PRESET_IDS.has(cat.id) ? t(`category.${cat.id}` as TranslationKey) : cat.label}`}
                                    >
                                        <X size={8} />
                                    </button>
                                )}
                                {showDropIndicator && dragIndex !== null && dragIndex < i && (
                                    <div className="absolute -right-1 top-1 bottom-1 w-0.5 rounded-full bg-foreground/30" />
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center w-7 h-7 rounded-full text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-foreground/5 transition-all"
                        aria-label={t("category.addCustom")}
                    >
                        <Plus size={13} />
                    </button>
                </div>
                </div>
            </div>

            {/* Undo toast — portaled to body */}
            {createPortal(
                <AnimatePresence>
                    {undoInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-foreground/[0.06] shadow-cozy-lg"
                        >
                            <span className="font-body text-xs text-muted-foreground">
                                {undoInfo.cat.emoji} {PRESET_IDS.has(undoInfo.cat.id) ? t(`category.${undoInfo.cat.id}` as TranslationKey) : undoInfo.cat.label} {t("category.undoRemove")}
                            </span>
                            <button
                                onClick={handleUndo}
                                className="font-body text-[11px] font-medium text-foreground hover:text-foreground/70 transition-colors"
                            >
                                {t("category.undo")}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Add Category Modal — portaled to body to escape stacking context */}
            {createPortal(
                <AnimatePresence>
                    {showAddModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-background/60 z-50 will-change-[opacity]"
                                onClick={() => setShowAddModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(320px,90vw)] bg-card border border-foreground/[0.06] rounded-3xl p-5 shadow-cozy-lg will-change-transform"
                            >
                                <h3 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-4">
                                    {t("category.newCategory")}
                                </h3>

                                <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder={t("category.categoryName")}
                                    maxLength={20}
                                    className="w-full bg-foreground/5 rounded-xl px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground/30 outline-none focus:ring-1 focus:ring-foreground/10 mb-3"
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                                />

                                <div className="mb-3">
                                    <div className="font-body text-[9px] text-muted-foreground/40 mb-1.5">{t("category.emoji")}</div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {PRESET_EMOJIS.map((e) => (
                                            <button
                                                key={e}
                                                onClick={() => setNewEmoji(e)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                                                    newEmoji === e ? "bg-foreground/10 scale-110" : "hover:bg-foreground/5"
                                                }`}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="font-body text-[9px] text-muted-foreground/40 mb-1.5">{t("category.color")}</div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {PRESET_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setNewColor(c)}
                                                className={`w-7 h-7 rounded-full transition-all ${
                                                    newColor === c ? "ring-2 ring-foreground/20 scale-110" : "hover:scale-105"
                                                }`}
                                                style={{ backgroundColor: `hsl(${c})` }}
                                                aria-label={`Color ${c}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-2 rounded-xl font-body text-[11px] text-muted-foreground/50 hover:bg-foreground/5 transition-all"
                                    >
                                        {t("category.cancel")}
                                    </button>
                                    <button
                                        onClick={handleAdd}
                                        disabled={!newLabel.trim()}
                                        className="flex-1 py-2 rounded-xl font-body text-[11px] font-medium bg-foreground/8 text-foreground hover:bg-foreground/12 transition-all disabled:opacity-30"
                                    >
                                        {t("category.add")}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
});

CategoryChips.displayName = "CategoryChips";
