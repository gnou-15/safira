import React from 'react';
import '../css/BufferLoader.css';

const CloudSVG = ({ className }) => (
  <svg className={className} viewBox="0 0 100 40" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
    <path d="M 15,30 A 8,8 0 0,1 22,18 A 12,12 0 0,1 48,12 A 10,10 0 0,1 68,16 A 8,8 0 0,1 78,30 Z" />
  </svg>
);

export default function BufferLoader() {
  return (
    <div className="buffer-loader-overlay">
      <div className="sky-bg"></div>
      
      {/* Moving clouds layers */}
      <div className="clouds-container">
        <CloudSVG className="cloud c1" />
        <CloudSVG className="cloud c2" />
        <CloudSVG className="cloud c3" />
        <CloudSVG className="cloud c4" />
        <CloudSVG className="cloud c5" />
      </div>

      {/* Wind lines */}
      <div className="wind-container">
        <div className="wind-line w1"></div>
        <div className="wind-line w2"></div>
        <div className="wind-line w3"></div>
      </div>

      {/* Airplane Container */}
      <div className="airplane-container">
        <svg viewBox="0 0 100 50" className="airplane-svg">
          {/* Left Wing behind fuselage */}
          <path d="M40 25 L25 5 L35 5 L52 23 Z" fill="#94a3b8" opacity="0.7" />
          {/* Tail Fin */}
          <path d="M20 22.5 L12 8 C11 7 8 8 9 10 L17 25 Z" fill="#475569" />
          {/* Fuselage */}
          <path d="M15 25 C15 25 25 21 55 21 C75 21 85 24 88 25 C85 26 75 29 55 29 C25 29 15 25 15 25 Z" fill="#ffffff" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
          {/* Cockpit Window */}
          <path d="M80 23 C81 23 83 23.5 84 25 C82 25 80 24.5 80 23 Z" fill="#38bdf8" />
          {/* Right Wing in front */}
          <path d="M45 25 L32 45 L42 45 L58 27 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
          {/* Engine */}
          <rect x="38" y="27" width="12" height="5" rx="2.5" fill="#475569" />
        </svg>
      </div>

      {/* Loading Text */}
      <div className="loading-text-container">
        <span className="please-wait-text">PLEASE WAIT</span>
        <span className="sub-wait-text">Preparing safety dashboard...</span>
      </div>
    </div>
  );
}
