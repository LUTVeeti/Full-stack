import api from './client';

export const uploadFiles = (fileList, parentFolder, onProgress) => {
  const form = new FormData();
  Array.from(fileList).forEach((f) => form.append('files', f));
  if (parentFolder) form.append('parentFolder', parentFolder);

  return api
    .post('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    })
    .then((r) => r.data);
};

export const renameFile = (id, name) => api.patch(`/files/${id}/rename`, { name }).then((r) => r.data);

export const moveFile = (id, parentFolder) =>
  api.patch(`/files/${id}/move`, { parentFolder }).then((r) => r.data);

export const deleteFile = (id) => api.delete(`/files/${id}`).then((r) => r.data);

export const permanentlyDeleteFile = (id) => api.delete(`/files/${id}/permanent`).then((r) => r.data);

export const restoreFile = (id) => api.patch(`/files/${id}/restore`).then((r) => r.data);

export const listTrash = () => api.get('/files/trash').then((r) => r.data);

export const search = (q) => api.get('/files/search', { params: { q } }).then((r) => r.data);

export const thumbnailUrl = (id) =>
  `${api.defaults.baseURL}/files/${id}/thumbnail?token=${localStorage.getItem('token')}`;

export const streamUrl = (id) =>
  `${api.defaults.baseURL}/files/${id}/stream?token=${localStorage.getItem('token')}`;

export const downloadUrl = (id) => `${api.defaults.baseURL}/files/${id}/download`;

export const downloadFile = async (id, name) => {
  const res = await api.get(`/files/${id}/download`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
