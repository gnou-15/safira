export const formatTimestamp = (dateString) => {
  if (!dateString) return 'recently';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'recently';
  }
};

export const getRiskLevel = (score) => {
  if (score <= 4) return 'Low';
  if (score <= 12) return 'Medium';
  return 'High';
};
