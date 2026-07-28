import { useState, useEffect, useRef, useCallback } from 'react';
import { getRiskLevel } from '../utils/riskCalculations';
import { createDefaultReportMeta, createDefaultRow } from '../utils/createDefaultHiracData';
import useAuth from './useAuth';
import useSafetyManuals from './useSafetyManuals';
import useChatbot from './useChatbot';
import useConfirmModal from './useConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function useReports() {
  const [currentPage, setCurrentPage] = useState(() => {
    const cachedPage = sessionStorage.getItem('safira_current_page');
    const token = localStorage.getItem('safira_token');
    if (token && cachedPage === 'login') return 'landing';
    return cachedPage || 'landing';
  });

  // Auth Sub-Hook
  const { user, setUser, authedFetch, handleKeyLogin, handleKeyGenerate, handleLogout: handleLogoutAuth } = useAuth(setCurrentPage);

  // App & HIRAC Report State
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(() => {
    try {
      const cached = sessionStorage.getItem('activeReport');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [rows, setRows] = useState(() => {
    try {
      const cached = sessionStorage.getItem('activeReportRows');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing safety dashboard...");
  const [lastSaved, setLastSaved] = useState(null);

  const stateRef = useRef({ currentReport, rows });
  stateRef.current = { currentReport, rows };

  // New Report Generation Modal State
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

  // Confirm Modal Sub-Hook
  const { confirmModalState, requestConfirm, closeConfirmModal } = useConfirmModal();

  // Safety Manuals Sub-Hook
  const {
    showManualsModal,
    setShowManualsModal,
    manuals,
    isLoadingManuals,
    isUploadingManual,
    dragOver,
    setDragOver,
    manualsAlert,
    setManualsAlert,
    fetchManuals,
    handleOpenManualsModal,
    handleUploadFile,
    handleApproveManual,
    handleDeleteManual
  } = useSafetyManuals(authedFetch, user);

  // Table Update Executor for AI Chat payloads
  const executeTableUpdate = useCallback((payload) => {
    const { action, row_index, data } = payload;
    setRows(prev => {
      let updated = [...prev];
      if (action === 'modify_row' && typeof row_index === 'number' && updated[row_index]) {
        updated[row_index] = { ...updated[row_index], ...data };
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
        setHasChanges(true);
      } else if (action === 'add_row' && data) {
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
        setHasChanges(true);
      } else if (action === 'delete_row' && typeof row_index === 'number') {
        updated = updated.filter((_, idx) => idx !== row_index);
        setHasChanges(true);
      }
      return updated;
    });
  }, []);

  // Chatbot Sub-Hook
  const {
    chatOpen,
    setChatOpen,
    chatHistory,
    setChatHistory,
    chatInput,
    setChatInput,
    isLoadingChat,
    handleSendMessage: sendMessageToChatbot
  } = useChatbot(authedFetch, executeTableUpdate);

  const handleSendMessage = (e, activeReport, activeInvestigation, onInvestigationUpdate) => {
    return sendMessageToChatbot(e, activeReport || currentReport, rows, activeInvestigation, onInvestigationUpdate);
  };

  // Sync page state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('safira_current_page', currentPage);
  }, [currentPage]);

  // Sync active report & rows to sessionStorage
  useEffect(() => {
    if (currentReport && currentReport.id) {
      sessionStorage.setItem('activeReportId', currentReport.id);
      sessionStorage.setItem('activeReport', JSON.stringify(currentReport));
    } else if (currentReport === null) {
      sessionStorage.removeItem('activeReportId');
      sessionStorage.removeItem('activeReport');
      sessionStorage.removeItem('activeReportRows');
    }
  }, [currentReport]);

  useEffect(() => {
    if (currentReport && rows && rows.length > 0) {
      sessionStorage.setItem('activeReportRows', JSON.stringify(rows));
    }
  }, [rows, currentReport]);

  // Fetch reports list
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authedFetch(`${API_URL}/api/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  }, [user, authedFetch]);

  useEffect(() => {
    if (user) {
      fetchReports();
    } else {
      setReports([]);
      setCurrentReport(null);
      setRows([]);
    }
  }, [user, fetchReports]);

  // Navigation Helper
  const handleNavigate = async (pageName) => {
    setChatOpen(false);
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

  const handleExitToLanding = async () => {
    setChatOpen(false);
    setLoadingMessage("Returning to home dashboard...");
    setIsPageLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCurrentReport(null);
    setRows([]);
    sessionStorage.removeItem('activeReportId');
    sessionStorage.removeItem('activeReport');
    sessionStorage.removeItem('activeReportRows');
    sessionStorage.setItem('safira_current_page', 'landing');
    setCurrentPage('landing');
    setIsPageLoading(false);
  };

  const handleLogout = async () => {
    setChatOpen(false);
    return handleLogoutAuth(setLoadingMessage, setIsPageLoading, () => {
      setCurrentReport(null);
      setRows([]);
      setReports([]);
    });
  };

  // Load active report
  const loadReport = async (reportId) => {
    setChatOpen(false);
    setIsReportLoading(true);
    try {
      const metaRes = await authedFetch(`${API_URL}/api/reports/${reportId}`);
      if (!metaRes.ok) throw new Error('Failed to load report metadata');
      const metaData = await metaRes.json();

      let reportRows = Array.isArray(metaData.rows) ? metaData.rows : [];
      if (!reportRows.length) {
        const rowsRes = await authedFetch(`${API_URL}/api/reports/${reportId}/rows`).catch(() => null);
        if (rowsRes && rowsRes.ok) {
          const fetchedRows = await rowsRes.json();
          if (Array.isArray(fetchedRows)) reportRows = fetchedRows;
        }
      }

      setCurrentReport(metaData);
      setRows(reportRows);
      setHasChanges(false);
      sessionStorage.setItem('activeReportId', reportId);
      sessionStorage.setItem('safira_current_page', 'document');
      setCurrentPage('document');
    } catch (err) {
      console.warn(`Could not load report ${reportId}:`, err.message);
      sessionStorage.removeItem('activeReportId');
      sessionStorage.removeItem('activeReport');
      sessionStorage.removeItem('activeReportRows');
      sessionStorage.setItem('safira_current_page', 'landing');
      setCurrentReport(null);
      setRows([]);
      setCurrentPage('landing');
    } finally {
      setIsReportLoading(false);
    }
  };

  // Direct edit handlers
  const handleCellEdit = (index, field, value) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'initial_likelihood' || field === 'initial_severity') {
        const l = parseInt(updated[index].initial_likelihood) || 1;
        const s = parseInt(updated[index].initial_severity) || 1;
        updated[index].initial_risk_score = l * s;
        updated[index].initial_risk_index = getRiskLevel(l, s);
      }
      if (field === 'residual_likelihood' || field === 'residual_severity') {
        const l = parseInt(updated[index].residual_likelihood) || 1;
        const s = parseInt(updated[index].residual_severity) || 1;
        updated[index].residual_risk_score = l * s;
        updated[index].residual_risk_index = getRiskLevel(l, s);
      }
      return updated;
    });
    setHasChanges(true);
  };

  const handleMetaEdit = (field, value) => {
    setCurrentReport(prev => prev ? { ...prev, [field]: value } : prev);
    setHasChanges(true);
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, createDefaultRow()]);
    setHasChanges(true);
  };

  const handleDeleteRow = useCallback((index) => {
    requestConfirm({
      title: 'Delete Hazard Row?',
      message: `Are you sure you want to remove row #${index + 1}?`,
      confirmText: 'Delete Row',
      onConfirm: () => {
        setRows(prev => prev.filter((_, idx) => idx !== index));
        setHasChanges(true);
      }
    });
  }, [requestConfirm]);

  const handleDeleteReport = useCallback((reportId) => {
    requestConfirm({
      title: 'Delete HIRAC Report?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete Report',
      useCountdown: true,
      onConfirm: async () => {
        setLoadingMessage("Deleting report...");
        setIsPageLoading(true);
        try {
          const res = await authedFetch(`${API_URL}/api/reports/${reportId}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error('Failed to delete report');
          setReports(prev => prev.filter(r => r.id !== reportId));
          if (currentReport?.id === reportId) {
            setCurrentReport(null);
            setRows([]);
            setCurrentPage('landing');
          }
        } catch (err) {
          alert(`Error deleting report: ${err.message}`);
        } finally {
          setIsPageLoading(false);
        }
      }
    });
  }, [authedFetch, currentReport, requestConfirm]);

  const handleSave = async () => {
    if (!currentReport) return;
    setIsSaving(true);
    try {
      const metaRes = await authedFetch(`${API_URL}/api/reports/${currentReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentReport)
      });
      if (!metaRes.ok) throw new Error('Failed to save report metadata');

      const rowsRes = await authedFetch(`${API_URL}/api/reports/${currentReport.id}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });
      if (!rowsRes.ok) throw new Error('Failed to save report rows');

      setHasChanges(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      fetchReports();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (currentReport?.id) {
      loadReport(currentReport.id);
    }
  };

  const handleGetToWork = async () => {
    setIsPageLoading(true);
    setLoadingMessage("Opening latest safety assessment...");
    try {
      if (reports.length > 0) {
        await loadReport(reports[0].id);
      } else {
        const defaultMeta = createDefaultReportMeta();
        const defaultRow = createDefaultRow();
        const metaRes = await authedFetch(`${API_URL}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultMeta)
        });
        if (!metaRes.ok) throw new Error('Failed to create default report');
        const savedMeta = await metaRes.json();
        await authedFetch(`${API_URL}/api/reports/${savedMeta.id}/rows`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: [defaultRow] })
        });
        setReports([savedMeta, ...reports]);
        setCurrentReport(savedMeta);
        setRows([defaultRow]);
        sessionStorage.setItem('activeReportId', savedMeta.id);
        sessionStorage.setItem('safira_current_page', 'document');
        setCurrentPage('document');
      }
    } catch (err) {
      console.warn("Fallback to default report view:", err);
      const defaultMeta = { id: 'temp-default-' + Date.now(), ...createDefaultReportMeta() };
      const defaultRow = createDefaultRow();
      setCurrentReport(defaultMeta);
      setRows([defaultRow]);
      sessionStorage.setItem('safira_current_page', 'document');
      setCurrentPage('document');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!incidentPrompt.trim()) return;
    setIsGenerating(true);
    try {
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

      await authedFetch(`${API_URL}/api/reports/${savedReportMeta.id}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: generatedRows })
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      setReports([savedReportMeta, ...reports]);
      setCurrentReport(savedReportMeta);
      setRows(generatedRows);
      sessionStorage.setItem('activeReportId', savedReportMeta.id);
      sessionStorage.setItem('safira_current_page', 'document');
      setCurrentPage('document');
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

  const handlePrint = () => {
    const formElements = document.querySelectorAll('input, select, textarea');
    const savedStyles = [];
    formElements.forEach(el => {
      savedStyles.push(el.getAttribute('style') || '');
      const width = el.getBoundingClientRect().width;
      if (width > 0) {
        el.style.width = `${width}px`;
      }
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
    handleKeyLogin,
    handleKeyGenerate,
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
    handleApproveManual,
    handleDeleteManual,
    handleCellEdit,
    handleMetaEdit,
    handleGetToWork,
    handleCreateReport,
    handleSendMessage,
    handlePrint,
    confirmModalState,
    closeConfirmModal,
    handleDeleteReport,
    lastSaved,
    isReportLoading
  };
}
