import { useState, useEffect, useRef } from 'react';
import '../css/NewReportModal.css';

export default function NewReportModal({
  showModal,
  setShowModal,
  newReportMeta,
  setNewReportMeta,
  incidentPrompt,
  setIncidentPrompt,
  handleCreateReport,
  isGenerating,
  cancelGeneration
}) {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const debounceTimerRef = useRef(null);
  const lastFetchedTitleRef = useRef('');

  const fetchSuggestions = async (title, force = false) => {
    const trimmedTitle = (title || '').trim();
    if (!trimmedTitle || trimmedTitle.length < 3) return;
    if (!force && trimmedTitle === lastFetchedTitleRef.current) return;
    
    lastFetchedTitleRef.current = trimmedTitle;
    setIsSuggesting(true);

    try {
      const token = localStorage.getItem('safira_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ai/suggest-details`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: trimmedTitle })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.department) {
          setNewReportMeta(prev => ({ ...prev, department: data.department }));
        }
        if (data.description) {
          setIncidentPrompt(data.description);
        }
      }
    } catch (err) {
      console.error('Error fetching title suggestions:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleRegenerateDescription = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isSuggesting || isGenerating) return;

    let targetTitle = (newReportMeta.title || '').trim();
    if (!targetTitle) {
      targetTitle = 'Airport Ramp Operations & Ground Safety';
      setNewReportMeta(prev => ({ ...prev, title: targetTitle }));
    }
    fetchSuggestions(targetTitle, true);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setNewReportMeta(prev => ({ ...prev, title: val }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 650);
  };

  const handleTitleBlur = (e) => {
    const val = e.target.value;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    fetchSuggestions(val);
  };

  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        if (isGenerating) {
          if (cancelGeneration) cancelGeneration();
        } else {
          setShowModal(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, isGenerating, cancelGeneration, setShowModal]);

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <form className={`modal-content ${isGenerating ? 'generating' : ''}`} onSubmit={handleCreateReport}>
        {isGenerating && (
          <div className="modal-generating-overlay">
            <div className="modal-generating-loader">
              <div className="unique-buffer-icon">
                <svg className="unique-buffer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                  <circle className="outer-spin" cx="50" cy="50" r="40" fill="none" stroke="#3a9ad9" strokeWidth="3.5" strokeDasharray="40 20" />
                  <circle className="inner-spin" cx="50" cy="50" r="28" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="15 15" />
                  <g className="center-shield">
                    <path d="M 50,34 C 50,34 62,37 62,46 C 62,56 50,66 50,66 C 50,66 38,56 38,46 C 38,37 50,34 50,34 Z" fill="#3a9ad9" opacity="0.15" />
                    <path d="M 50,36 C 50,36 60,39 60,47 C 60,55 50,64 50,64 C 50,64 40,55 40,47 C 40,39 50,36 50,36 Z" fill="none" stroke="#3a9ad9" strokeWidth="2" />
                    <path d="M 45,50 L 49,54 L 56,45" fill="none" stroke="#3a9ad9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              <h4>Analyzing Hazard Scenario...</h4>
              <p>Our safety model is generating risk rows and control mitigations.</p>
              <button
                type="button"
                className="modal-generating-cancel-btn"
                onClick={cancelGeneration}
                title="Cancel generation (or press Esc)"
              >
                <kbd>ESC</kbd> Cancel Generating
              </button>
            </div>
          </div>
        )}
        <h3 className="modal-header-title">Generate HIRAC via AI Prompt</h3>
        
        <div className="modal-form-group">
          <label className="modal-label">Report Title</label>
          <input
            type="text"
            className="modal-input-field"
            value={newReportMeta.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            required
          />
        </div>

        <div className="modal-grid-layout">
          <div>
            <label className="modal-label">Location</label>
            <input
              type="text"
              className="modal-input-field"
              value={newReportMeta.location}
              onChange={(e) => setNewReportMeta({ ...newReportMeta, location: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="modal-label">Department</label>
            <input
              type="text"
              className="modal-input-field"
              value={newReportMeta.department || ''}
              onChange={(e) => setNewReportMeta({ ...newReportMeta, department: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="modal-form-group">
          <label className="modal-label">Describe the Incident, Activity, or Hazard Scenario</label>
          <div className="modal-prompt-container">
            <textarea
              className="modal-prompt-textarea"
              placeholder="e.g. A severe Typhoon warning in Mactan Cebu affecting baggage handler equipment and strong wind damage inside the passenger terminal..."
              value={incidentPrompt}
              onChange={(e) => setIncidentPrompt(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn-regenerate-prompt"
              onClick={handleRegenerateDescription}
              disabled={isSuggesting || isGenerating}
              title="Regenerate description scenario"
            >
              <svg
                className={`refresh-icon ${isSuggesting ? 'spin-anim' : ''}`}
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isSuggesting ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            className="btn-modal-cancel" 
            onClick={() => setShowModal(false)} 
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button type="submit" className="btn-modal-submit" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
