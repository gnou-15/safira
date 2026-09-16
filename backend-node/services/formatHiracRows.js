// Helper to clamp score between 1 and 5
export const clampScore = (val, fallback = 3) => {
  const n = parseInt(val, 10);
  if (isNaN(n)) return fallback;
  return Math.max(1, Math.min(5, n));
};

// Calculate ICAO/FAA 5x5 Risk Matrix Index
export const calcRiskLevel = (likelihood, severity) => {
  const L = clampScore(likelihood, 1);
  const S = clampScore(severity, 1);

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

// Validate and parse date
export const parseTargetDate = (val) => {
  if (!val || typeof val !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) return val.trim();
  return null;
};

// Normalize and format HIRAC rows array with mathematically correct risk indices
export const formatHiracRows = (rows = []) => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const il = clampScore(row.initial_likelihood, 3);
    const is_ = clampScore(row.initial_severity, 3);
    let rl = clampScore(row.residual_likelihood, 2);
    let rs = clampScore(row.residual_severity, 2);

    // Enforce residual <= initial
    if (rl > il) rl = il;
    if (rs > is_) rs = is_;

    const initScore = il * is_;
    const resScore = rl * rs;

    return {
      operation_type: String(row.operation_type || 'Operations'),
      generic_hazard: String(row.generic_hazard || 'Safety Hazard'),
      risks: String(row.risks || 'Operational risks'),
      existing_defenses: String(row.existing_defenses || 'Standard Operating Procedures'),
      initial_likelihood: il,
      initial_severity: is_,
      initial_risk_score: initScore,
      initial_risk_index: calcRiskLevel(il, is_),
      mitigating_actions: String(row.mitigating_actions || ''),
      residual_likelihood: rl,
      residual_severity: rs,
      residual_risk_score: resScore,
      residual_risk_index: calcRiskLevel(rl, rs),
      remarks: row.remarks ? String(row.remarks) : 'Mitigations within acceptable ALARP thresholds',
      target_date: parseTargetDate(row.target_date),
      department_responsible: row.department_responsible ? String(row.department_responsible) : 'Safety & Security',
      row_order: index + 1
    };
  });
};
