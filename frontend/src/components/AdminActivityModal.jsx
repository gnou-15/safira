import React, { useState, useEffect } from 'react';
import '../css/AdminActivityModal.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AdminActivityModal({ showModal, setShowModal, token }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsersActivity = async () => {
    const authToken = token || localStorage.getItem('safira_token');
    if (!authToken) {
      setError('No admin authorization token found.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/admin/users-activity`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch user activity');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching admin users activity:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchUsersActivity();
    }
  }, [showModal, token]);

  if (!showModal) return null;

  const formatDate = (isoString) => {
    if (!isoString) return <span className="time-never">Never</span>;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return <span className="time-never">Never</span>;
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    if (isToday) {
      return <span className="time-today">Today at {timeStr}</span>;
    }
    return <span className="time-past">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {timeStr}</span>;
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const totalApiRequests = users.reduce((acc, u) => acc + (u.api_request_count || 0), 0);
  const totalReportsCreated = users.reduce((acc, u) => acc + (u.reports_count || 0), 0);
  
  const todayDateStr = new Date().toDateString();
  const activeTodayCount = users.filter(u => u.last_accessed_at && new Date(u.last_accessed_at).toDateString() === todayDateStr).length;

  return (
    <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title-group">
            <span className="admin-title-badge">
              <span className="badge-pulse"></span>
              ADMIN DASHBOARD
            </span>
            <h2>Who Worked Today?</h2>
            <p className="admin-modal-subtitle">Real-time tracking of active key sessions, timestamps, and API usage.</p>
          </div>
          <button className="admin-modal-close-btn" onClick={() => setShowModal(false)} title="Close Modal">
            ✕
          </button>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card card-cyan">
            <div className="stat-card-top">
              <span className="stat-label">Active Keys Today</span>
              <span className="stat-icon">🟢</span>
            </div>
            <span className="stat-value val-cyan">{activeTodayCount}</span>
          </div>

          <div className="admin-stat-card card-purple">
            <div className="stat-card-top">
              <span className="stat-label">Total Registered Keys</span>
              <span className="stat-icon">🔑</span>
            </div>
            <span className="stat-value val-purple">{users.length}</span>
          </div>

          <div className="admin-stat-card card-amber">
            <div className="stat-card-top">
              <span className="stat-label">Total API Requests</span>
              <span className="stat-icon">⚡</span>
            </div>
            <span className="stat-value val-amber">{totalApiRequests}</span>
          </div>

          <div className="admin-stat-card card-emerald">
            <div className="stat-card-top">
              <span className="stat-label">Total Reports Created</span>
              <span className="stat-icon">📄</span>
            </div>
            <span className="stat-value val-emerald">{totalReportsCreated}</span>
          </div>
        </div>

        {/* Search Bar & Refresh Controls */}
        <div className="admin-controls-row">
          <div className="admin-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by Key (e.g. AAA-000 or ADM-000)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>
          <button
            className={`admin-refresh-btn ${isLoading ? 'is-spinning' : ''}`}
            onClick={fetchUsersActivity}
            disabled={isLoading}
          >
            <span className="refresh-icon">🔄</span>
            <span>{isLoading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* User Keys Table */}
        <div className="admin-table-wrapper">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User Key / Username</th>
                <th>Last Access (Date & Time)</th>
                <th>API Requests Committed</th>
                <th>Reports Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-loading-cell">
                    <div className="table-loader-spinner"></div>
                    <span>Loading key activity records...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-cell">
                    No matching key records found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isToday = u.last_accessed_at && new Date(u.last_accessed_at).toDateString() === todayDateStr;
                  const isAdminKey = u.username === 'ADM-000';

                  return (
                    <tr key={u.id} className={isToday ? 'row-active-today' : ''}>
                      <td>
                        <div className="key-badge-container">
                          <span className={`key-badge ${isAdminKey ? 'badge-admin' : 'badge-user'}`}>
                            {u.username}
                          </span>
                          {isAdminKey && <span className="admin-chip">ADMIN</span>}
                        </div>
                      </td>
                      <td className="time-cell">
                        {formatDate(u.last_accessed_at)}
                      </td>
                      <td className="requests-cell">
                        <span className="request-count-pill">
                          <span className="lightning-icon">⚡</span> {u.api_request_count || 0} reqs
                        </span>
                      </td>
                      <td className="reports-cell">
                        <span className="report-count-pill">
                          <span className="doc-icon">📄</span> {u.reports_count || 0} reports
                        </span>
                      </td>
                      <td>
                        {isToday ? (
                          <span className="status-indicator status-online">
                            <span className="status-dot"></span> Active Today
                          </span>
                        ) : (
                          <span className="status-indicator status-offline">
                            <span className="status-dot-grey"></span> Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
