import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ParticleType = "growth" | "harvest" | "death";

type Particle = {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    dx: number;
    dy: number;
};

function createParticles(type: ParticleType): Particle[] {
    const count = type === "harvest" ? 6 : type === "growth" ? 4 : 3;
    return Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
        const speed = 20 + Math.random() * 30;

        let color: string;
        if (type === "growth") {
            const greens = ["hsl(140 50% 55%)", "hsl(120 40% 60%)", "hsl(160 45% 50%)", "hsl(100 35% 55%)"];
            color = greens[i % greens.length];
        } else if (type === "harvest") {
            const golds = ["hsl(45 80% 55%)", "hsl(35 75% 50%)", "hsl(50 85% 60%)", "hsl(40 70% 45%)", "hsl(55 80% 55%)", "hsl(30 75% 50%)"];
            color = golds[i % golds.length];
        } else {
            const browns = ["hsl(25 40% 40%)", "hsl(20 35% 35%)", "hsl(30 30% 45%)"];
            color = browns[i % browns.length];
        }

        return {
            id: i,
            x: (Math.random() - 0.5) * 40,
            y: 0,
            color,
            size: 3 + Math.random() * 2,
            dx: Math.cos(angle) * speed,
            dy: type === "death" ? Math.abs(Math.sin(angle)) * speed : -Math.abs(Math.sin(angle)) * speed,
        };
    });
}

type PlantParticlesProps = {
    trigger: number; // increment to trigger
    type: ParticleType;
};

export const PlantParticles: React.FC<PlantParticlesProps> = ({ trigger, type }) => {
    const particles = useMemo(() => (trigger > 0 ? createParticles(type) : []), [trigger, type]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={`${trigger}-${p.id}`}
                        initial={{
                            x: p.x,
                            y: p.y,
                            opacity: 1,
                            scale: 1,
                        }}
                        animate={{
                            x: p.x + p.dx,
                            y: p.y + p.dy,
                            opacity: 0,
                            scale: 0.3,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute left-1/2 top-1/2"
                        style={{
                            width: p.size,
                            height: p.size,
                            borderRadius: "50%",
                            backgroundColor: p.color,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
