import { useMemo, memo } from "react";
import type { CSSProperties } from "react";

type Mote = {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
};

type FireflyStyle = CSSProperties & {
    "--firefly-duration"?: string;
    "--firefly-delay"?: string;
    "--firefly-opacity"?: string;
};

function generateMotes(count: number): Mote[] {
    return Array.from({ length: count }, (_, index) => ({
        id: index,
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
            {motes.map((mote) => (
                <div
                    key={mote.id}
                    className="absolute rounded-full firefly-mote"
                    style={{
                        left: `${mote.x}%`,
                        top: `${mote.y}%`,
                        width: mote.size,
                        height: mote.size,
                        background: `hsl(var(--aurora-1) / ${mote.opacity})`,
                        filter: `blur(${mote.size * 0.6}px)`,
                        "--firefly-duration": `${mote.duration}s`,
                        "--firefly-delay": `${mote.delay}s`,
                        "--firefly-opacity": String(mote.opacity),
                    } as FireflyStyle}
                />
            ))}
        </div>
    );
});
