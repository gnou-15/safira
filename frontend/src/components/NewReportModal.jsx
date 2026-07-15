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
