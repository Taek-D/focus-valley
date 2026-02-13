import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ConfettiProps = {
    trigger: number;
};

type Piece = {
    id: number;
    x: number;
    dx: number;
    dy: number;
    rotation: number;
    color: string;
    size: number;
    delay: number;
};

const COLORS = [
    "hsl(45 85% 55%)",
    "hsl(35 80% 50%)",
    "hsl(55 80% 60%)",
    "hsl(140 50% 55%)",
    "hsl(200 60% 55%)",
    "hsl(330 60% 60%)",
    "hsl(270 55% 60%)",
    "hsl(20 70% 55%)",
];

function createPieces(): Piece[] {
    return Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        dx: (Math.random() - 0.5) * 120,
        dy: -(80 + Math.random() * 120),
        rotation: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 4 + Math.random() * 4,
        delay: Math.random() * 0.15,
    }));
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger }) => {
    const pieces = useMemo(() => (trigger > 0 ? createPieces() : []), [trigger]);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <AnimatePresence>
                {pieces.map((p) => (
                    <motion.div
                        key={`${trigger}-${p.id}`}
                        initial={{
                            x: p.x,
                            y: 0,
                            opacity: 1,
                            rotate: 0,
                            scale: 1,
                        }}
                        animate={{
                            x: p.x + p.dx,
                            y: p.dy,
                            opacity: [1, 1, 0],
                            rotate: p.rotation,
                            scale: [1, 1.2, 0.6],
                        }}
                        transition={{
                            duration: 1.2,
                            delay: p.delay,
                            ease: "easeOut",
                        }}
                        className="absolute"
                        style={{
                            width: p.size,
                            height: p.size * 0.6,
                            backgroundColor: p.color,
                            borderRadius: 1,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
