import React from 'react';

export default function AddressBar({ breadcrumbs, currentView, onNavigate }) {
  return (
    <div className="address-bar">
      <div className="address-nav-btns">
        <span className="addr-btn">◀</span>
        <span className="addr-btn">▶</span>
      </div>
      <div className="address-path">
        {currentView === 'trash' ? (
          <span className="crumb active">🗑 Recycle Bin</span>
        ) : (
          <>
            <span className="crumb" onClick={() => onNavigate(null)}>
              ☁ My Cloud
            </span>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.id}>
                <span className="crumb-sep">›</span>
                <span
                  className={`crumb ${i === breadcrumbs.length - 1 ? 'active' : ''}`}
                  onClick={() => onNavigate(b.id)}
                >
                  {b.name}
                </span>
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
