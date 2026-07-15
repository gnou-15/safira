import { setCorsHeaders } from '../_lib/supabase.js';
import { getAuthenticatedUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  return res.status(200).json({ user });
}
