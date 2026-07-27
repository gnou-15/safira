import { supabase } from '../config/supabase.js';

// Helper: validate a date string or return null
const parseDate = (val) => {
  if (!val || typeof val !== 'string') return null;
  // Only accept YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) return val.trim();
  return null; // "Ongoing", free text, etc. become null
};

// Helper: clamp integer between 1 and 5
const clampScore = (val, fallback = 3) => {
  const n = parseInt(val);
  if (isNaN(n)) return fallback;
  return Math.max(1, Math.min(5, n));
};

// Helper: calculate risk index level
const calcRiskLevel = (likelihood, severity) => {
  const L = parseInt(likelihood) || 1;
  const S = parseInt(severity) || 1;
  
  const letters = {
    5: 'A',
    4: 'B',
    3: 'C',
    2: 'D',
    1: 'E'
  };
  const letter = letters[L] || 'E';
  const code = `${S}${letter}`;
  
  const extremeCodes = ['5A', '5B', '5C', '4A', '4B', '3A'];
  const highCodes = ['5D', '4C', '3B', '3C', '2A'];
  const moderateCodes = ['5E', '4D', '4E', '3D', '2B', '2C', '1A'];
  
  if (extremeCodes.includes(code)) return 'Extreme';
  if (highCodes.includes(code)) return 'High';
  if (moderateCodes.includes(code)) return 'Moderate';
  return 'Low';
};

export const ReportModel = {
  // Helper: Verify report ownership or if it is a pre-auth public report
  async verifyOwnership(reportId, userId) {
    if (!reportId) return;
    const { data: report, error } = await supabase
      .from('hirac_reports')
      .select('user_id')
      .eq('id', reportId)
      .maybeSingle();
      
    if (error) throw error;
    if (report && report.user_id && report.user_id !== userId) {
      throw new Error('Access denied: You do not own this report.');
    }
  },

  // Fetch all reports accessible to user
  async getAll(userId) {
    let query = supabase.from('hirac_reports').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Fetch report details by id
  async getById(id, userId) {
    const { data: report, error: reportError } = await supabase
      .from('hirac_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportError) throw reportError;
    
    // Ownership validation
    if (report.user_id && report.user_id !== userId) {
      throw new Error('Access denied: You do not own this report.');
    }

    const { data: rows, error: rowsError } = await supabase
      .from('hirac_rows')
      .select('*')
      .eq('report_id', id)
      .order('row_order', { ascending: true });

    if (rowsError) throw rowsError;

    return { ...report, rows };
  },

  // Create a new report metadata entry
  async create(reportData, userId) {
    const {
      title,
      ref_no,
      location,
      activity_assessed,
      assessor_team,
      department,
      prepared_by_name,
      prepared_by_role,
      approved_by_name,
      approved_by_role,
      acknowledged_by_name,
      acknowledged_by_role,
      footer_remarks
    } = reportData;

    const { data, error } = await supabase
      .from('hirac_reports')
      .insert([{
        title: title || 'New HIRAC Report',
        ref_no: ref_no || `CSC-${Date.now().toString().slice(-6)}`,
        location: location || 'Airport Terminal',
        activity_assessed: activity_assessed || 'Safety Assessment',
        assessor_team: assessor_team || 'SSQA Team',
        department: department || 'Operations',
        prepared_by_name,
        prepared_by_role,
        approved_by_name,
        approved_by_role,
        acknowledged_by_name,
        acknowledged_by_role,
        footer_remarks,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update report metadata entry
  async update(id, updateData, userId) {
    await this.verifyOwnership(id, userId);

    const { data, error } = await supabase
      .from('hirac_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete report entry
  async delete(id, userId) {
    await this.verifyOwnership(id, userId);

    const { error } = await supabase
      .from('hirac_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Report deleted successfully' };
  },

  // Clear and rewrite all rows for a report (bulk upsert)
  async upsertRows(id, rows, userId) {
    await this.verifyOwnership(id, userId);

    // 1. Clear existing rows
    const { error: deleteError } = await supabase
      .from('hirac_rows')
      .delete()
      .eq('report_id', id);

    if (deleteError) throw deleteError;

    if (!rows || rows.length === 0) {
      return { message: 'Rows cleared successfully.' };
    }

    // 2. Format rows to database schema
    const rowsToInsert = rows.map((row, index) => {
      const il = clampScore(row.initial_likelihood, 3);
      const is_ = clampScore(row.initial_severity, 3);
      const rl = clampScore(row.residual_likelihood, 2);
      const rs = clampScore(row.residual_severity, 2);

      return {
        report_id: id,
        row_order: index + 1,
        operation_type: String(row.operation_type || 'Operations'),
        generic_hazard: String(row.generic_hazard || 'Hazard'),
        risks: String(row.risks || 'Risks'),
        existing_defenses: String(row.existing_defenses || 'Defenses'),
        initial_likelihood: il,
        initial_severity: is_,
        initial_risk_score: il * is_,
        initial_risk_index: calcRiskLevel(il, is_),
        mitigating_actions: String(row.mitigating_actions || ''),
        residual_likelihood: rl,
        residual_severity: rs,
        residual_risk_score: rl * rs,
        residual_risk_index: calcRiskLevel(rl, rs),
        remarks: row.remarks ? String(row.remarks) : null,
        target_date: parseDate(row.target_date),
        department_responsible: row.department_responsible ? String(row.department_responsible) : null
      };
    });

    // 3. Insert new rows
    const { data, error: insertError } = await supabase
      .from('hirac_rows')
      .insert(rowsToInsert)
      .select();

    if (insertError) throw insertError;
    return data;
  }
};
