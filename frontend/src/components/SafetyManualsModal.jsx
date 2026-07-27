import '../css/SafetyManualsModal.css';

const PRESET_MANUALS = [
  'OSH-Standards-2020-Edition.pdf',
  'iata-safety-report-2021.pdf'
];

export default function SafetyManualsModal({
  showManualsModal,
  setShowManualsModal,
  manuals = [],
  isLoadingManuals,
  isUploadingManual,
  dragOver,
  setDragOver,
  manualsAlert,
  handleUploadFile,
  handleApproveManual,
  handleDeleteManual,
  user
}) {
  if (!showManualsModal) return null;

  const isAdmin = user?.username === 'ADM-000';

  // Role-based document visibility filtering
  const visibleManuals = (manuals || []).filter(item => {
    if (!item) return false;
    const filename = typeof item === 'string' ? item : item.filename;
    if (!filename) return false;
    const isPreset = PRESET_MANUALS.includes(filename) || (typeof item === 'object' && item.isPreset);
    if (isAdmin) return true; // Admin sees all
    
    if (typeof item === 'string') return isPreset;
    const isMine = item.uploadedBy === user?.username;
    const isApproved = item.status === 'approved' || isPreset;
    return isPreset || isMine || isApproved;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content manuals-modal-content" style={{ maxWidth: '650px', width: '90%' }}>
        <div className="manuals-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Airport Safety Manuals Manager</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {isAdmin 
                ? '🔑 Admin Key Dashboard (ADM-000) — Manage & approve all user manuals' 
                : `Account: ${user?.username || 'User'} — Retained custom safety SOPs`}
            </span>
          </div>
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
            <strong>Click to upload</strong> or drag and drop custom safety guidelines
          </p>
          <span className="dropzone-hint">
            {isAdmin 
              ? 'Upload system-wide manuals or SOPs (PDF/TXT)' 
              : `Upload custom SOPs retained exclusively for your key account (${user?.username || 'User'})`}
          </span>
        </div>

        {/* Uploaded Manuals List */}
        <div className="manuals-list-section" style={{ marginTop: '24px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Active Safety Reference Documents ({visibleManuals.length})
          </h4>
          
          {isLoadingManuals ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading referenced safety manuals...
            </div>
          ) : visibleManuals.length === 0 ? (
            <div className="manuals-empty-state" style={{ textAlign: 'center', padding: '30px 20px', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>No reference manuals found for your account.</p>
              <span style={{ fontSize: '11px' }}>System presets (OSH Standards & IATA Safety) are enabled by default.</span>
            </div>
          ) : (
            <div className="manuals-scroll-list" style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              {visibleManuals.map((item, i) => {
                const filename = typeof item === 'string' ? item : item.filename;
                const isPreset = PRESET_MANUALS.includes(filename) || (typeof item === 'object' && item.isPreset);
                const isMine = typeof item === 'object' && item.uploadedBy === user?.username;
                const isPending = typeof item === 'object' && item.status === 'pending';

                return (
                  <div key={i} className="manuals-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < visibleManuals.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{filename.toLowerCase().endsWith('.pdf') ? '📄' : '📝'}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{filename}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                          {isPreset ? (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Preset</span>
                          ) : (
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                              {isMine ? 'My Upload' : `Uploaded by ${item.uploadedBy || 'User'}`}
                            </span>
                          )}

                          {isPending && (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Pending Approval</span>
                          )}
                          {typeof item === 'object' && item.status === 'approved' && !isPreset && (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>Approved Global</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Admin Check (✓ Approve) and Wrong (✕ Reject) Buttons */}
                      {isAdmin && isPending && (
                        <>
                          <button 
                            type="button"
                            className="btn-admin-approve"
                            title="Approve manual for all users"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (handleApproveManual) handleApproveManual(filename);
                            }}
                            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: '800', fontSize: '13px' }}
                          >
                            ✓
                          </button>
                          <button 
                            type="button"
                            className="btn-admin-reject"
                            title="Reject & delete manual"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteManual(filename);
                            }}
                            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', width: '26px', height: '26px', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}
                          >
                            ✕
                          </button>
                        </>
                      )}

                      {/* Delete Button: Admin can delete any; Regular users can only delete their own non-preset manuals */}
                      {(!isPending || !isAdmin) && (isAdmin || (isMine && !isPreset)) && (
                        <button 
                          type="button"
                          className="btn-delete-manual"
                          title={isPreset ? "Delete Preset Manual (Admin Only)" : "Delete Document"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteManual(filename);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'inline-flex' }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 4 6 L 19 3 M 9.5 3.5 L 13.5 2.7" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 6 7 L 7.3 19 C 7.4 20.1 8.3 21 9.4 21 L 14.6 21 C 15.7 21 16.6 20.1 16.7 19 L 18 7 Z" fill="#ef4444" stroke="#ef4444" strokeWidth="1.2" strokeLinejoin="round" />
                            <line x1="9.5" y1="10" x2="10" y2="17" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                            <line x1="12" y1="10" x2="12" y2="17" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                            <line x1="14.5" y1="10" x2="14" y2="17" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
