import { setCorsHeaders } from './_lib/supabase.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    service: 'SAFIRA API (Vercel Serverless)',
    timestamp: new Date().toISOString()
  });
}
