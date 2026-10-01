import React from 'react';

// Simple flat SVG icons so the app has no external icon dependency.
export default function FileIcon({ type, category, size = 20 }) {
  if (type === 'folder') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M2 6.5C2 5.67 2.67 5 3.5 5h5.06c.36 0 .7.14.96.38l1.2 1.12c.26.24.6.38.96.38H20.5c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5h-17C2.67 20 2 19.33 2 18.5v-12z"
          fill="#FFCA5F"
        />
        <path
          d="M2 8.5C2 7.67 2.67 7 3.5 7h17c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-17C2.67 19 2 18.33 2 17.5v-9z"
          fill="#FFDD87"
        />
      </svg>
    );
  }

  const colors = {
    image: '#5FA8FF',
    video: '#FF6B6B',
    audio: '#B084F5',
    document: '#4FB8A6',
    archive: '#D9A441',
    other: '#9AA5B1'
  };
  const color = colors[category] || colors.other;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 2h8l5 5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V3.5A1.5 1.5 0 0 1 6.5 2z"
        fill="#F3F5F7"
        stroke="#CBD2D9"
        strokeWidth="1"
      />
      <path d="M14 2v4.5A1.5 1.5 0 0 0 15.5 8H20" fill="none" stroke="#CBD2D9" strokeWidth="1" />
      <rect x="7.5" y="11" width="9" height="6.5" rx="1" fill={color} opacity="0.85" />
    </svg>
  );
}
