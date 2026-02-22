import { useState } from "react";

function getMondayKey(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(monday.getDate() - diff);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

export function useWeeklySummary() {
    const today = new Date();
    const isMonday = today.getDay() === 1;
    const key = `focus-valley-weekly-summary-${getMondayKey()}`;

    const [show, setShow] = useState(() => isMonday && !localStorage.getItem(key));

    const dismiss = () => {
        localStorage.setItem(key, "1");
        setShow(false);
    };

    return { showWeeklySummary: show, dismissWeeklySummary: dismiss };
}
