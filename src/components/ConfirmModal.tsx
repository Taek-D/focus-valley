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
    isOpen, title, message, confirmLabel = "Yes", cancelLabel = "No", onConfirm, onCancel,
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                    onClick={onCancel}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-message"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 4 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="glass-strong rounded-2xl shadow-cozy-lg p-6 max-w-sm w-full mx-4 space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={16} className="text-destructive" />
                            <h3 id="confirm-title" className="font-display text-sm font-medium text-foreground">{title}</h3>
                        </div>
                        <p id="confirm-message" className="font-body text-xs text-muted-foreground leading-relaxed">{message}</p>
                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                ref={cancelRef}
                                onClick={onCancel}
                                className="px-5 py-2 font-body text-xs font-medium text-foreground rounded-xl border border-foreground/10 hover:border-foreground/20 transition-all"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-5 py-2 font-body text-xs font-medium bg-destructive text-destructive-foreground rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
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
