export function formatBytes(bytes) {
  if (bytes === 0 || bytes === undefined || bytes === null) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function fileTypeLabel(item) {
  if (item.itemType === 'folder') return 'File folder';
  const category = item.category;
  const ext = item.name.includes('.') ? item.name.split('.').pop().toUpperCase() : '';
  switch (category) {
    case 'image':
      return `${ext} Image`;
    case 'video':
      return `${ext} Video`;
    case 'audio':
      return `${ext} Audio`;
    case 'document':
      return `${ext} Document`;
    case 'archive':
      return `${ext} Archive`;
    default:
      return ext ? `${ext} File` : 'File';
  }
}
