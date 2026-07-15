import { formatTimestampShort } from '../utils/formatTimestampShort';

export default function LandingPage({
  reports,
  loadReport,
  handleGetToWork
}) {
  return (
    <div className="landing-page-container">
      <div className="landing-page-content">
        {/* Hero Section with Unified SVG Composition */}
        <div className="landing-hero-section">
          <div className="landing-hero-scene">
            <svg viewBox="0 0 800 200" className="landing-scene-svg">
              {/* Main Centered Text */}
              <text x="400" y="70" textAnchor="middle" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="48" letterSpacing="-1">
                <tspan fill="#0f172a">ANY </tspan>
                <tspan fill="#3a9ad9">REPORT</tspan>
              </text>
              <text x="400" y="120" textAnchor="middle" fontFamily="'Outfit', 'Inter', sans-serif" fontWeight="900" fontSize="48" letterSpacing="-1" fill="#0f172a">
                FOR TODAY?
              </text>

              {/* Ground Line */}
              <line x1="160" y1="180" x2="640" y2="180" stroke="#3b1c14" strokeWidth="2.5" strokeLinecap="round" />

              {/* Airplane (rendered behind clouds/port) */}
              <g className="animating-plane-group">
                <image href="/plane.png" x="0" y="0" width="115" height="82" />
              </g>

              {/* Left Cloud (rendered on top of plane) */}
              <g className="landing-cloud-left-group">
                <image href="/cloud left.png" x="-70" y="-40" width="300" height="200" />
              </g>

              {/* Right Cloud (rendered on top of plane) */}
              <g className="landing-cloud-right-group">
                <image href="/cloud right.png" x="600" y="-80" width="350" height="250" />
              </g>

              {/* Airport Control Tower Terminal (rendered on top of plane) */}
              <image href="/port.png" x="535" y="82" width="110" height="115" />

              {/* Flashing Port Warning Beacon (tip of control tower antenna) */}
              <circle cx="617" cy="99" r="2.2" fill="#ff2a2a" />
              <circle cx="617" cy="99" r="6" fill="#ff2a2a" className="port-beacon-glow" />
            </svg>
          </div>

          {/* Hero Action Button */}
          <button className="btn-yes-today" onClick={handleGetToWork}>
            Yes There Is!
          </button>
        </div>

        {/* Bottom Segment: Report Logs (Horizontal glassmorphic pills) */}
        <div className="landing-report-logs-section">
          <h4 className="report-logs-title">Recent Reports</h4>
          <div className="report-logs-list">
            {reports.length === 0 ? (
              <span className="report-log-link-placeholder">No reports found.</span>
            ) : (
              reports.slice(0, 3).map((report) => (
                <div
                  key={report.id}
                  className="report-log-pill"
                  onClick={() => loadReport(report.id)}
                >
                  <span className="pill-dot"></span>
                  <span className="pill-title" title={report.title}>{report.title || 'Untitled Report'}</span>
                  <span className="pill-date">{formatTimestampShort(report.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
