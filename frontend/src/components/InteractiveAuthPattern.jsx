import React, { useState, useRef, useEffect } from "react";

export default function InteractiveAuthPattern() {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });
  const [ripples, setRipples] = useState([]);
  const [hoveredTile, setHoveredTile] = useState(null);

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setSpotlight({ x: pctX, y: pctY, active: true });

    const tiltX = ((y / rect.height) - 0.5) * -14;
    const tiltY = ((x / rect.width) - 0.5) * 14;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setSpotlight((prev) => ({ ...prev, active: false }));
    setHoveredTile(null);
  };

  const handlePanelClick = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <div
      className="auth-pattern-wrapper"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={containerRef}
        className="auth-pattern-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handlePanelClick}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
        }}
      >
        {/* Spotlight cursor glow overlay - Ice Blue/Cyan Glow */}
        {spotlight.active && (
          <div
            className="auth-spotlight-glow"
            style={{
              background: `radial-gradient(circle 350px at ${spotlight.x}% ${spotlight.y}%, rgba(14, 165, 233, 0.16) 0%, rgba(56, 189, 248, 0.08) 50%, rgba(0, 0, 0, 0) 100%)`,
            }}
          />
        )}

        {/* Floating background dust/particles */}
        <div className="auth-dust-container">
          <div className="auth-dust dust-1"></div>
          <div className="auth-dust dust-2"></div>
          <div className="auth-dust dust-3"></div>
        </div>

        {/* Dynamic click ripples */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="auth-click-ripple"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
            }}
          />
        ))}

        <div className="auth-pattern-grid">
          {/* TILE 1: Floating Cloud + Altitude Wind Lines (Top Left) */}
          <div
            className={`auth-tile tile-1 ${hoveredTile === 1 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(1)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <defs>
                {/* Left half of cloud: Bright reflective white-to-blue */}
                <linearGradient id="cloudLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
                {/* Right half of cloud: Shadowed cyan-to-blue */}
                <linearGradient id="cloudRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                {/* Subtle telemetry dial glow */}
                <filter id="telemetryGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Side Altitude Tick Marks */}
              <g stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1">
                <line x1="20" y1="40" x2="30" y2="40" />
                <line x1="20" y1="60" x2="26" y2="60" />
                <line x1="20" y1="80" x2="30" y2="80" />
                <line x1="20" y1="100" x2="26" y2="100" />
                <line x1="20" y1="120" x2="30" y2="120" />
                
                <line x1="140" y1="40" x2="130" y2="40" />
                <line x1="140" y1="60" x2="134" y2="60" />
                <line x1="140" y1="80" x2="130" y2="80" />
                <line x1="140" y1="100" x2="134" y2="100" />
                <line x1="140" y1="120" x2="130" y2="120" />
              </g>

              {/* Concentric Telemetry Rings (Radar weather/cloud layer indicator) */}
              <circle cx="80" cy="78" r="50" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              <circle cx="80" cy="78" r="62" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" strokeDasharray="3 6" />
              
              {/* Climbing / Wind Flow Vector Line */}
              <path d="M 15,138 C 45,128 115,128 145,138" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 15,147 C 45,139 115,139 145,147" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" />

              {/* Split Folded Geometric Cloud Icon */}
              <g className="cloud-group" filter="url(#telemetryGlow)">
                {/* Left Fold */}
                <path 
                  d="M 80,55 
                     C 65,55 53,67 53,82 
                     C 43,82 35,89 35,98 
                     L 80,98 Z" 
                  fill="url(#cloudLeftGrad)" 
                />
                {/* Right Fold */}
                <path 
                  d="M 80,55 
                     C 95,55 107,67 107,82 
                     C 117,82 125,89 125,98 
                     L 80,98 Z" 
                  fill="url(#cloudRightGrad)" 
                />
              </g>
            </svg>
          </div>

          {/* TILE 2: Cockpit Radar Scan System (Top Middle) */}
          <div
            className={`auth-tile tile-2 ${hoveredTile === 2 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(2)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Grid Background */}
              <pattern id="radarGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="none" stroke="#0f172a" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />

              {/* Radar Circles */}
              <circle cx="80" cy="80" r="60" fill="none" stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="80" cy="80" r="40" fill="none" stroke="#1e3a8a" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="20" fill="none" stroke="#1e3a8a" strokeWidth="1" />
              <line x1="80" y1="10" x2="80" y2="150" stroke="#1e3a8a" strokeWidth="1.5" />
              <line x1="10" y1="80" x2="150" y2="80" stroke="#1e3a8a" strokeWidth="1.5" />

              {/* Rotating Sweep Line */}
              <line x1="80" y1="80" x2="135" y2="45" stroke="#38bdf8" strokeWidth="2.5" className="radar-sweep-line" />

              {/* Blip Target Indicators */}
              <circle cx="120" cy="55" r="4" fill="#0ea5e9" className="radar-blip blip-1" />
              <circle cx="50" cy="95" r="3" fill="#38bdf8" className="radar-blip blip-2" />
            </svg>
          </div>

          {/* TILE 3: 3D Isometric Navigation Cube (Top Right) */}
          <div
            className={`auth-tile tile-3 ${hoveredTile === 3 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(3)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Compass Ring */}
              <circle cx="80" cy="80" r="65" fill="none" stroke="#1e3a8a" strokeWidth="1" />
              <circle cx="80" cy="80" r="55" fill="none" stroke="#1e3a8a" strokeWidth="1.5" strokeDasharray="3 3" />
              
              <g className="iso-cubes-group" transform="translate(10, 15)">
                {/* 3D Flight Stack Navigation Block */}
                <g className="iso-cube cube-top" transform="translate(70, 45)">
                  {/* Top Face */}
                  <polygon points="0,-18 31,-32 0,-46 -31,-32" fill="#e0f2fe" />
                  {/* Left Face */}
                  <polygon points="-31,-32 0,-18 0,16 -31,2" fill="#0ea5e9" />
                  {/* Right Face */}
                  <polygon points="0,-18 31,-32 31,2 0,16" fill="#1e3a8a" />
                </g>
                <g className="iso-cube cube-bottom" transform="translate(70, 85)">
                  <polygon points="0,-18 31,-32 0,-46 -31,-32" fill="#e0f2fe" fillOpacity="0.7" />
                  <polygon points="-31,-32 0,-18 0,16 -31,2" fill="#38bdf8" fillOpacity="0.8" />
                  <polygon points="0,-18 31,-32 31,2 0,16" fill="#1d4ed8" fillOpacity="0.8" />
                </g>
              </g>
            </svg>
          </div>

          {/* TILE 4: Runway Glideslope / Landing Chevrons (Middle Left) */}
          <div
            className={`auth-tile tile-4 ${hoveredTile === 4 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(4)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Runway centerline perspective */}
              <polygon points="80,10 77,140 83,140" fill="#1e3a8a" />
              <line x1="60" y1="140" x2="80" y2="10" stroke="#1e293b" strokeWidth="1" />
              <line x1="100" y1="140" x2="80" y2="10" stroke="#1e293b" strokeWidth="1" />

              {/* Sequenced Landing Chevrons */}
              <g className="landing-chevrons" transform="translate(0, 10)">
                <path d="M45,100 L80,75 L115,100" fill="none" stroke="#0ea5e9" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" className="chev-arrow chev-1" />
                <path d="M52,80 L80,60 L108,80" fill="none" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" className="chev-arrow chev-2" />
                <path d="M58,60 L80,45 L102,60" fill="none" stroke="#e0f2fe" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="chev-arrow chev-3" />
              </g>
            </svg>
          </div>

          {/* TILE 5: Compass Rose & Navigation Star (Middle Center) */}
          <div
            className={`auth-tile tile-5 ${hoveredTile === 5 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(5)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Outer Dial */}
              <circle cx="80" cy="80" r="62" fill="none" stroke="#1e3a8a" strokeWidth="2.5" />
              {/* Dial Marks */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = i * 45;
                return (
                  <line
                    key={i}
                    x1="80"
                    y1="22"
                    x2="80"
                    y2="28"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                    transform={`rotate(${angle} 80 80)`}
                  />
                );
              })}

              <g className="compass-rose-group" transform="translate(80, 80)">
                {/* Compass points */}
                <polygon points="0,-50 8,-12 0,0" fill="#3b82f6" />
                <polygon points="0,-50 -8,-12 0,0" fill="#1e3a8a" />
                
                <polygon points="0,50 -8,12 0,0" fill="#3b82f6" />
                <polygon points="0,50 8,12 0,0" fill="#1e3a8a" />

                <polygon points="50,0 12,8 0,0" fill="#3b82f6" />
                <polygon points="50,0 12,-8 0,0" fill="#1e3a8a" />

                <polygon points="-50,0 -12,-8 0,0" fill="#3b82f6" />
                <polygon points="-50,0 -12,8 0,0" fill="#1e3a8a" />

                {/* Central Starburst (Gold Accent) */}
                <polygon points="0,-12 4,-4 12,0 4,4 0,12 -4,4 -12,0 -4,-4" fill="#eab308" className="compass-core" />
              </g>
            </svg>
          </div>

          {/* TILE 6: Aerodynamic Wing Airflow / Streamlines (Middle Right) */}
          <div
            className={`auth-tile tile-6 ${hoveredTile === 6 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(6)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Curved airfoil shape representation */}
              <path d="M 20,80 C 50,45 110,40 140,80 C 110,85 50,85 20,80 Z" fill="none" stroke="#1e3a8a" strokeWidth="1.5" />
              
              <g className="aerodynamic-flow" fill="none" strokeLinecap="round">
                {/* Wind stream lines */}
                <path
                  d="M10,50 C40,25 100,25 150,55"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="airflow-line flow-1"
                />
                <path
                  d="M10,80 C45,55 105,55 150,85"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  className="airflow-line flow-2"
                />
                <path
                  d="M10,110 C40,85 100,85 150,115"
                  stroke="#1d4ed8"
                  strokeWidth="1.5"
                  className="airflow-line flow-3"
                />
              </g>
            </svg>
          </div>

          {/* TILE 7: Sonar Air Traffic Control Waves (Bottom Left) */}
          <div
            className={`auth-tile tile-7 ${hoveredTile === 7 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(7)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Concentric ATC ping waves from center */}
              <g className="atc-ping-waves" transform="translate(80, 80)">
                <circle cx="0" cy="0" r="70" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeOpacity="0.15" className="ping-ring ring-1" />
                <circle cx="0" cy="0" r="50" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeOpacity="0.35" className="ping-ring ring-2" />
                <circle cx="0" cy="0" r="30" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeOpacity="0.6" className="ping-ring ring-3" />
                <circle cx="0" cy="0" r="10" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3.5" fill="#e0f2fe" />
              </g>

              {/* Scanning sweep sector overlay */}
              <path d="M80,80 L135,115 A 70 70 0 0 1 45,135 Z" fill="rgba(56, 189, 248, 0.03)" />
            </svg>
          </div>

          {/* TILE 8: Gyroscopic Horizon Level Indicator (Bottom Middle) */}
          <div
            className={`auth-tile tile-8 ${hoveredTile === 8 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(8)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <g className="gyro-casing" stroke="#1e3a8a" fill="none">
                <circle cx="80" cy="80" r="55" strokeWidth="2.5" />
                <circle cx="80" cy="80" r="45" strokeWidth="1.5" strokeDasharray="2 3" />
              </g>

              {/* Horizon bar that tilts */}
              <g className="horizon-dial-group" transform="translate(80, 80)">
                {/* Sky blue half */}
                <path d="M-45,0 A45,45 0 0 1 45,0 Z" fill="rgba(56, 189, 248, 0.15)" />
                {/* Horizon Line */}
                <line x1="-50" y1="0" x2="50" y2="0" stroke="#0ea5e9" strokeWidth="3" />
                {/* Degree tick markers */}
                <line x1="-20" y1="-15" x2="20" y2="-15" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="-12" y1="-30" x2="12" y2="-30" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="-20" y1="15" x2="20" y2="15" stroke="#1e3a8a" strokeWidth="1.5" />
                <line x1="-12" y1="30" x2="12" y2="30" stroke="#1e3a8a" strokeWidth="1.5" />
              </g>

              {/* Static aircraft indicator */}
              <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
                <line x1="45" y1="80" x2="65" y2="80" />
                <line x1="95" y1="80" x2="115" y2="80" />
                <circle cx="80" cy="80" r="3" fill="#ffffff" stroke="none" />
              </g>
            </svg>
          </div>

          {/* TILE 9: Runway Strip Heading to Sunset (Bottom Right) */}
          <div
            className={`auth-tile tile-9 ${hoveredTile === 9 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(9)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <defs>
                <linearGradient id="runwayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0.2)" />
                </linearGradient>
              </defs>

              {/* Ground Runway Area Grid */}
              <polygon points="80,60 135,160 25,160" fill="url(#runwayGrad)" />
              <line x1="80" y1="60" x2="25" y2="160" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
              <line x1="80" y1="60" x2="135" y2="160" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
              
              {/* Side Runway Perspective Lights */}
              <circle cx="63.5" cy="90" r="1.5" fill="#38bdf8" opacity="0.6" />
              <circle cx="96.5" cy="90" r="1.5" fill="#38bdf8" opacity="0.6" />
              <circle cx="50" cy="115" r="2" fill="#38bdf8" opacity="0.8" />
              <circle cx="110" cy="115" r="2" fill="#38bdf8" opacity="0.8" />
              <circle cx="33.5" cy="145" r="3" fill="#38bdf8" />
              <circle cx="126.5" cy="145" r="3" fill="#38bdf8" />

              {/* Center Runway dash markings */}
              <line x1="80" y1="60" x2="80" y2="160" stroke="#ffffff" strokeWidth="2.2" strokeDasharray="6 8" strokeOpacity="0.95" className="runway-centerline" />

              {/* Altitude Horizon Indicator Dial */}
              <path d="M 35,95 A 45 45 0 0 1 125,95" fill="none" stroke="#eab308" strokeWidth="1.2" strokeDasharray="2 3" strokeOpacity="0.75" />
              <circle cx="80" cy="95" r="35" fill="none" stroke="#eab308" strokeWidth="0.75" strokeOpacity="0.3" />

              {/* Guidance Beacon Compass Star */}
              <g transform="translate(80, 60)" className="sunset-star">
                <polygon points="0,-14 3.5,-3.5 14,0 3.5,3.5 0,14 -3.5,3.5 -14,0 -3.5,-3.5" fill="#f59e0b" />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
