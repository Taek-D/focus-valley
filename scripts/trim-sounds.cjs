/**
 * Trims ambient sound files to ~20 seconds.
 * - MP3: trims at frame boundaries.
 * - WAV: trims PCM payload and updates RIFF sizes.
 *
 * Usage: node scripts/trim-sounds.cjs
 */
const fs = require("fs");
const path = require("path");

const SOUNDS_DIR = path.join(__dirname, "..", "public", "sounds");
const TARGET_SECONDS = 20;

// MP3 frame sync: starts with 0xFF 0xFB/0xFA/0xF3/0xF2 (11 sync bits)
function isFrameSync(buf, offset) {
    if (offset + 1 >= buf.length) return false;
    return buf[offset] === 0xff && (buf[offset + 1] & 0xe0) === 0xe0;
}

// Parse MP3 frame header to get frame size and bitrate
function parseFrameHeader(buf, offset) {
    if (offset + 4 > buf.length) return null;
    if (!isFrameSync(buf, offset)) return null;

    const b1 = buf[offset + 1];
    const b2 = buf[offset + 2];

    const versionBits = (b1 >> 3) & 0x03;
    const layerBits = (b1 >> 1) & 0x03;
    const bitrateBits = (b2 >> 4) & 0x0f;
    const sampleRateBits = (b2 >> 2) & 0x03;
    const paddingBit = (b2 >> 1) & 0x01;

    // Bitrate table for MPEG1 Layer 3
    const bitrateTable = {
        // MPEG1 Layer 3
        "3-1": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
        // MPEG2 Layer 3
        "2-1": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
        // MPEG2.5 Layer 3
        "0-1": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
    };

    const sampleRateTable = {
        3: [44100, 48000, 32000], // MPEG1
        2: [22050, 24000, 16000], // MPEG2
        0: [11025, 12000, 8000],  // MPEG2.5
    };

    const key = `${versionBits}-${layerBits}`;
    const table = bitrateTable[key];
    if (!table || bitrateBits === 0 || bitrateBits === 15) return null;
    if (!sampleRateTable[versionBits] || sampleRateBits === 3) return null;

    const bitrate = table[bitrateBits] * 1000;
    const sampleRate = sampleRateTable[versionBits][sampleRateBits];
    const samplesPerFrame = versionBits === 3 ? 1152 : 576;

    if (bitrate === 0 || sampleRate === 0) return null;

    const frameSize = Math.floor((samplesPerFrame * bitrate) / (8 * sampleRate) + paddingBit);
    const frameDuration = samplesPerFrame / sampleRate;

    return { frameSize, frameDuration };
}

function trimMp3File(filename) {
    const filePath = path.join(SOUNDS_DIR, filename);
    const buf = fs.readFileSync(filePath);
    const originalSize = buf.length;

    // Skip ID3v2 tag if present
    let offset = 0;
    if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
        const tagSize =
            ((buf[6] & 0x7f) << 21) |
            ((buf[7] & 0x7f) << 14) |
            ((buf[8] & 0x7f) << 7) |
            (buf[9] & 0x7f);
        offset = 10 + tagSize;
    }

    // Find frames and accumulate duration
    let totalDuration = 0;
    let endOffset = offset;

    while (offset < buf.length && totalDuration < TARGET_SECONDS) {
        while (offset < buf.length - 1 && !isFrameSync(buf, offset)) {
            offset++;
        }
        if (offset >= buf.length - 1) break;

        const frame = parseFrameHeader(buf, offset);
        if (!frame || frame.frameSize <= 0) {
            offset++;
            continue;
        }

        totalDuration += frame.frameDuration;
        offset += frame.frameSize;
        endOffset = offset;
    }

    const trimmed = buf.subarray(0, endOffset);
    fs.writeFileSync(filePath, trimmed);

    const newSize = trimmed.length;
    console.log(
        `  ${filename}: ${(originalSize / 1024).toFixed(0)}KB -> ${(newSize / 1024).toFixed(0)}KB (${totalDuration.toFixed(1)}s)`
    );
}

function trimWavFile(filename) {
    const filePath = path.join(SOUNDS_DIR, filename);
    const buf = fs.readFileSync(filePath);
    const originalSize = buf.length;

    const isRiff = buf.length >= 44 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WAVE";
    if (!isRiff) {
        console.log(`  ${filename}: skipped (unsupported WAV format)`);
        return;
    }

    // Assumes canonical PCM layout used by scripts/generate-sounds.cjs.
    const sampleRate = buf.readUInt32LE(24);
    const blockAlign = buf.readUInt16LE(32);
    const dataSize = buf.readUInt32LE(40);
    const maxDataSize = Math.floor(TARGET_SECONDS * sampleRate) * blockAlign;
    const newDataSize = Math.min(dataSize, maxDataSize);
    const endOffset = 44 + newDataSize;

    const trimmed = Buffer.from(buf.subarray(0, endOffset));
    trimmed.writeUInt32LE(trimmed.length - 8, 4);
    trimmed.writeUInt32LE(newDataSize, 40);
    fs.writeFileSync(filePath, trimmed);

    const actualSeconds = newDataSize / (sampleRate * blockAlign);
    console.log(
        `  ${filename}: ${(originalSize / 1024).toFixed(0)}KB -> ${(trimmed.length / 1024).toFixed(0)}KB (${actualSeconds.toFixed(1)}s)`
    );
}

console.log(`Trimming sounds to ~${TARGET_SECONDS}s...\n`);

const files = fs.readdirSync(SOUNDS_DIR).filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"));
for (const file of files) {
    if (file.endsWith(".mp3")) {
        trimMp3File(file);
    } else if (file.endsWith(".wav")) {
        trimWavFile(file);
    }
}

console.log("\nDone!");
