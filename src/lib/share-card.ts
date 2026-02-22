export type ShareCardTheme = "aurora" | "sunset" | "forest";

type ThemeConfig = {
    gradient: { stop: number; color: string }[];
    blobs: { x: number; y: number; r: number; color: string }[];
};

export const SHARE_THEMES: Record<ShareCardTheme, ThemeConfig> = {
    aurora: {
        gradient: [
            { stop: 0, color: "hsl(230 15% 10%)" },
            { stop: 0.4, color: "hsl(260 20% 14%)" },
            { stop: 0.7, color: "hsl(200 18% 12%)" },
            { stop: 1, color: "hsl(230 15% 8%)" },
        ],
        blobs: [
            { x: 130, y: 180, r: 120, color: "hsla(330, 70%, 60%, 0.15)" },
            { x: 290, y: 220, r: 100, color: "hsla(270, 60%, 62%, 0.12)" },
            { x: 200, y: 280, r: 140, color: "hsla(185, 55%, 55%, 0.10)" },
            { x: 320, y: 160, r: 80, color: "hsla(140, 45%, 58%, 0.08)" },
        ],
    },
    sunset: {
        gradient: [
            { stop: 0, color: "hsl(20 20% 12%)" },
            { stop: 0.4, color: "hsl(350 25% 16%)" },
            { stop: 0.7, color: "hsl(30 22% 14%)" },
            { stop: 1, color: "hsl(15 18% 8%)" },
        ],
        blobs: [
            { x: 140, y: 190, r: 130, color: "hsla(25, 80%, 55%, 0.16)" },
            { x: 280, y: 210, r: 110, color: "hsla(345, 65%, 58%, 0.13)" },
            { x: 210, y: 290, r: 120, color: "hsla(40, 70%, 50%, 0.10)" },
            { x: 310, y: 150, r: 90, color: "hsla(10, 60%, 55%, 0.09)" },
        ],
    },
    forest: {
        gradient: [
            { stop: 0, color: "hsl(160 18% 10%)" },
            { stop: 0.4, color: "hsl(140 22% 14%)" },
            { stop: 0.7, color: "hsl(170 20% 12%)" },
            { stop: 1, color: "hsl(150 15% 7%)" },
        ],
        blobs: [
            { x: 120, y: 200, r: 130, color: "hsla(150, 60%, 50%, 0.14)" },
            { x: 300, y: 230, r: 100, color: "hsla(170, 55%, 45%, 0.12)" },
            { x: 200, y: 270, r: 140, color: "hsla(130, 50%, 55%, 0.10)" },
            { x: 330, y: 170, r: 85, color: "hsla(90, 45%, 50%, 0.08)" },
        ],
    },
};

type ShareCardData = {
    date: string;
    totalMinutes: number;
    streak: number;
    categoryBreakdown: { label: string; emoji: string; minutes: number; color: string }[];
    plantCount: number;
};

function parseHSL(hsl: string): string {
    return `hsl(${hsl})`;
}

