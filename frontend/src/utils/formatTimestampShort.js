export const formatTimestampShort = (dateString) => {
  if (!dateString) return 'recently';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'recently';
  }
};
