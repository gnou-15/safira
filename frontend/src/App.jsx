import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // App State
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  
  // Chat Sidebar State
  const [chatOpen, setChatOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am SAFIRA, your airport safety AI assistant. Describe an incident or select a report to get started. I can help explain regulations or make inline edits to your report.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // New Report Modal State
  const [showModal, setShowModal] = useState(false);
  const [incidentPrompt, setIncidentPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newReportMeta, setNewReportMeta] = useState({
    title: 'Earthquake and Calamities - Airport Operations',
    location: 'Mactan Cebu International Airport T1 and T2',
    activity_assessed: 'Terminal & Ramp Operations',
    assessor_team: 'Safety Security & Quality Assurance (SSQA)'
  });

  // Ref to track the 5-second idle timer
  const idleTimerRef = useRef(null);

  // Fetch list of all reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        // Load first report if available
        if (data.length > 0 && !currentReport) {
          loadReport(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const loadReport = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        const { rows: fetchedRows, ...meta } = data;
        setCurrentReport(meta);
        setRows(fetchedRows || []);
        setHasChanges(false);
        setShowSavePrompt(false);
      }
    } catch (err) {
      console.error(`Failed to load report ${id}:`, err);
    }
  };

  // Triggers 5-second idle timer on change
  const markChanged = () => {
    setHasChanges(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // Show prompt after 5 seconds of inactivity
    idleTimerRef.current = setTimeout(() => {
      setShowSavePrompt(true);
    }, 5000);
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Save changes (rows + metadata) to Supabase
  const handleSave = async () => {
    if (!currentReport) return;
    setIsSaving(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    try {
      // 1. Update report metadata
      const metaRes = await fetch(`${API_URL}/api/reports/${currentReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentReport)
      });

      if (!metaRes.ok) throw new Error('Failed to save report headers');

      // 2. Update report rows
      const rowsRes = await fetch(`${API_URL}/api/reports/${currentReport.id}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });

      if (!rowsRes.ok) throw new Error('Failed to save table rows');

      setHasChanges(false);
      setShowSavePrompt(false);
      fetchReports();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes and reload from db
  const handleDiscard = () => {
    if (currentReport) {
      loadReport(currentReport.id);
    }
  };

  // Create a new empty row
  const handleAddRow = () => {
    const newRow = {
      operation_type: 'Passenger terminal operations',
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
      department_responsible: 'SSQA'
    };
    setRows([...rows, newRow]);
    markChanged();
  };

  // Delete a specific row
  const handleDeleteRow = (index) => {
    const updated = rows.filter((_, idx) => idx !== index);
    setRows(updated);
    markChanged();
  };

  // Edit cell value directly
  const handleCellEdit = (index, field, value) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };

    // Automatically recalculate Risk Levels if L or S changes
    if (field === 'initial_likelihood' || field === 'initial_severity') {
      const l = parseInt(updated[index].initial_likelihood) || 1;
      const s = parseInt(updated[index].initial_severity) || 1;
      const score = l * s;
      updated[index].initial_risk_score = score;
      updated[index].initial_risk_index = getRiskLevel(score);
    }

    if (field === 'residual_likelihood' || field === 'residual_severity') {
      const l = parseInt(updated[index].residual_likelihood) || 1;
      const s = parseInt(updated[index].residual_severity) || 1;
      const score = l * s;
      updated[index].residual_risk_score = score;
      updated[index].residual_risk_index = getRiskLevel(score);
    }

    setRows(updated);
    markChanged();
  };

  // Mathematical classification helper
  const getRiskLevel = (score) => {
    if (score <= 4) return 'Low';
    if (score <= 12) return 'Medium';
    return 'High';
  };

  // Meta header editing handler
  const handleMetaEdit = (field, value) => {
    setCurrentReport({ ...currentReport, [field]: value });
    markChanged();
  };

  // Create report using AI generation prompt
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!incidentPrompt.trim()) return;
    setIsGenerating(true);

    try {
      // 1. Generate Rows using Groq Proxy
      const aiRes = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_prompt: incidentPrompt,
          location: newReportMeta.location,
          department: newReportMeta.department
        })
      });

      if (!aiRes.ok) throw new Error('AI Generation failed');
      const generatedRows = await aiRes.json();

      // 2. Save metadata and get report ID
      const metaRes = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newReportMeta.title,
          location: newReportMeta.location,
          activity_assessed: newReportMeta.activity_assessed,
          assessor_team: newReportMeta.assessor_team,
          department: newReportMeta.department,
          ref_no: `CSC-${Date.now().toString().slice(-4)}`
        })
      });

      if (!metaRes.ok) throw new Error('Failed to create report database entry');
      const savedReportMeta = await metaRes.json();

      // 3. Save generated rows to Supabase
      const rowsRes = await fetch(`${API_URL}/api/reports/${savedReportMeta.id}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: generatedRows })
      });

      if (!rowsRes.ok) throw new Error('Failed to save generated rows');

      // Refresh list, load new report, close modal
      setReports([savedReportMeta, ...reports]);
      setCurrentReport(savedReportMeta);
      setRows(generatedRows);
      setShowModal(false);
      setIncidentPrompt('');
      setChatHistory([
        { role: 'assistant', content: `Successfully generated HIRAC report for: "${newReportMeta.title}". You can now edit the cells directly or ask me to modify any specific rows.` }
      ]);
    } catch (err) {
      alert(`Error generating report: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send message to chatbot (RAG Chat API)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoadingChat) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoadingChat(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          chat_history: chatHistory.slice(-6),
          current_table: rows
        })
      });

      if (!res.ok) throw new Error('Failed to fetch AI reply');
      const data = await res.json();
      let replyContent = data.response;

      // Extract and execute TABLE_UPDATE_PAYLOAD if present
      const payloadRegex = /\[TABLE_UPDATE_PAYLOAD\]([\s\S]*?)\[\/TABLE_UPDATE_PAYLOAD\]/;
      const match = replyContent.match(payloadRegex);

      if (match) {
        try {
          const payload = JSON.parse(match[1].trim());
          executeTableUpdate(payload);
          // Strip payload from the visible text for the user
          replyContent = replyContent.replace(payloadRegex, '').trim();
        } catch (jsonErr) {
          console.error("Failed to parse update command:", jsonErr);
        }
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'system', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Perform chatbot-driven modifications
  const executeTableUpdate = (payload) => {
    const { action, row_index, data } = payload;
    let updated = [...rows];

    if (action === 'modify_row' && typeof row_index === 'number' && updated[row_index]) {
      updated[row_index] = { ...updated[row_index], ...data };
      // Redo risk indices
      if ('initial_likelihood' in data || 'initial_severity' in data) {
        const l = parseInt(updated[row_index].initial_likelihood) || 1;
        const s = parseInt(updated[row_index].initial_severity) || 1;
        updated[row_index].initial_risk_score = l * s;
        updated[row_index].initial_risk_index = getRiskLevel(l * s);
      }
      if ('residual_likelihood' in data || 'residual_severity' in data) {
        const l = parseInt(updated[row_index].residual_likelihood) || 1;
        const s = parseInt(updated[row_index].residual_severity) || 1;
        updated[row_index].residual_risk_score = l * s;
        updated[row_index].residual_risk_index = getRiskLevel(l * s);
      }
      setRows(updated);
      markChanged();
      setChatHistory(prev => [...prev, { role: 'system', content: `Applied edit to Row ${row_index + 1}` }]);
    } 
    else if (action === 'add_row' && data) {
      const fullNewRow = {
        operation_type: data.operation_type || 'Operations',
        generic_hazard: data.generic_hazard || 'Hazard',
        risks: data.risks || 'Risks',
        existing_defenses: data.existing_defenses || 'Defenses',
        initial_likelihood: data.initial_likelihood || 3,
        initial_severity: data.initial_severity || 3,
        initial_risk_score: (data.initial_likelihood || 3) * (data.initial_severity || 3),
        initial_risk_index: getRiskLevel((data.initial_likelihood || 3) * (data.initial_severity || 3)),
        mitigating_actions: data.mitigating_actions || '',
        residual_likelihood: data.residual_likelihood || 2,
        residual_severity: data.residual_severity || 2,
        residual_risk_score: (data.residual_likelihood || 2) * (data.residual_severity || 2),
        residual_risk_index: getRiskLevel((data.residual_likelihood || 2) * (data.residual_severity || 2)),
        remarks: data.remarks || '',
        target_date: data.target_date || '',
        department_responsible: data.department_responsible || 'Safety'
      };
      setRows([...rows, fullNewRow]);
      markChanged();
      setChatHistory(prev => [...prev, { role: 'system', content: 'Added a new row to the table.' }]);
    } 
    else if (action === 'delete_row' && typeof row_index === 'number') {
      handleDeleteRow(row_index);
    }
  };

  // Launch browser native print interface (styled by print stylesheet)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-nav">
        <div className="logo-container">
          <button className="brand-btn" onClick={() => fetchReports()}>SAFIRA</button>
        </div>
        <div className="nav-actions">
          <button className="btn-secondary" onClick={() => setShowModal(true)}>+ Generate New HIRAC</button>
          <button className="btn-primary" onClick={handlePrint}>Export PDF</button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-workspace">
        
        {/* Left sidebar: Reports list */}
        <aside className="reports-list-sidebar">
          <div className="sidebar-header">HIRAC Reports Archive</div>
          <div className="reports-menu-list">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`report-item ${currentReport?.id === report.id ? 'active' : ''}`}
                onClick={() => loadReport(report.id)}
              >
                {report.title}
              </div>
            ))}
          </div>
        </aside>

        {/* Center Canvas */}
        <section className="document-workspace">
          {currentReport ? (
            <div className="document-sheet">
              {/* Header Box */}
              <div className="doc-header-layout">
                {/* Simulated aviation logo wings */}
                <div className="logo-placeholder">
                  <svg viewBox="0 0 100 40" width="100%" height="40">
                    <path d="M10 20 L25 10 L40 20 L25 30 Z" fill="#7d8b99" />
                    <path d="M90 20 L75 10 L60 20 L75 30 Z" fill="#7d8b99" />
                    <text x="50" y="25" dominantBaseline="middle" textAnchor="middle" fontWeight="bold" fontSize="12" fill="#1a1a1a">PAGSS</text>
                  </svg>
                </div>
                <div className="doc-title-container">
                  <h2 className="doc-title">Hazard Identification, Risk Assessment & Control Report</h2>
                </div>
              </div>

              {/* Metadata Fields */}
              <table className="meta-table">
                <tbody>
                  <tr>
                    <td className="meta-label">B Title:</td>
                    <td className="meta-value" colSpan="3">
                      <input
                        type="text"
                        value={currentReport.title || ''}
                        onChange={(e) => handleMetaEdit('title', e.target.value)}
                      />
                    </td>
                    <td className="meta-label">HIRAC Ref No:</td>
                    <td className="meta-value">
                      <input
                        type="text"
                        value={currentReport.ref_no || ''}
                        onChange={(e) => handleMetaEdit('ref_no', e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-label">Department:</td>
                    <td className="meta-value">
                      <input
                        type="text"
                        value={currentReport.department || ''}
                        onChange={(e) => handleMetaEdit('department', e.target.value)}
                      />
                    </td>
                    <td className="meta-label">Location:</td>
                    <td className="meta-value" colSpan="3">
                      <input
                        type="text"
                        value={currentReport.location || ''}
                        onChange={(e) => handleMetaEdit('location', e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-label">Activity Assessed:</td>
                    <td className="meta-value" colSpan="3">
                      <input
                        type="text"
                        value={currentReport.activity_assessed || ''}
                        onChange={(e) => handleMetaEdit('activity_assessed', e.target.value)}
                      />
                    </td>
                    <td className="meta-label">Assessor Team:</td>
                    <td className="meta-value">
                      <input
                        type="text"
                        value={currentReport.assessor_team || ''}
                        onChange={(e) => handleMetaEdit('assessor_team', e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Editable HIRAC Grid */}
              <div className="hirac-table-container">
                <table className="hirac-table">
                  <thead>
                    <tr>
                      <th rowSpan="2" style={{ width: '12%' }}>Type of Operation or Activity</th>
                      <th rowSpan="2" style={{ width: '12%' }}>Generic Hazard</th>
                      <th rowSpan="2" style={{ width: '12%' }}>Risks (Consequences)</th>
                      <th rowSpan="2" style={{ width: '12%' }}>Existing Defenses</th>
                      <th colSpan="3">Initial Assessment</th>
                      <th rowSpan="2" style={{ width: '15%' }}>Mitigating Actions</th>
                      <th colSpan="3">Residual Assessment</th>
                      <th rowSpan="2" style={{ width: '8%' }}>Remarks</th>
                      <th rowSpan="2" style={{ width: '6%' }}>Target Date</th>
                      <th rowSpan="2" style={{ width: '8%' }}>Dept Responsible</th>
                      <th rowSpan="2" className="row-actions-td">Actions</th>
                    </tr>
                    <tr>
                      <th style={{ width: '2.5%' }}>L</th>
                      <th style={{ width: '2.5%' }}>S</th>
                      <th style={{ width: '4%' }}>Index</th>
                      <th style={{ width: '2.5%' }}>L</th>
                      <th style={{ width: '2.5%' }}>S</th>
                      <th style={{ width: '4%' }}>Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="op-type-text">
                          <textarea
                            className="cell-editable op-type-text"
                            value={row.operation_type || ''}
                            onChange={(e) => handleCellEdit(idx, 'operation_type', e.target.value)}
                          />
                        </td>
                        <td>
                          <textarea
                            className="cell-editable"
                            value={row.generic_hazard || ''}
                            onChange={(e) => handleCellEdit(idx, 'generic_hazard', e.target.value)}
                          />
                        </td>
                        <td>
                          <textarea
                            className="cell-editable"
                            value={row.risks || ''}
                            onChange={(e) => handleCellEdit(idx, 'risks', e.target.value)}
                          />
                        </td>
                        <td>
                          <textarea
                            className="cell-editable"
                            value={row.existing_defenses || ''}
                            onChange={(e) => handleCellEdit(idx, 'existing_defenses', e.target.value)}
                          />
                        </td>
                        
                        {/* Initial Assessment parameters */}
                        <td>
                          <select
                            className="cell-select"
                            value={row.initial_likelihood}
                            onChange={(e) => handleCellEdit(idx, 'initial_likelihood', parseInt(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                        <td>
                          <select
                            className="cell-select"
                            value={row.initial_severity}
                            onChange={(e) => handleCellEdit(idx, 'initial_severity', parseInt(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                        <td className={`risk-index-cell risk-${(row.initial_risk_index || 'Low').toLowerCase()}`}>
                          {row.initial_risk_index} ({row.initial_risk_score})
                        </td>

                        <td>
                          <textarea
                            className="cell-editable"
                            value={row.mitigating_actions || ''}
                            onChange={(e) => handleCellEdit(idx, 'mitigating_actions', e.target.value)}
                          />
                        </td>

                        {/* Residual Assessment parameters */}
                        <td>
                          <select
                            className="cell-select"
                            value={row.residual_likelihood}
                            onChange={(e) => handleCellEdit(idx, 'residual_likelihood', parseInt(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                        <td>
                          <select
                            className="cell-select"
                            value={row.residual_severity}
                            onChange={(e) => handleCellEdit(idx, 'residual_severity', parseInt(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                        <td className={`risk-index-cell risk-${(row.residual_risk_index || 'Low').toLowerCase()}`}>
                          {row.residual_risk_index} ({row.residual_risk_score})
                        </td>

                        <td>
                          <textarea
                            className="cell-editable"
                            value={row.remarks || ''}
                            onChange={(e) => handleCellEdit(idx, 'remarks', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="cell-editable"
                            style={{ minHeight: 'auto', textAlign: 'center' }}
                            value={row.target_date || ''}
                            onChange={(e) => handleCellEdit(idx, 'target_date', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="cell-editable"
                            style={{ minHeight: 'auto' }}
                            value={row.department_responsible || ''}
                            onChange={(e) => handleCellEdit(idx, 'department_responsible', e.target.value)}
                          />
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
                <div className="sig-box">
                  <div className="sig-box-title">Prepared by:</div>
                  <div>
                    <input
                      type="text"
                      className="sig-name-input"
                      placeholder="Name & Signature"
                      value={currentReport.prepared_by_name || ''}
                      onChange={(e) => handleMetaEdit('prepared_by_name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="sig-role-input"
                      placeholder="Role (e.g. S.H.E Specialist)"
                      value={currentReport.prepared_by_role || ''}
                      onChange={(e) => handleMetaEdit('prepared_by_role', e.target.value)}
                    />
                  </div>
                </div>
                <div className="sig-box">
                  <div className="sig-box-title">Approved by:</div>
                  <div>
                    <input
                      type="text"
                      className="sig-name-input"
                      placeholder="Name & Signature"
                      value={currentReport.approved_by_name || ''}
                      onChange={(e) => handleMetaEdit('approved_by_name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="sig-role-input"
                      placeholder="Role (e.g. VP Safety)"
                      value={currentReport.approved_by_role || ''}
                      onChange={(e) => handleMetaEdit('approved_by_role', e.target.value)}
                    />
                  </div>
                </div>
                <div className="sig-box">
                  <div className="sig-box-title">Acknowledged by:</div>
                  <div>
                    <input
                      type="text"
                      className="sig-name-input"
                      placeholder="Name & Signature"
                      value={currentReport.acknowledged_by_name || ''}
                      onChange={(e) => handleMetaEdit('acknowledged_by_name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="sig-role-input"
                      placeholder="Role (e.g. GSE Manager)"
                      value={currentReport.acknowledged_by_role || ''}
                      onChange={(e) => handleMetaEdit('acknowledged_by_role', e.target.value)}
                    />
                  </div>
                </div>
                <div className="sig-remarks-box">
                  <strong>Remarks / Notes:</strong>
                  <textarea
                    className="cell-editable"
                    placeholder="General report remarks or comments..."
                    style={{ minHeight: '60px', marginTop: '10px' }}
                    value={currentReport.footer_remarks || ''}
                    onChange={(e) => handleMetaEdit('footer_remarks', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-state-placeholder" style={{ color: '#ffffff', textAlign: 'center', marginTop: '100px' }}>
              <h3>No Report Loaded</h3>
              <p>Click "Generate New HIRAC" in the header to create a report via AI.</p>
            </div>
          )}
        </section>

        {/* Right side chatbot panel */}
        {chatOpen && (
          <aside className="chatbot-sidebar">
            <div className="chatbot-header">
              <h4 className="chatbot-title">SAFIRA AI Safety Bot</h4>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setChatOpen(false)}>✕</button>
            </div>
            
            <div className="chat-history">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-msg chat-msg-${msg.role}`}>
                  {msg.content}
                </div>
              ))}
              {isLoadingChat && (
                <div className="chat-msg chat-msg-assistant">
                  <div className="loader-spinner"></div>
                </div>
              )}
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Ask to change rows, verify, or Q&A..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isLoadingChat}
                />
                <button type="submit" className="chat-send-btn" disabled={isLoadingChat}>
                  ✈️
                </button>
              </div>
            </form>
          </aside>
        )}

        {/* Floating robot icon to open chat if closed */}
        {!chatOpen && (
          <div className="chatbot-toggle-btn" onClick={() => setChatOpen(true)} title="Open AI Chat">
            🤖
          </div>
        )}
      </main>

      {/* Unsaved Changes Banner */}
      {showSavePrompt && hasChanges && (
        <div className="save-prompt-banner">
          <span>⚠️ You have unsaved table modifications. Confirm updates?</span>
          <button className="save-btn-confirm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Sync to Supabase'}
          </button>
          <button className="save-btn-discard" onClick={handleDiscard} disabled={isSaving}>
            Discard
          </button>
        </div>
      )}

      {/* Initial Prompt Generation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCreateReport}>
            <h3>Generate HIRAC via AI Prompt</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Report Title</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                value={newReportMeta.title}
                onChange={(e) => setNewReportMeta({ ...newReportMeta, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Location</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                  value={newReportMeta.location}
                  onChange={(e) => setNewReportMeta({ ...newReportMeta, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Department</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }}
                  value={newReportMeta.department || ''}
                  onChange={(e) => setNewReportMeta({ ...newReportMeta, department: e.target.value })}
                  required
                />
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Describe the Incident, Activity, or Hazard Scenario</label>
            <textarea
              className="modal-prompt-textarea"
              placeholder="e.g. A severe Typhoon warning in Mactan Cebu affecting baggage handler equipment and strong wind damage inside the passenger terminal..."
              value={incidentPrompt}
              onChange={(e) => setIncidentPrompt(e.target.value)}
              required
            />
            
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} disabled={isGenerating}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
