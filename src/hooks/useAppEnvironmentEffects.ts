import { useEffect } from "react";
import type { TimerMode } from "@/hooks/useTimer";
import type { WeatherMood } from "@/hooks/useWeather";

type UseAppEnvironmentEffectsArgs = {
    mode: TimerMode;
    isRunning: boolean;
    weatherLoaded: boolean;
    weatherMood: WeatherMood;
    deepFocusStreak: number;
};

export function useAppEnvironmentEffects({
    mode,
    isRunning,
    weatherLoaded,
    weatherMood,
    deepFocusStreak,
}: UseAppEnvironmentEffectsArgs) {
    useEffect(() => {
        document.documentElement.setAttribute("data-mode", mode);
    }, [mode]);

    useEffect(() => {
        const month = new Date().getMonth();
        let season: string;
        if (month >= 2 && month <= 4) season = "spring";
        else if (month >= 5 && month <= 7) season = "summer";
        else if (month >= 8 && month <= 10) season = "autumn";
        else season = "winter";
        document.documentElement.setAttribute("data-season", season);
    }, []);

    useEffect(() => {
        if (weatherLoaded && mode === "FOCUS") {
            document.documentElement.setAttribute("data-weather", weatherMood);
            return;
        }

        document.documentElement.removeAttribute("data-weather");
    }, [weatherLoaded, weatherMood, mode]);

    useEffect(() => {
        if (deepFocusStreak >= 4) {
            document.documentElement.setAttribute("data-deep", "2");
            return;
        }

        if (deepFocusStreak >= 2) {
            document.documentElement.setAttribute("data-deep", "1");
            return;
        }

        document.documentElement.removeAttribute("data-deep");
    }, [deepFocusStreak]);

    useEffect(() => {
        if (!isRunning || mode !== "FOCUS") return;

        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isRunning, mode]);
}
