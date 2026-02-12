import { useMemo } from "react";

const FIREFLY_COUNT = 18;

function seededRandom(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

export const Fireflies = () => {
    const particles = useMemo(() =>
        Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
            id: i,
            left: `${seededRandom(i * 7 + 1) * 100}%`,
            top: `${seededRandom(i * 13 + 5) * 80}%`,
            dx: `${(seededRandom(i * 3 + 2) - 0.5) * 80}px`,
            dy: `${(seededRandom(i * 11 + 7) - 0.5) * 60}px`,
            duration: `${6 + seededRandom(i * 5 + 3) * 10}s`,
            glowDuration: `${2 + seededRandom(i * 9 + 4) * 4}s`,
            delay: `${seededRandom(i * 17 + 8) * -12}s`,
            brightness: 0.3 + seededRandom(i * 23 + 11) * 0.6,
            size: 2 + seededRandom(i * 19 + 6) * 4,
        })),
        []
    );

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="firefly"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: `${p.delay}, ${p.delay}`,
                        "--dx": p.dx,
                        "--dy": p.dy,
                        "--duration": p.duration,
                        "--glow-duration": p.glowDuration,
                        "--brightness": p.brightness,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};
