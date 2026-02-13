import { memo } from "react";

type ProgressRingProps = {
    progress: number;
};

export const ProgressRing = memo(function ProgressRing({ progress }: ProgressRingProps) {
    const size = 220;
    const strokeWidth = 1.5;
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const strokeDashoffset = circumference * (1 - clamped);

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[220px] md:h-[220px] pointer-events-none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="aurora-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--aurora-1))" />
                    <stop offset="35%" stopColor="hsl(var(--aurora-2))" />
                    <stop offset="65%" stopColor="hsl(var(--aurora-3))" />
                    <stop offset="100%" stopColor="hsl(var(--aurora-4))" />
                </linearGradient>
            </defs>

            {/* Background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--foreground) / 0.04)"
                strokeWidth={1}
            />

            {/* Outer glow — aurora gradient, blurred */}
            {clamped > 0 && (
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#aurora-ring)"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset 1s linear", filter: "blur(6px)", opacity: 0.25 }}
                />
            )}

            {/* Progress arc — aurora gradient */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={clamped > 0 ? "url(#aurora-ring)" : "hsl(var(--foreground) / 0.06)"}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
            />

            {/* End dot — visible when progress > 5% */}
            {clamped > 0.05 && (
                <circle
                    cx={size / 2 + radius * Math.cos(2 * Math.PI * clamped - Math.PI / 2)}
                    cy={size / 2 + radius * Math.sin(2 * Math.PI * clamped - Math.PI / 2)}
                    r={3}
                    fill="hsl(var(--aurora-3))"
                    style={{ transition: "cx 1s linear, cy 1s linear", opacity: 0.6 }}
                />
            )}
        </svg>
    );
});
