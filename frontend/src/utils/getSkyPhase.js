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
  // Fallback: if API data is missing, derive a precise phase from local time
  if (!sunriseISO || !sunsetISO) {
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    // 5:15 AM to 5:45 AM: dawn
    if (totalMinutes >= 315 && totalMinutes < 345) return 'dawn';
    // 5:45 AM to 5:45 PM: day
    if (totalMinutes >= 345 && totalMinutes < 1065) return 'day';
    // 5:45 PM to 6:45 PM: sunset
    if (totalMinutes >= 1065 && totalMinutes < 1125) return 'sunset';
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
