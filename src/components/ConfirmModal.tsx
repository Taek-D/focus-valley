import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, title, message, confirmLabel = "YES", cancelLabel = "NO", onConfirm, onCancel,
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        cancelRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={onCancel}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-message"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 5 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] p-6 max-w-sm w-full mx-4 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-destructive" />
                            <h3 id="confirm-title" className="font-pixel text-[11px] tracking-wider text-destructive">{title}</h3>
                        </div>
                        <p id="confirm-message" className="font-retro text-lg text-muted-foreground leading-snug">{message}</p>
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                ref={cancelRef}
                                onClick={onCancel}
                                className="px-6 py-2.5 font-pixel text-[10px] tracking-wider text-foreground border-2 border-border hover:bg-muted shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none transition-all"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-6 py-2.5 font-pixel text-[10px] tracking-wider bg-destructive text-destructive-foreground border-2 border-destructive shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none transition-all"
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
