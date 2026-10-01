import React, { useRef } from 'react';

export default function Toolbar({
  onNewFolder,
  onUploadClick,
  onDelete,
  onRename,
  onDownload,
  onRefresh,
  viewMode,
  onViewModeChange,
  selectionCount,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  currentView
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="toolbar">
      <div className="toolbar-buttons">
        <button className="toolbar-btn" onClick={onNewFolder} disabled={currentView === 'trash'}>
          <span className="btn-icon">📁+</span> New folder
        </button>
        <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()} disabled={currentView === 'trash'}>
          <span className="btn-icon">⬆</span> Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files.length) onUploadClick(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="toolbar-sep" />
        <button className="toolbar-btn" onClick={onRename} disabled={selectionCount !== 1}>
          <span className="btn-icon">✎</span> Rename
        </button>
        <button className="toolbar-btn" onClick={onDelete} disabled={selectionCount === 0}>
          <span className="btn-icon">🗑</span> {currentView === 'trash' ? 'Delete permanently' : 'Delete'}
        </button>
        <button className="toolbar-btn" onClick={onDownload} disabled={selectionCount === 0 || currentView === 'trash'}>
          <span className="btn-icon">⬇</span> Download
        </button>
        <div className="toolbar-sep" />
        <button className="toolbar-btn" onClick={onRefresh}>
          <span className="btn-icon">⟳</span> Refresh
        </button>
      </div>

      <div className="toolbar-right">
        <form
          className="search-box"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search My Cloud"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </form>

        <div className="view-toggle">
          <button
            className={viewMode === 'details' ? 'active' : ''}
            title="Details view"
            onClick={() => onViewModeChange('details')}
          >
            ☰
          </button>
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            title="Large icons"
            onClick={() => onViewModeChange('grid')}
          >
            ▦
          </button>
        </div>
      </div>
    </div>
  );
}
