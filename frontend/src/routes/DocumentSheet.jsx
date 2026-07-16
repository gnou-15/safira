import AutoResizeTextarea from '../components/AutoResizeTextarea';
import { getRiskCode } from '../utils/riskCalculations';
import '../css/DocumentSheet.css';

const getRiskClass = (index) => {
  if (!index) return 'low';
  const val = index.toLowerCase();
  return val === 'medium' ? 'moderate' : val;
};

export default function DocumentSheet({
  currentReport,
  rows,
  isReportLoading,
  handleCellEdit,
  handleMetaEdit,
  handleAddRow,
  handleDeleteRow,
  handleDeleteReport
}) {
  return (
    <div className={`document-sheet ${isReportLoading ? 'skeleton-active' : ''}`}>
      {/* Header Box */}
      <div className="doc-header-layout">
        <div className="logo-placeholder">
          <img src="/PAGSS.png?v=2" alt="PAGSS Logo" className="pagss-logo" />
        </div>
        <div className="doc-title-container">
          <h2 className="doc-title">Hazard Identification, Risk Assessment & Control Report</h2>
        </div>
      </div>

      {/* Metadata Fields */}
      <table className="meta-table">
        <tbody>
          <tr>
            <td className="meta-label" style={{ width: '18%' }}>REPORT TITLE:</td>
            <td className="meta-value" colSpan={3} style={{ width: '62%' }}>
              <input
                type="text"
                className="screen-only"
                value={currentReport.title || ''}
                onChange={(e) => handleMetaEdit('title', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.title || ''}</div>
            </td>
            <td className="meta-value-sidebar" rowSpan={2} style={{ width: '20%' }}>
              <div className="sidebar-label">HIRAC REF. NO.:</div>
              <input
                type="text"
                className="sidebar-input screen-only"
                value={currentReport.ref_no || ''}
                onChange={(e) => handleMetaEdit('ref_no', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold', fontSize: '10px' }}>{currentReport.ref_no || ''}</div>
              <div className="sidebar-subtext">(Refer to SSQA Risk Registry Database)</div>
            </td>
          </tr>
          <tr>
            <td className="meta-label">DEPARTMENT:</td>
            <td className="meta-value">
              <input
                type="text"
                className="screen-only"
                value={currentReport.department || ''}
                onChange={(e) => handleMetaEdit('department', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.department || ''}</div>
            </td>
            <td className="meta-label" style={{ width: '15%' }}>LOCATION:</td>
            <td className="meta-value" style={{ width: '25%' }}>
              <input
                type="text"
                className="screen-only"
                value={currentReport.location || ''}
                onChange={(e) => handleMetaEdit('location', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.location || ''}</div>
            </td>
          </tr>
          <tr>
            <td className="meta-label">ACTIVITY/AREA ASSESSED:</td>
            <td className="meta-value" colSpan={3}>
              <input
                type="text"
                className="screen-only"
                value={currentReport.activity_assessed || ''}
                onChange={(e) => handleMetaEdit('activity_assessed', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.activity_assessed || ''}</div>
            </td>
            <td className="meta-value-sidebar" rowSpan={2}>
              <div className="sidebar-label">ASSESSOR(S)/TEAM:</div>
              <AutoResizeTextarea
                className="sidebar-textarea screen-only"
                value={currentReport.assessor_team || ''}
                onChange={(e) => handleMetaEdit('assessor_team', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold', fontSize: '10px' }}>{currentReport.assessor_team || ''}</div>
            </td>
          </tr>
          <tr>
            <td className="meta-label">DATE CREATED:</td>
            <td className="meta-value">
              <input
                type="text"
                className="screen-only"
                value={currentReport.date_created || ''}
                onChange={(e) => handleMetaEdit('date_created', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.date_created || ''}</div>
            </td>
            <td className="meta-label">DATE REVIEWED:</td>
            <td className="meta-value">
              <input
                type="text"
                className="screen-only"
                value={currentReport.date_reviewed || ''}
                onChange={(e) => handleMetaEdit('date_reviewed', e.target.value)}
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.date_reviewed || ''}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Editable HIRAC Grid */}
      <div className="hirac-table-container">
        <table className="hirac-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Type of Operation or Activity</th>
              <th style={{ width: '12%' }}>Generic Hazard</th>
              <th style={{ width: '12%' }}>Risks (Consequences of the Hazard)</th>
              <th style={{ width: '12%' }}>Existing Defenses to Control Safety Risks</th>
              <th style={{ width: '7%' }}>Safety Risk Index</th>
              <th style={{ width: '14%' }}>
                Mitigating Actions to Further Reduce Safety Risks
                <div className="header-subtext">(a) Elimination (b) Substitution (c) Engineering control (d) Administrative (e) PPE</div>
              </th>
              <th style={{ width: '7%' }}>Residual Risk Index</th>
              <th style={{ width: '8%' }}>Remarks</th>
              <th style={{ width: '8%' }}>Target Date</th>
              <th style={{ width: '12%' }}>Dept Responsible</th>
              <th className="row-actions-td" style={{ width: '6%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="op-type-text">
                  <AutoResizeTextarea
                    className="cell-editable op-type-text screen-only"
                    value={row.operation_type || ''}
                    onChange={(e) => handleCellEdit(idx, 'operation_type', e.target.value)}
                  />
                  <div className="print-only cell-print-text op-type-text">{row.operation_type || ''}</div>
                </td>
                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    value={row.generic_hazard || ''}
                    onChange={(e) => handleCellEdit(idx, 'generic_hazard', e.target.value)}
                  />
                  <div className="print-only cell-print-text">{row.generic_hazard || ''}</div>
                </td>
                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    value={row.risks || ''}
                    onChange={(e) => handleCellEdit(idx, 'risks', e.target.value)}
                  />
                  <div className="print-only cell-print-text">{row.risks || ''}</div>
                </td>
                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    value={row.existing_defenses || ''}
                    onChange={(e) => handleCellEdit(idx, 'existing_defenses', e.target.value)}
                  />
                  <div className="print-only cell-print-text">{row.existing_defenses || ''}</div>
                </td>

                {/* Interactive Safety Risk Index (Single cell with internal score controls) */}
                <td className={`risk-index-cell risk-${getRiskClass(row.initial_risk_index)}`}>
                  {/* Screen: full interactive widget */}
                  <div className="risk-cell-content screen-only">
                    <div className="risk-level-label">
                      {row.initial_risk_index ? row.initial_risk_index.toUpperCase() : 'LOW'}
                      <span className="risk-score-number"><br />({getRiskCode(row.initial_likelihood, row.initial_severity)})</span>
                    </div>
                    <div className="risk-score-selectors">
                      <div className="risk-selector-group">
                        <span className="risk-selector-label">PROBABILITY</span>
                        <div className="risk-selector-circles">
                          {[
                            { label: 'A', val: 5 },
                            { label: 'B', val: 4 },
                            { label: 'C', val: 3 },
                            { label: 'D', val: 2 },
                            { label: 'E', val: 1 }
                          ].map(opt => (
                            <button
                              key={opt.val}
                              type="button"
                              className={`risk-circle-btn ${(row.initial_likelihood || 3) === opt.val ? 'active' : ''}`}
                              onClick={() => handleCellEdit(idx, 'initial_likelihood', opt.val)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="risk-selector-group">
                        <span className="risk-selector-label">SEVERITY</span>
                        <div className="risk-selector-circles">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              type="button"
                              className={`risk-circle-btn ${(row.initial_severity || 3) === v ? 'active' : ''}`}
                              onClick={() => handleCellEdit(idx, 'initial_severity', v)}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Print: solid-colored badge — divs always print backgrounds */}
                  <div className={`print-only risk-print-badge risk-print-${getRiskClass(row.initial_risk_index)}`}>
                    <div>{getRiskCode(row.initial_likelihood, row.initial_severity)}</div>
                    <div style={{ fontSize: '9px', marginTop: '2px' }}>
                      {row.initial_risk_index ? row.initial_risk_index.toUpperCase() : 'LOW'}
                    </div>
                  </div>
                </td>

                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    value={row.mitigating_actions || ''}
                    onChange={(e) => handleCellEdit(idx, 'mitigating_actions', e.target.value)}
                  />
                  <div className="print-only cell-print-text">{row.mitigating_actions || ''}</div>
                </td>

                {/* Interactive Residual Risk Index */}
                <td className={`risk-index-cell risk-${getRiskClass(row.residual_risk_index)}`}>
                  {/* Screen: full interactive widget */}
                  <div className="risk-cell-content screen-only">
                    <div className="risk-level-label">
                      {row.residual_risk_index ? row.residual_risk_index.toUpperCase() : 'LOW'}
                      <span className="risk-score-number"><br />({getRiskCode(row.residual_likelihood, row.residual_severity)})</span>
                    </div>
                    <div className="risk-score-selectors">
                      <div className="risk-selector-group">
                        <span className="risk-selector-label">PROBABILITY</span>
                        <div className="risk-selector-circles">
                          {[
                            { label: 'A', val: 5 },
                            { label: 'B', val: 4 },
                            { label: 'C', val: 3 },
                            { label: 'D', val: 2 },
                            { label: 'E', val: 1 }
                          ].map(opt => (
                            <button
                              key={opt.val}
                              type="button"
                              className={`risk-circle-btn ${(row.residual_likelihood || 2) === opt.val ? 'active' : ''}`}
                              onClick={() => handleCellEdit(idx, 'residual_likelihood', opt.val)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="risk-selector-group">
                        <span className="risk-selector-label">SEVERITY</span>
                        <div className="risk-selector-circles">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              type="button"
                              className={`risk-circle-btn ${(row.residual_severity || 2) === v ? 'active' : ''}`}
                              onClick={() => handleCellEdit(idx, 'residual_severity', v)}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Print: solid-colored badge — divs always print backgrounds */}
                  <div className={`print-only risk-print-badge risk-print-${getRiskClass(row.residual_risk_index)}`}>
                    <div>{getRiskCode(row.residual_likelihood, row.residual_severity)}</div>
                    <div style={{ fontSize: '9px', marginTop: '2px' }}>
                      {row.residual_risk_index ? row.residual_risk_index.toUpperCase() : 'LOW'}
                    </div>
                  </div>
                </td>

                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    value={row.remarks || ''}
                    onChange={(e) => handleCellEdit(idx, 'remarks', e.target.value)}
                  />
                  <div className="print-only cell-print-text">{row.remarks || ''}</div>
                </td>
                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    style={{ textAlign: 'center' }}
                    value={row.target_date || ''}
                    onChange={(e) => handleCellEdit(idx, 'target_date', e.target.value)}
                  />
                  <div className="print-only cell-print-text" style={{ textAlign: 'center' }}>{row.target_date || ''}</div>
                </td>
                <td>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    value={row.department_responsible || ''}
                    onChange={(e) => handleCellEdit(idx, 'department_responsible', e.target.value)}
                  />
                  <div className="print-only cell-print-text">{row.department_responsible || ''}</div>
                </td>
                <td className="row-actions-td">
                  <button
                    type="button"
                    className="delete-row-btn"
                    onClick={() => handleDeleteRow(idx)}
                    title="Delete Row"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-row-container">
        <button className="btn-add-row" onClick={handleAddRow}>+ Add New Hazard Row</button>
      </div>

      {/* Document Signatures */}
      <div className="doc-footer-signatures">
        {/* Left Column */}
        <div className="sig-column">
          <div className="sig-column-content">
            <div className="sig-block-group">
              <div className="sig-block-title">Prepared by:</div>
              <div className="sig-block-body">
                <input
                  type="text"
                  className="sig-name-input screen-only"
                  placeholder="Name & Signature"
                  value={currentReport.prepared_by_name || ''}
                  onChange={(e) => handleMetaEdit('prepared_by_name', e.target.value)}
                />
                <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.prepared_by_name || ''}</div>
                <input
                  type="text"
                  className="sig-role-input screen-only"
                  placeholder="Role (e.g. S.H.E Specialist)"
                  value={currentReport.prepared_by_role || ''}
                  onChange={(e) => handleMetaEdit('prepared_by_role', e.target.value)}
                />
                <div className="print-only cell-print-text" style={{ color: '#444', fontSize: '9px' }}>{currentReport.prepared_by_role || ''}</div>
              </div>
            </div>

            <div className="sig-block-group" style={{ marginTop: '20px' }}>
              <div className="sig-block-title">Approved by:</div>
              <div className="sig-block-body">
                <input
                  type="text"
                  className="sig-name-input screen-only"
                  placeholder="Name & Signature"
                  value={currentReport.approved_by_name || ''}
                  onChange={(e) => handleMetaEdit('approved_by_name', e.target.value)}
                />
                <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.approved_by_name || ''}</div>
                <input
                  type="text"
                  className="sig-role-input screen-only"
                  placeholder="Role (e.g. VP Safety)"
                  value={currentReport.approved_by_role || ''}
                  onChange={(e) => handleMetaEdit('approved_by_role', e.target.value)}
                />
                <div className="print-only cell-print-text" style={{ color: '#444', fontSize: '9px' }}>{currentReport.approved_by_role || ''}</div>
              </div>
            </div>
          </div>
          <div className="sig-bottom-bar">
            Name and Signature
          </div>
        </div>

        {/* Right Column */}
        <div className="sig-column">
          <div className="sig-column-content">
            <div className="sig-block-group">
              <div className="sig-block-title">Acknowledged by:</div>
              <div className="sig-block-body">
                <input
                  type="text"
                  className="sig-name-input screen-only"
                  placeholder="Name & Signature"
                  value={currentReport.acknowledged_by_name || ''}
                  onChange={(e) => handleMetaEdit('acknowledged_by_name', e.target.value)}
                />
                <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.acknowledged_by_name || ''}</div>
                <input
                  type="text"
                  className="sig-role-input screen-only"
                  placeholder="Role (e.g. GSE Manager)"
                  value={currentReport.acknowledged_by_role || ''}
                  onChange={(e) => handleMetaEdit('acknowledged_by_role', e.target.value)}
                />
                <div className="print-only cell-print-text" style={{ color: '#444', fontSize: '9px' }}>{currentReport.acknowledged_by_role || ''}</div>
              </div>
            </div>

            <div className="sig-block-group" style={{ marginTop: '20px' }}>
              <div className="sig-block-title" style={{ fontStyle: 'italic', textTransform: 'none' }}>Remarks:</div>
              <div className="sig-block-body">
                <AutoResizeTextarea
                  className="cell-editable screen-only"
                  placeholder="General report remarks or comments..."
                  value={currentReport.footer_remarks || ''}
                  onChange={(e) => handleMetaEdit('footer_remarks', e.target.value)}
                />
                <div className="print-only cell-print-text remarks-print-text" style={{ textAlign: 'left' }}>{currentReport.footer_remarks || ''}</div>
              </div>
            </div>
          </div>
          <div className="sig-bottom-bar">
            Name and Signature
          </div>
        </div>
      </div>

      <div className="delete-report-container screen-only">
        <button 
          type="button" 
          className="btn-delete-report" 
          onClick={() => handleDeleteReport(currentReport.id)}
        >
          Delete This Report
        </button>
      </div>
    </div>
  );
}
