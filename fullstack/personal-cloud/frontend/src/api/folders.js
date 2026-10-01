import api from './client';

export const listContents = (parentFolder) =>
  api.get('/folders', { params: { parentFolder: parentFolder || '' } }).then((r) => r.data);

export const getTree = () => api.get('/folders/tree').then((r) => r.data);

export const createFolder = (name, parentFolder) =>
  api.post('/folders', { name, parentFolder }).then((r) => r.data);

export const renameFolder = (id, name) => api.patch(`/folders/${id}/rename`, { name }).then((r) => r.data);

export const moveFolder = (id, parentFolder) =>
  api.patch(`/folders/${id}/move`, { parentFolder }).then((r) => r.data);

export const deleteFolder = (id) => api.delete(`/folders/${id}`).then((r) => r.data);
