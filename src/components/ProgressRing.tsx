import React from "react";

type ProgressRingProps = {
    progress: number;
};

export const ProgressRing: React.FC<ProgressRingProps> = ({ progress }) => {
    const size = 200;
    const strokeWidth = 1.5;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const strokeDashoffset = circumference * (1 - clamped);

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] md:w-[200px] md:h-[200px] pointer-events-none"
            aria-hidden="true"
        >
            {/* Background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--foreground) / 0.06)"
                strokeWidth={1}
            />
            {/* Soft glow layer — visible when there's progress */}
            {clamped > 0 && (
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--aurora-1) / 0.12)"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dashoffset 1s linear", filter: "blur(4px)" }}
                />
            )}
            {/* Progress arc */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--foreground) / 0.2)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
            />
        </svg>
    );
};
