import React, { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const menuWidth = 190;
  const menuHeight = items.length * 34 + 10;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuHeight - 8);

  return (
    <div className="context-menu" style={{ left, top }} ref={ref}>
      {items.map((item, idx) =>
        item.divider ? (
          <div key={idx} className="context-menu-divider" />
        ) : (
          <div
            key={idx}
            className={`context-menu-item ${item.danger ? 'danger' : ''}`}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            <span className="ctx-icon">{item.icon}</span>
            {item.label}
          </div>
        )
      )}
    </div>
  );
}
