import { supabase, setCorsHeaders } from '../_lib/supabase.js';
import { getAuthenticatedUser } from '../_lib/auth.js';

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

  try {
    if (req.method === 'GET') {
      // GET /api/reports — fetch all reports
      const { data, error } = await supabase
        .from('hirac_reports')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // POST /api/reports — create a new report
      const {
        title, ref_no, location, activity_assessed, assessor_team,
        department, prepared_by_name, prepared_by_role, approved_by_name,
        approved_by_role, acknowledged_by_name, acknowledged_by_role, footer_remarks
      } = req.body;

      const { data, error } = await supabase
        .from('hirac_reports')
        .insert([{
          title: title || 'New HIRAC Report',
          ref_no: ref_no || `CSC-${Date.now().toString().slice(-6)}`,
          location: location || 'Airport Terminal',
          activity_assessed: activity_assessed || 'Safety Assessment',
          assessor_team: assessor_team || 'SSQA Team',
          department: department || 'Operations',
          prepared_by_name, prepared_by_role,
          approved_by_name, approved_by_role,
          acknowledged_by_name, acknowledged_by_role,
          footer_remarks,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({ error: error.message });
  }
}
