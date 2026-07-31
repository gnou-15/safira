/**
 * Determines the activity status badge properties for a user key record.
 *
 * @param {string|Date} lastAccessedAt - The ISO timestamp of last access
 * @returns {Object} Status details { label, color, isOnline, dotClass }
 */
export default function getActivityStatus(lastAccessedAt) {
  if (!lastAccessedAt) {
    return {
      label: 'Inactive',
      color: '#666666',
      isOnline: false,
      dotClass: 'status-dot-inactive'
    };
  }

  const date = new Date(lastAccessedAt);
  const timeMs = date.getTime();
  if (isNaN(timeMs)) {
    return {
      label: 'Inactive',
      color: '#666666',
      isOnline: false,
      dotClass: 'status-dot-inactive'
    };
  }

  const diffMinutes = (Date.now() - timeMs) / (1000 * 60);

  if (diffMinutes <= 15) {
    return {
      label: 'Ready',
      color: '#50e3c2',
      isOnline: true,
      dotClass: 'status-dot-ready'
    };
  } else if (diffMinutes <= 1440) { // within 24h
    return {
      label: 'Active Today',
      color: '#0070f3',
      isOnline: false,
      dotClass: 'status-dot-active'
    };
  }

  return {
    label: 'Idle',
    color: '#888888',
    isOnline: false,
    dotClass: 'status-dot-idle'
  };
}
