import React from 'react';
import { formatBytes } from '../utils/format.js';

export default function StatusBar({ itemCount, selectedCount, storageUsed, storageLimit }) {
  const pct = storageLimit ? Math.min(100, (storageUsed / storageLimit) * 100) : 0;

  return (
    <div className="status-bar">
      <div className="status-left">
        {itemCount} item{itemCount !== 1 ? 's' : ''}
        {selectedCount > 0 ? ` · ${selectedCount} selected` : ''}
      </div>
      <div className="status-right">
        <div className="storage-bar">
          <div className="storage-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span>
          {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
        </span>
      </div>
    </div>
  );
}
