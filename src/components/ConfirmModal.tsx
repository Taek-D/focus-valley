import React, { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useDialogA11y } from "@/hooks/useDialogA11y";

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
    const dialogRef = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();

    useDialogA11y({
        isOpen,
        onClose: onCancel,
        containerRef: dialogRef,
        initialFocusRef: cancelRef,
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                    onClick={onCancel}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-title"
                    aria-describedby="confirm-message"
                >
                    <motion.div
                        ref={dialogRef}
                        initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.98, opacity: 0, y: 4 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        tabIndex={-1}
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
