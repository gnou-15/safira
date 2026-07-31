import React, { useState } from 'react';
import formatTimeAgo from '../utils/formatTimeAgo';
import formatFullTimestamp from '../utils/formatFullTimestamp';
import getActivityStatus from '../utils/getActivityStatus';
import getUserAvatarGradient from '../utils/getUserAvatarGradient';
import KeyActivityExpandedDetail from './KeyActivityExpandedDetail';

export default function KeyActivityRow({ userKey, isSelected, onToggleSelect, isTopMost }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!userKey) return null;

  const status = getActivityStatus(userKey.last_accessed_at);
  const relativeTimeStr = formatTimeAgo(userKey.last_accessed_at);
  const fullTimestampStr = formatFullTimestamp(userKey.last_accessed_at);

  const displayKey = userKey.username || 'KEY-USER';
  const displayEmail = userKey.email || `${displayKey.toLowerCase()}@safira.key`;
  const initial = displayKey.charAt(0).toUpperCase();

  const avatarStyle = getUserAvatarGradient(displayKey);

  return (
    <div className={`activity-row-wrapper ${isSelected ? 'is-selected' : ''} ${isExpanded ? 'is-expanded' : ''} ${isTopMost ? 'is-topmost' : ''}`}>
      
      <div className="activity-row-main" onClick={() => setIsExpanded(!isExpanded)}>
        
        {/* Checkbox Column */}
        <div className="col-checkbox" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="row-checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
          />
        </div>

        {/* User Key & Avatar */}
        <div className="col-user">
          <div
            className="user-avatar-circle"
            style={{
              background: avatarStyle.background,
              color: avatarStyle.color,
              boxShadow: `0 3px 8px ${avatarStyle.shadow}`
            }}
          >
            {initial}
          </div>
          <div className="user-name-group">
            <span className="user-name-text">{displayKey}</span>
            <span className="user-email-text">{displayEmail}</span>
          </div>
        </div>

        {/* Last Active Timestamp */}
        <div className="col-active">
          <div className="active-time-group">
            <span className="active-full-time">{fullTimestampStr}</span>
            {userKey.last_accessed_at && (
              <span className="active-relative-tag">{relativeTimeStr}</span>
            )}
          </div>
        </div>

        {/* API Requests */}
        <div className="col-api">
          <span className={`metric-pill api-pill ${userKey.api_request_count > 0 ? 'has-value' : 'is-zero'}`}>
            <span className="num-val">{userKey.api_request_count || 0}</span> reqs
          </span>
        </div>

        {/* Reports Created */}
        <div className="col-reports">
          <span className={`metric-pill reports-pill ${userKey.reports_count > 0 ? 'has-value' : 'is-zero'}`}>
            <span className="num-val">{userKey.reports_count || 0}</span> reports
          </span>
        </div>

        {/* Status Pill Badge */}
        <div className="col-status">
          <span className={`status-badge ${status.dotClass}`}>
            <span className="status-badge-dot"></span>
            {status.label}
          </span>
        </div>

        {/* Action / Expand Button */}
        <div className="col-action" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
          <button className={`expand-arrow-btn ${isExpanded ? 'expanded' : ''}`} title="Toggle Key Details">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

      </div>

      {/* Expanded Inline Detail Panel */}
      {isExpanded && (
        <KeyActivityExpandedDetail userKey={userKey} />
      )}

    </div>
  );
}
