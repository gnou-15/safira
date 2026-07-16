import React from 'react';
import '../css/DocumentSkeleton.css';

export default function DocumentSkeleton() {
  return (
    <div className="document-skeleton-container">
      <div className="document-sheet skeleton-sheet">
        {/* Top Header Blocks */}
        <div className="skeleton-header-row">
          <div className="skeleton-block header-left"></div>
          <div className="skeleton-block header-right"></div>
        </div>

        {/* Tall Card Blocks */}
        <div className="skeleton-block tall-card"></div>

        <div className="skeleton-block tall-card"></div>

        {/* Two Columns Grid */}
        <div className="skeleton-columns-row">
          <div className="skeleton-block half-card"></div>
          <div className="skeleton-block half-card"></div>
        </div>
      </div>
    </div>
  );
}
