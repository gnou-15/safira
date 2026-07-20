/**
 * Rate limiter middleware — disabled. All users have unlimited AI access.
 */
export async function rateLimiter(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  return next();
}
