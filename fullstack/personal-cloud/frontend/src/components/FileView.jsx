import React, { useState } from 'react';
import FileIcon from './FileIcon.jsx';
import { formatBytes, formatDate, fileTypeLabel } from '../utils/format.js';
import { thumbnailUrl } from '../api/files.js';

export default function FileView({
  items,
  viewMode,
  selectedIds,
  onSelect,
  onOpen,
  onContextMenu,
  onDropOnFolder,
  currentView,
  loading
}) {
  const [dragOverId, setDragOverId] = useState(null);

  const handleRowClick = (e, item) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect(item.id, 'toggle');
    } else if (e.shiftKey) {
      onSelect(item.id, 'range');
    } else {
      onSelect(item.id, 'single');
    }
  };

  const handleDragStart = (e, item) => {
    if (!selectedIds.includes(item.id)) {
      onSelect(item.id, 'single');
    }
    e.dataTransfer.setData('text/plain', item.id);
  };

  if (loading) {
    return <div className="file-view-empty">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="file-view-empty">
        {currentView === 'trash' ? 'Recycle Bin is empty' : 'This folder is empty'}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="file-grid" onClick={() => onSelect(null, 'clear')}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`grid-item ${selectedIds.includes(item.id) ? 'selected' : ''} ${
              dragOverId === item.id ? 'drag-over' : ''
            }`}
            draggable={currentView !== 'trash'}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(e, item);
            }}
            onDoubleClick={() => onOpen(item)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!selectedIds.includes(item.id)) onSelect(item.id, 'single');
              onContextMenu(e, item);
            }}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => {
              if (item.itemType !== 'folder') return;
              e.preventDefault();
              setDragOverId(item.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverId(null);
              if (item.itemType === 'folder') onDropOnFolder(item.id);
            }}
          >
            <div className="grid-thumb">
              {item.itemType === 'file' && item.category === 'image' && item.thumbnailKey ? (
                <img src={thumbnailUrl(item.id)} alt={item.name} />
              ) : (
                <FileIcon type={item.itemType} category={item.category} size={48} />
              )}
            </div>
            <div className="grid-name">{item.name}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="details-view" onClick={() => onSelect(null, 'clear')}>
      <div className="details-header">
        <div className="col-name">Name</div>
        <div className="col-modified">Date modified</div>
        <div className="col-type">Type</div>
        <div className="col-size">Size</div>
      </div>
      <div className="details-body">
        {items.map((item) => (
          <div
            key={item.id}
            className={`details-row ${selectedIds.includes(item.id) ? 'selected' : ''} ${
              dragOverId === item.id ? 'drag-over' : ''
            }`}
            draggable={currentView !== 'trash'}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(e, item);
            }}
            onDoubleClick={() => onOpen(item)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!selectedIds.includes(item.id)) onSelect(item.id, 'single');
              onContextMenu(e, item);
            }}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => {
              if (item.itemType !== 'folder') return;
              e.preventDefault();
              setDragOverId(item.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverId(null);
              if (item.itemType === 'folder') onDropOnFolder(item.id);
            }}
          >
            <div className="col-name">
              <FileIcon type={item.itemType} category={item.category} />
              <span className="row-name-text">{item.name}</span>
            </div>
            <div className="col-modified">{formatDate(item.updatedAt)}</div>
            <div className="col-type">{fileTypeLabel(item)}</div>
            <div className="col-size">{item.itemType === 'file' ? formatBytes(item.size) : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
