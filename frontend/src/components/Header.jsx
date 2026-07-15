export default function Header({
  currentReport,
  setCurrentReport,
  reports,
  loadReport,
  handleGetToWork,
  handleOpenManualsModal,
  setShowModal,
  handlePrint,
  fetchReports
}) {
  return (
    <header className="top-nav">
      {!currentReport ? (
        <>
          <div className="logo-container" onClick={() => fetchReports()}>
            <div className="safira-logo-wrapper">
              <svg viewBox="0 0 100 100" className="safira-logo" width="30" height="30">
                <defs>
                  <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00f2fe" floodOpacity="0.3" />
                  </filter>
                </defs>

                <g filter="url(#logo-glow)">
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
            <span className="landing-nav-link active">Home</span>
            <span className="landing-nav-link">About Us</span>
            <span className="landing-nav-link">Service</span>
            <span className="landing-nav-link">Contact</span>
          </div>
        </>
      ) : (
        <>
          <div className="logo-container" onClick={() => setCurrentReport(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
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
          {reports.length > 0 && (
            <select
              className="report-select-dropdown"
              value={currentReport?.id || ''}
              onChange={(e) => loadReport(e.target.value)}
            >
              <option value="" disabled>Select a Report...</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.title}
                </option>
              ))}
            </select>
          )}
          <div className="nav-actions">
            <button className="btn-secondary btn-nav-manuals" onClick={handleOpenManualsModal}>📚 Safety Manuals</button>
            <button className="btn-secondary" onClick={() => setShowModal(true)}>+ Generate New HIRAC</button>
            <button className="btn-primary" onClick={handlePrint}>EXPORT</button>
          </div>
        </>
      )}
    </header>
  );
}
