import React, { useState, useEffect, useMemo } from 'react';
import { formatTimestampShort } from '../utils/formatTimestampShort';
import '../css/LandingPage.css';

export default function LandingPage({
  user,
  setCurrentPage,
  handleNavigate,
  reports,
  investigations,
  loadReport,
  loadInvestigation,
  handleGetToWork,
  handleGetToWorkInvestigation,
  handleKeyLogin,
  handleOpenManualsModal
}) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [lightning, setLightning] = useState(null);
  const [timeString, setTimeString] = useState('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timePart = now.toTimeString().split(' ')[0]; // HH:MM:SS
      const tzPart = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();
      const dayPart = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const monthPart = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      const datePart = now.getDate();
      const yearPart = now.getFullYear();

      setTimeString(`${timePart} ${tzPart} | ${dayPart} : ${monthPart} ${datePart}, ${yearPart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply/remove night-mode-active body class for CSS scoping (logged-out = night sky)
  useEffect(() => {
    if (!user) {
      document.body.classList.add('night-mode-active');
    } else {
      document.body.classList.remove('night-mode-active');
    }
    return () => {
      document.body.classList.remove('night-mode-active');
    };
  }, [user]);

  const handleAction = async () => {
    if (!user) {
      const rememberedKey = localStorage.getItem('safira_remembered_key');
      if (rememberedKey) {
        try {
          await handleKeyLogin(rememberedKey);
          setShowTypeSelector(true);
        } catch (e) {
          handleNavigate('login');
        }
      } else {
        handleNavigate('login');
      }
    } else {
      setShowTypeSelector(true);
    }
  };

  const handleReportClick = (report) => {
    if (!user) {
      handleNavigate('login');
    } else {
      if (report.docType === 'investigation') {
        loadInvestigation(report.id);
      } else {
        loadReport(report.id);
      }
    }
  };

  const unifiedRecentReports = [
    ...(reports || []).map((r) => ({ ...r, docType: 'hirac' })),
    ...(investigations || []).map((i) => ({ ...i, docType: 'investigation' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range: -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Generate stable randomized star positions once per mount
  const stars = useMemo(() => {
    const variants = ['twinkle-a', 'twinkle-b', 'twinkle-c'];
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      top: `${(Math.random() * 90).toFixed(1)}%`,
      left: `${(Math.random() * 100).toFixed(1)}%`,
      size: `${(Math.random() * 1.8 + 0.7).toFixed(1)}px`,
      delay: `${(Math.random() * 6).toFixed(2)}s`,
      duration: `${(Math.random() * 3 + 2).toFixed(2)}s`,
      variant: variants[i % 3],
      bright: i < 12,
    }));
  }, []);

  const triggerLightning = (cloudId, startX, startY) => {
    // Apply parallax offset only to Cloud 1 (left cloud) which has mouse tracking
    let offsetX = 0;
    let offsetY = 0;
    if (cloudId === 'left') {
      offsetX = mouseOffset.x * 22;
      offsetY = mouseOffset.y * 11;
    }

    const isBackground = cloudId === 'bg-left' || cloudId === 'bg-right';
    const targetY = isBackground ? 75 : 180;
    const devScale = isBackground ? 0.4 : 1.0;

    // Generate a random zig-zag lightning path down to the ground line
    const segments = [];
    let curX = startX + offsetX;
    let curY = startY + offsetY;
    const steps = 4;
    const stepY = (targetY - curY) / steps;

    segments.push(`M ${curX} ${curY}`);
    for (let i = 1; i < steps; i++) {
      curX += (Math.random() - 0.5) * 28 * devScale; // zig-zag deviation
      curY += stepY;
      segments.push(`L ${curX} ${curY}`);
    }
    const finalStartX = startX + offsetX;
    segments.push(`L ${finalStartX + (Math.random() - 0.5) * 12 * devScale} ${targetY}`);

    setLightning({
      id: Date.now(),
      path: segments.join(' '),
      strokeWidth: isBackground ? 1.2 : 3
    });

    // Clear flash after 220ms
    setTimeout(() => {
      setLightning(null);
    }, 220);
  };

  return (
    <div className="landing-page-container">
      {/* Night Sky: Stars + Crescent Moon + Shooting Stars (logged-out only) */}
      {!user && (
        <>
          <div className="star-field" aria-hidden="true">
            {stars.map(star => (
              <span
                key={star.id}
                className={`star ${star.variant}${star.bright ? ' bright' : ''}`}
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  animationDuration: star.duration,
                  animationDelay: star.delay,
                }}
              />
            ))}
          </div>
          <div className="landing-moon-wrapper" aria-hidden="true">
            <svg viewBox="0 0 70 70" className="landing-moon-svg" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
              <defs>
                <filter id="moon-glow-filter" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#c4dcff" floodOpacity="0.75" />
                  <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#90b4d8" floodOpacity="0.3" />
                </filter>
                {/* Mask creates a true crescent — no opaque fill needed */}
                <mask id="moon-crescent-mask">
                  <circle cx="38" cy="35" r="22" fill="white" />
                  <circle cx="51" cy="27" r="20" fill="black" />
                </mask>
              </defs>
              {/* Moon disc with glow applied to the crescent shape */}
              <g filter="url(#moon-glow-filter)">
                <circle cx="38" cy="35" r="22" fill="#dde8f4" mask="url(#moon-crescent-mask)" />
              </g>
              {/* Craters — also masked to stay within visible crescent */}
              <g mask="url(#moon-crescent-mask)">
                <circle cx="22" cy="42" r="2.8" fill="rgba(148,172,200,0.28)" />
                <circle cx="16" cy="30" r="2" fill="rgba(148,172,200,0.2)" />
              </g>
            </svg>
          </div>
          <div className="shooting-star shooting-star-1" aria-hidden="true" />
          <div className="shooting-star shooting-star-2" aria-hidden="true" />
          <div className="shooting-star shooting-star-3" aria-hidden="true" />
        </>
      )}
      {/* Sun (logged-in / daytime landing only) */}
      {user && (
        <div className="landing-sun-wrapper" aria-hidden="true">
          <div className="sun-halo-outer" />
          <div className="sun-disc" />
        </div>
      )}
      {/* Selector Modal Overlay */}
      {showTypeSelector && (
        <div className="modal-overlay">
          <div className="modal-content select-report-type-modal" style={{ maxWidth: '480px', width: '90%', textAlign: 'center', padding: '30px' }}>
            <h3 className="modal-header-title" style={{ marginBottom: '12px' }}>Select Report Type</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>
              Choose which safety report workspace you would like to open:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button 
                type="button"
                className="btn-select-type hirac-type"
                onClick={() => {
                  setShowTypeSelector(false);
                  handleGetToWork();
                }}
              >
                <strong>HIRAC Report</strong>
                <span className="desc-text">Hazard Identification, Risk Assessment & Control</span>
              </button>
              
              <button 
                type="button"
                className="btn-select-type investigation-type"
                onClick={() => {
                  setShowTypeSelector(false);
                  handleGetToWorkInvestigation();
                }}
              >
                <strong>Investigation Report</strong>
                <span className="desc-text">Incident & Accident Investigation Dashboard</span>
              </button>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-modal-cancel" 
                style={{ width: 'auto', padding: '8px 24px' }}
                onClick={() => setShowTypeSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="landing-page-content">
        {/* Hero Section with Unified SVG Composition */}
        <div className="landing-hero-section">
          <div
            className="landing-hero-scene"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <svg viewBox="0 0 800 200" className="landing-scene-svg">
              <defs>
                {/* Glowing neon filter for lightning strike */}
                <filter id="lightningGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.9" />
                  <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#00f2fe" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Main Centered Text */}
              <text x="400" y="70" textAnchor="middle" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="48" letterSpacing="-1">
                <tspan fill="#0f172a">ANY </tspan>
                <tspan fill="#3a9ad9" className="hero-report-text">REPORT</tspan>
              </text>
              <text x="400" y="120" textAnchor="middle" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="48" letterSpacing="-1" fill="#0f172a">
                FOR TODAY?
              </text>

              {/* Ground Line */}
              <line x1="160" y1="180" x2="640" y2="180" stroke="#3b1c14" strokeWidth="2.5" strokeLinecap="round" />

              {/* Background Clouds (rendered behind the plane) */}
              <g
                className="landing-cloud-bg-left-group"
                onClick={() => triggerLightning('bg-left', 270, 10)}
                style={{
                  cursor: 'pointer'
                }}
              >
                <image href="/cloud left.png" x="190" y="-60" width="160" height="100" opacity="0.65" />
                <g className="cloud-rain-group">
                  <line x1="238" y1="10" x2="238" y2="16" className="rain-drop drop-1" />
                  <line x1="254" y1="10" x2="254" y2="16" className="rain-drop drop-2" />
                  <line x1="270" y1="10" x2="270" y2="16" className="rain-drop drop-3" />
                  <line x1="286" y1="10" x2="286" y2="16" className="rain-drop drop-4" />
                  <line x1="302" y1="10" x2="302" y2="16" className="rain-drop drop-5" />
                </g>
              </g>

              <g
                className="landing-cloud-bg-right-group"
                onClick={() => triggerLightning('bg-right', 560, 7)}
                style={{
                  cursor: 'pointer'
                }}
              >
                <image href="/cloud right.png" x="470" y="-70" width="180" height="110" opacity="0.65" />
                <g className="cloud-rain-group">
                  <line x1="524" y1="7" x2="524" y2="14" className="rain-drop drop-1" />
                  <line x1="542" y1="7" x2="542" y2="14" className="rain-drop drop-2" />
                  <line x1="560" y1="7" x2="560" y2="14" className="rain-drop drop-3" />
                  <line x1="578" y1="7" x2="578" y2="14" className="rain-drop drop-4" />
                  <line x1="596" y1="7" x2="596" y2="14" className="rain-drop drop-5" />
                </g>
              </g>

              {/* Airplane (rendered in front of background clouds, but behind foreground clouds/port) */}
              <g className="animating-plane-group">
                <image href="/plane.png" x="0" y="0" width="115" height="82" />
              </g>

              {/* Foreground Left Cloud (rendered on top of plane, moves with mouse) */}
              <g
                className="landing-cloud-left-group"
                onClick={() => triggerLightning('left', 80, 100)}
                style={{
                  transform: `translate(${mouseOffset.x * 22}px, ${mouseOffset.y * 11}px)`,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease-out'
                }}
              >
                <image href="/cloud left.png" x="-70" y="-40" width="300" height="200" />
                <g className="cloud-rain-group">
                  <line x1="20" y1="100" x2="20" y2="112" className="rain-drop drop-1" />
                  <line x1="50" y1="100" x2="50" y2="112" className="rain-drop drop-2" />
                  <line x1="80" y1="100" x2="80" y2="112" className="rain-drop drop-3" />
                  <line x1="110" y1="100" x2="110" y2="112" className="rain-drop drop-4" />
                  <line x1="140" y1="100" x2="140" y2="112" className="rain-drop drop-5" />
                </g>
              </g>

              {/* Foreground Right Cloud (rendered on top of plane) */}
              <g
                className="landing-cloud-right-group"
                onClick={() => triggerLightning('right', 775, 70)}
                style={{
                  cursor: 'pointer'
                }}
              >
                <image href="/cloud right.png" x="600" y="-80" width="350" height="250" />
                <g className="cloud-rain-group">
                  <line x1="705" y1="70" x2="705" y2="84" className="rain-drop drop-1" />
                  <line x1="740" y1="70" x2="740" y2="84" className="rain-drop drop-2" />
                  <line x1="775" y1="70" x2="775" y2="84" className="rain-drop drop-3" />
                  <line x1="810" y1="70" x2="810" y2="84" className="rain-drop drop-4" />
                  <line x1="845" y1="70" x2="845" y2="84" className="rain-drop drop-5" />
                </g>
              </g>

              {/* Airport Control Tower Terminal (rendered on top of plane) */}
              <image href="/port.png" x="535" y="82" width="110" height="115" />

              {/* Flashing Port Warning Beacon (tip of control tower antenna) */}
              <circle cx="617" cy="99" r="2.2" fill="#ff2a2a" />
              <circle cx="617" cy="99" r="6" fill="#ff2a2a" className="port-beacon-glow" />

              {/* Safety Manuals Button (under terminal building) */}
              <g 
                className="landing-svg-manuals-btn" 
                onClick={handleOpenManualsModal}
                style={{ cursor: 'pointer' }}
              >
                <rect 
                  x="560" 
                  y="185" 
                  width="80" 
                  height="15" 
                  rx="7.5" 
                  fill="#3a9ad9" 
                />
                <text 
                  x="600" 
                  y="195" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontFamily="'Outfit', 'Inter', sans-serif" 
                  fontWeight="800" 
                  fontSize="7.5"
                  letterSpacing="0.2"
                >
                  Safety Manuals
                </text>
              </g>

              {/* Glowing Electric Lightning Bolt Overlay */}
              {lightning && (
                <path
                  d={lightning.path}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={lightning.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#lightningGlow)"
                />
              )}
              {/* Real-time date, day, and time update */}
              <text x="160" y="192" fill="#3b1c14" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="600" fontSize="8" letterSpacing="0.2">
                {timeString}
              </text>

            </svg>
          </div>

          {/* Hero Action Button */}
          <button className="btn-yes-today" onClick={handleAction}>
            Yes There Is!
          </button>

          {/* Static app purpose statement */}
          <p className="landing-app-description">
            Safira generates comprehensive, regulatory-compliant HIRAC safety reports and risk assessments for airport operations in seconds.
          </p>
        </div>

        {/* Conditional rendering for authenticated report list vs unauthenticated prompt bubble */}
        {user ? (
          <div className="landing-report-logs-section">
            <h4 className="report-logs-title">Recent Reports</h4>
            <div className="report-logs-list">
              {unifiedRecentReports.length === 0 ? (
                <span className="report-log-link-placeholder">No reports found.</span>
              ) : (
                unifiedRecentReports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className="report-log-pill"
                    onClick={() => handleReportClick(report)}
                  >
                    <span className="pill-dot" style={{ backgroundColor: report.docType === 'investigation' ? '#f59e0b' : '#3a9ad9' }}></span>
                    <span className="pill-title" title={report.title}>
                      {report.docType === 'investigation' ? 
                        (report.title || 'Untitled Report').replace(/^(Safety Incident\s+)?Investigation\s+Report(:\s*)?/i, '').trim() || 'Safety Incident Investigation'
                        : (report.title || 'Untitled Report')
                      }
                    </span>
                    <span className="pill-date">{formatTimestampShort(report.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="login-prompt-bubble">
            <span className="tiny-pulse-dot"></span>
            <span className="bubble-text">
              Log in to sync worksheets and link safety manuals.
            </span>
          </div>
        )}
      </div>

      {/* City Skyline Silhouette */}
      <div className="landing-skyline"></div>

      {/* Footer Version Info */}
      <footer className="landing-footer">
        <span className="landing-footer-text">Safira by Nezer &bull;</span>
        <span className="landing-footer-version">
          <span className="version-dot"></span>
          v1.0.0
        </span>
      </footer>
    </div>
  );
}
