import React, { useState, useEffect, useCallback } from 'react';
import sortUsersByActivity from '../utils/sortUsersByActivity';
import KeyActivityTableHeader from '../components/KeyActivityTableHeader';
import KeyActivityRow from '../components/KeyActivityRow';
import KeyActivityPagination from '../components/KeyActivityPagination';
import '../css/UserActivityPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UserActivityPage({ token }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [selectedKeyIds, setSelectedKeyIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchUsersActivity = useCallback(async () => {
    const authToken = token || localStorage.getItem('safira_token');
    if (!authToken) {
      setError('No active key authorization session found.');
      setIsLoading(false);
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
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch user activity records');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching key activity:', err);
      setError(err.message || 'Error connecting to activity service');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsersActivity();
  }, [fetchUsersActivity]);

  // Filter out ADM-000 admin key and sort descending by last_accessed_at
  const sortedUsers = sortUsersByActivity(users);

  // Active keys count within 24h
  const activeKeysCount = sortedUsers.filter(u => {
    if (!u.last_accessed_at) return false;
    const diffHours = (Date.now() - new Date(u.last_accessed_at).getTime()) / (1000 * 3600);
    return diffHours <= 24;
  }).length;

  const inactiveKeysCount = sortedUsers.length - activeKeysCount;

  // Apply search query & status filters
  const filteredUsers = sortedUsers.filter((u) => {
    // Status tab filter
    if (statusFilter === 'active') {
      if (!u.last_accessed_at) return false;
      const diffHours = (Date.now() - new Date(u.last_accessed_at).getTime()) / (1000 * 3600);
      if (diffHours > 24) return false;
    } else if (statusFilter === 'inactive') {
      if (u.last_accessed_at) {
        const diffHours = (Date.now() - new Date(u.last_accessed_at).getTime()) / (1000 * 3600);
        if (diffHours <= 24) return false;
      }
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // Paginated user keys
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Toggle selection for individual key row
  const toggleSelectKey = (id) => {
    setSelectedKeyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle selection for all keys on current page
  const toggleSelectAll = () => {
    if (selectedKeyIds.size === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedKeyIds(new Set());
    } else {
      setSelectedKeyIds(new Set(paginatedUsers.map(u => u.id || u.username)));
    }
  };

  const allSelectedOnPage = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedKeyIds.has(u.id || u.username));

  return (
    <div className="user-activity-page">
      
      {/* Outer Card Container */}
      <div className="activity-card-container">
        
        {/* Card Header & Breadcrumbs */}
        <div className="dashboard-card-header">
          <div className="header-titles">
            <h2>Active Key Sessions</h2>
            <div className="breadcrumb-trail">
              <span>Admin Dashboard</span>
              <span className="separator">›</span>
              <span className="active-crumb">Key Monitor & Activity</span>
            </div>
          </div>

          <div className="header-actions-right">
            <button className="refresh-activity-btn" onClick={fetchUsersActivity} disabled={isLoading}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" className={isLoading ? 'is-spinning' : ''}>
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {isLoading ? 'Refreshing...' : '+ Refresh Activity'}
            </button>
          </div>
        </div>

        {/* Search & Status Filter Tabs Bar */}
        <div className="controls-filter-bar">
          <div className="controls-filter-left">
            <div className="search-box-wrapper">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input-field"
                placeholder="Search key, email, or session..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
              {searchQuery ? (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              ) : (
                <span className="search-shortcut-hint">⌘K</span>
              )}
            </div>

            {/* Status Filter Tab Pills */}
            <div className="status-tabs-group">
              <button
                className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('all'); setPage(1); }}
              >
                All Keys <span className="tab-count">{sortedUsers.length}</span>
              </button>

              <button
                className={`status-tab-btn tab-active ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('active'); setPage(1); }}
              >
                <span className="tab-dot dot-green"></span>
                Active <span className="tab-count">{activeKeysCount}</span>
              </button>

              <button
                className={`status-tab-btn tab-inactive ${statusFilter === 'inactive' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('inactive'); setPage(1); }}
              >
                <span className="tab-dot dot-gray"></span>
                Inactive <span className="tab-count">{inactiveKeysCount}</span>
              </button>
            </div>
          </div>

          {selectedKeyIds.size > 0 && (
            <div className="selection-badge">
              <span className="check-icon">✓</span>
              <span>{selectedKeyIds.size} Selected</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-alert-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Main Table Container */}
        <div className="activity-table-wrapper">
          
          <KeyActivityTableHeader
            allSelected={allSelectedOnPage}
            onSelectAll={toggleSelectAll}
          />

          {isLoading && users.length === 0 ? (
            <div className="loading-state-container">
              <div className="skeleton-row"></div>
              <div className="skeleton-row"></div>
              <div className="skeleton-row"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state-container">
              <h4>No active key records found</h4>
              <p>Try searching for a different key or switching status filter tabs.</p>
            </div>
          ) : (
            <div className="rows-list-container">
              {paginatedUsers.map((userKey, index) => {
                const keyId = userKey.id || userKey.username;
                return (
                  <KeyActivityRow
                    key={keyId}
                    userKey={userKey}
                    isSelected={selectedKeyIds.has(keyId)}
                    onToggleSelect={() => toggleSelectKey(keyId)}
                    isTopMost={index === 0 && page === 1 && !searchQuery && statusFilter === 'all'}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Pagination */}
          <KeyActivityPagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filteredUsers.length}
            onPageChange={(newPage) => setPage(newPage)}
          />

        </div>

      </div>

    </div>
  );
}
