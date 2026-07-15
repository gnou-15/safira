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

export const getRiskLevel = (likelihood, severity) => {
  const L = parseInt(likelihood) || 1;
  const S = parseInt(severity) || 1;
  
  const probabilityLetters = {
    5: 'A',
    4: 'B',
    3: 'C',
    2: 'D',
    1: 'E'
  };
  const letter = probabilityLetters[L] || 'E';
  const code = `${S}${letter}`;
  
  const extremeCodes = ['5A', '5B', '5C', '4A', '4B', '3A'];
  const highCodes = ['5D', '4C', '3B', '3C', '2A'];
  const moderateCodes = ['5E', '4D', '4E', '3D', '2B', '2C', '1A'];
  
  if (extremeCodes.includes(code)) return 'Extreme';
  if (highCodes.includes(code)) return 'High';
  if (moderateCodes.includes(code)) return 'Moderate';
  return 'Low';
};

export const getRiskCode = (likelihood, severity) => {
  const L = parseInt(likelihood) || 1;
  const S = parseInt(severity) || 1;
  
  const probabilityLetters = {
    5: 'A',
    4: 'B',
    3: 'C',
    2: 'D',
    1: 'E'
  };
  const letter = probabilityLetters[L] || 'E';
  return `${S}${letter}`;
};
