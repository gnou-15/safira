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
    // 1. Verify ownership if investigation has user_id
    const { data: check, error: checkError } = await supabase
      .from('safira_investigations')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (check && check.user_id && check.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied: You do not own this report.' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('safira_investigations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { data, error } = await supabase
        .from('safira_investigations')
        .update(req.body)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('safira_investigations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ message: 'Investigation report deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`Investigation ${id} error:`, error);
    return res.status(500).json({ error: error.message });
  }
}
