import { verifyToken } from '../utils/auth.js';

/**
 * Express middleware to verify the Bearer authentication token.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Format must be: Bearer <token>' });
  }

  const token = parts[1];
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  req.user = {
    id: payload.userId,
    username: payload.username,
    email: payload.email
  };

  next();
}
