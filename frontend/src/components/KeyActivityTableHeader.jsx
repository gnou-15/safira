import React from 'react';

export default function KeyActivityTableHeader({ allSelected, onSelectAll }) {
  return (
    <div className="activity-table-header">
      <div className="col-checkbox">
        <input
          type="checkbox"
          className="row-checkbox"
          checked={allSelected}
          onChange={onSelectAll}
          title="Select All Keys"
        />
      </div>
      <div className="col-user">Key / User</div>
      <div className="col-active">Last Active</div>
      <div className="col-api">API Requests</div>
      <div className="col-reports">Reports Created</div>
      <div className="col-status">Status</div>
      <div className="col-action">Details</div>
    </div>
  );
}
