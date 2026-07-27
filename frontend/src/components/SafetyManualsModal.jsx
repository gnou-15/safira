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

  const handleDownloadFile = (filename, item) => {
    const presetPath = `/documents/${encodeURIComponent(filename)}`;

    // 1. System preset download from public/documents
    if (PRESET_MANUALS.includes(filename)) {
      const link = document.createElement('a');
      link.href = presetPath;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 2. Custom uploaded file download via blob
    if (item && typeof item === 'object' && item.base64_data) {
      try {
        let base64 = item.base64_data;
        if (base64.includes(',')) base64 = base64.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mimeType = filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'text/plain';
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (e) {
        console.warn("Base64 blob conversion error:", e);
      }
    }

    // 3. Fallback direct download link
    const link = document.createElement('a');
    link.href = presetPath;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content manuals-modal-content" style={{ maxWidth: '640px', width: '92%', padding: '28px' }}>
        {/* Header */}
        <div className="manuals-modal-header">
          <div className="manuals-header-text">
            <h3 className="manuals-modal-title">Airport Safety Manuals Manager</h3>
            <div className="manuals-subtitle-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'nowrap' }}>
              <span className="manuals-modal-subtitle">
                {isAdmin 
                  ? '🔑 Admin Key Dashboard (ADM-000) — Manage & approve all user manuals' 
                  : `Account: ${user?.username || 'User'} — Retained custom safety SOPs`}
              </span>
              {manualsAlert.message && (
                <span className={`manuals-alert-pill alert-${manualsAlert.type}`}>
                  {manualsAlert.type === 'info' && <span className="spinner-small" style={{ marginRight: '4px' }}>⏳</span>}
                  {manualsAlert.message}
                </span>
              )}
            </div>
          </div>
          <button 
            type="button" 
            className="manuals-close-btn"
            onClick={() => setShowManualsModal(false)}
            title="Close Manager"
          >
            ✕
          </button>
        </div>

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
          {/* Flat Blue Upload Icon from reference sample */}
          <div className="dropzone-icon-wrapper">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3a9ad9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 4 12 v 6 a 2 2 0 0 0 2 2 h 12 a 2 2 0 0 0 2 -2 v -6" />
              <polyline points="16 8 12 4 8 8" />
              <line x1="12" y1="4" x2="12" y2="16" />
            </svg>
          </div>
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
        <div className="manuals-list-section">
          <h4 className="manuals-section-heading">
            Active Safety Reference Documents ({visibleManuals.length})
          </h4>
          
          {isLoadingManuals ? (
            <div className="manuals-loading-text">
              Loading referenced safety manuals...
            </div>
          ) : visibleManuals.length === 0 ? (
            <div className="manuals-empty-card">
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>No reference manuals found for your account.</p>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>System presets (OSH Standards & IATA Safety) are enabled by default.</span>
            </div>
          ) : (
            <div className="manuals-scroll-list">
              {visibleManuals.map((item, i) => {
                const filename = typeof item === 'string' ? item : item.filename;
                const isPreset = PRESET_MANUALS.includes(filename) || (typeof item === 'object' && item.isPreset);
                const isMine = typeof item === 'object' && item.uploadedBy === user?.username;
                const isPending = typeof item === 'object' && item.status === 'pending';

                return (
                  <div key={i} className="manuals-list-item">
                    <div 
                      className="manual-item-left clickable-download-zone"
                      onClick={() => handleDownloadFile(filename, item)}
                      title="Click to download"
                    >
                      {/* Flat Blue Document Icon from reference sample */}
                      <div className="file-flat-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3a9ad9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M 14 2 H 6 a 2 2 0 0 0 -2 2 v 16 a 2 2 0 0 0 2 2 h 12 a 2 2 0 0 0 2 -2 V 8 Z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                          <line x1="8" y1="15" x2="16" y2="15" />
                          <line x1="8" y1="18" x2="13" y2="18" />
                        </svg>
                      </div>

                      <div className="file-info-col">
                        <div className="file-name-row">
                          <span className="file-name-text">{filename}</span>
                          {isPreset ? (
                            <span className="badge-tag tag-preset">Preset</span>
                          ) : (
                            <span className="badge-tag tag-user">
                              {isMine ? 'My Upload' : `Uploaded by ${item.uploadedBy || 'User'}`}
                            </span>
                          )}

                          {isPending && (
                            <span className="badge-tag tag-pending">Pending Approval</span>
                          )}
                          {typeof item === 'object' && item.status === 'approved' && !isPreset && (
                            <span className="badge-tag tag-approved">Approved Global</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="manual-actions-right">
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

        {/* Modal Actions Footer */}
        <div className="manuals-modal-footer">
          <button 
            type="button" 
            className="btn-close-manager" 
            onClick={() => setShowManualsModal(false)}
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
}
