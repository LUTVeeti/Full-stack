import React, { useMemo, useState } from 'react';

function buildTree(folders) {
  const byParent = {};
  folders.forEach((f) => {
    const key = f.parentFolder || 'root';
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(f);
  });
  return byParent;
}

function TreeNode({ folder, byParent, depth, currentFolder, onNavigate, onDropItem }) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const children = byParent[folder._id] || [];
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={`tree-row ${currentFolder === folder._id ? 'active' : ''} ${dragOver ? 'drag-over' : ''}`}
        style={{ paddingLeft: 14 + depth * 16 }}
        onClick={() => onNavigate(folder._id)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onDropItem(folder._id);
        }}
      >
        <span
          className={`tree-caret ${hasChildren ? '' : 'invisible'}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          {hasChildren ? (open ? '▾' : '▸') : ''}
        </span>
        <span className="tree-icon">📁</span>
        <span className="tree-label">{folder.name}</span>
      </div>
      {open &&
        children.map((child) => (
          <TreeNode
            key={child._id}
            folder={child}
            byParent={byParent}
            depth={depth + 1}
            currentFolder={currentFolder}
            onNavigate={onNavigate}
            onDropItem={onDropItem}
          />
        ))}
    </div>
  );
}

export default function Sidebar({ folders, currentFolder, currentView, onNavigate, onShowTrash, onDropItem }) {
  const byParent = useMemo(() => buildTree(folders), [folders]);
  const roots = byParent.root || [];
  const [homeDragOver, setHomeDragOver] = useState(false);

  return (
    <div className="sidebar">
      <div
        className={`tree-row top-row ${currentView === 'home' && !currentFolder ? 'active' : ''} ${
          homeDragOver ? 'drag-over' : ''
        }`}
        onClick={() => onNavigate(null)}
        onDragOver={(e) => {
          e.preventDefault();
          setHomeDragOver(true);
        }}
        onDragLeave={() => setHomeDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHomeDragOver(false);
          onDropItem(null);
        }}
      >
        <span className="tree-icon">☁</span>
        <span className="tree-label">My Cloud</span>
      </div>

      <div className="sidebar-section-label">This PC</div>
      {roots.map((folder) => (
        <TreeNode
          key={folder._id}
          folder={folder}
          byParent={byParent}
          depth={0}
          currentFolder={currentFolder}
          onNavigate={onNavigate}
          onDropItem={onDropItem}
        />
      ))}

      <div className="sidebar-divider" />
      <div className={`tree-row top-row ${currentView === 'trash' ? 'active' : ''}`} onClick={onShowTrash}>
        <span className="tree-icon">🗑</span>
        <span className="tree-label">Recycle Bin</span>
      </div>
    </div>
  );
}
