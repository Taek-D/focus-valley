import { useState, useCallback } from "react";

const STORAGE_KEY = "focus-valley-landing-done";

export function useLanding() {
    const [show, setShow] = useState(() => !localStorage.getItem(STORAGE_KEY));

    const dismiss = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, "1");
        setShow(false);
    }, []);

    return { showLanding: show, dismissLanding: dismiss };
}