function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export function generateShareCard(data: ShareCardData, theme: ShareCardTheme = "aurora"): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const W = 420;
        const H = 560;
        const canvas = document.createElement("canvas");
        canvas.width = W * 2; // 2x for retina
        canvas.height = H * 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
        }

        ctx.scale(2, 2);

        const themeConfig = SHARE_THEMES[theme];

        // Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        for (const g of themeConfig.gradient) {
            bgGrad.addColorStop(g.stop, g.color);
        }
        ctx.fillStyle = bgGrad;
        drawRoundedRect(ctx, 0, 0, W, H, 24);
        ctx.fill();

        // Glow blobs
        for (const blob of themeConfig.blobs) {
            const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
            grad.addColorStop(0, blob.color);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.fillRect(blob.x - blob.r, blob.y - blob.r, blob.r * 2, blob.r * 2);
        }

        // Header — Logo + date
        ctx.fillStyle = "hsla(0, 0%, 100%, 0.4)";
        ctx.font = "500 10px 'Sora', sans-serif";
        ctx.letterSpacing = "2px";
        ctx.textAlign = "center";
        ctx.fillText("FOCUS VALLEY", W / 2, 48);

        ctx.fillStyle = "hsla(0, 0%, 100%, 0.25)";
        ctx.font = "300 11px 'Sora', sans-serif";
        ctx.letterSpacing = "0.5px";
        ctx.fillText(data.date, W / 2, 68);

        // Divider line
        ctx.strokeStyle = "hsla(0, 0%, 100%, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 88);
        ctx.lineTo(W - 60, 88);
        ctx.stroke();

        // Total focus time (big)
        const hours = Math.floor(data.totalMinutes / 60);
        const mins = data.totalMinutes % 60;
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        ctx.fillStyle = "hsla(0, 0%, 100%, 0.9)";
        ctx.font = "300 48px 'Sora', sans-serif";
        ctx.letterSpacing = "-1px";
        ctx.textAlign = "center";
        ctx.fillText(timeStr, W / 2, 155);

        ctx.fillStyle = "hsla(0, 0%, 100%, 0.3)";
        ctx.font = "400 11px 'Sora', sans-serif";
        ctx.letterSpacing = "1px";
        ctx.fillText("FOCUSED TODAY", W / 2, 178);

        // Streak + Plants row
        const statsY = 220;
        const statsWidth = 120;

        // Streak
        ctx.fillStyle = "hsla(0, 0%, 100%, 0.85)";
        ctx.font = "400 22px 'Sora', sans-serif";
        ctx.letterSpacing = "0px";
        ctx.textAlign = "center";
        ctx.fillText(`\u{1F525} ${data.streak}`, W / 2 - statsWidth / 2, statsY);

        ctx.fillStyle = "hsla(0, 0%, 100%, 0.3)";
        ctx.font = "400 9px 'Sora', sans-serif";
        ctx.letterSpacing = "1px";
        ctx.fillText("STREAK", W / 2 - statsWidth / 2, statsY + 18);

        // Plants
        ctx.fillStyle = "hsla(0, 0%, 100%, 0.85)";
        ctx.font = "400 22px 'Sora', sans-serif";
        ctx.letterSpacing = "0px";
        ctx.fillText(`\u{1F331} ${data.plantCount}`, W / 2 + statsWidth / 2, statsY);

        ctx.fillStyle = "hsla(0, 0%, 100%, 0.3)";
        ctx.font = "400 9px 'Sora', sans-serif";
        ctx.letterSpacing = "1px";
        ctx.fillText("GROWN", W / 2 + statsWidth / 2, statsY + 18);

        // Category breakdown bar
        if (data.categoryBreakdown.length > 0) {
            const barY = 275;
            const barH = 8;
            const barX = 40;
            const barW = W - 80;
            const totalMins = data.categoryBreakdown.reduce((s, c) => s + c.minutes, 0);

            // Bar background
            drawRoundedRect(ctx, barX, barY, barW, barH, 4);
            ctx.fillStyle = "hsla(0, 0%, 100%, 0.05)";
            ctx.fill();

            // Bar segments
            ctx.save();
            drawRoundedRect(ctx, barX, barY, barW, barH, 4);
            ctx.clip();

            let offsetX = barX;
            for (const cat of data.categoryBreakdown) {
                const segW = (cat.minutes / totalMins) * barW;
                ctx.fillStyle = parseHSL(cat.color);
                ctx.fillRect(offsetX, barY, segW, barH);
                offsetX += segW;
            }
            ctx.restore();

            // Category labels
            const labelsY = 305;
            const maxLabels = Math.min(data.categoryBreakdown.length, 4);
            const labelSpacing = barW / maxLabels;

            for (let i = 0; i < maxLabels; i++) {
                const cat = data.categoryBreakdown[i];
                const x = barX + labelSpacing * i + labelSpacing / 2;
                const pct = totalMins > 0 ? Math.round((cat.minutes / totalMins) * 100) : 0;

                ctx.fillStyle = "hsla(0, 0%, 100%, 0.7)";
                ctx.font = "400 12px 'Sora', sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(cat.emoji, x, labelsY);

                ctx.fillStyle = "hsla(0, 0%, 100%, 0.5)";
                ctx.font = "400 10px 'Sora', sans-serif";
                ctx.fillText(cat.label, x, labelsY + 16);

                ctx.fillStyle = "hsla(0, 0%, 100%, 0.3)";
                ctx.font = "300 9px 'Sora', sans-serif";
                ctx.fillText(`${pct}%`, x, labelsY + 30);
            }
        }

        // Dot grid pattern (subtle)
        ctx.fillStyle = "hsla(0, 0%, 100%, 0.03)";
        for (let x = 20; x < W; x += 22) {
            for (let y = 380; y < H - 40; y += 22) {
                ctx.beginPath();
                ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Watermark
        ctx.fillStyle = "hsla(0, 0%, 100%, 0.15)";
        ctx.font = "400 9px 'Sora', sans-serif";
        ctx.letterSpacing = "1px";
        ctx.textAlign = "center";
        ctx.fillText("Made with Focus Valley", W / 2, H - 28);

        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to generate image"));
        }, "image/png");
    });
}

export async function shareOrDownload(blob: Blob, filename: string) {
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
            title: "Focus Valley",
            text: "My focus record today!",
            files: [file],
        });
    } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
}
