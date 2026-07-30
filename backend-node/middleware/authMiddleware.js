import { verifyToken } from '../utils/auth.js';
import { supabase } from '../config/supabase.js';

/**
 * Express middleware to verify the Bearer authentication token.
 * Also tracks user last access timestamp & API request count asynchronously.
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

  // Asynchronously record user activity & API request count
  if (payload.userId) {
    Promise.resolve().then(async () => {
      try {
        // Fetch current count & update last_accessed_at
        const { data: userRecord } = await supabase
          .from('safira_users')
          .select('api_request_count')
          .eq('id', payload.userId)
          .maybeSingle();

        const newCount = ((userRecord?.api_request_count) || 0) + 1;

        await supabase
          .from('safira_users')
          .update({
            last_accessed_at: new Date().toISOString(),
            api_request_count: newCount
          })
          .eq('id', payload.userId);
      } catch (err) {
        console.warn('Failed to record user activity in middleware:', err.message);
      }
    });
  }

  next();
}

