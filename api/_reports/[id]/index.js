import { supabase, setCorsHeaders } from '../../_lib/supabase.js';
import { getAuthenticatedUser } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authenticate user
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  const { id } = req.query;

  try {
    // 1. Verify ownership if report has user_id
    const { data: reportCheck, error: checkError } = await supabase
      .from('hirac_reports')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (reportCheck && reportCheck.user_id && reportCheck.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied: You do not own this report.' });
    }

    if (req.method === 'GET') {
      // GET /api/reports/[id] — fetch report with rows
      const { data: report, error: reportError } = await supabase
        .from('hirac_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (reportError) throw reportError;

      const { data: rows, error: rowsError } = await supabase
        .from('hirac_rows')
        .select('*')
        .eq('report_id', id)
        .order('row_order', { ascending: true });

      if (rowsError) throw rowsError;

      return res.status(200).json({ ...report, rows });
    }

    if (req.method === 'PUT') {
      // PUT /api/reports/[id] — update report metadata
      const { data, error } = await supabase
        .from('hirac_reports')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      // DELETE /api/reports/[id] — delete report
      const { error } = await supabase
        .from('hirac_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ message: 'Report deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`Report ${id} error:`, error);
    return res.status(500).json({ error: error.message });
  }
}
