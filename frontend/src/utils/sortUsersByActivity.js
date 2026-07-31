/**
 * Filters out admin user (ADM-000) and sorts user keys by most recent activity timestamp.
 * Keys active recently appear at the top.
 *
 * @param {Array} usersList - Raw user key records
 * @returns {Array} Filtered and sorted user key records
 */
export default function sortUsersByActivity(usersList) {
  if (!Array.isArray(usersList)) return [];

  // Exclude admin key
  const nonAdminUsers = usersList.filter(u => u && u.username !== 'ADM-000');

  // Sort descending by last_accessed_at
  return nonAdminUsers.sort((a, b) => {
    const timeA = a.last_accessed_at ? new Date(a.last_accessed_at).getTime() : 0;
    const timeB = b.last_accessed_at ? new Date(b.last_accessed_at).getTime() : 0;
    return timeB - timeA;
  });
}
