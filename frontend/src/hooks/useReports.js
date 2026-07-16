import { useState, useEffect, useRef, useCallback } from 'react';
import { getRiskLevel } from '../utils/riskCalculations';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function useReports() {
  // Auth State
  const [user, setUser] = useState(() => {
    try {
      const cachedToken = localStorage.getItem('safira_token');
      const cachedUser = localStorage.getItem('safira_user');
      return cachedToken && cachedUser ? { token: cachedToken, ...JSON.parse(cachedUser) } : null;
    } catch (e) {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const cachedPage = localStorage.getItem('safira_current_page');
    const token = localStorage.getItem('safira_token');
    if (token && cachedPage === 'login') return 'landing';
    return cachedPage || 'landing';
  });

  // App State
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(() => {
    try {
      const cached = localStorage.getItem('activeReport');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [rows, setRows] = useState(() => {
    try {
      const cached = localStorage.getItem('activeReportRows');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing safety dashboard...");
  const [lastSaved, setLastSaved] = useState(null);

  const stateRef = useRef({ currentReport, rows });
  stateRef.current = { currentReport, rows };


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
    assessor_team: 'Safety Security & Quality Assurance (SSQA)',
    department: 'Operations'
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

  // Sync page state to localStorage
  useEffect(() => {
    localStorage.setItem('safira_current_page', currentPage);
  }, [currentPage]);

  // Fetch list of all reports and restore active report session in background
  useEffect(() => {
    if (user) {
      fetchReports();
      const storedId = localStorage.getItem('activeReportId');
      if (storedId) {
        loadReport(storedId);
      }
    }
  }, [user]);

  // Persist active report session and metadata in localStorage
  useEffect(() => {
    if (currentReport && currentReport.id) {
      localStorage.setItem('activeReportId', currentReport.id);
      localStorage.setItem('activeReport', JSON.stringify(currentReport));
    } else if (currentReport === null) {
      localStorage.removeItem('activeReportId');
      localStorage.removeItem('activeReport');
      localStorage.removeItem('activeReportRows');
    }
  }, [currentReport]);

  // Persist active rows in localStorage
  useEffect(() => {
    if (currentReport && rows && rows.length > 0) {
      localStorage.setItem('activeReportRows', JSON.stringify(rows));
    }
  }, [rows, currentReport]);

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

  // Authenticated Fetch wrapper helper
  const authedFetch = async (url, options = {}) => {
    const token = user?.token || localStorage.getItem('safira_token');
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Auth Operations
  const handleNavigate = async (pageName) => {
    if (pageName === 'login' || pageName === 'landing') {
      setCurrentPage(pageName);
      return;
    }

    let msg = "Navigating...";
    if (pageName === 'document') msg = "Loading safety worksheets...";
    setLoadingMessage(msg);
    setIsPageLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentPage(pageName);
    setIsPageLoading(false);
  };

  const handleLogin = async (email, password, rememberMe) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    const loginUser = { token: data.token, ...data.user };

    setUser(loginUser);
    if (rememberMe) {
      localStorage.setItem('safira_token', data.token);
      localStorage.setItem('safira_user', JSON.stringify(data.user));
    } else {
      localStorage.removeItem('safira_token');
      localStorage.removeItem('safira_user');
    }
    return true;
  };

  const handleSignup = async (username, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');

    const loginUser = { token: data.token, ...data.user };

    setUser(loginUser);
    localStorage.setItem('safira_token', data.token);
    localStorage.setItem('safira_user', JSON.stringify(data.user));
    return true;
  };

  const handleLogout = async () => {
    setLoadingMessage("Till we meet again...");
    setIsPageLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser(null);
    setCurrentReport(null);
    setRows([]);
    setReports([]);
    localStorage.removeItem('safira_token');
    localStorage.removeItem('safira_user');
    localStorage.setItem('safira_current_page', 'login');
    localStorage.removeItem('activeReportId');
    localStorage.removeItem('activeReport');
    localStorage.removeItem('activeReportRows');
    setCurrentPage('login');
    setIsPageLoading(false);
  };

  const fetchReports = async () => {
    try {
      const res = await authedFetch(`${API_URL}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const loadReport = async (id) => {
    if (stateRef.current.currentReport && hasChanges) {
      await handleSave();
    }
    setLastSaved(null);
    setLoadingMessage("Retrieving report data...");
    setIsPageLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/api/reports/${id}`);
      if (res.ok) {
        const data = await res.json();
        const { rows: fetchedRows, ...meta } = data;
        // 1s delay to show transition animation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentReport(meta);
        setRows(fetchedRows || []);
        setHasChanges(false);
        setShowSavePrompt(false);
      } else {
        setCurrentReport(null);
      }
    } catch (err) {
      console.error(`Failed to load report ${id}:`, err);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Transition back to landing page with loader animation
  const handleExitToLanding = async () => {
    if (hasChanges) {
      await handleSave();
    }
    setLoadingMessage("Closing safety worksheet...");
    setIsPageLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentReport(null);
    } finally {
      setIsPageLoading(false);
    }
  };

  // Triggers 2-second idle timer on change for autosave
  const markChanged = () => {
    setHasChanges(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // Auto-save after 2 seconds of inactivity
    idleTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Save changes (rows + metadata) to Supabase
  const handleSave = async () => {
    const { currentReport: latestReport, rows: latestRows } = stateRef.current;
    if (!latestReport) return;
    setIsSaving(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    try {
      // 1. Update report metadata
      const metaRes = await authedFetch(`${API_URL}/api/reports/${latestReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latestReport)
      });

      if (!metaRes.ok) throw new Error('Failed to save report headers');

      // 2. Update report rows
      const rowsRes = await authedFetch(`${API_URL}/api/reports/${latestReport.id}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: latestRows })
      });

      if (!rowsRes.ok) throw new Error('Failed to save table rows');

      setHasChanges(false);
      setShowSavePrompt(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      fetchReports();
    } catch (err) {
      console.error(`Save error: ${err.message}`);
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
  const handleDeleteRow = useCallback((index) => {
    setRows(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated;
    });
    markChanged();
  }, []);

  // Load safety manuals
  const fetchManuals = async () => {
    setIsLoadingManuals(true);
    try {
      const res = await authedFetch(`${API_URL}/api/ai/documents`);
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
      const res = await authedFetch(`${API_URL}/api/ai/upload`, {
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
      const res = await authedFetch(`${API_URL}/api/ai/documents?name=${encodeURIComponent(filename)}`, {
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

    if (field === 'initial_likelihood' || field === 'initial_severity') {
      const l = parseInt(updated[index].initial_likelihood) || 1;
      const s = parseInt(updated[index].initial_severity) || 1;
      const score = l * s;
      updated[index].initial_risk_score = score;
      updated[index].initial_risk_index = getRiskLevel(l, s);
    }

    if (field === 'residual_likelihood' || field === 'residual_severity') {
      const l = parseInt(updated[index].residual_likelihood) || 1;
      const s = parseInt(updated[index].residual_severity) || 1;
      const score = l * s;
      updated[index].residual_risk_score = score;
      updated[index].residual_risk_index = getRiskLevel(l, s);
    }

    setRows(updated);
    markChanged();
  };

  // Meta header editing handler
  const handleMetaEdit = (field, value) => {
    setCurrentReport({ ...currentReport, [field]: value });
    markChanged();
  };

  // Redirect to workspace page (load most recent report, or auto-create a default empty report if no reports exist)
  const handleGetToWork = async () => {
    setLoadingMessage("Loading workspace...");
    setIsPageLoading(true);
    if (reports.length > 0) {
      await loadReport(reports[0].id);
      setIsPageLoading(false);
    } else {
      setIsGenerating(true);
      try {
        const title = 'Untitled HIRAC Report';
        const location = 'Mactan Cebu International Airport';
        const department = 'Operations';
        const activity_assessed = 'General Operations';
        const assessor_team = 'Safety Team';
        const ref_no = `CSC-${Date.now().toString().slice(-6)}`;

        const metaRes = await authedFetch(`${API_URL}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            location,
            activity_assessed,
            assessor_team,
            department,
            ref_no
          })
        });

        if (!metaRes.ok) throw new Error('Failed to create default report');
        const savedReportMeta = await metaRes.json();

        // Create one default empty row
        const defaultRow = {
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
        };

        const rowsRes = await authedFetch(`${API_URL}/api/reports/${savedReportMeta.id}/rows`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: [defaultRow] })
        });

        if (!rowsRes.ok) throw new Error('Failed to save default row');

        // 1s delay to show transition animation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReports([savedReportMeta, ...reports]);
        setCurrentReport(savedReportMeta);
        setRows([defaultRow]);
      } catch (err) {
        alert(`Error creating blank report: ${err.message}`);
      } finally {
        setIsGenerating(false);
        setIsPageLoading(false);
      }
    }
  };

  // Create report using AI generation prompt
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!incidentPrompt.trim()) return;
    setIsGenerating(true);

    try {
      // 1. Generate Rows using Groq Proxy
      const aiRes = await authedFetch(`${API_URL}/api/ai/generate`, {
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
      const metaRes = await authedFetch(`${API_URL}/api/reports`, {
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
      const rowsRes = await authedFetch(`${API_URL}/api/reports/${savedReportMeta.id}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: generatedRows })
      });

      if (!rowsRes.ok) throw new Error('Failed to save generated rows');

      // 1s delay to show transition animation
      await new Promise(resolve => setTimeout(resolve, 1000));
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

  // Perform chatbot-driven modifications
  const executeTableUpdate = useCallback((payload) => {
    const { action, row_index, data } = payload;

    setRows(prev => {
      let updated = [...prev];
      if (action === 'modify_row' && typeof row_index === 'number' && updated[row_index]) {
        updated[row_index] = { ...updated[row_index], ...data };
        // Redo risk indices
        if ('initial_likelihood' in data || 'initial_severity' in data) {
          const l = parseInt(updated[row_index].initial_likelihood) || 1;
          const s = parseInt(updated[row_index].initial_severity) || 1;
          updated[row_index].initial_risk_score = l * s;
          updated[row_index].initial_risk_index = getRiskLevel(l, s);
        }
        if ('residual_likelihood' in data || 'residual_severity' in data) {
          const l = parseInt(updated[row_index].residual_likelihood) || 1;
          const s = parseInt(updated[row_index].residual_severity) || 1;
          updated[row_index].residual_risk_score = l * s;
          updated[row_index].residual_risk_index = getRiskLevel(l, s);
        }
        setChatHistory(h => [...h, { role: 'system', content: `Applied edit to Row ${row_index + 1}` }]);
        markChanged();
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
          initial_risk_index: getRiskLevel(data.initial_likelihood || 3, data.initial_severity || 3),
          mitigating_actions: data.mitigating_actions || '',
          residual_likelihood: data.residual_likelihood || 2,
          residual_severity: data.residual_severity || 2,
          residual_risk_score: (data.residual_likelihood || 2) * (data.residual_severity || 2),
          residual_risk_index: getRiskLevel(data.residual_likelihood || 2, data.residual_severity || 2),
          remarks: data.remarks || '',
          target_date: data.target_date || '',
          department_responsible: data.department_responsible || 'Safety'
        };
        updated = [...updated, fullNewRow];
        setChatHistory(h => [...h, { role: 'system', content: 'Added a new row to the table.' }]);
        markChanged();
      }
      else if (action === 'delete_row' && typeof row_index === 'number') {
        updated = updated.filter((_, idx) => idx !== row_index);
        markChanged();
      }
      return updated;
    });
  }, [handleDeleteRow]);

  // Send message to chatbot (RAG Chat API)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoadingChat) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoadingChat(true);

    try {
      const res = await authedFetch(`${API_URL}/api/ai/chat`, {
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

  // Launch browser native print interface (styled by print stylesheet)
  const handlePrint = () => {
    const formElements = document.querySelectorAll('textarea, input, select');
    const savedStyles = [];
    formElements.forEach((el) => {
      savedStyles.push(el.getAttribute('style'));
      el.removeAttribute('style');
    });

    window.print();

    formElements.forEach((el, i) => {
      if (savedStyles[i]) {
        el.setAttribute('style', savedStyles[i]);
      }
    });
  };

  return {
    user,
    setUser,
    currentPage,
    setCurrentPage,
    handleLogin,
    handleSignup,
    handleLogout,
    handleNavigate,
    reports,
    currentReport,
    setCurrentReport,
    rows,
    isSaving,
    hasChanges,
    showSavePrompt,
    isPageLoading,
    handleExitToLanding,
    chatOpen,
    setChatOpen,
    chatHistory,
    setChatHistory,
    chatInput,
    setChatInput,
    isLoadingChat,
    showModal,
    setShowModal,
    incidentPrompt,
    setIncidentPrompt,
    isGenerating,
    newReportMeta,
    setNewReportMeta,
    showManualsModal,
    setShowManualsModal,
    manuals,
    isLoadingManuals,
    isUploadingManual,
    dragOver,
    setDragOver,
    manualsAlert,
    setManualsAlert,
    fetchReports,
    loadReport,
    handleSave,
    handleDiscard,
    handleAddRow,
    handleDeleteRow,
    handleOpenManualsModal,
    handleUploadFile,
    handleDeleteManual,
    handleCellEdit,
    handleMetaEdit,
    handleGetToWork,
    handleCreateReport,
    handleSendMessage,
    handlePrint,
    lastSaved
  };
}
