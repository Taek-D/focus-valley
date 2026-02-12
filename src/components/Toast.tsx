import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout } from "lucide-react";

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
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] px-5 py-3 flex items-center gap-3"
                >
                    <Sprout size={16} className="text-primary shrink-0" />
                    <span className="font-retro text-lg text-foreground">{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
