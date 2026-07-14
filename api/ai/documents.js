import { setCorsHeaders } from '../_lib/supabase.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!PYTHON_SERVICE_URL) {
    return res.status(500).json({ error: 'Python AI service URL is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${PYTHON_SERVICE_URL}/documents`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: errorData.detail || 'AI Service error' });
      }
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ error: 'Document name is required.' });
      }
      const response = await fetch(`${PYTHON_SERVICE_URL}/documents/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: errorData.detail || 'AI Service error' });
      }
      const data = await response.json();
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('AI documents proxy error:', error);
    return res.status(500).json({ error: 'AI Service communication error' });
  }
}
