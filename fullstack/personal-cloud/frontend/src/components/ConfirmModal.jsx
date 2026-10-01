import React from 'react';

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onMouseDown={onCancel}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className={`modal-btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
