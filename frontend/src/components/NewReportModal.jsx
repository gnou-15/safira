import '../css/NewReportModal.css';

export default function NewReportModal({
  showModal,
  setShowModal,
  newReportMeta,
  setNewReportMeta,
  incidentPrompt,
  setIncidentPrompt,
  handleCreateReport,
  isGenerating
}) {
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
            </div>
          </div>
        )}
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
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setShowModal(false)} 
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
