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
      const { data, error } = await supabase
        .from('safira_investigations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const {
        title, ref_no, revision_info, id_number, position, date_of_hiring,
        trainings, executive_summary, operational_irregularity, risk_index,
        analysis, root_cause, corrective_action, preventive_action,
        references_text, prepared_by_name, prepared_by_role, approved_by_name, approved_by_role
      } = req.body;

      const { data, error } = await supabase
        .from('safira_investigations')
        .insert([{
          user_id: user.id,
          title: title || 'Untitled Incident Investigation',
          ref_no: ref_no || 'SSQA-032',
          revision_info: revision_info || 'July2022 / Rev 02',
          id_number: id_number || '',
          position: position || '',
          date_of_hiring: date_of_hiring || '',
          trainings: trainings || '',
          executive_summary: executive_summary || '',
          operational_irregularity: operational_irregularity || '',
          risk_index: risk_index || '',
          analysis: analysis || [],
          root_cause: root_cause || [],
          corrective_action: corrective_action || [],
          preventive_action: preventive_action || [],
          references_text: references_text || '- Interview with concerned personnel\n- Safety Security Report Form',
          prepared_by_name: prepared_by_name || 'Catalino III Z. Borromeo',
          prepared_by_role: prepared_by_role || 'SSQA - S.H.E Representative',
          approved_by_name: approved_by_name || 'Roy Philip R. Magsayo',
          approved_by_role: approved_by_role || 'SSQA - Vice President (VP)'
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Investigations error:', error);
    return res.status(500).json({ error: error.message });
  }
}
