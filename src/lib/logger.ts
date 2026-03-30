export function warnDev(...args: unknown[]) {
    if (import.meta.env.DEV) {
        console.warn(...args);
    }
}
