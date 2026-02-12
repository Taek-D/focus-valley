/* eslint-disable no-restricted-globals */
const ctx: Worker = self as any;

ctx.onmessage = (e: MessageEvent) => {
    const { command } = e.data;

    if (command === "START") {
        // @ts-ignore
        if (self.timerId) clearInterval(self.timerId);

        // @ts-ignore
        self.timerId = setInterval(() => {
            ctx.postMessage({ type: "TICK" });
        }, 1000);
    }
    else if (command === "PAUSE" || command === "STOP") {
        // @ts-ignore
        if (self.timerId) clearInterval(self.timerId);
    }
};

export { };
