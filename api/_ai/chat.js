import { setCorsHeaders } from '../_lib/supabase.js';
import { getAuthenticatedUser } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimiter.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authenticate user
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  // 2. Enforce daily rate limit
  const allowed = await checkRateLimit(req, res, user);
  if (!allowed) return;

  if (!PYTHON_SERVICE_URL) {
    return res.status(500).json({ error: 'Python AI service URL is not configured.' });
  }

  const { message, chat_history, current_table, doc_type, current_investigation } = req.body;

  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chat_history, current_table, doc_type, current_investigation })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.detail || 'AI Service error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('AI chat proxy error:', error);
    return res.status(500).json({ error: 'AI Service communication error' });
  }
}
