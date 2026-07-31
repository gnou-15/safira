import React from 'react';

export default function VercelActivityFilterBar({
  searchQuery,
  setSearchQuery,
  totalCount,
  activeCount,
  isLoading,
  onRefresh
}) {
  return (
    <div className="vercel-filter-bar">
      
      {/* Search Input */}
      <div className="vercel-search-wrapper">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="vercel-search-icon">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="vercel-search-input"
          placeholder="All Authors / Search keys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="vercel-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
            ✕
          </button>
        )}
      </div>

      {/* Filter Dropdowns (Vercel Style) */}
      <div className="vercel-dropdowns-group">
        <div className="vercel-select-box">
          <span>All Environments</span>
          <span className="select-arrow">˅</span>
        </div>
        <div className="vercel-select-box">
          <span>All Repositories</span>
          <span className="select-arrow">˅</span>
        </div>
        <div className="vercel-select-box">
          <span>All Branches</span>
          <span className="select-arrow">˅</span>
        </div>
      </div>

      {/* Right Controls: Refresh & Status Count */}
      <div className="vercel-filter-right">
        <span className="vercel-status-counter">
          <span className="counter-dots">🟢🟡</span>
          Status {activeCount}/{totalCount}
        </span>

        <button
          className={`vercel-refresh-btn ${isLoading ? 'is-spinning' : ''}`}
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh real-time activity"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" className="refresh-svg">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          {isLoading ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

    </div>
  );
}
