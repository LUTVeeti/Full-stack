const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/fileController');

router.use(auth);

router.post('/upload', upload.array('files', 20), ctrl.uploadFiles);
router.get('/search', ctrl.search);
router.get('/trash', ctrl.listTrash);
router.patch('/:id/rename', ctrl.renameFile);
router.patch('/:id/move', ctrl.moveFile);
router.patch('/:id/restore', ctrl.restoreFile);
router.delete('/:id', ctrl.deleteFile);
router.delete('/:id/permanent', ctrl.permanentlyDeleteFile);
router.get('/:id/thumbnail', ctrl.getThumbnail);
router.get('/:id/download', ctrl.downloadFile);
router.get('/:id/stream', ctrl.streamFile);

module.exports = router;
