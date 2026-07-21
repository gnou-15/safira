/**
 * Determines the current sky phase based on local time and today's
 * actual sunrise/sunset times (ISO strings from Open-Meteo).
 *
 * @param {Date} now - Current local date/time
 * @param {string|null} sunriseISO - ISO8601 sunrise time e.g. "2026-07-21T05:31"
 * @param {string|null} sunsetISO  - ISO8601 sunset time  e.g. "2026-07-21T18:09"
 * @returns {'night'|'dawn'|'day'|'sunset'}
 */
export function getSkyPhase(now, sunriseISO, sunsetISO) {
  // Fallback: if API data is missing, derive a rough phase from hour alone
  if (!sunriseISO || !sunsetISO) {
    const hour = now.getHours();
    if (hour >= 5 && hour < 7)  return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'sunset';
    return 'night';
  }

  const sunriseMs = new Date(sunriseISO).getTime();
  const sunsetMs  = new Date(sunsetISO).getTime();
  const nowMs     = now.getTime();

  const DAWN_START_OFFSET   = 60 * 60 * 1000; // 60 min before sunrise
  const DAWN_END_OFFSET     = 30 * 60 * 1000; // 30 min after  sunrise
  const SUNSET_START_OFFSET = 60 * 60 * 1000; // 60 min before sunset
  const SUNSET_END_OFFSET   = 60 * 60 * 1000; // 60 min after  sunset

  const dawnStart   = sunriseMs - DAWN_START_OFFSET;
  const dawnEnd     = sunriseMs + DAWN_END_OFFSET;
  const sunsetStart = sunsetMs  - SUNSET_START_OFFSET;
  const sunsetEnd   = sunsetMs  + SUNSET_END_OFFSET;

  if (nowMs >= dawnStart && nowMs < dawnEnd)     return 'dawn';
  if (nowMs >= dawnEnd   && nowMs < sunsetStart) return 'day';
  if (nowMs >= sunsetStart && nowMs < sunsetEnd) return 'sunset';
  return 'night';
}
