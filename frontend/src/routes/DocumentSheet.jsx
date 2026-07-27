import { useState, useEffect } from 'react';
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
  rows = [],
  isReportLoading,
  handleCellEdit,
  handleMetaEdit,
  handleAddRow,
  handleDeleteRow,
  handleDeleteReport
}) {
  const [mobileActiveRowIndex, setMobileActiveRowIndex] = useState(0);

  // Keep mobile active row index bounded safely
  useEffect(() => {
    if (rows && rows.length > 0 && mobileActiveRowIndex >= rows.length) {
      setMobileActiveRowIndex(Math.max(0, rows.length - 1));
    }
  }, [rows, mobileActiveRowIndex]);

  if (!currentReport) return null;

  const activeRow = rows && rows.length > 0 ? rows[mobileActiveRowIndex] : null;

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
              <AutoResizeTextarea
                className="meta-textarea screen-only"
                value={currentReport.title || ''}
                onChange={(e) => handleMetaEdit('title', e.target.value)}
                placeholder="Enter report title..."
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
              <AutoResizeTextarea
                className="meta-textarea screen-only"
                value={currentReport.department || ''}
                onChange={(e) => handleMetaEdit('department', e.target.value)}
                placeholder="Enter department..."
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.department || ''}</div>
            </td>
            <td className="meta-label" style={{ width: '15%' }}>LOCATION:</td>
            <td className="meta-value" style={{ width: '25%' }}>
              <AutoResizeTextarea
                className="meta-textarea screen-only"
                value={currentReport.location || ''}
                onChange={(e) => handleMetaEdit('location', e.target.value)}
                placeholder="Enter location..."
              />
              <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.location || ''}</div>
            </td>
          </tr>
          <tr>
            <td className="meta-label">ACTIVITY/AREA ASSESSED:</td>
            <td className="meta-value" colSpan={3}>
              <AutoResizeTextarea
                className="meta-textarea screen-only"
                value={currentReport.activity_assessed || ''}
                onChange={(e) => handleMetaEdit('activity_assessed', e.target.value)}
                placeholder="Enter activity assessed..."
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

      {/* Editable HIRAC Grid (Desktop Table View) */}
      <div className="hirac-table-container screen-only-desktop">
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

      <div className="add-row-container screen-only-desktop">
        <button className="btn-add-row" onClick={handleAddRow}>+ Add New Hazard Row</button>
      </div>

      {/* Mobile Paginated Single-Row Card View (Screen Only on <= 768px) */}
      <div className="mobile-hirac-container screen-only-mobile">
        {activeRow ? (
          <div className="mobile-row-card">
            {/* 1. TOP: Minimal Row Header */}
            <div className="mobile-row-top-bar">
              <span className="mobile-row-title-text">Hazard Row {mobileActiveRowIndex + 1} of {rows.length}</span>
              <button
                type="button"
                className="mobile-delete-icon-btn"
                onClick={() => {
                  const deleted = handleDeleteRow(mobileActiveRowIndex);
                  if (deleted && mobileActiveRowIndex >= rows.length - 1) {
                    setMobileActiveRowIndex(Math.max(0, rows.length - 2));
                  }
                }}
                title="Delete Row"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Delete Row</span>
              </button>
            </div>

            {/* 2. MIDDLE: Row Fields Content */}
            <div className="mobile-row-fields">
              <div className="mobile-field-group">
                <label className="mobile-field-label">TYPE OF OPERATION OR ACTIVITY:</label>
                <AutoResizeTextarea
                  className="mobile-field-input op-type-text"
                  value={activeRow.operation_type || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'operation_type', e.target.value)}
                  placeholder="Enter operation or activity..."
                />
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">GENERIC HAZARD:</label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.generic_hazard || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'generic_hazard', e.target.value)}
                  placeholder="Enter generic hazard..."
                />
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">RISKS (CONSEQUENCES OF THE HAZARD):</label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.risks || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'risks', e.target.value)}
                  placeholder="Enter risks..."
                />
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">EXISTING DEFENSES TO CONTROL SAFETY RISKS:</label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.existing_defenses || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'existing_defenses', e.target.value)}
                  placeholder="Enter existing defenses..."
                />
              </div>

              {/* Safety Risk Index */}
              <div className="mobile-field-group">
                <label className="mobile-field-label">SAFETY RISK INDEX:</label>
                <div className={`mobile-risk-widget risk-${getRiskClass(activeRow.initial_risk_index)}`}>
                  <div className="risk-level-label">
                    {activeRow.initial_risk_index ? activeRow.initial_risk_index.toUpperCase() : 'LOW'}
                    <span className="risk-score-number"> ({getRiskCode(activeRow.initial_likelihood, activeRow.initial_severity)})</span>
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
                            className={`risk-circle-btn ${(activeRow.initial_likelihood || 3) === opt.val ? 'active' : ''}`}
                            onClick={() => handleCellEdit(mobileActiveRowIndex, 'initial_likelihood', opt.val)}
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
                            className={`risk-circle-btn ${(activeRow.initial_severity || 3) === v ? 'active' : ''}`}
                            onClick={() => handleCellEdit(mobileActiveRowIndex, 'initial_severity', v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">
                  MITIGATING ACTIONS TO FURTHER REDUCE SAFETY RISKS
                  <div className="header-subtext" style={{ color: '#64748b' }}>(a) Elimination (b) Substitution (c) Engineering control (d) Administrative (e) PPE</div>
                </label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.mitigating_actions || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'mitigating_actions', e.target.value)}
                  placeholder="Enter mitigating actions..."
                />
              </div>

              {/* Residual Risk Index */}
              <div className="mobile-field-group">
                <label className="mobile-field-label">RESIDUAL RISK INDEX:</label>
                <div className={`mobile-risk-widget risk-${getRiskClass(activeRow.residual_risk_index)}`}>
                  <div className="risk-level-label">
                    {activeRow.residual_risk_index ? activeRow.residual_risk_index.toUpperCase() : 'LOW'}
                    <span className="risk-score-number"> ({getRiskCode(activeRow.residual_likelihood, activeRow.residual_severity)})</span>
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
                            className={`risk-circle-btn ${(activeRow.residual_likelihood || 2) === opt.val ? 'active' : ''}`}
                            onClick={() => handleCellEdit(mobileActiveRowIndex, 'residual_likelihood', opt.val)}
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
                            className={`risk-circle-btn ${(activeRow.residual_severity || 2) === v ? 'active' : ''}`}
                            onClick={() => handleCellEdit(mobileActiveRowIndex, 'residual_severity', v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">REMARKS:</label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.remarks || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'remarks', e.target.value)}
                  placeholder="Enter remarks..."
                />
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">TARGET DATE:</label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.target_date || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'target_date', e.target.value)}
                  placeholder="e.g. 2026-12-31"
                />
              </div>

              <div className="mobile-field-group">
                <label className="mobile-field-label">DEPT RESPONSIBLE:</label>
                <AutoResizeTextarea
                  className="mobile-field-input"
                  value={activeRow.department_responsible || ''}
                  onChange={(e) => handleCellEdit(mobileActiveRowIndex, 'department_responsible', e.target.value)}
                  placeholder="Enter department responsible..."
                />
              </div>
            </div>

            {/* 3. BELOW CONTENT: Horizontal Scrollable Pagination Controls */}
            <div className="mobile-pagination-bar">
              <button
                type="button"
                className="mobile-page-nav-btn"
                disabled={mobileActiveRowIndex === 0}
                onClick={() => setMobileActiveRowIndex(prev => Math.max(0, prev - 1))}
                title="Previous Row"
              >
                ‹
              </button>
              <div className="mobile-page-dots">
                {rows.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`mobile-dot-btn ${i === mobileActiveRowIndex ? 'active' : ''}`}
                    onClick={() => setMobileActiveRowIndex(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mobile-page-nav-btn"
                disabled={mobileActiveRowIndex >= rows.length - 1}
                onClick={() => setMobileActiveRowIndex(prev => Math.min(rows.length - 1, prev + 1))}
                title="Next Row"
              >
                ›
              </button>
            </div>

            {/* 4. BELOW PAGINATION: Add Row Button */}
            <div className="mobile-add-row-wrapper">
              <button
                type="button"
                className="btn-add-row-mobile"
                onClick={() => {
                  handleAddRow();
                  setMobileActiveRowIndex(rows.length);
                }}
              >
                + Add New Hazard Row
              </button>
            </div>
          </div>
        ) : (
          <div className="mobile-empty-rows-card">
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '12px' }}>No hazard rows found.</p>
            <button
              type="button"
              className="btn-add-row-mobile"
              onClick={() => {
                handleAddRow();
                setMobileActiveRowIndex(0);
              }}
            >
              + Add New Hazard Row
            </button>
          </div>
        )}
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

      {/* Document Footer — doc code + revision (right-aligned, editable) */}
      <div className="doc-footer">
        <div className="doc-footer-fields">
          <input
            type="text"
            className="doc-footer-input screen-only"
            placeholder="Doc Code (e.g. SSQA - 009)"
            value={currentReport.doc_code !== undefined ? currentReport.doc_code : 'SSQA - 009'}
            onChange={(e) => handleMetaEdit('doc_code', e.target.value)}
          />
          <div className="print-only doc-footer-text">{currentReport.doc_code !== undefined ? currentReport.doc_code : 'SSQA - 009'}</div>

          <input
            type="text"
            className="doc-footer-input screen-only"
            placeholder="Revision (e.g. FEB2023/Rev06)"
            value={currentReport.doc_revision !== undefined ? currentReport.doc_revision : 'FEB2023/Rev06'}
            onChange={(e) => handleMetaEdit('doc_revision', e.target.value)}
          />
          <div className="print-only doc-footer-text">{currentReport.doc_revision !== undefined ? currentReport.doc_revision : 'FEB2023/Rev06'}</div>
        </div>
      </div>
    </div>
  );
}
