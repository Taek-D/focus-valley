const ctx = self as unknown as { onmessage: ((e: MessageEvent) => void) | null; postMessage: (msg: unknown) => void };

let timerId: ReturnType<typeof setInterval> | null = null;

ctx.onmessage = (e: MessageEvent) => {
    const { command } = e.data;

    if (command === "START") {
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
            ctx.postMessage({ type: "TICK" });
        }, 1000);
    } else if (command === "PAUSE" || command === "STOP") {
        if (timerId) clearInterval(timerId);
        timerId = null;
    }
};

export {};
