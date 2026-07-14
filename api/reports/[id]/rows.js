import { supabase, clampScore, calcRiskLevel, parseDate, setCorsHeaders } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      // PUT /api/reports/[id]/rows — bulk upsert rows
      const { rows } = req.body;

      // 1. Clear existing rows
      const { error: deleteError } = await supabase
        .from('hirac_rows')
        .delete()
        .eq('report_id', id);

      if (deleteError) throw deleteError;

      if (!rows || rows.length === 0) {
        return res.status(200).json({ message: 'Rows cleared successfully.' });
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
          initial_risk_index: calcRiskLevel(il * is_),
          mitigating_actions: String(row.mitigating_actions || ''),
          residual_likelihood: rl,
          residual_severity: rs,
          residual_risk_score: rl * rs,
          residual_risk_index: calcRiskLevel(rl * rs),
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
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(`Rows error for report ${id}:`, error);
    return res.status(500).json({ error: error.message });
  }
}
