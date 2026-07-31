/**
 * Formats an ISO date string into a Vercel-style relative time string.
 * Examples: '12s ago', '5m ago', '2h ago', '1d ago', '3w ago', 'Never'
 *
 * @param {string|Date} isoString - The timestamp to format
 * @returns {string} Relative formatted time string
 */
export default function formatTimeAgo(isoString) {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  const timeMs = date.getTime();
  if (isNaN(timeMs)) return 'Never';

  const nowMs = Date.now();
  const diffSeconds = Math.floor((nowMs - timeMs) / 1000);

  if (diffSeconds < 0) return 'Just now';
  if (diffSeconds < 10) return 'Just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}
