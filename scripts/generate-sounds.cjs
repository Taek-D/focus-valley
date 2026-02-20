/**
 * Generates high-quality ambient sound loops as WAV files.
 * Offline rendering allows multi-pass filtering and long, seamless loops.
 *
 * Usage: node scripts/generate-sounds.cjs
 * Output: public/sounds/{rain,fire,cafe,stream,white}.wav
 */
const fs = require("fs");
const path = require("path");
const SAMPLE_RATE = 44100;
const DURATION = 30; // seconds — long enough to avoid obvious repetition
const CROSSFADE = 1.0; // seconds — smooth loop boundary
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

const OUT_DIR = path.join(__dirname, "..", "public", "sounds");

// ─── Utilities ───────────────────────────────────────────────

function makeBuffer() {
    return new Float32Array(SAMPLE_RATE * DURATION);
}

/** Apply equal-power crossfade at loop boundary */
function crossfadeLoop(buf) {
    const fadeSamples = Math.floor(CROSSFADE * SAMPLE_RATE);
    for (let i = 0; i < fadeSamples; i++) {
        const t = i / fadeSamples;
        // Equal-power: cos/sin curve
        const fadeIn = Math.sin((t * Math.PI) / 2);
        const fadeOut = Math.cos((t * Math.PI) / 2);
        const head = buf[i];
        const tail = buf[buf.length - fadeSamples + i];
        buf[i] = head * fadeIn + tail * fadeOut;
        buf[buf.length - fadeSamples + i] = buf[i]; // mirror for seamless join
    }
}

