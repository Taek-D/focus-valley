import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastProps = {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
};

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 3000 }) => {
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};
