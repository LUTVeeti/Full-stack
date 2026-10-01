import React from 'react';

export default function UploadToast({ uploads }) {
  if (uploads.length === 0) return null;

  return (
    <div className="upload-toast">
      {uploads.map((u) => (
        <div key={u.id} className="upload-toast-row">
          <div className="upload-toast-top">
            <span>{u.label}</span>
            <span>{u.status === 'error' ? 'Failed' : u.status === 'done' ? 'Done' : `${u.progress}%`}</span>
          </div>
          <div className="upload-toast-bar">
            <div
              className={`upload-toast-fill ${u.status === 'error' ? 'error' : ''} ${
                u.status === 'done' ? 'done' : ''
              }`}
              style={{ width: `${u.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
