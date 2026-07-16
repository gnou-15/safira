import { setCorsHeaders } from './_lib/supabase.js';

// Import all handlers from underscored folders/files
import authHandler from './_auth.js';
import healthHandler from './_health.js';
import reportsHandler from './_reports/index.js';
import reportIdHandler from './_reports/[id]/index.js';
import reportRowsHandler from './_reports/[id]/rows.js';
import investigationsHandler from './_investigations/index.js';
import investigationIdHandler from './_investigations/[id]/index.js';
import aiChatHandler from './_ai/chat.js';
import aiGenerateHandler from './_ai/generate.js';
import aiInvestigateHandler from './_ai/investigate.js';
import aiSuggestDetailsHandler from './_ai/suggest-details.js';
import aiUploadHandler from './_ai/upload.js';
import aiDocumentsHandler from './_ai/documents.js';

export default async function handler(req, res) {
  // Set global CORS headers
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse URL path
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // 1. Health check
    if (pathname === '/api/health') {
      return await healthHandler(req, res);
    }

    // 2. Auth routes
    if (pathname.startsWith('/api/auth')) {
      return await authHandler(req, res);
    }

    // 3. AI routes
    if (pathname === '/api/ai/chat') {
      return await aiChatHandler(req, res);
    }
    if (pathname === '/api/ai/generate') {
      return await aiGenerateHandler(req, res);
    }
    if (pathname === '/api/ai/investigate') {
      return await aiInvestigateHandler(req, res);
    }
    if (pathname === '/api/ai/suggest-details') {
      return await aiSuggestDetailsHandler(req, res);
    }
    if (pathname === '/api/ai/upload') {
      return await aiUploadHandler(req, res);
    }
    if (pathname === '/api/ai/documents') {
      return await aiDocumentsHandler(req, res);
    }

    // 4. Investigations routes
    if (pathname === '/api/investigations' || pathname === '/api/investigations/') {
      return await investigationsHandler(req, res);
    }
    if (pathname.startsWith('/api/investigations/')) {
      // Extract investigation ID
      const parts = pathname.split('/');
      const id = parts[3];
      req.query = { ...req.query, id };
      return await investigationIdHandler(req, res);
    }

    // 5. Reports / HIRAC routes
    if (pathname.startsWith('/api/reports/')) {
      const parts = pathname.split('/');
      // Path pattern: /api/reports/:id/rows or /api/reports/:id
      const id = parts[3];
      req.query = { ...req.query, id };
      
      if (parts[4] === 'rows') {
        return await reportRowsHandler(req, res);
      }
      return await reportIdHandler(req, res);
    }
    if (pathname === '/api/reports' || pathname === '/api/reports/') {
      return await reportsHandler(req, res);
    }

    return res.status(404).json({ error: `Not Found: ${pathname}` });
  } catch (error) {
    console.error(`API execution error on ${pathname}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
