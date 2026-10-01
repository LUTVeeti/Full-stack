const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/folderController');

router.use(auth);

router.get('/', ctrl.listContents);
router.get('/tree', ctrl.getTree);
router.post('/', ctrl.createFolder);
router.patch('/:id/rename', ctrl.renameFolder);
router.patch('/:id/move', ctrl.moveFolder);
router.delete('/:id', ctrl.deleteFolder);

module.exports = router;
