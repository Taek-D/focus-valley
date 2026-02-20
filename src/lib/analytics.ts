// Google Analytics 4 — Event tracking utility
// Enabled only when VITE_ENABLE_ANALYTICS=true in production.

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-DJGQRRNSTQ";
const ANALYTICS_ENABLED = import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS === "true";
let analyticsInitialized = false;

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        dataLayer: unknown[];
    }
}

/** Load gtag.js script (called once from main.tsx) */
export function initAnalytics() {
    if (typeof window === "undefined") return;
    if (!ANALYTICS_ENABLED) return;
    if (!GA_MEASUREMENT_ID) return;
    if (analyticsInitialized) return;

    // dataLayer init
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: true,
    });

    // Load gtag.js
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    analyticsInitialized = true;
}

// ── Event helpers ────────────────────────────────────────

function track(eventName: string, params?: Record<string, unknown>) {
    if (!analyticsInitialized) return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params);
}

// ── Timer Events ─────────────────────────────────────────

export function trackSessionStart(mode: string, durationMinutes: number, categoryId?: string) {
    track("session_start", { mode, duration_minutes: durationMinutes, category: categoryId });
}

export function trackSessionComplete(mode: string, durationMinutes: number, categoryId?: string) {
    track("session_complete", { mode, duration_minutes: durationMinutes, category: categoryId });
}

export function trackSessionAbandon(mode: string, elapsedSeconds: number) {
    track("session_abandon", { mode, elapsed_seconds: elapsedSeconds });
}

// ── Garden Events ────────────────────────────────────────

export function trackPlantHarvested(plantType: string) {
    track("plant_harvested", { plant_type: plantType });
}

export function trackPlantDied(plantType: string) {
    track("plant_died", { plant_type: plantType });
}

export function trackSeedPlanted(plantType: string) {
    track("seed_planted", { plant_type: plantType });
}

// ── Sound Events ─────────────────────────────────────────

export function trackSoundToggle(soundType: string, volume: number) {
    track("sound_toggle", { sound_type: soundType, volume });
}

// ── Category Events ──────────────────────────────────────

export function trackCategoryAdded(label: string) {
    track("category_added", { label });
}

export function trackCategoryRemoved(label: string) {
    track("category_removed", { label });
}

// ── Todo Events ──────────────────────────────────────────

export function trackTodoCreated() {
    track("todo_created");
}

export function trackTodoCompleted() {
    track("todo_completed");
}

// ── Share & Export ────────────────────────────────────────

export function trackShareCard() {
    track("share_card_generated");
}

export function trackCsvExport() {
    track("csv_exported");
}

// ── Settings ─────────────────────────────────────────────

export function trackSettingsChanged(setting: string, value: unknown) {
    track("settings_changed", { setting, value });
}

// ── Waitlist ─────────────────────────────────────────────

export function trackWaitlistSignup(source: string) {
    track("waitlist_signup", { source });
}

export function trackWaitlistDismissed() {
    track("waitlist_dismissed");
}
