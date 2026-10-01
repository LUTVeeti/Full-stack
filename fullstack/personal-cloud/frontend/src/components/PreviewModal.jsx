import React, { useEffect } from 'react';
import { streamUrl, downloadFile } from '../api/files.js';
import { formatBytes, formatDate } from '../utils/format.js';

export default function PreviewModal({ file, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!file) return null;

  return (
    <div className="preview-overlay" onMouseDown={onClose}>
      <div className="preview-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <span className="preview-name">{file.name}</span>
          <div className="preview-actions">
            <button onClick={() => downloadFile(file.id, file.name)}>⬇ Download</button>
            <button onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="preview-body">
          {file.category === 'image' && (
            <img src={streamUrl(file.id)} alt={file.name} className="preview-media" />
          )}
          {file.category === 'video' && (
            <video src={streamUrl(file.id)} controls autoPlay className="preview-media" />
          )}
          {file.category === 'audio' && (
            <audio src={streamUrl(file.id)} controls className="preview-audio" />
          )}
          {!['image', 'video', 'audio'].includes(file.category) && (
            <div className="preview-unsupported">
              <p>No inline preview available for this file type.</p>
              <button onClick={() => downloadFile(file.id, file.name)}>Download to view</button>
            </div>
          )}
        </div>
        <div className="preview-footer">
          {formatBytes(file.size)} · Modified {formatDate(file.updatedAt)}
        </div>
      </div>
    </div>
  );
}
