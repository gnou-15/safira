/**
 * Formats an ISO date string into a clean full date and time string.
 * Example: 'Aug 1, 2026, 02:15 AM' or 'Never'
 *
 * @param {string|Date} isoString - ISO Date string
 * @returns {string} Formatted full timestamp
 */
export default function formatFullTimestamp(isoString) {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Never';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
