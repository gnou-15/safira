import { useState, useEffect, useRef } from 'react';
import { getSkyPhase } from '../utils/getSkyPhase';
import { getWeatherMeta } from '../utils/getWeatherMeta';

/**
 * Fetches sunrise/sunset and current weather from Open-Meteo for
 * Lapu-Lapu City, Cebu (lat=10.31, lon=123.95) and derives:
 *   - skyPhase: 'night' | 'dawn' | 'day' | 'sunset'
 *   - weatherMeta: { isClear, isCloudy, isRainy, isStormy }
 *
 * Refreshes weather every 10 minutes.
 * Falls back gracefully to time-only phase computation if the API fails.
 *
 * @returns {{
 *   skyPhase: 'night'|'dawn'|'day'|'sunset',
 *   weatherMeta: { isClear: boolean, isCloudy: boolean, isRainy: boolean, isStormy: boolean },
 *   isLoading: boolean,
 * }}
 */
export default function useTimeAndWeather() {
  const LAT = 10.31;
  const LON = 123.95;
  const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  const [sunriseISO, setSunriseISO]   = useState(null);
  const [sunsetISO,  setSunsetISO]    = useState(null);
  const [weatherCode, setWeatherCode] = useState(null);
  const [skyPhase, setSkyPhase]       = useState('day');
  const [isLoading, setIsLoading]     = useState(true);
  const timerRef = useRef(null);

  // --- Fetch from Open-Meteo ---
  const fetchWeather = async () => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast`
        + `?latitude=${LAT}&longitude=${LON}`
        + `&current=weather_code`
        + `&daily=sunrise,sunset`
        + `&timezone=Asia/Manila`
        + `&forecast_days=1`;

      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const sunrise = data?.daily?.sunrise?.[0] ?? null;
      const sunset  = data?.daily?.sunset?.[0]  ?? null;
      const code    = data?.current?.weather_code ?? null;

      setSunriseISO(sunrise);
      setSunsetISO(sunset);
      setWeatherCode(code);
    } catch {
      // Graceful fallback: keep existing values (or null for first load)
      // The tick will still compute skyPhase from local time only.
    } finally {
      setIsLoading(false);
    }
  };

  // --- Tick every second to keep skyPhase in sync with wall clock ---
  useEffect(() => {
    const tick = () => {
      const phase = getSkyPhase(new Date(), sunriseISO, sunsetISO);
      setSkyPhase(phase);
    };

    tick(); // run immediately
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [sunriseISO, sunsetISO]);

  // --- Initial fetch + re-fetch every 10 min ---
  useEffect(() => {
    fetchWeather();
    const refreshId = setInterval(fetchWeather, REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weatherMeta = getWeatherMeta(weatherCode);

  return { skyPhase, weatherMeta, isLoading };
}
