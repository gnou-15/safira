/**
 * Maps a WMO weather code (from Open-Meteo) into visual metadata
 * used to silently drive sky overlays on the landing page.
 *
 * WMO codes reference:
 *   0        – Clear sky
 *   1, 2, 3  – Mainly clear, partly cloudy, overcast
 *   45, 48   – Fog
 *   51–57    – Drizzle
 *   61–67    – Rain
 *   71–77    – Snow (treat as rain in PH context)
 *   80–82    – Rain showers
 *   85–86    – Snow showers (treat as rain)
 *   95       – Thunderstorm (slight/moderate)
 *   96, 99   – Thunderstorm with hail
 *
 * @param {number|null} code - WMO weather code
 * @returns {{ isClear: boolean, isCloudy: boolean, isRainy: boolean, isStormy: boolean }}
 */
export function getWeatherMeta(code) {
  if (code === null || code === undefined) {
    return { isClear: true, isCloudy: false, isRainy: false, isStormy: false };
  }

  const isStormy = code >= 95;
  const isRainy  = !isStormy && (
    (code >= 51 && code <= 82) ||
    (code >= 85 && code <= 86)
  );
  const isCloudy = !isStormy && !isRainy && (code === 2 || code === 3 || code === 45 || code === 48);
  const isClear  = !isStormy && !isRainy && !isCloudy;

  return { isClear, isCloudy, isRainy, isStormy };
}
