/**
 * Deterministically generates a beautiful gradient and text color for a user avatar based on username hash.
 *
 * @param {string} username - Key or username string
 * @returns {Object} { background, color, boxShadow }
 */
export default function getUserAvatarGradient(username = '') {
  const gradients = [
    { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#ffffff', shadow: 'rgba(99, 102, 241, 0.25)' }, // Indigo
    { background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#ffffff', shadow: 'rgba(14, 165, 233, 0.25)' }, // Sky
    { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', shadow: 'rgba(16, 185, 129, 0.25)' }, // Emerald
    { background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#ffffff', shadow: 'rgba(139, 92, 246, 0.25)' }, // Violet
    { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', shadow: 'rgba(245, 158, 11, 0.25)' }, // Amber
    { background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: '#ffffff', shadow: 'rgba(236, 72, 153, 0.25)' }, // Pink
    { background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', color: '#ffffff', shadow: 'rgba(20, 184, 166, 0.25)' }, // Teal
    { background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', color: '#ffffff', shadow: 'rgba(244, 63, 94, 0.25)' }  // Rose
  ];

  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}
