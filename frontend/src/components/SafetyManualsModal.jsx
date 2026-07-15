import '../css/SafetyManualsModal.css';

export default function SafetyManualsModal({
  showManualsModal,
  setShowManualsModal,
  manuals,
  isLoadingManuals,
  isUploadingManual,
  dragOver,
  setDragOver,
  manualsAlert,
  handleUploadFile,
  handleDeleteManual
}) {
  if (!showManualsModal) return null;

  return (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteManual(filename);
                    }}
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
  );
}
