import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const authedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('safira_token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

export default function useInvestigations(user, setCurrentPage) {
  const [investigations, setInvestigations] = useState([]);
  const [currentInvestigation, setCurrentInvestigation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const idleTimerRef = useRef(null);

  // Fetch all investigations
  const loadInvestigations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/api/investigations`);
      if (res.ok) {
        const data = await res.json();
        setInvestigations(data);
      }
    } catch (err) {
      console.error('Failed to load investigations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load a single investigation report
  const loadInvestigation = async (id) => {
    if (!id) return;
    setLoadingMessage("Loading investigation report...");
    setIsLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/api/investigations/${id}`);
      if (!res.ok) throw new Error('Failed to load investigation');
      const data = await res.json();
      setCurrentInvestigation(data);
      sessionStorage.setItem('activeInvestigationId', id);
      sessionStorage.setItem('safira_current_page', 'investigation');
      setCurrentPage('investigation');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create an investigation report using Groq
  const handleCreateInvestigation = async (meta) => {
    setIsGenerating(true);
    setLoadingMessage("Analyzing incident using AI...");
    try {
      // 1. Generate via AI proxy
      const aiRes = await authedFetch(`${API_URL}/api/ai/investigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      });

      if (!aiRes.ok) {
        const errData = await aiRes.json().catch(() => ({}));
        throw new Error(errData.error || 'AI Investigation generation failed');
      }

      const generated = await aiRes.json();

      // 2. Save metadata and AI fields to database
      const saveRes = await authedFetch(`${API_URL}/api/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generated.title || meta.title,
          id_number: meta.id_number,
          position: meta.position,
          date_of_hiring: meta.date_of_hiring,
          trainings: meta.trainings,
          executive_summary: meta.executive_summary,
          operational_irregularity: generated.operational_irregularity,
          risk_index: generated.risk_index,
          analysis: generated.analysis,
          root_cause: generated.root_cause,
          corrective_action: generated.corrective_action,
          preventive_action: generated.preventive_action
        })
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save investigation report');
      }
      const saved = await saveRes.json();

      // Refresh list, load active, close modals
      setInvestigations([saved, ...investigations]);
      setCurrentInvestigation(saved);
      sessionStorage.setItem('activeInvestigationId', saved.id);
      sessionStorage.setItem('safira_current_page', 'investigation');
      setCurrentPage('investigation');
      setShowModal(false);
    } catch (err) {
      alert(`Error generating report: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update field edit
  const handleFieldEdit = (field, value) => {
    if (!currentInvestigation) return;
    setCurrentInvestigation(prev => {
      const updated = { ...prev, [field]: value };
      markChanged(updated);
      return updated;
    });
  };

  // Save changes to database
  const saveChanges = async (updatedDoc) => {
    if (!updatedDoc) return;
    try {
      const res = await authedFetch(`${API_URL}/api/investigations/${updatedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoc)
      });
      if (res.ok) {
        setHasChanges(false);
        // Sync back into investigations list
        setInvestigations(prev => prev.map(item => item.id === updatedDoc.id ? updatedDoc : item));
      }
    } catch (err) {
      console.error('Failed to auto-save investigation:', err);
    }
  };

  // Trigger 1.5s idle timer for auto-save
  const markChanged = (updatedDoc) => {
    setHasChanges(true);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      saveChanges(updatedDoc);
    }, 1500);
  };

  const handleSaveExplicit = async () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    await saveChanges(currentInvestigation);
  };

  // Delete investigation
  const handleDeleteInvestigation = async (id) => {
    if (!id) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this investigation report? This action cannot be undone.");
    if (!confirmDelete) return;

    setLoadingMessage("Deleting investigation report...");
    setIsLoading(true);
    try {
      const res = await authedFetch(`${API_URL}/api/investigations/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete report');
      }

      setInvestigations(prev => prev.filter(item => item.id !== id));
      setCurrentInvestigation(null);
      sessionStorage.removeItem('activeInvestigationId');
      setCurrentPage('landing');
    } catch (err) {
      alert(`Error deleting investigation: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitInvestigation = async () => {
    if (hasChanges) {
      await saveChanges(currentInvestigation);
    }
    setLoadingMessage("Closing investigation report...");
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      sessionStorage.removeItem('activeInvestigationId');
      sessionStorage.setItem('safira_current_page', 'landing');
      setCurrentInvestigation(null);
      setCurrentPage('landing');
    } finally {
      setIsLoading(false);
    }
  };

  // Load from session storage on mount
  useEffect(() => {
    if (user) {
      loadInvestigations();
      const activeId = sessionStorage.getItem('activeInvestigationId');
      const savedPage = sessionStorage.getItem('safira_current_page');
      if (activeId && savedPage === 'investigation') {
        loadInvestigation(activeId);
      }
    } else {
      setInvestigations([]);
      setCurrentInvestigation(null);
    }
  }, [user, loadInvestigations]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return {
    investigations,
    currentInvestigation,
    isLoadingInvestigations: isLoading,
    isGeneratingInvestigation: isGenerating,
    hasInvestigationChanges: hasChanges,
    investigationLoadingMessage: loadingMessage,
    showInvestigationModal: showModal,
    setShowInvestigationModal: setShowModal,
    loadInvestigation,
    handleCreateInvestigation,
    handleFieldEdit,
    handleDeleteInvestigation,
    handleExitInvestigation,
    handleSaveExplicit
  };
}
