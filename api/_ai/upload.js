import { setCorsHeaders } from '../_lib/supabase.js';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!PYTHON_SERVICE_URL) {
    return res.status(500).json({ error: 'Python AI service URL is not configured.' });
  }

  const { filename, base64_data } = req.body;
  if (!filename || !base64_data) {
    return res.status(400).json({ error: 'Filename and base64_data are required.' });
  }

  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/upload-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, base64_data })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: errorData.detail || 'AI Service error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('AI upload proxy error:', error);
    return res.status(500).json({ error: 'AI Service communication error' });
  }
}
