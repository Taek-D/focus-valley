import { useState, useCallback } from "react";

const STORAGE_KEY = "focus-valley-onboarding-done";

export function useOnboarding() {
    const [show, setShow] = useState(() => !localStorage.getItem(STORAGE_KEY));

    const complete = useCallback(() => {
        setShow(false);
    }, []);

    return { showOnboarding: show, completeOnboarding: complete };
}