/** Simple biquad lowpass filter (direct form II) */
function lowpass(buf, freq, Q = 0.707) {
    const w0 = (2 * Math.PI * freq) / SAMPLE_RATE;
    const alpha = Math.sin(w0) / (2 * Q);
    const cosW0 = Math.cos(w0);
    const b0 = (1 - cosW0) / 2;
    const b1 = 1 - cosW0;
    const b2 = (1 - cosW0) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosW0;
    const a2 = 1 - alpha;
    return biquad(buf, b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
}

/** Simple biquad bandpass filter */
function bandpass(buf, freq, Q = 1.0) {
    const w0 = (2 * Math.PI * freq) / SAMPLE_RATE;
    const alpha = Math.sin(w0) / (2 * Q);
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;
    return biquad(buf, b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
}

/** Simple biquad highshelf filter */
function highshelf(buf, freq, gainDb) {
    const A = Math.pow(10, gainDb / 40);
    const w0 = (2 * Math.PI * freq) / SAMPLE_RATE;
    const alpha = (Math.sin(w0) / 2) * Math.sqrt(2);
    const cosW0 = Math.cos(w0);
    const b0 = A * (A + 1 + (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha);
    const b1 = -2 * A * (A - 1 + (A + 1) * cosW0);
    const b2 = A * (A + 1 + (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha);
    const a0 = A + 1 - (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha;
    const a1 = 2 * (A - 1 - (A + 1) * cosW0);
    const a2 = A + 1 - (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha;
    return biquad(buf, b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
}

function biquad(input, b0, b1, b2, a1, a2) {
    const out = new Float32Array(input.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < input.length; i++) {
        const x = input[i];
        out[i] = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1; x1 = x;
        y2 = y1; y1 = out[i];
    }
    return out;
}

/** Normalize buffer to peak amplitude */
function normalize(buf, peak = 0.85) {
    let max = 0;
    for (let i = 0; i < buf.length; i++) max = Math.max(max, Math.abs(buf[i]));
    if (max === 0) return buf;
    const scale = peak / max;
    for (let i = 0; i < buf.length; i++) buf[i] *= scale;
    return buf;
}

/** Mix two buffers together */
function mix(a, b, bGain = 1.0) {
    const out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i++) out[i] = a[i] + b[i] * bGain;
    return out;
}

/** Encode Float32Array to WAV and save */
function saveWAV(buf, filename) {
    const numSamples = buf.length;
    const byteRate = SAMPLE_RATE * CHANNELS * (BITS_PER_SAMPLE / 8);
    const blockAlign = CHANNELS * (BITS_PER_SAMPLE / 8);
    const dataSize = numSamples * (BITS_PER_SAMPLE / 8);
    const headerSize = 44;
    const fileSize = headerSize + dataSize;

    const buffer = Buffer.alloc(fileSize);
    let offset = 0;

    // RIFF header
    buffer.write("RIFF", offset); offset += 4;
    buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
    buffer.write("WAVE", offset); offset += 4;

    // fmt chunk
    buffer.write("fmt ", offset); offset += 4;
    buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
    buffer.writeUInt16LE(1, offset); offset += 2; // PCM
    buffer.writeUInt16LE(CHANNELS, offset); offset += 2;
    buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
    buffer.writeUInt32LE(byteRate, offset); offset += 4;
    buffer.writeUInt16LE(blockAlign, offset); offset += 2;
    buffer.writeUInt16LE(BITS_PER_SAMPLE, offset); offset += 2;

    // data chunk
    buffer.write("data", offset); offset += 4;
    buffer.writeUInt32LE(dataSize, offset); offset += 4;

    // Write samples
    for (let i = 0; i < numSamples; i++) {
        const s = Math.max(-1, Math.min(1, buf[i]));
        const val = s < 0 ? s * 32768 : s * 32767;
        buffer.writeInt16LE(Math.round(val), offset);
        offset += 2;
    }

    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(` → ${sizeKB} KB`);
}

// ─── Sound Generators ────────────────────────────────────────

function generateRain() {
    const len = SAMPLE_RATE * DURATION;

    // Layer 1: Pink noise base (steady rain)
    let buf = makeBuffer();
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        buf[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.06;
        b6 = w * 0.115926;
    }

    // Layer 2: Sparse rain drop impacts (transient clicks)
    const drops = makeBuffer();
    for (let i = 0; i < len; i++) {
        if (Math.random() < 0.0003) { // sparse drops
            const amp = 0.1 + Math.random() * 0.15;
            const decaySamples = Math.floor((0.005 + Math.random() * 0.015) * SAMPLE_RATE);
            for (let j = 0; j < decaySamples && (i + j) < len; j++) {
                drops[i + j] += amp * Math.exp(-j / (decaySamples * 0.3)) * (Math.random() * 2 - 1);
            }
        }
    }
    const dropsFiltered = lowpass(drops, 3000, 0.5);
    buf = mix(buf, dropsFiltered, 0.3);

    // Slow amplitude modulation (intensity waves)
    for (let i = 0; i < len; i++) {
        const t = i / SAMPLE_RATE;
        const mod = 0.7 + 0.15 * Math.sin(t * 0.25 * Math.PI * 2)
                  + 0.1 * Math.sin(t * 0.07 * Math.PI * 2)
                  + 0.05 * Math.sin(t * 0.4 * Math.PI * 2);
        buf[i] *= mod;
    }

    // Multi-pass filtering: warm, muffled rain
    buf = lowpass(buf, 700, 0.6);
    buf = lowpass(buf, 1400, 0.4);
    buf = highshelf(buf, 2000, -8);

    crossfadeLoop(buf);
    normalize(buf, 0.8);
    return buf;
}

function generateFire() {
    const len = SAMPLE_RATE * DURATION;

    // Brown noise base — deep rumble
    let buf = makeBuffer();
    let last = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        buf[i] = (last + 0.02 * w) / 1.02;
        last = buf[i];
    }

    // Layer 2: Crackle events (short bright bursts)
    const crackle = makeBuffer();
    for (let i = 0; i < len; i++) {
        if (Math.random() < 0.0008) {
            const amp = 0.05 + Math.random() * 0.12;
            const dur = Math.floor((0.002 + Math.random() * 0.008) * SAMPLE_RATE);
            for (let j = 0; j < dur && (i + j) < len; j++) {
                crackle[i + j] += amp * Math.exp(-j / (dur * 0.2)) * (Math.random() * 2 - 1);
            }
        }
    }
    const crackleFiltered = lowpass(bandpass(crackle, 2500, 0.8), 4000, 0.5);
    buf = mix(buf, crackleFiltered, 0.15);

    // Slow flicker modulation
    for (let i = 0; i < len; i++) {
        const t = i / SAMPLE_RATE;
        const flicker = 0.75 + 0.15 * Math.sin(t * 0.35 * Math.PI * 2)
                      + 0.1 * Math.sin(t * 0.12 * Math.PI * 2);
        buf[i] *= flicker;
    }

    // Deep filtering
    buf = lowpass(buf, 200, 0.7);
    buf = lowpass(buf, 400, 0.5);
    buf = highshelf(buf, 500, -10);

    crossfadeLoop(buf);
    normalize(buf, 0.8);
    return buf;
}

function generateCafe() {
    const len = SAMPLE_RATE * DURATION;

    // Pink noise base — room tone
    let buf = makeBuffer();
    let c0 = 0, c1 = 0, c2 = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        c0 = 0.99765 * c0 + w * 0.0990460;
        c1 = 0.96300 * c1 + w * 0.2965164;
        c2 = 0.57000 * c2 + w * 0.1526527;
        buf[i] = (c0 + c1 + c2 + w * 0.1848) * 0.08;
    }

    // Layer 2: Murmur — modulated noise at speech frequencies
    const murmur = makeBuffer();
    let m0 = 0, m1 = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        m0 = 0.995 * m0 + w * 0.15;
        m1 = 0.97 * m1 + w * 0.25;
        murmur[i] = (m0 + m1) * 0.05;
    }
    const murmurFiltered = lowpass(bandpass(murmur, 800, 0.3), 2500, 0.4);

    // Slow wax/wane of murmur
    for (let i = 0; i < len; i++) {
        const t = i / SAMPLE_RATE;
        const wave = 0.5 + 0.25 * Math.sin(t * 0.18 * Math.PI * 2)
                   + 0.15 * Math.sin(t * 0.07 * Math.PI * 2)
                   + 0.1 * Math.sin(t * 0.42 * Math.PI * 2);
        murmurFiltered[i] *= wave;
    }
    buf = mix(buf, murmurFiltered, 0.6);

    // Layer 3: Sparse clink/cup sounds (tiny bright transients)
    const clinks = makeBuffer();
    for (let i = 0; i < len; i++) {
        if (Math.random() < 0.00015) {
            const amp = 0.03 + Math.random() * 0.06;
            const freq = 1200 + Math.random() * 2000;
            const dur = Math.floor((0.01 + Math.random() * 0.03) * SAMPLE_RATE);
            for (let j = 0; j < dur && (i + j) < len; j++) {
                clinks[i + j] += amp * Math.exp(-j / (dur * 0.15)) * Math.sin(j / SAMPLE_RATE * freq * Math.PI * 2);
            }
        }
    }
    buf = mix(buf, clinks, 0.2);

    // Bandpass to "room" frequencies
    buf = bandpass(buf, 1000, 0.3);
    buf = lowpass(buf, 3000, 0.4);

    crossfadeLoop(buf);
    normalize(buf, 0.8);
    return buf;
}

function generateStream() {
    const len = SAMPLE_RATE * DURATION;

    // Brown noise — water base
    let buf = makeBuffer();
    let last = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        buf[i] = (last + 0.03 * w) / 1.03;
        last = buf[i];
    }

    // Layer 2: Higher frequency "babble" — pink noise
    const babble = makeBuffer();
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.998 * b0 + w * 0.08;
        b1 = 0.97 * b1 + w * 0.18;
        b2 = 0.6 * b2 + w * 0.12;
        babble[i] = (b0 + b1 + b2) * 0.07;
    }
    const babbleFiltered = bandpass(babble, 600, 0.5);

    // Flowing modulation
    for (let i = 0; i < len; i++) {
        const t = i / SAMPLE_RATE;
        const flow = 0.6 + 0.2 * Math.sin(t * 0.15 * Math.PI * 2)
                   + 0.12 * Math.sin(t * 0.38 * Math.PI * 2)
                   + 0.08 * Math.sin(t * 0.08 * Math.PI * 2);
        babbleFiltered[i] *= flow;
    }
    buf = mix(buf, babbleFiltered, 0.5);

    // Gentle overall modulation
    for (let i = 0; i < len; i++) {
        const t = i / SAMPLE_RATE;
        const wave = 0.8 + 0.12 * Math.sin(t * 0.1 * Math.PI * 2)
                   + 0.08 * Math.sin(t * 0.27 * Math.PI * 2);
        buf[i] *= wave;
    }

    // Filtering for water
    buf = lowpass(buf, 600, 0.5);
    buf = lowpass(buf, 1200, 0.4);
    buf = highshelf(buf, 1500, -6);

    crossfadeLoop(buf);
    normalize(buf, 0.8);
    return buf;
}

function generateWhite() {
    const len = SAMPLE_RATE * DURATION;
    let buf = makeBuffer();
    for (let i = 0; i < len; i++) {
        buf[i] = (Math.random() * 2 - 1) * 0.5;
    }

    // Gentle high-cut to tame harsh frequencies
    buf = lowpass(buf, 6000, 0.5);
    buf = highshelf(buf, 4000, -4);

    crossfadeLoop(buf);
    normalize(buf, 0.75);
    return buf;
}

// ─── Main ────────────────────────────────────────────────────

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

console.log("Generating ambient sound loops (30s each, 16-bit WAV)...\n");

const sounds = [
    { name: "rain", gen: generateRain },
    { name: "fire", gen: generateFire },
    { name: "cafe", gen: generateCafe },
    { name: "stream", gen: generateStream },
    { name: "white", gen: generateWhite },
];

for (const s of sounds) {
    process.stdout.write(`  Generating ${s.name}...`);
    const buf = s.gen();
    process.stdout.write(" saving...");
    saveWAV(buf, `${s.name}.wav`);
}

console.log("\nDone! Files saved to public/sounds/");
