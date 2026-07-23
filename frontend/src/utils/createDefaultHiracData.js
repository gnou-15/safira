export const createDefaultReportMeta = () => ({
  id: `report-${Date.now()}`,
  title: 'Untitled HIRAC Report',
  location: 'Mactan Cebu International Airport',
  department: 'Operations',
  activity_assessed: 'General Operations',
  assessor_team: 'Safety Team',
  ref_no: `CSC-${Date.now().toString().slice(-6)}`,
  doc_code: 'SSQA - 009',
  doc_revision: 'FEB2023/Rev06'
});

export const createDefaultRow = () => ({
  row_order: 1,
  operation_type: 'Operations',
  generic_hazard: 'New Hazard Description',
  risks: 'Potential consequences...',
  existing_defenses: 'Current active controls...',
  initial_likelihood: 3,
  initial_severity: 3,
  initial_risk_score: 9,
  initial_risk_index: 'Medium',
  mitigating_actions: '(c) Engineering controls...',
  residual_likelihood: 2,
  residual_severity: 2,
  residual_risk_score: 4,
  residual_risk_index: 'Low',
  remarks: '',
  target_date: '',
  department_responsible: 'Safety'
});
