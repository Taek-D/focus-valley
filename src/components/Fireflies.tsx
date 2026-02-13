import { useMemo, memo } from "react";
import { motion } from "framer-motion";

type Mote = {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
};

function generateMotes(count: number): Mote[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        size: 3 + Math.random() * 5,
        duration: 12 + Math.random() * 18,
        delay: Math.random() * 8,
        opacity: 0.08 + Math.random() * 0.12,
    }));
}

export const Fireflies = memo(function Fireflies() {
    const motes = useMemo(() => generateMotes(8), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden" aria-hidden="true">
            {motes.map((m) => (
                <motion.div
                    key={m.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${m.x}%`,
                        top: `${m.y}%`,
                        width: m.size,
                        height: m.size,
                        background: `hsl(var(--aurora-1) / ${m.opacity})`,
                        filter: `blur(${m.size * 0.6}px)`,
                    }}
                    animate={{
                        x: [0, 30, -20, 10, 0],
                        y: [0, -25, 15, -10, 0],
                        opacity: [m.opacity, m.opacity * 1.8, m.opacity * 0.5, m.opacity * 1.4, m.opacity],
                    }}
                    transition={{
                        duration: m.duration,
                        delay: m.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
});
