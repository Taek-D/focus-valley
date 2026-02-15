import { useState, useEffect, useRef } from "react";

export type WeatherMood = "clear" | "cloudy" | "rain" | "snow" | "night";

type WeatherData = {
    weatherCode: number;
    isDay: boolean;
    mood: WeatherMood;
    loaded: boolean;
};

const CACHE_KEY = "focus-valley-weather";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CachedWeather = {
    weatherCode: number;
    isDay: boolean;
    timestamp: number;
};

function weatherCodeToMood(code: number, isDay: boolean): WeatherMood {
    if (!isDay) return "night";
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return "rain";
    if ((code >= 2 && code <= 3) || (code >= 45 && code <= 48)) return "cloudy";
    return "clear";
}

function loadCache(): CachedWeather | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw) as CachedWeather;
        if (Date.now() - data.timestamp > CACHE_TTL_MS) return null;
        return data;
    } catch {
        return null;
    }
}

function saveCache(weatherCode: number, isDay: boolean) {
    try {
        const data: CachedWeather = { weatherCode, isDay, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
}

function getInitialWeather(): WeatherData {
    const cached = loadCache();
    if (cached) {
        return {
            weatherCode: cached.weatherCode,
            isDay: cached.isDay,
            mood: weatherCodeToMood(cached.weatherCode, cached.isDay),
            loaded: true,
        };
    }
    return { weatherCode: 0, isDay: true, mood: "clear", loaded: false };
}

export function useWeather(): WeatherData {
    const [data, setData] = useState<WeatherData>(getInitialWeather);
    const fetched = useRef(false);

    useEffect(() => {
        if (data.loaded || fetched.current) return;
        fetched.current = true;

        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,is_day`;
                    const res = await fetch(url);
                    if (!res.ok) return;
                    const json = await res.json();
                    const weatherCode = json?.current?.weather_code ?? 0;
                    const isDay = json?.current?.is_day === 1;

                    saveCache(weatherCode, isDay);
                    setData({
                        weatherCode,
                        isDay,
                        mood: weatherCodeToMood(weatherCode, isDay),
                        loaded: true,
                    });
                } catch {
                    // Silent fail — weather is non-essential
                }
            },
            () => {
                // Geolocation denied — silent fail
            },
            { timeout: 5000, maximumAge: CACHE_TTL_MS }
        );
    }, [data.loaded]);

    return data;
}
