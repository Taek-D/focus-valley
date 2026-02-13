import { memo } from "react";

export const AuroraBlob = memo(function AuroraBlob() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="relative w-[85vw] h-[85vw] max-w-[550px] max-h-[550px]">
                <div
                    className="absolute inset-0 rounded-full animate-aurora-1"
                    style={{
                        background: `radial-gradient(circle at 30% 30%, hsl(var(--aurora-1) / 0.5), transparent 50%)`,
                        filter: "blur(60px)",
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full animate-aurora-2"
                    style={{
                        background: `radial-gradient(circle at 75% 35%, hsl(var(--aurora-2) / 0.45), transparent 50%)`,
                        filter: "blur(65px)",
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full animate-aurora-3"
                    style={{
                        background: `radial-gradient(circle at 50% 75%, hsl(var(--aurora-3) / 0.4), transparent 50%)`,
                        filter: "blur(60px)",
                    }}
                />
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 40% 55%, hsl(var(--aurora-4) / 0.3), transparent 55%)`,
                        filter: "blur(70px)",
                    }}
                />
            </div>
        </div>
    );
});
