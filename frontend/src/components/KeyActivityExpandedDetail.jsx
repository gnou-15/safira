import React, { useState } from 'react';
import formatFullTimestamp from '../utils/formatFullTimestamp';

export default function KeyActivityExpandedDetail({ userKey }) {
  const [copied, setCopied] = useState(false);

  if (!userKey) return null;

  const createdDateStr = formatFullTimestamp(userKey.created_at);
  const lastActiveStr = formatFullTimestamp(userKey.last_accessed_at);
  const keyHash = userKey.id || userKey.username || 'N/A';

  const handleCopyKey = () => {
    if (keyHash && navigator.clipboard) {
      navigator.clipboard.writeText(keyHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasActivity = Boolean(userKey.last_accessed_at);

  return (
    <div className="expanded-detail-container">
      <div className="detail-cards-grid">
        
        {/* Card 1: Key Hash & Security */}
        <div className="detail-mini-card">
          <div className="card-label">Key Hash & Identifier</div>
          <div className="hash-copy-row">
            <code className="key-hash-code">{keyHash}</code>
            <button className={`copy-hash-btn ${copied ? 'copied' : ''}`} onClick={handleCopyKey} title="Copy Key Hash">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="card-subtext">Access Scope: Airport Operational Workspace</div>
        </div>

        {/* Card 2: Session Timestamps */}
        <div className="detail-mini-card">
          <div className="card-label">Session Timestamps</div>
          <div className="card-primary-val">{lastActiveStr}</div>
          <div className="card-subtext">Registered on {createdDateStr}</div>
        </div>

        {/* Card 3: Generated Artifacts */}
        <div className="detail-mini-card">
          <div className="card-label">Artifacts & Usage</div>
          <div className="card-primary-val highlight-blue">
            {userKey.reports_count || 0} Safety Reports
          </div>
          <div className="card-subtext">
            {userKey.api_request_count || 0} Total API Calls Committed
          </div>
        </div>

        {/* Card 4: Status & Permissions */}
        <div className="detail-mini-card">
          <div className="card-label">Permissions & Scope</div>
          <div className="card-tags-row">
            <span className="scope-tag production">Production</span>
            <span className="scope-tag role">User Key</span>
          </div>
          <div className="card-subtext">
            {hasActivity ? '🟢 Active Session Token' : '⚪ Idle / Unused Token'}
          </div>
        </div>

      </div>
    </div>
  );
}
