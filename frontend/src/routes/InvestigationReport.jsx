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

  // Helpers to update JSON arrays
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

  // Helper to estimate block height in pixels based on text length
  const estimateTextareaHeight = (text, minHeight = 45, charsPerLine = 80) => {
    if (!text) return minHeight;
    const lines = text.split('\n');
    let totalLines = 0;
    lines.forEach(l => {
      totalLines += Math.max(1, Math.ceil(l.length / charsPerLine));
    });
    return Math.max(minHeight, totalLines * 20 + 20);
  };

  // ── Build granular blocks with estimated heights ─────────────────
  const blocks = [];

  // Title + Executive Summary Block
  const execText = currentInvestigation.executive_summary || '';
  blocks.push({
    id: 'block_title_exec',
    estimatedHeight: 120 + estimateTextareaHeight(execText, 60),
    render: () => (
      <>
        <div className="inv-title-container" style={{ margin: '0 0 16px 0' }}>
          <AutoResizeTextarea
            className="inv-title-textarea"
            value={currentInvestigation.title || ''}
            onChange={(e) => handleFieldEdit('title', e.target.value)}
            placeholder="Investigation Report Title"
          />
        </div>
        <div className="inv-section-card" style={{ marginBottom: '16px' }}>
          <h4 className="inv-section-title">EXECUTIVE SUMMARY</h4>
          <AutoResizeTextarea
            className="inv-section-textarea"
            value={execText}
            onChange={(e) => handleFieldEdit('executive_summary', e.target.value)}
            placeholder="Executive summary describing the incident scenario..."
          />
        </div>
      </>
    )
  });

  // Section 1: Factual Information
  const opText = currentInvestigation.operational_irregularity || '';
  blocks.push({
    id: 'block_sec_1',
    estimatedHeight: 35 + estimateTextareaHeight(opText, 45) + 50 + 175,
    render: () => (
      <div className="inv-section-card" style={{ marginBottom: '16px' }}>
        <h3 className="inv-heading">1. Factual Information</h3>
        <div className="inv-sub-section">
          <h4 className="inv-sub-heading">1.1 Operational Irregularity</h4>
          <AutoResizeTextarea
            className="inv-section-textarea"
            value={opText}
            onChange={(e) => handleFieldEdit('operational_irregularity', e.target.value)}
            placeholder="Describe the operational irregularity in one summary sentence..."
          />
        </div>
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
    )
  });

  // Section 2: Analysis Heading
  blocks.push({
    id: 'block_sec_2_heading',
    estimatedHeight: 35,
    render: () => <h3 className="inv-heading" style={{ marginTop: '8px', marginBottom: '8px' }}>2. Analysis</h3>
  });

  const analysisItems = currentInvestigation.analysis || [];
  analysisItems.forEach((bullet, idx) => {
    blocks.push({
      id: `block_sec_2_item_${idx}`,
      estimatedHeight: estimateTextareaHeight(bullet, 45),
      render: () => (
        <div key={idx} className="bullet-item-row" style={{ marginBottom: '6px' }}>
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
      )
    });
  });

  blocks.push({
    id: 'block_sec_2_add',
    estimatedHeight: 30,
    render: () => (
      <div className="screen-only" style={{ margin: '4px 0 14px 20px' }}>
        <button 
          type="button" 
          className="btn-add-bullet" 
          onClick={() => handleAddArrayElement('analysis')}
        >
          + Add Analysis Bullet
        </button>
      </div>
    )
  });

  // Section 3: Root Cause Heading
  blocks.push({
    id: 'block_sec_3_heading',
    estimatedHeight: 35,
    render: () => <h3 className="inv-heading" style={{ marginTop: '8px', marginBottom: '8px' }}>3. Root Cause</h3>
  });

  const rootCauseItems = currentInvestigation.root_cause || [];
  rootCauseItems.forEach((bullet, idx) => {
    blocks.push({
      id: `block_sec_3_item_${idx}`,
      estimatedHeight: estimateTextareaHeight(bullet, 45),
      render: () => (
        <div key={idx} className="bullet-item-row" style={{ marginBottom: '6px' }}>
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
      )
    });
  });

  blocks.push({
    id: 'block_sec_3_add',
    estimatedHeight: 30,
    render: () => (
      <div className="screen-only" style={{ margin: '4px 0 14px 20px' }}>
        <button 
          type="button" 
          className="btn-add-bullet" 
          onClick={() => handleAddArrayElement('root_cause')}
        >
          + Add Root Cause
        </button>
      </div>
    )
  });

  // Section 4: Immediate/Corrective Action Heading
  blocks.push({
    id: 'block_sec_4_heading',
    estimatedHeight: 35,
    render: () => <h3 className="inv-heading" style={{ marginTop: '8px', marginBottom: '8px' }}>4. Immediate/Corrective Action</h3>
  });

  const correctiveItems = currentInvestigation.corrective_action || [];
  correctiveItems.forEach((bullet, idx) => {
    blocks.push({
      id: `block_sec_4_item_${idx}`,
      estimatedHeight: estimateTextareaHeight(bullet, 45),
      render: () => (
        <div key={idx} className="bullet-item-row" style={{ marginBottom: '6px' }}>
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
      )
    });
  });

  blocks.push({
    id: 'block_sec_4_add',
    estimatedHeight: 30,
    render: () => (
      <div className="screen-only" style={{ margin: '4px 0 14px 20px' }}>
        <button 
          type="button" 
          className="btn-add-bullet" 
          onClick={() => handleAddArrayElement('corrective_action')}
        >
          + Add Corrective Action
        </button>
      </div>
    )
  });

  // Section 5: Preventive Action Heading
  blocks.push({
    id: 'block_sec_5_heading',
    estimatedHeight: 35,
    render: () => <h3 className="inv-heading" style={{ marginTop: '8px', marginBottom: '8px' }}>5. Preventive Action</h3>
  });

  const preventiveItems = currentInvestigation.preventive_action || [];
  preventiveItems.forEach((bullet, idx) => {
    blocks.push({
      id: `block_sec_5_item_${idx}`,
      estimatedHeight: estimateTextareaHeight(bullet, 45),
      render: () => (
        <div key={idx} className="bullet-item-row" style={{ marginBottom: '6px' }}>
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
      )
    });
  });

  blocks.push({
    id: 'block_sec_5_add',
    estimatedHeight: 30,
    render: () => (
      <div className="screen-only" style={{ margin: '4px 0 14px 20px' }}>
        <button 
          type="button" 
          className="btn-add-bullet" 
          onClick={() => handleAddArrayElement('preventive_action')}
        >
          + Add Preventive Action
        </button>
      </div>
    )
  });

  // Section 6: References
  const refText = currentInvestigation.references_text || '';
  blocks.push({
    id: 'block_sec_6',
    estimatedHeight: 35 + estimateTextareaHeight(refText, 45),
    render: () => (
      <div className="inv-section-card" style={{ marginBottom: '16px' }}>
        <h3 className="inv-heading">6. References</h3>
        <AutoResizeTextarea
          className="inv-section-textarea references"
          value={refText}
          onChange={(e) => handleFieldEdit('references_text', e.target.value)}
          placeholder="References list..."
        />
      </div>
    )
  });

  // Section 7: Investigation Team Signatures
  blocks.push({
    id: 'block_sec_7',
    estimatedHeight: 200,
    render: () => (
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
    )
  });

  return (
    <div className="investigation-report-page">
      {/* Editor: Single Continuous Worksheet */}
      <div className="investigation-sheet-canvas">
        {/* Header */}
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

        {/* All content blocks in one continuous flow */}
        <div className="inv-page-content-body">
          {blocks.map(b => (
            <React.Fragment key={b.id}>
              {b.render()}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Delete Button */}
      <div className="delete-report-container screen-only">
        <button
          type="button"
          className="btn-delete-report"
          onClick={() => handleDeleteInvestigation(currentInvestigation.id)}
        >
          Delete This Report
        </button>
      </div>

      {/* Clean Static 5-Page PDF Export */}
      <InvestigationReportPrint currentInvestigation={currentInvestigation} />
    </div>
  );
}
