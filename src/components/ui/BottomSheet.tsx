import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { GESTURE } from "@/lib/constants";

type BottomSheetProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    headerActions?: ReactNode;
    children: ReactNode;
};

export const BottomSheet = ({ isOpen, onClose, title, headerActions, children }: BottomSheetProps) => {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        closeRef.current?.focus();
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > GESTURE.DRAG_DISMISS_OFFSET || info.velocity.y > GESTURE.DRAG_DISMISS_VELOCITY) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="fixed bottom-0 left-0 right-0 max-h-[85vh] glass-strong rounded-t-3xl shadow-cozy-lg z-50 flex flex-col"
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                            <div className="w-8 h-0.5 rounded-full bg-foreground/10" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pb-3 pt-1">
                            <h2 className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground">
                                {title}
                            </h2>
                            <div className="flex items-center gap-1">
                                {headerActions}
                                <button
                                    ref={closeRef}
                                    onClick={onClose}
                                    aria-label={`Close ${title.toLowerCase()}`}
                                    className="p-1.5 rounded-xl text-muted-foreground/40 hover:text-foreground transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
