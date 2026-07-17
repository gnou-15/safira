import React from 'react';
import AutoResizeTextarea from '../components/AutoResizeTextarea';
import '../css/InvestigationReport.css';
import '../css/InvestigationReportPrint.css';
import InvestigationReportPrint from '../components/InvestigationReportPrint';

export default function InvestigationReport({
  currentInvestigation,
  handleFieldEdit,
  handleDeleteInvestigation,
  hasChanges,
  handleExitToLanding
}) {
  if (!currentInvestigation) return null;

  // Helpers to update JSON arrays (Analysis, Root Cause, etc.)
  const handleArrayElementChange = (field, index, value) => {
    const list = [...(currentInvestigation[field] || [])];
    list[index] = value;
    handleFieldEdit(field, list);
  };

  const handleAddArrayElement = (field) => {
    const list = [...(currentInvestigation[field] || [])];
    list.push('');
    handleFieldEdit(field, list);
  };

  const handleRemoveArrayElement = (field, index) => {
    const list = [...(currentInvestigation[field] || [])];
    list.splice(index, 1);
    handleFieldEdit(field, list);
  };

  // Helper to trigger print dialog
  const handlePrint = () => {
    window.print();
  };

  // Formats risk index background styling dynamically
  const getRiskIndexStyle = (indexStr) => {
    if (!indexStr) return {};
    const lower = indexStr.toLowerCase();
    if (lower.includes('low')) {
      return { backgroundColor: '#22c55e', color: '#ffffff' };
    } else if (lower.includes('medium') || lower.includes('moderate')) {
      return { backgroundColor: '#eab308', color: '#ffffff' };
    } else if (lower.includes('high')) {
      return { backgroundColor: '#f97316', color: '#ffffff' };
    } else if (lower.includes('extreme') || lower.includes('critical')) {
      return { backgroundColor: '#ef4444', color: '#ffffff' };
    }
    return { backgroundColor: '#f1f5f9', color: '#3b1c14' };
  };

  return (
    <div className="investigation-report-page">
      {/* Main Print Container Sheet */}
      <div className="investigation-sheet-canvas">
        {/* Document Header */}
        <div className="inv-sheet-header">
          <div className="inv-header-meta">
            <input 
              type="text" 
              className="inv-meta-input ref-no" 
              value={currentInvestigation.ref_no || ''} 
              onChange={(e) => handleFieldEdit('ref_no', e.target.value)}
              placeholder="Ref No."
            />
            <input 
              type="text" 
              className="inv-meta-input rev-info" 
              value={currentInvestigation.revision_info || ''} 
              onChange={(e) => handleFieldEdit('revision_info', e.target.value)}
              placeholder="Revision Info"
            />
          </div>
          
          <div className="inv-header-logo">
            <img src="/PAGSS.png" alt="PAGSS Logo" className="inv-logo-img" />
          </div>
        </div>

        {/* Main Document Title */}
        <div className="inv-title-container">
          <AutoResizeTextarea
            className="inv-title-textarea"
            value={currentInvestigation.title || ''}
            onChange={(e) => handleFieldEdit('title', e.target.value)}
            placeholder="Investigation Report Title"
          />
        </div>

        {/* Executive Summary input (editable inline) */}
        <div className="inv-section-card">
          <h4 className="inv-section-title">EXECUTIVE SUMMARY</h4>
          <AutoResizeTextarea
            className="inv-section-textarea"
            value={currentInvestigation.executive_summary || ''}
            onChange={(e) => handleFieldEdit('executive_summary', e.target.value)}
            placeholder="Executive summary describing the incident scenario..."
          />
        </div>

        {/* Section 1: Factual Information */}
        <div className="inv-section-card">
          <h3 className="inv-heading">1. Factual Information</h3>
          
          {/* 1.1 Operational Irregularity */}
          <div className="inv-sub-section">
            <h4 className="inv-sub-heading">1.1 Operational Irregularity</h4>
            <AutoResizeTextarea
              className="inv-section-textarea"
              value={currentInvestigation.operational_irregularity || ''}
              onChange={(e) => handleFieldEdit('operational_irregularity', e.target.value)}
              placeholder="Describe the operational irregularity in one summary sentence..."
            />
          </div>

          {/* 1.2 Risk Index */}
          <div className="inv-sub-section">
            <h4 className="inv-sub-heading">1.2 Risk Index</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="text" 
                className="inv-risk-index-input" 
                value={currentInvestigation.risk_index || ''} 
                onChange={(e) => handleFieldEdit('risk_index', e.target.value)}
                style={getRiskIndexStyle(currentInvestigation.risk_index)}
                placeholder="e.g. 2D - LOW"
              />
              <span className="screen-only" style={{ fontSize: '11px', color: '#64748b' }}>
                (Type 'low', 'medium', 'high', or 'extreme' to auto-color code)
              </span>
            </div>
          </div>

          {/* 1.3 Personnel Information Table */}
          <div className="inv-sub-section">
            <h4 className="inv-sub-heading">1.3 Personnel Information</h4>
            <table className="inv-personnel-table">
              <tbody>
                <tr>
                  <td className="table-label">ID Number</td>
                  <td className="table-value">
                    <input 
                      type="text" 
                      value={currentInvestigation.id_number || ''} 
                      onChange={(e) => handleFieldEdit('id_number', e.target.value)}
                      placeholder="Enter ID number"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="table-label">Position</td>
                  <td className="table-value">
                    <input 
                      type="text" 
                      value={currentInvestigation.position || ''} 
                      onChange={(e) => handleFieldEdit('position', e.target.value)}
                      placeholder="Enter position"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="table-label">Date of Hiring</td>
                  <td className="table-value">
                    <input 
                      type="text" 
                      value={currentInvestigation.date_of_hiring || ''} 
                      onChange={(e) => handleFieldEdit('date_of_hiring', e.target.value)}
                      placeholder="Enter hiring date"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="table-label">Trainings</td>
                  <td className="table-value">
                    <AutoResizeTextarea
                      className="table-textarea"
                      value={currentInvestigation.trainings || ''}
                      onChange={(e) => handleFieldEdit('trainings', e.target.value)}
                      placeholder="Enter safety trainings"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Analysis */}
        <div className="inv-section-card">
          <h3 className="inv-heading">2. Analysis</h3>
          <div className="bullet-items-list">
            {(currentInvestigation.analysis || []).map((bullet, idx) => (
              <div key={idx} className="bullet-item-row">
                <span className="bullet-label">{String.fromCharCode(97 + idx)})</span>
                <AutoResizeTextarea
                  className="bullet-textarea"
                  value={bullet}
                  onChange={(e) => handleArrayElementChange('analysis', idx, e.target.value)}
                  placeholder="Analysis description..."
                />
                <button 
                  type="button" 
                  className="btn-remove-bullet screen-only" 
                  onClick={() => handleRemoveArrayElement('analysis', idx)}
                  title="Remove analysis bullet"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-add-bullet screen-only" 
              onClick={() => handleAddArrayElement('analysis')}
            >
              + Add Analysis Bullet
            </button>
          </div>
        </div>

        {/* Section 3: Root Cause */}
        <div className="inv-section-card">
          <h3 className="inv-heading">3. Root Cause</h3>
          <div className="bullet-items-list">
            {(currentInvestigation.root_cause || []).map((bullet, idx) => (
              <div key={idx} className="bullet-item-row">
                <span className="bullet-label">{String.fromCharCode(97 + idx)})</span>
                <AutoResizeTextarea
                  className="bullet-textarea"
                  value={bullet}
                  onChange={(e) => handleArrayElementChange('root_cause', idx, e.target.value)}
                  placeholder="Root cause detail..."
                />
                <button 
                  type="button" 
                  className="btn-remove-bullet screen-only" 
                  onClick={() => handleRemoveArrayElement('root_cause', idx)}
                  title="Remove root cause"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-add-bullet screen-only" 
              onClick={() => handleAddArrayElement('root_cause')}
            >
              + Add Root Cause
            </button>
          </div>
        </div>

        {/* Section 4: Immediate/Corrective Action */}
        <div className="inv-section-card">
          <h3 className="inv-heading">4. Immediate/Corrective Action</h3>
          <div className="bullet-items-list">
            {(currentInvestigation.corrective_action || []).map((bullet, idx) => (
              <div key={idx} className="bullet-item-row">
                <span className="bullet-label">{String.fromCharCode(97 + idx)})</span>
                <AutoResizeTextarea
                  className="bullet-textarea"
                  value={bullet}
                  onChange={(e) => handleArrayElementChange('corrective_action', idx, e.target.value)}
                  placeholder="Corrective action..."
                />
                <button 
                  type="button" 
                  className="btn-remove-bullet screen-only" 
                  onClick={() => handleRemoveArrayElement('corrective_action', idx)}
                  title="Remove corrective action"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-add-bullet screen-only" 
              onClick={() => handleAddArrayElement('corrective_action')}
            >
              + Add Corrective Action
            </button>
          </div>
        </div>

        {/* Section 5: Preventive Action */}
        <div className="inv-section-card">
          <h3 className="inv-heading">5. Preventive Action</h3>
          <div className="bullet-items-list">
            {(currentInvestigation.preventive_action || []).map((bullet, idx) => (
              <div key={idx} className="bullet-item-row">
                <span className="bullet-label">{String.fromCharCode(97 + idx)})</span>
                <AutoResizeTextarea
                  className="bullet-textarea"
                  value={bullet}
                  onChange={(e) => handleArrayElementChange('preventive_action', idx, e.target.value)}
                  placeholder="Preventive action..."
                />
                <button 
                  type="button" 
                  className="btn-remove-bullet screen-only" 
                  onClick={() => handleRemoveArrayElement('preventive_action', idx)}
                  title="Remove preventive action"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-add-bullet screen-only" 
              onClick={() => handleAddArrayElement('preventive_action')}
            >
              + Add Preventive Action
            </button>
          </div>
        </div>

        {/* Section 6: References */}
        <div className="inv-section-card">
          <h3 className="inv-heading">6. References</h3>
          <AutoResizeTextarea
            className="inv-section-textarea references"
            value={currentInvestigation.references_text || ''}
            onChange={(e) => handleFieldEdit('references_text', e.target.value)}
            placeholder="References list..."
          />
        </div>

        {/* Section 7: Investigation Team Signatures */}
        <div className="inv-section-card page-break-avoid">
          <h3 className="inv-heading">7. Investigation Team</h3>
          
          <div className="inv-signatures-layout">
            <div className="inv-sig-box">
              <span className="sig-header-label">Prepared by:</span>
              <div className="sig-line-container">
                <input 
                  type="text" 
                  className="sig-input-name" 
                  value={currentInvestigation.prepared_by_name || ''} 
                  onChange={(e) => handleFieldEdit('prepared_by_name', e.target.value)}
                  placeholder="Prepared by name"
                />
                <input 
                  type="text" 
                  className="sig-input-role" 
                  value={currentInvestigation.prepared_by_role || ''} 
                  onChange={(e) => handleFieldEdit('prepared_by_role', e.target.value)}
                  placeholder="Prepared by role"
                />
              </div>
            </div>

            <div className="inv-sig-box">
              <span className="sig-header-label">Approved by:</span>
              <div className="sig-line-container">
                <input 
                  type="text" 
                  className="sig-input-name" 
                  value={currentInvestigation.approved_by_name || ''} 
                  onChange={(e) => handleFieldEdit('approved_by_name', e.target.value)}
                  placeholder="Approved by name"
                />
                <input 
                  type="text" 
                  className="sig-input-role" 
                  value={currentInvestigation.approved_by_role || ''} 
                  onChange={(e) => handleFieldEdit('approved_by_role', e.target.value)}
                  placeholder="Approved by role"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button Container */}
      <div className="delete-report-container screen-only">
        <button 
          type="button" 
          className="btn-delete-report" 
          onClick={() => handleDeleteInvestigation(currentInvestigation.id)}
        >
          Delete This Report
        </button>
      </div>

      {/* Print-Only Version (Exactly formatted as Portrait PDF) */}
      <InvestigationReportPrint currentInvestigation={currentInvestigation} />
    </div>
  );
}
