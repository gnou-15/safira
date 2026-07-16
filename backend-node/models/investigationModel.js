import { supabase } from '../config/supabase.js';

export const InvestigationModel = {
  // Helper: Verify report ownership
  async verifyOwnership(id, userId) {
    if (!id) return;
    const { data: inv, error } = await supabase
      .from('safira_investigations')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    if (inv && inv.user_id && inv.user_id !== userId) {
      throw new Error('Access denied: You do not own this investigation report.');
    }
  },

  // Fetch all investigations accessible to user
  async getAll(userId) {
    let query = supabase.from('safira_investigations').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Fetch investigation details by id
  async getById(id, userId) {
    const { data, error } = await supabase
      .from('safira_investigations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (data.user_id && data.user_id !== userId) {
      throw new Error('Access denied: You do not own this investigation report.');
    }
    return data;
  },

  // Create a new investigation
  async create(data, userId) {
    const payload = {
      user_id: userId || null,
      title: data.title || 'Untitled Incident Investigation',
      ref_no: data.ref_no || 'SSQA-032',
      revision_info: data.revision_info || 'July2022 / Rev 02',
      id_number: data.id_number || '',
      position: data.position || '',
      date_of_hiring: data.date_of_hiring || '',
      trainings: data.trainings || '',
      executive_summary: data.executive_summary || '',
      operational_irregularity: data.operational_irregularity || '',
      risk_index: data.risk_index || '',
      analysis: data.analysis || [],
      root_cause: data.root_cause || [],
      corrective_action: data.corrective_action || [],
      preventive_action: data.preventive_action || [],
      references_text: data.references_text || '- Interview with concerned personnel\n- Safety Security Report Form',
      prepared_by_name: data.prepared_by_name || 'Catalino III Z. Borromeo',
      prepared_by_role: data.prepared_by_role || 'SSQA - S.H.E Representative',
      approved_by_name: data.approved_by_name || 'Roy Philip R. Magsayo',
      approved_by_role: data.approved_by_role || 'SSQA - Vice President (VP)'
    };

    const { data: created, error } = await supabase
      .from('safira_investigations')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return created;
  },

  // Update investigation report details
  async update(id, data, userId) {
    await this.verifyOwnership(id, userId);

    const payload = {
      title: data.title,
      ref_no: data.ref_no,
      revision_info: data.revision_info,
      id_number: data.id_number,
      position: data.position,
      date_of_hiring: data.date_of_hiring,
      trainings: data.trainings,
      executive_summary: data.executive_summary,
      operational_irregularity: data.operational_irregularity,
      risk_index: data.risk_index,
      analysis: data.analysis,
      root_cause: data.root_cause,
      corrective_action: data.corrective_action,
      preventive_action: data.preventive_action,
      references_text: data.references_text,
      prepared_by_name: data.prepared_by_name,
      prepared_by_role: data.prepared_by_role,
      approved_by_name: data.approved_by_name,
      approved_by_role: data.approved_by_role
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key];
    });

    const { data: updated, error } = await supabase
      .from('safira_investigations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  // Delete an investigation report
  async delete(id, userId) {
    await this.verifyOwnership(id, userId);
    const { error } = await supabase
      .from('safira_investigations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: 'Investigation report deleted successfully' };
  }
};
