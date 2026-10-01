import React, { useEffect, useRef, useState } from 'react';

export default function PromptModal({ title, initialValue = '', confirmLabel = 'OK', onConfirm, onCancel }) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div className="modal-overlay" onMouseDown={onCancel}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) onConfirm(value.trim());
            if (e.key === 'Escape') onCancel();
          }}
        />
        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn primary" disabled={!value.trim()} onClick={() => onConfirm(value.trim())}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
