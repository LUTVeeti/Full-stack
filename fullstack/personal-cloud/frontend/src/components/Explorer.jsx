import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import Toolbar from './Toolbar.jsx';
import AddressBar from './AddressBar.jsx';
import FileView from './FileView.jsx';
import ContextMenu from './ContextMenu.jsx';
import PromptModal from './PromptModal.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import PreviewModal from './PreviewModal.jsx';
import StatusBar from './StatusBar.jsx';
import UploadToast from './UploadToast.jsx';
import * as foldersApi from '../api/folders.js';
import * as filesApi from '../api/files.js';

let uploadIdCounter = 0;

export default function Explorer() {
  const { user, logout, updateStorageUsed } = useAuth();

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'trash' | 'search'
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [viewMode, setViewMode] = useState('details');
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [uploads, setUploads] = useState([]);

  const dragCounter = useRef(0);
  const [pageDragOver, setPageDragOver] = useState(false);

  const items = buildItems();

  function buildItems() {
    if (currentView === 'trash') {
      return files.map((f) => ({
        id: f._id,
        name: f.name,
        itemType: 'file',
        category: f.category,
        size: f.size,
        updatedAt: f.updatedAt,
        thumbnailKey: f.thumbnailKey
      }));
    }
    if (currentView === 'search' && searchResults) {
      const f1 = searchResults.folders.map((f) => ({
        id: f._id,
        name: f.name,
        itemType: 'folder',
        updatedAt: f.updatedAt
      }));
      const f2 = searchResults.files.map((f) => ({
        id: f._id,
        name: f.name,
        itemType: 'file',
        category: f.category,
        size: f.size,
        updatedAt: f.updatedAt,
        thumbnailKey: f.thumbnailKey
      }));
      return [...f1, ...f2];
    }
    const folderItems = folders.map((f) => ({
      id: f._id,
      name: f.name,
      itemType: 'folder',
      updatedAt: f.updatedAt
    }));
    const fileItems = files.map((f) => ({
      id: f._id,
      name: f.name,
      itemType: 'file',
      category: f.category,
      size: f.size,
      updatedAt: f.updatedAt,
      thumbnailKey: f.thumbnailKey
    }));
    return [...folderItems, ...fileItems];
  }

  const loadTree = useCallback(async () => {
    const data = await foldersApi.getTree();
    setAllFolders(data.folders);
  }, []);

  const loadFolder = useCallback(async (folderId) => {
    setLoading(true);
    try {
      const data = await foldersApi.listContents(folderId);
      setFolders(data.folders);
      setFiles(data.files);
      setBreadcrumbs(data.breadcrumbs);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    try {
      const data = await filesApi.listTrash();
      setFiles(data.files);
      setFolders([]);
      setBreadcrumbs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
    loadFolder(null);
  }, [loadTree, loadFolder]);

  const navigate = (folderId) => {
    setCurrentView('home');
    setCurrentFolder(folderId);
    setSelectedIds([]);
    setSearchTerm('');
    setSearchResults(null);
    loadFolder(folderId);
  };

  const showTrash = () => {
    setCurrentView('trash');
    setSelectedIds([]);
    loadTrash();
  };

  const refresh = () => {
    loadTree();
    if (currentView === 'trash') loadTrash();
    else loadFolder(currentFolder);
  };

  const handleSelect = (id, mode) => {
    if (mode === 'clear') {
      setSelectedIds([]);
      return;
    }
    const idx = items.findIndex((it) => it.id === id);
    if (mode === 'single') {
      setSelectedIds([id]);
      setLastSelectedIndex(idx);
    } else if (mode === 'toggle') {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      setLastSelectedIndex(idx);
    } else if (mode === 'range' && lastSelectedIndex !== null) {
      const [start, end] = [lastSelectedIndex, idx].sort((a, b) => a - b);
      const rangeIds = items.slice(start, end + 1).map((it) => it.id);
      setSelectedIds(rangeIds);
    }
  };

  const handleOpen = (item) => {
    if (item.itemType === 'folder') {
      navigate(item.id);
    } else {
      setPreviewFile(item);
    }
  };

  const handleNewFolder = () => {
    setModal({ type: 'newFolder' });
  };

  const handleUpload = async (fileList) => {
    const batch = Array.from(fileList);
    const id = ++uploadIdCounter;
    const label = batch.length === 1 ? batch[0].name : `${batch.length} files`;
    setUploads((prev) => [...prev, { id, label, progress: 0, status: 'uploading' }]);

    try {
      const data = await filesApi.uploadFiles(batch, currentFolder, (progress) => {
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress } : u)));
      });
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'done', progress: 100 } : u)));
      updateStorageUsed(data.storageUsed);
      if (currentView === 'home') loadFolder(currentFolder);
      setTimeout(() => setUploads((prev) => prev.filter((u) => u.id !== id)), 2500);
    } catch (err) {
      setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'error' } : u)));
      setTimeout(() => setUploads((prev) => prev.filter((u) => u.id !== id)), 4000);
    }
  };

  const handleRenameAction = () => {
    if (selectedIds.length !== 1) return;
    const item = items.find((it) => it.id === selectedIds[0]);
    if (!item) return;
    setModal({ type: 'rename', item });
  };

  const handleDeleteAction = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setConfirmModal({
      title: currentView === 'trash' ? 'Delete permanently' : 'Delete',
      message:
        currentView === 'trash'
          ? `Permanently delete ${count} item${count !== 1 ? 's' : ''}? This cannot be undone.`
          : `Move ${count} item${count !== 1 ? 's' : ''} to the Recycle Bin?`,
      confirmLabel: currentView === 'trash' ? 'Delete permanently' : 'Delete',
      onConfirm: async () => {
        const selectedItems = items.filter((it) => selectedIds.includes(it.id));
        for (const item of selectedItems) {
          if (currentView === 'trash') {
            await filesApi.permanentlyDeleteFile(item.id);
          } else if (item.itemType === 'folder') {
            await foldersApi.deleteFolder(item.id);
          } else {
            await filesApi.deleteFile(item.id);
          }
        }
        setSelectedIds([]);
        setConfirmModal(null);
        refresh();
      }
    });
  };

  const handleDownloadAction = async () => {
    const selectedItems = items.filter((it) => selectedIds.includes(it.id) && it.itemType === 'file');
    for (const item of selectedItems) {
      await filesApi.downloadFile(item.id, item.name);
    }
  };

  const handleContextMenu = (e, item) => {
    const menuItems = [];
    if (currentView === 'trash') {
      menuItems.push({
        icon: '↺',
        label: 'Restore',
        onClick: async () => {
          await filesApi.restoreFile(item.id);
          refresh();
        }
      });
      menuItems.push({ divider: true });
      menuItems.push({
        icon: '🗑',
        label: 'Delete permanently',
        danger: true,
        onClick: handleDeleteAction
      });
    } else {
      if (item.itemType === 'file') {
        menuItems.push({ icon: '👁', label: 'Open / Preview', onClick: () => handleOpen(item) });
        menuItems.push({
          icon: '⬇',
          label: 'Download',
          onClick: () => filesApi.downloadFile(item.id, item.name)
        });
      } else {
        menuItems.push({ icon: '📂', label: 'Open', onClick: () => handleOpen(item) });
      }
      menuItems.push({ divider: true });
      menuItems.push({ icon: '✎', label: 'Rename', onClick: handleRenameAction });
      menuItems.push({ icon: '🗑', label: 'Delete', danger: true, onClick: handleDeleteAction });
    }
    setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
  };

  const handleDropOnFolder = async (targetFolderId) => {
    if (currentView === 'trash' || selectedIds.length === 0) return;
    const selectedItems = items.filter((it) => selectedIds.includes(it.id));
    for (const item of selectedItems) {
      if (item.itemType === 'folder') {
        if (item.id === targetFolderId) continue;
        await foldersApi.moveFolder(item.id, targetFolderId);
      } else {
        await filesApi.moveFile(item.id, targetFolderId);
      }
    }
    setSelectedIds([]);
    refresh();
  };

  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) {
      setCurrentView('home');
      setSearchResults(null);
      return;
    }
    setLoading(true);
    setCurrentView('search');
    try {
      const data = await filesApi.search(searchTerm.trim());
      setSearchResults(data);
    } finally {
      setLoading(false);
    }
  };

  // Page-level drag & drop for uploading files anywhere in the file view
  const handlePageDragEnter = (e) => {
    e.preventDefault();
    if (currentView === 'trash') return;
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes('Files')) setPageDragOver(true);
  };
  const handlePageDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setPageDragOver(false);
    }
  };
  const handlePageDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setPageDragOver(false);
    if (currentView === 'trash') return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const selectedItem = selectedIds.length === 1 ? items.find((it) => it.id === selectedIds[0]) : null;

  return (
    <div className="explorer-shell">
      <div className="title-bar">
        <div className="title-bar-left">☁ My Cloud</div>
        <div className="title-bar-right">
          <span className="title-user">{user?.name}</span>
          <button className="title-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>

      <Toolbar
        onNewFolder={handleNewFolder}
        onUploadClick={handleUpload}
        onDelete={handleDeleteAction}
        onRename={handleRenameAction}
        onDownload={handleDownloadAction}
        onRefresh={refresh}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectionCount={selectedIds.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        currentView={currentView}
      />

      <AddressBar breadcrumbs={breadcrumbs} currentView={currentView} onNavigate={navigate} />

      <div className="explorer-body">
        <Sidebar
          folders={allFolders}
          currentFolder={currentFolder}
          currentView={currentView}
          onNavigate={navigate}
          onShowTrash={showTrash}
          onDropItem={handleDropOnFolder}
        />

        <div
          className={`file-view-container ${pageDragOver ? 'page-drag-over' : ''}`}
          onDragEnter={handlePageDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handlePageDragLeave}
          onDrop={handlePageDrop}
        >
          {pageDragOver && (
            <div className="drop-hint">
              <div>⬆ Drop files to upload</div>
            </div>
          )}
          <FileView
            items={items}
            viewMode={viewMode}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
            onDropOnFolder={handleDropOnFolder}
            currentView={currentView}
            loading={loading}
          />
        </div>
      </div>

      <StatusBar
        itemCount={items.length}
        selectedCount={selectedIds.length}
        storageUsed={user?.storageUsed || 0}
        storageLimit={user?.storageLimit || 1}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}

      {modal?.type === 'newFolder' && (
        <PromptModal
          title="New folder"
          initialValue="New folder"
          confirmLabel="Create"
          onCancel={() => setModal(null)}
          onConfirm={async (name) => {
            await foldersApi.createFolder(name, currentFolder);
            setModal(null);
            refresh();
          }}
        />
      )}

      {modal?.type === 'rename' && (
        <PromptModal
          title="Rename"
          initialValue={modal.item.name}
          confirmLabel="Rename"
          onCancel={() => setModal(null)}
          onConfirm={async (name) => {
            if (modal.item.itemType === 'folder') {
              await foldersApi.renameFolder(modal.item.id, name);
            } else {
              await filesApi.renameFile(modal.item.id, name);
            }
            setModal(null);
            refresh();
          }}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}

      <UploadToast uploads={uploads} />
    </div>
  );
}
