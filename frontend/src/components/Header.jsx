import { useState } from 'react';
import '../css/Header.css';

export default function Header({
  user,
  handleLogout,
  setCurrentPage,
  handleNavigate,
  currentReport,
  setCurrentReport,
  handleExitToLanding,
  reports,
  loadReport,
  handleGetToWork,
  handleOpenManualsModal,
  setShowModal,
  handlePrint,
  fetchReports,
  isSaving,
  hasChanges,
  lastSaved,
  handleKeyLogin,
  currentInvestigation,
  investigations,
  loadInvestigation,
  setShowInvestigationModal,
  hasInvestigationChanges,
  handleExitInvestigation
}) {
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [copyText, setCopyText] = useState("Copy");
  return (
    <header className="top-nav">
      {!currentReport && !currentInvestigation ? (
        <>
          <div className="logo-container" onClick={() => fetchReports()}>
            <div className="safira-logo-wrapper">
              <svg viewBox="0 0 100 100" className="safira-logo" width="30" height="30">
                <defs>
                  <filter id="logo-glow-ed" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00f2fe" floodOpacity="0.3" />
                  </filter>
                </defs>

                <g filter="url(#logo-glow-ed)">
                  {/* Face under the helmet */}
                  <path d="M 26,44 C 26,62 30,76 50,76 C 70,76 74,62 74,44 Z" fill="#fde0c5" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />

                  {/* Cute Smile (visible below goggles) */}
                  <path d="M 46,65 Q 50,69 54,65" fill="none" stroke="#3b1c14" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Pink Cheeks (peeking out) */}
                  <circle cx="33" cy="62" r="3.5" fill="#fca5a5" opacity="0.6" />
                  <circle cx="67" cy="62" r="3.5" fill="#fca5a5" opacity="0.6" />

                  {/* Helmet Dome */}
                  <path d="M 18,45 C 18,20 32,10 50,10 C 68,10 82,20 82,45 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 50,10 L 50,45" stroke="#3b1c14" strokeWidth="2.5" />

                  {/* Left Ear Flap Outer */}
                  <path d="M 22,42 C 16,52 14,64 15,78 C 16,84 20,86 23,83 C 26,80 26,68 26,42 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* Left Ear Flap Inner Fleece */}
                  <path d="M 25,44 C 22,50 20,60 21,76 C 21.5,79 23,80 24.5,78 C 26,75 26.5,66 26.5,44 Z" fill="#f6e5b5" stroke="#3b1c14" strokeWidth="1.5" strokeLinejoin="round" />

                  {/* Right Ear Flap Outer */}
                  <path d="M 78,42 C 84,52 86,64 85,78 C 84,84 80,86 77,83 C 74,80 74,68 74,42 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  {/* Right Ear Flap Inner Fleece */}
                  <path d="M 75,44 C 78,50 80,60 79,76 C 78.5,79 77,80 75.5,78 C 74,75 73.5,66 73.5,44 Z" fill="#f6e5b5" stroke="#3b1c14" strokeWidth="1.5" strokeLinejoin="round" />

                  {/* Goggles Strap (Moved down to eye level) */}
                  <path d="M 18,52 C 18,52 30,50 50,50 C 70,50 82,52 82,52" stroke="#451c14" strokeWidth="6" strokeLinecap="round" />

                  {/* Goggles Left */}
                  <circle cx="39" cy="52" r="10" fill="#e5832a" stroke="#3b1c14" strokeWidth="2" />
                  <circle cx="39" cy="52" r="7.5" fill="#f9ab55" stroke="#3b1c14" strokeWidth="1.5" />
                  <circle cx="39" cy="52" r="6" fill="#7cd4d5" stroke="#3b1c14" strokeWidth="1.5" />
                  <path d="M 36,50 L 38,48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Goggles Right */}
                  <circle cx="61" cy="52" r="10" fill="#e5832a" stroke="#3b1c14" strokeWidth="2" />
                  <circle cx="61" cy="52" r="7.5" fill="#f9ab55" stroke="#3b1c14" strokeWidth="1.5" />
                  <circle cx="61" cy="52" r="6" fill="#7cd4d5" stroke="#3b1c14" strokeWidth="1.5" />
                  <path d="M 58,50 L 60,48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <span className="brand-text">Safira <span className="brand-subtext">by Nezer</span></span>
          </div>
          <div className="landing-nav-links">

            {user ? (
              <div className="header-key-widget-container">
                <button
                  type="button"
                  className={`header-key-btn ${showKeyDropdown ? 'active' : ''}`}
                  onClick={() => setShowKeyDropdown(!showKeyDropdown)}
                  title="View your Secure Key"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-key-svg">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L14 9" />
                  </svg>
                </button>
                {showKeyDropdown && (
                  <div className="header-key-dropdown">
                    <div className="dropdown-key-title">Your Secure Key</div>
                    <div
                      className={`dropdown-key-box ${copyText === "Copied!" ? "success" : ""}`}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(user.username);
                          setCopyText("Copied!");
                          setTimeout(() => setCopyText("Copy"), 2000);
                        } catch (e) {
                          console.warn("Copy failed");
                        }
                      }}
                      title="Click anywhere to copy secure key"
                    >
                      <span className="dropdown-key-val">
                        {copyText === "Copied!" ? "COPIED" : user.username}
                      </span>
                      <button type="button" className="dropdown-copy-btn" tabIndex="-1">
                        {copyText === "Copied!" ? "✓" : "📋"}
                      </button>
                    </div>
                    <button type="button" className="dropdown-logout-btn" onClick={() => { setShowKeyDropdown(false); handleLogout(); }}>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-keyhole-wrapper">
                <button
                  type="button"
                  className="header-keyhole-btn"
                  onClick={async () => {
                    const rememberedKey = localStorage.getItem('safira_remembered_key');
                    if (rememberedKey) {
                      try {
                        await handleKeyLogin(rememberedKey);
                      } catch (e) {
                        handleNavigate('login');
                      }
                    } else {
                      handleNavigate('login');
                    }
                  }}
                  title="Unlock Safira Workspace"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-keyhole-svg">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="10" r="3" fill="currentColor" />
                    <path d="M10 13 L14 13 L15 18 L9 18 Z" fill="currentColor" />
                  </svg>
                </button>

                {/* Subtle attention-catching prompt bubble */}
                <div className="keyhole-prompt-bubble">
                  Unlock workspace key!
                  <div className="bubble-arrow"></div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="logo-container" onClick={currentReport ? handleExitToLanding : handleExitInvestigation} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <div className="safira-logo-wrapper">
                <svg viewBox="0 0 100 100" className="safira-logo" width="30" height="30">
                  <defs>
                    <filter id="logo-glow-ed" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00f2fe" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  <g filter="url(#logo-glow-ed)">
                    {/* Face under the helmet */}
                    <path d="M 26,44 C 26,62 30,76 50,76 C 70,76 74,62 74,44 Z" fill="#fde0c5" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />

                    {/* Cute Smile (visible below goggles) */}
                    <path d="M 46,65 Q 50,69 54,65" fill="none" stroke="#3b1c14" strokeWidth="2.2" strokeLinecap="round" />

                    {/* Pink Cheeks (peeking out) */}
                    <circle cx="33" cy="62" r="3.5" fill="#fca5a5" opacity="0.6" />
                    <circle cx="67" cy="62" r="3.5" fill="#fca5a5" opacity="0.6" />

                    {/* Helmet Dome */}
                    <path d="M 18,45 C 18,20 32,10 50,10 C 68,10 82,20 82,45 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M 50,10 L 50,45" stroke="#3b1c14" strokeWidth="2.5" />

                    {/* Left Ear Flap Outer */}
                    <path d="M 22,42 C 16,52 14,64 15,78 C 16,84 20,86 23,83 C 26,80 26,68 26,42 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Left Ear Flap Inner Fleece */}
                    <path d="M 25,44 C 22,50 20,60 21,76 C 21.5,79 23,80 24.5,78 C 26,75 26.5,66 26.5,44 Z" fill="#f6e5b5" stroke="#3b1c14" strokeWidth="1.5" strokeLinejoin="round" />

                    {/* Right Ear Flap Outer */}
                    <path d="M 78,42 C 84,52 86,64 85,78 C 84,84 80,86 77,83 C 74,80 74,68 74,42 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Right Ear Flap Inner Fleece */}
                    <path d="M 75,44 C 78,50 80,60 79,76 C 78.5,79 77,80 75.5,78 C 74,75 73.5,66 73.5,44 Z" fill="#f6e5b5" stroke="#3b1c14" strokeWidth="1.5" strokeLinejoin="round" />

                    {/* Goggles Strap (Moved down to eye level) */}
                    <path d="M 18,52 C 18,52 30,50 50,50 C 70,50 82,52 82,52" stroke="#451c14" strokeWidth="6" strokeLinecap="round" />

                    {/* Goggles Left */}
                    <circle cx="39" cy="52" r="10" fill="#e5832a" stroke="#3b1c14" strokeWidth="2" />
                    <circle cx="39" cy="52" r="7.5" fill="#f9ab55" stroke="#3b1c14" strokeWidth="1.5" />
                    <circle cx="39" cy="52" r="6" fill="#7cd4d5" stroke="#3b1c14" strokeWidth="1.5" />
                    <path d="M 36,50 L 38,48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Goggles Right */}
                    <circle cx="61" cy="52" r="10" fill="#e5832a" stroke="#3b1c14" strokeWidth="2" />
                    <circle cx="61" cy="52" r="7.5" fill="#f9ab55" stroke="#3b1c14" strokeWidth="1.5" />
                    <circle cx="61" cy="52" r="6" fill="#7cd4d5" stroke="#3b1c14" strokeWidth="1.5" />
                    <path d="M 58,50 L 60,48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
              <span className="brand-text">Safira</span>
            </div>
            {currentReport && reports.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <div className="custom-report-selector">
                  <button
                    type="button"
                    className={`custom-select-trigger ${showReportDropdown ? 'active' : ''}`}
                    onClick={() => setShowReportDropdown(!showReportDropdown)}
                  >
                    <span className="trigger-text" title={currentReport?.title || 'Select a Report...'}>
                      {currentReport?.title || 'Select a Report...'}
                    </span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showReportDropdown && (
                    <>
                      {/* Invisible click backdrop to dismiss dropdown */}
                      <div className="custom-select-backdrop" onClick={() => setShowReportDropdown(false)}></div>

                      <div className="custom-select-menu">
                        <div className="custom-menu-header">Available HIRAC Worksheets</div>
                        <div className="custom-menu-options">
                          {reports.map((report) => (
                            <div
                              key={report.id}
                              className={`custom-select-option ${currentReport?.id === report.id ? 'selected' : ''}`}
                              onClick={() => {
                                loadReport(report.id);
                                setShowReportDropdown(false);
                              }}
                            >
                              <span className="option-bullet"></span>
                              <span className="option-title" title={report.title}>{report.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Autosave Status Indicator */}
                <div className="header-save-status">
                  {isSaving ? (
                    <span className="status-saving">
                      Saving...
                    </span>
                  ) : hasChanges ? (
                    <span className="status-pending">
                      Saving soon...
                    </span>
                  ) : (
                    <span className="status-saved">
                      Saved{lastSaved ? ` at ${lastSaved}` : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {currentInvestigation && investigations.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <div className="custom-report-selector">
                  <button
                    type="button"
                    className={`custom-select-trigger ${showReportDropdown ? 'active' : ''}`}
                    onClick={() => setShowReportDropdown(!showReportDropdown)}
                  >
                    <span className="trigger-text" title={currentInvestigation?.title || 'Select an Investigation...'}>
                      {currentInvestigation?.title || 'Select an Investigation...'}
                    </span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showReportDropdown && (
                    <>
                      <div className="custom-select-backdrop" onClick={() => setShowReportDropdown(false)}></div>

                      <div className="custom-select-menu">
                        <div className="custom-menu-header">Available Investigations</div>
                        <div className="custom-menu-options">
                          {investigations.map((inv) => (
                            <div
                              key={inv.id}
                              className={`custom-select-option ${currentInvestigation?.id === inv.id ? 'selected' : ''}`}
                              onClick={() => {
                                loadInvestigation(inv.id);
                                setShowReportDropdown(false);
                              }}
                            >
                              <span className="option-bullet" style={{ backgroundColor: '#f59e0b' }}></span>
                              <span className="option-title" title={inv.title}>{inv.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="header-save-status">
                  {hasInvestigationChanges ? (
                    <span className="status-pending">
                      Saving soon...
                    </span>
                  ) : (
                    <span className="status-saved">
                      Saved
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="nav-actions">
            {currentReport && (
              <>
                <button className="btn-nav-action btn-nav-generate" onClick={() => setShowModal(true)}>+ Generate New HIRAC</button>
                <button className="btn-nav-action btn-nav-export" onClick={handlePrint}>Export</button>
              </>
            )}
            {currentInvestigation && (
              <>
                <button className="btn-nav-action btn-nav-generate" onClick={() => setShowInvestigationModal(true)}>+ New Investigation</button>
                <button className="btn-nav-action btn-nav-export" onClick={handlePrint}>Export</button>
              </>
            )}

            {/* Back to Home Button when open in workspace */}
            {(currentReport || currentInvestigation) && (
              <button
                type="button"
                className="btn-nav-back-home"
                onClick={currentReport ? handleExitToLanding : handleExitInvestigation}
              >
                ← Back
              </button>
            )}

            {/* Secure Key Widget */}
            {user && !currentReport && !currentInvestigation && (
              <div className="header-key-widget-container">
                <button
                  type="button"
                  className={`header-key-btn ${showKeyDropdown ? 'active' : ''}`}
                  onClick={() => setShowKeyDropdown(!showKeyDropdown)}
                  title="View your Secure Key"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="btn-key-svg">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L14 9" />
                  </svg>
                </button>
                {showKeyDropdown && (
                  <div className="header-key-dropdown">
                    <div className="dropdown-key-title">Your Secure Key</div>
                    <div
                      className={`dropdown-key-box ${copyText === "Copied!" ? "success" : ""}`}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(user.username);
                          setCopyText("Copied!");
                          setTimeout(() => setCopyText("Copy"), 2000);
                        } catch (e) {
                          console.warn("Copy failed");
                        }
                      }}
                      title="Click anywhere to copy secure key"
                    >
                      <span className="dropdown-key-val">
                        {copyText === "Copied!" ? "COPIED" : user.username}
                      </span>
                      <button type="button" className="dropdown-copy-btn" tabIndex="-1">
                        {copyText === "Copied!" ? "✓" : "📋"}
                      </button>
                    </div>
                    <button type="button" className="dropdown-logout-btn" onClick={() => { setShowKeyDropdown(false); handleLogout(); }}>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
