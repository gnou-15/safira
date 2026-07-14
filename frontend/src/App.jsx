import { useState, useEffect, useRef, useCallback } from 'react';
import mascotImg from './assets/mascot.png';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const formatTimestamp = (dateString) => {
  if (!dateString) return 'recently';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'recently';
  }
};

function AutoResizeTextarea({ value, onChange, className, style, placeholder }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      className={className}
      placeholder={placeholder}
      style={{ 
        ...style, 
        resize: 'none', 
        overflowY: 'hidden',
        minHeight: 'auto',
        height: 'auto'
      }}
    />
  );
}

function App() {
  // App State
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [rows, setRows] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  
  // Chat Sidebar State
  const [chatOpen, setChatOpen] = useState(false);
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

  // Safety Manuals Modal State
  const [showManualsModal, setShowManualsModal] = useState(false);
  const [manuals, setManuals] = useState([]);
  const [isLoadingManuals, setIsLoadingManuals] = useState(false);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [manualsAlert, setManualsAlert] = useState({ type: '', message: '' });


  // Ref to track the 5-second idle timer
  const idleTimerRef = useRef(null);

  // Fetch list of all reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  // Track mouse coordinates for subtle interactive background spotlights
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
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

  // Load safety manuals
  const fetchManuals = async () => {
    setIsLoadingManuals(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/documents`);
      if (res.ok) {
        const data = await res.json();
        setManuals(data || []);
      } else {
        throw new Error('Failed to load manuals');
      }
    } catch (err) {
      console.error('Error fetching manuals:', err);
    } finally {
      setIsLoadingManuals(false);
    }
  };

  const handleOpenManualsModal = () => {
    setShowManualsModal(true);
    setManualsAlert({ type: '', message: '' });
    fetchManuals();
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload file
  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt')) {
      setManualsAlert({ type: 'error', message: 'Only .pdf and .txt files are supported.' });
      return;
    }

    setIsUploadingManual(true);
    setManualsAlert({ type: 'info', message: `Processing and ingesting ${file.name}...` });

    try {
      const base64Data = await fileToBase64(file);
      const res = await fetch(`${API_URL}/api/ai/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          base64_data: base64Data
        })
      });

      if (res.ok) {
        setManualsAlert({ type: 'success', message: `Successfully ingested "${file.name}"! The AI model now has access to this data.` });
        fetchManuals();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setManualsAlert({ type: 'error', message: `Ingestion failed: ${err.message}` });
    } finally {
      setIsUploadingManual(false);
    }
  };

  // Delete safety manual
  const handleDeleteManual = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? All AI safety guidelines context for this document will be removed.`)) return;

    setManualsAlert({ type: 'info', message: `Deleting ${filename}...` });
    try {
      const res = await fetch(`${API_URL}/api/ai/documents?name=${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setManualsAlert({ type: 'success', message: `Successfully deleted "${filename}"` });
        fetchManuals();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete manual error:', err);
      setManualsAlert({ type: 'error', message: `Failed to delete manual: ${err.message}` });
    }
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
    // Completely strip ALL inline style attributes from form elements before printing.
    // AutoResizeTextarea sets inline height/overflow via JS, and these inline styles
    // override print CSS, causing scrollbars, arrows, and fixed-height cells.
    // By removing the style attribute entirely, only the @media print CSS applies.
    const formElements = document.querySelectorAll('textarea, input, select');
    const savedStyles = [];
    formElements.forEach((el) => {
      savedStyles.push(el.getAttribute('style'));
      el.removeAttribute('style');
    });

    window.print();

    // Restore original inline styles after the print dialog closes
    formElements.forEach((el, i) => {
      if (savedStyles[i]) {
        el.setAttribute('style', savedStyles[i]);
      }
    });
  };

  return (
    <div className={`app-container ${!currentReport ? 'landing-active' : ''}`}>
      {/* Top Navbar */}
      <header className="top-nav">
        {!currentReport ? (
          <>
            <div className="logo-container" onClick={() => fetchReports()}>
              <div className="safira-logo-wrapper">
                <svg viewBox="0 0 100 100" className="safira-logo" width="34" height="34">
                  <defs>
                    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="gold-wing" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b45309" />
                      <stop offset="50%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>
                  </defs>
                  {/* Back wing */}
                  <path d="M 35 65 C 20 40, 30 18, 50 10 C 42 28, 40 48, 52 62 Z" fill="url(#gold-wing)" />
                  {/* Middle wing */}
                  <path d="M 42 62 C 30 35, 42 12, 60 5 C 52 26, 48 48, 60 58 Z" fill="url(#gold-grad)" />
                  {/* Main front wing */}
                  <path d="M 48 58 C 40 38, 50 20, 68 12 C 58 32, 54 50, 68 54 Z" fill="url(#gold-wing)" />
                  {/* Body & Head */}
                  <path d="M 25 80 C 35 78, 52 70, 60 58 C 68 54, 74 46, 78 38 C 80 34, 82 32, 86 34 C 90 36, 92 34, 95 32 C 90 38, 86 42, 82 48 C 74 60, 65 72, 52 82 C 42 85, 32 83, 25 80 Z" fill="url(#gold-grad)" />
                  {/* Eye */}
                  <circle cx="82" cy="38" r="2.5" fill="#1e293b" />
                </svg>
              </div>
              <span className="brand-text">SAFIRA <span className="brand-subtext">by Nezer</span></span>
            </div>
            <div className="landing-nav-links">
              <span className="landing-nav-link active">Home</span>
              <span className="landing-nav-link">About Us</span>
              <span className="landing-nav-link">Service</span>
              <span className="landing-nav-link">Contact</span>
            </div>
          </>
        ) : (
          <>
            <div className="logo-container" onClick={() => setCurrentReport(null)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div className="safira-logo-wrapper">
                <svg viewBox="0 0 100 100" className="safira-logo" width="34" height="34">
                  <defs>
                    <linearGradient id="gold-grad-ed" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="gold-wing-ed" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b45309" />
                      <stop offset="50%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>
                  </defs>
                  {/* Back wing */}
                  <path d="M 35 65 C 20 40, 30 18, 50 10 C 42 28, 40 48, 52 62 Z" fill="url(#gold-wing-ed)" />
                  {/* Middle wing */}
                  <path d="M 42 62 C 30 35, 42 12, 60 5 C 52 26, 48 48, 60 58 Z" fill="url(#gold-grad-ed)" />
                  {/* Main front wing */}
                  <path d="M 48 58 C 40 38, 50 20, 68 12 C 58 32, 54 50, 68 54 Z" fill="url(#gold-wing-ed)" />
                  {/* Body & Head */}
                  <path d="M 25 80 C 35 78, 52 70, 60 58 C 68 54, 74 46, 78 38 C 80 34, 82 32, 86 34 C 90 36, 92 34, 95 32 C 90 38, 86 42, 82 48 C 74 60, 65 72, 52 82 C 42 85, 32 83, 25 80 Z" fill="url(#gold-grad-ed)" />
                  {/* Eye */}
                  <circle cx="82" cy="38" r="2.5" fill="#1e293b" />
                </svg>
              </div>
              <span className="brand-text">SAFIRA</span>
            </div>
            {reports.length > 0 && (
              <select
                className="report-select-dropdown"
                value={currentReport?.id || ''}
                onChange={(e) => loadReport(e.target.value)}
              >
                <option value="" disabled>Select a Report...</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.title}
                  </option>
                ))}
              </select>
            )}
            <div className="nav-actions">
              <button className="btn-secondary btn-nav-manuals" onClick={handleOpenManualsModal}>📚 Safety Manuals</button>
              <button className="btn-secondary" onClick={() => setShowModal(true)}>+ Generate New HIRAC</button>
              <button className="btn-primary" onClick={handlePrint}>EXPORT</button>
            </div>
          </>
        )}
      </header>

      {/* Main Container */}
      <main className="main-workspace">
        
        {/* Center Canvas */}
        <section className="document-workspace">
          {currentReport ? (
            <div className="document-sheet">
              {/* Header Box */}
              <div className="doc-header-layout">
                {/* Simulated aviation logo wings */}
                <div className="logo-placeholder">
                  <svg viewBox="0 0 260 70" width="220" height="60">
                    <g transform="translate(0, 5)">
                      {/* Left stylized wing lines */}
                      <path d="M 10 32 L 70 12 L 70 20 L 20 37 Z" fill="#7d8b99" opacity="0.9" />
                      <path d="M 20 39 L 70 24 L 70 32 L 30 44 Z" fill="#7d8b99" opacity="0.9" />
                      <path d="M 30 46 L 70 35 L 70 42 L 40 49 Z" fill="#7d8b99" opacity="0.9" />
                      
                      {/* Center shield/diamond */}
                      <polygon points="80,5 140,5 145,45 75,45" fill="#5c5c5c" stroke="#4a4a4a" strokeWidth="1" />
                      <text x="110" y="27" dominantBaseline="middle" textAnchor="middle" fontWeight="900" fontSize="20" fill="#ffffff" letterSpacing="1">PAGSS</text>
                      
                      {/* Right stylized wing lines */}
                      <path d="M 210 32 L 150 12 L 150 20 L 200 37 Z" fill="#7d8b99" opacity="0.9" />
                      <path d="M 200 39 L 150 24 L 150 32 L 190 44 Z" fill="#7d8b99" opacity="0.9" />
                      <path d="M 190 46 L 150 35 L 150 42 L 180 49 Z" fill="#7d8b99" opacity="0.9" />

                      {/* Subtext below the wings */}
                      <text x="110" y="55" dominantBaseline="middle" textAnchor="middle" fontWeight="700" fontSize="5" fill="#4a4a4a" letterSpacing="0.2">
                        PHILIPPINE AIRPORT GROUND SUPPORT SOLUTIONS, INC.
                      </text>
                    </g>
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
                    <td className="meta-label" style={{ width: '15%' }}>REPORT TITLE:</td>
                    <td className="meta-value" colSpan={3} style={{ width: '65%' }}>
                      <input
                        type="text"
                        className="screen-only"
                        value={currentReport.title || ''}
                        onChange={(e) => handleMetaEdit('title', e.target.value)}
                      />
                      <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.title || ''}</div>
                    </td>
                    <td className="meta-value-sidebar" rowSpan={2} style={{ width: '20%' }}>
                      <div className="sidebar-label">HIRAC Ref. No.:</div>
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
                    <td className="meta-label">Department:</td>
                    <td className="meta-value">
                      <input
                        type="text"
                        className="screen-only"
                        value={currentReport.department || ''}
                        onChange={(e) => handleMetaEdit('department', e.target.value)}
                      />
                      <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.department || ''}</div>
                    </td>
                    <td className="meta-label" style={{ width: '15%' }}>Location:</td>
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
                    <td className="meta-label">Activity/Area being assessed:</td>
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
                      <div className="sidebar-label">Assessor(s)/Team:</div>
                      <AutoResizeTextarea
                        className="sidebar-textarea screen-only"
                        value={currentReport.assessor_team || ''}
                        onChange={(e) => handleMetaEdit('assessor_team', e.target.value)}
                      />
                      <div className="print-only cell-print-text" style={{ fontWeight: 'bold', fontSize: '10px' }}>{currentReport.assessor_team || ''}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-label">Date Created:</td>
                    <td className="meta-value">
                      <input
                        type="text"
                        className="screen-only"
                        value={currentReport.date_created || ''}
                        onChange={(e) => handleMetaEdit('date_created', e.target.value)}
                      />
                      <div className="print-only cell-print-text" style={{ fontWeight: 'bold' }}>{currentReport.date_created || ''}</div>
                    </td>
                    <td className="meta-label">Date Reviewed:</td>
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
                        <td className={`risk-index-cell risk-${(row.initial_risk_index || 'Low').toLowerCase()}`}>
                          {/* Screen: full interactive widget */}
                          <div className="risk-cell-content screen-only">
                            <div className="risk-level-label">
                              {row.initial_risk_index ? row.initial_risk_index.toUpperCase() : 'LOW'}
                              <span className="risk-score-number"><br/>({row.initial_risk_score || 0})</span>
                            </div>
                            <div className="risk-score-selectors">
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '600' }}>
                                  Likelihood:
                                  <select
                                    className="cell-select-compact"
                                    value={row.initial_likelihood || 3}
                                    onChange={(e) => handleCellEdit(idx, 'initial_likelihood', parseInt(e.target.value))}
                                  >
                                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '600' }}>
                                  Severity:
                                  <select
                                    className="cell-select-compact"
                                    value={row.initial_severity || 3}
                                    onChange={(e) => handleCellEdit(idx, 'initial_severity', parseInt(e.target.value))}
                                  >
                                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </label>
                              </div>
                            </div>
                          </div>
                          {/* Print: solid-colored badge — divs always print backgrounds */}
                          <div className={`print-only risk-print-badge risk-print-${(row.initial_risk_index || 'low').toLowerCase()}`}>
                            {row.initial_risk_index ? row.initial_risk_index.toUpperCase() : 'LOW'}
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

                        {/* Interactive Residual Risk Index (Single cell with internal score controls) */}
                        <td className={`risk-index-cell risk-${(row.residual_risk_index || 'Low').toLowerCase()}`}>
                          {/* Screen: full interactive widget */}
                          <div className="risk-cell-content screen-only">
                            <div className="risk-level-label">
                              {row.residual_risk_index ? row.residual_risk_index.toUpperCase() : 'LOW'}
                              <span className="risk-score-number"><br/>({row.residual_risk_score || 0})</span>
                            </div>
                            <div className="risk-score-selectors">
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '600' }}>
                                  Likelihood:
                                  <select
                                    className="cell-select-compact"
                                    value={row.residual_likelihood || 2}
                                    onChange={(e) => handleCellEdit(idx, 'residual_likelihood', parseInt(e.target.value))}
                                  >
                                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '600' }}>
                                  Severity:
                                  <select
                                    className="cell-select-compact"
                                    value={row.residual_severity || 2}
                                    onChange={(e) => handleCellEdit(idx, 'residual_severity', parseInt(e.target.value))}
                                  >
                                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </label>
                              </div>
                            </div>
                          </div>
                          {/* Print: solid-colored badge — divs always print backgrounds */}
                          <div className={`print-only risk-print-badge risk-print-${(row.residual_risk_index || 'low').toLowerCase()}`}>
                            {row.residual_risk_index ? row.residual_risk_index.toUpperCase() : 'LOW'}
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
                <div className="sig-box">
                  <div className="sig-box-title">Prepared by:</div>
                  <div>
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
                <div className="sig-box">
                  <div className="sig-box-title">Approved by:</div>
                  <div>
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
                <div className="sig-box">
                  <div className="sig-box-title">Acknowledged by:</div>
                  <div>
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
                <div className="sig-remarks-box">
                  <strong>Remarks / Notes:</strong>
                  <AutoResizeTextarea
                    className="cell-editable screen-only"
                    placeholder="General report remarks or comments..."
                    style={{ marginTop: '10px' }}
                    value={currentReport.footer_remarks || ''}
                    onChange={(e) => handleMetaEdit('footer_remarks', e.target.value)}
                  />
                  <div className="print-only cell-print-text" style={{ marginTop: '6px' }}>{currentReport.footer_remarks || ''}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="landing-page-container">
              <div className="landing-page-content">
                {/* Left Side: Recent Reports Logs */}
                 <div className="landing-left-column">
                  <div className="landing-pill-indicator"></div>
                  <div className="landing-left-content">
                    <h3 className="landing-logs-title">Recent Reports Logs</h3>
                    
                    <div className="landing-logs-list">
                      {reports.length === 0 ? (
                        <div className="landing-log-item empty-log">
                          <span className="log-bullet">•</span>
                          <p>No reports found in database. Let's get started and create your first report!</p>
                        </div>
                      ) : (
                        reports.slice(0, 3).map((report) => (
                          <div key={report.id} className="landing-log-item clickable-log" onClick={() => loadReport(report.id)}>
                            <span className="log-bullet">•</span>
                            <div className="log-details">
                              <span className="log-text">You recently worked on <strong>{report.title}</strong></span>
                              <span className="log-meta">Created {formatTimestamp(report.created_at)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button 
                      className="btn-get-to-work" 
                      onClick={() => {
                        if (reports.length > 0) {
                          loadReport(reports[0].id);
                        } else {
                          setShowModal(true);
                        }
                      }}
                    >
                      Let's get to work
                    </button>
                  </div>
                </div>

                {/* Right Side: Mascot & Tagline */}
                <div className="landing-right-column">
                  <div className="safira-mascot-wrapper">
                    <img src={mascotImg} className="safira-mascot-img" alt="SAFIRA Mascot" />
                  </div>
                  <p className="landing-tagline">
                    Your global companion on providing safe air: intelligent hazard identification, risk assessment, and compliance analytics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Floating chatbot overlay at bottom right */}
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
      {/* Safety Manuals Ingestion/Management Modal */}
      {showManualsModal && (
        <div className="modal-overlay">
          <div className="modal-content manuals-modal-content" style={{ maxWidth: '650px', width: '90%' }}>
            <div className="manuals-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>📚 Airport Safety Manuals Manager</h3>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }} 
                onClick={() => setShowManualsModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Alert Message Banner */}
            {manualsAlert.message && (
              <div className={`manuals-alert alert-${manualsAlert.type}`} style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {manualsAlert.type === 'info' && <span className="spinner-small" style={{ marginRight: '8px' }}>⏳</span>}
                {manualsAlert.message}
              </div>
            )}

            {/* Drag & Drop File Upload Area */}
            <div 
              className={`manuals-dropzone ${dragOver ? 'drag-over' : ''} ${isUploadingManual ? 'disabled' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (isUploadingManual) return;
                const file = e.dataTransfer.files[0];
                handleUploadFile(file);
              }}
              onClick={() => {
                if (isUploadingManual) return;
                document.getElementById('manuals-file-input').click();
              }}
            >
              <input 
                id="manuals-file-input"
                type="file"
                accept=".pdf,.txt"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  handleUploadFile(file);
                }}
              />
              <div className="dropzone-icon">📥</div>
              <p className="dropzone-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <span className="dropzone-hint">PDF or Text files containing airport safety SOPs or rules (Max 10MB)</span>
            </div>

            {/* Uploaded Manuals List */}
            <div className="manuals-list-section" style={{ marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Active Safety Reference Documents ({manuals.length})
              </h4>
              
              {isLoadingManuals ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Loading referenced safety manuals...
                </div>
              ) : manuals.length === 0 ? (
                <div className="manuals-empty-state" style={{ textAlign: 'center', padding: '30px 20px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>No safety manuals uploaded yet.</p>
                  <span style={{ fontSize: '11px' }}>AI will use standard airport guidelines until you upload custom manuals.</span>
                </div>
              ) : (
                <div className="manuals-scroll-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  {manuals.map((filename, i) => (
                    <div key={i} className="manuals-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < manuals.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>{filename.toLowerCase().endsWith('.pdf') ? '📄' : '📝'}</span>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{filename}</span>
                      </div>
                      <button 
                        type="button"
                        className="btn-delete-manual"
                        title="Delete Reference Document"
                        onClick={() => handleDeleteManual(filename)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowManualsModal(false)}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
