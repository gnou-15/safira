import React from 'react';
import formatTimeAgo from '../utils/formatTimeAgo';
import getActivityStatus from '../utils/getActivityStatus';

export default function VercelActivityRow({ userKey, isTopMost }) {
  if (!userKey) return null;

  const status = getActivityStatus(userKey.last_accessed_at);
  const timeAgoStr = formatTimeAgo(userKey.last_accessed_at);

  // Generate a mock commit hash from user ID or username for Vercel aesthetics
  const keyHash = userKey.id ? userKey.id.substring(0, 7) : (userKey.username || 'f027b39').toLowerCase();
  
  // Format avatar initials or avatar image
  const displayKey = userKey.username || 'KEY-USER';
  const initial = displayKey.charAt(0).toUpperCase();

  return (
    <div className={`vercel-row ${isTopMost ? 'vercel-row-topmost' : ''}`}>
      
      {/* Left Column: Key Identifier / Title */}
      <div className="vercel-col-title">
        <span className="vercel-key-name">{displayKey}</span>
        {userKey.email && (
          <span className="vercel-key-email">{userKey.email}</span>
        )}
      </div>

      {/* Status Pill & Relative Time */}
      <div className="vercel-col-status">
        <span className={`vercel-status-pill ${status.dotClass}`}>
          <span className="status-dot"></span>
          <span className="status-label">{status.label}</span>
          <span className="status-time">{timeAgoStr.replace(' ago', '')}</span>
        </span>
      </div>

      {/* Environment Badge */}
      <div className="vercel-col-env">
        <span className="vercel-env-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Production
        </span>
      </div>

      {/* Project Badge */}
      <div className="vercel-col-project">
        <span className="vercel-project-badge">
          <span className="project-icon">🔶</span>
          safira
        </span>
      </div>

      {/* Commit / Key Hash */}
      <div className="vercel-col-hash">
        <span className="vercel-hash-tag">
          <span className="hash-icon">-o-</span>
          <code>{keyHash}</code>
        </span>
      </div>

      {/* Branch Tag */}
      <div className="vercel-col-branch">
        <span className="vercel-branch-tag">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          main
        </span>
      </div>

      {/* Relative Timestamp */}
      <div className="vercel-col-time">
        <span className="vercel-time-text">{timeAgoStr}</span>
      </div>

      {/* User Avatar */}
      <div className="vercel-col-avatar">
        <div className="vercel-avatar-badge" title={displayKey}>
          {initial}
        </div>
      </div>

    </div>
  );
}
