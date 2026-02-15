import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastAction = {
    label: string;
    onClick: () => void;
};

type ToastProps = {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    action?: ToastAction;
};

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000, action }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const id = setTimeout(onClose, duration);
            return () => clearTimeout(id);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.99 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl shadow-cozy px-5 py-3"
                >
                    <span className="font-body text-xs font-medium text-foreground">{message}</span>
                    {action && (
                        <button
                            onClick={() => { action.onClick(); onClose(); }}
                            className="ml-3 font-body text-xs font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
                        >
                            {action.label}
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
