import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = resolve(__dirname, "index.ts");
const outDir = resolve(__dirname, "..", "out");

mkdirSync(outDir, { recursive: true });

const compositions = [
    "Teaser-Landscape",
    "Teaser-Portrait",
    "Teaser-Square",
    "Shorts-Landscape",
    "Shorts-Portrait",
    "Shorts-Square",
    "Full-Landscape",
    "Full-Portrait",
    "Full-Square",
];

console.log(`\nRendering ${compositions.length} videos...\n`);

for (const id of compositions) {
    const outFile = resolve(outDir, `${id}.mp4`);
    console.log(`Rendering ${id}...`);
    try {
        execSync(
            `npx remotion render "${entry}" ${id} "${outFile}"`,
            { stdio: "inherit" },
        );
        console.log(`  Done: ${outFile}\n`);
    } catch (e) {
        console.error(`  FAILED: ${id}\n`);
        process.exit(1);
    }
}

console.log("All renders complete!");
