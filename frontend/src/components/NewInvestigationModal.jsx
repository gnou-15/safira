import { useState } from 'react';
import '../css/NewReportModal.css';

export default function NewInvestigationModal({
  showModal,
  setShowModal,
  handleCreateReport,
  isGenerating
}) {
  const [title, setTitle] = useState('Safety Incident Investigation Report');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [position, setPosition] = useState('');
  const [dateOfHiring, setDateOfHiring] = useState('');
  const [trainings, setTrainings] = useState('All trainings/courses are current');

  if (!showModal) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    handleCreateReport({
      title,
      executive_summary: executiveSummary,
      id_number: idNumber,
      position,
      date_of_hiring: dateOfHiring,
      trainings
    });
  };

  return (
    <div className="modal-overlay">
      <form className={`modal-content ${isGenerating ? 'generating' : ''}`} onSubmit={onSubmit} style={{ maxWidth: '600px' }}>
        {isGenerating && (
          <div className="modal-generating-overlay">
            <div className="modal-generating-loader">
              <div className="unique-buffer-icon">
                <svg className="unique-buffer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                  <circle className="outer-spin" cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="40 20" />
                  <circle className="inner-spin" cx="50" cy="50" r="28" fill="none" stroke="#3a9ad9" strokeWidth="2.5" strokeDasharray="15 15" />
                  <g className="center-shield">
                    <path d="M 50,34 C 50,34 62,37 62,46 C 62,56 50,66 50,66 C 50,66 38,56 38,46 C 38,37 50,34 50,34 Z" fill="#f59e0b" opacity="0.15" />
                    <path d="M 50,36 C 50,36 60,39 60,47 C 60,55 50,64 50,64 C 50,64 40,55 40,47 C 40,39 50,36 50,36 Z" fill="none" stroke="#f59e0b" strokeWidth="2" />
                    <path d="M 45,50 L 49,54 L 56,45" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
              <h4>Analyzing Incident Details...</h4>
              <p>Our safety model is generating factual analysis, root causes, and corrective actions.</p>
            </div>
          </div>
        )}
        <h3 className="modal-header-title">Generate Safety Incident Investigation</h3>
        
        <div className="modal-form-group">
          <label className="modal-label">Investigation Title</label>
          <input
            type="text"
            className="modal-input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Investigation Report: Aircraft Parking Position Deviation..."
          />
        </div>

        <div className="modal-grid-layout">
          <div>
            <label className="modal-label">Personnel ID Number</label>
            <input
              type="text"
              className="modal-input-field"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. M61348"
              required
            />
          </div>
          <div>
            <label className="modal-label">Personnel Position</label>
            <input
              type="text"
              className="modal-input-field"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Ground Equipment Operator"
              required
            />
          </div>
        </div>

        <div className="modal-grid-layout" style={{ marginTop: '12px' }}>
          <div>
            <label className="modal-label">Date of Hiring</label>
            <input
              type="text"
              className="modal-input-field"
              value={dateOfHiring}
              onChange={(e) => setDateOfHiring(e.target.value)}
              placeholder="e.g. October 26, 2023"
              required
            />
          </div>
          <div>
            <label className="modal-label">Trainings Completed</label>
            <input
              type="text"
              className="modal-input-field"
              value={trainings}
              onChange={(e) => setTrainings(e.target.value)}
              placeholder="e.g. All safety courses current"
              required
            />
          </div>
        </div>

        <div className="modal-form-group" style={{ marginTop: '12px' }}>
          <label className="modal-label">Describe the Incident (Executive Summary)</label>
          <textarea
            className="modal-prompt-textarea"
            placeholder="Describe what occurred, who was involved, time/date, how the incident proceeded, and the initial observed results..."
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            style={{ minHeight: '120px' }}
            required
          />
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
            {isGenerating ? 'Generating...' : 'Generate Investigation'}
          </button>
        </div>
      </form>
    </div>
  );
}
