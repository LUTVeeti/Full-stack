const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const FileModel = require('../models/File');
const User = require('../models/User');
const { getCategory } = require('../utils/fileCategory');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const thumbsDir = path.join(uploadsDir, 'thumbnails');
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

exports.uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const parentFolder = req.body.parentFolder || null;
    const user = await User.findById(req.user._id);

    const totalIncomingSize = files.reduce((sum, f) => sum + f.size, 0);
    if (user.storageUsed + totalIncomingSize > user.storageLimit) {
      // Clean up the files multer already wrote to disk before rejecting
      files.forEach((f) => fs.unlink(f.path, () => {}));
      return res.status(413).json({ message: 'Upload would exceed your storage quota' });
    }

    const created = [];

    for (const file of files) {
      const category = getCategory(file.mimetype);
      let thumbnailKey = null;

      if (category === 'image') {
        try {
          const thumbName = `thumb-${uuidv4()}.webp`;
          await sharp(file.path)
            .resize(300, 300, { fit: 'cover' })
            .webp({ quality: 70 })
            .toFile(path.join(thumbsDir, thumbName));
          thumbnailKey = thumbName;
        } catch (thumbErr) {
          // Thumbnail generation failing shouldn't block the upload
          thumbnailKey = null;
        }
      }

      const doc = await FileModel.create({
        name: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        owner: req.user._id,
        parentFolder: parentFolder || null,
        storageKey: file.filename,
        thumbnailKey,
        category
      });

      created.push(doc);
    }

    user.storageUsed += totalIncomingSize;
    await user.save();

    res.status(201).json({ files: created, storageUsed: user.storageUsed });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

exports.renameFile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'New name is required' });
    }
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.name = name.trim();
    await file.save();
    res.json({ file });
  } catch (err) {
    res.status(500).json({ message: 'Failed to rename file', error: err.message });
  }
};

exports.moveFile = async (req, res) => {
  try {
    const { parentFolder = null } = req.body;
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.parentFolder = parentFolder || null;
    await file.save();
    res.json({ file });
  } catch (err) {
    res.status(500).json({ message: 'Failed to move file', error: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.trashed = true;
    await file.save();
    res.json({ message: 'File moved to trash' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete file', error: err.message });
  }
};

exports.permanentlyDeleteFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const filePath = path.join(uploadsDir, file.storageKey);
    fs.unlink(filePath, () => {});
    if (file.thumbnailKey) {
      fs.unlink(path.join(thumbsDir, file.thumbnailKey), () => {});
    }

    const user = await User.findById(req.user._id);
    user.storageUsed = Math.max(0, user.storageUsed - file.size);
    await user.save();

    await file.deleteOne();
    res.json({ message: 'File permanently deleted', storageUsed: user.storageUsed });
  } catch (err) {
    res.status(500).json({ message: 'Failed to permanently delete file', error: err.message });
  }
};

exports.listTrash = async (req, res) => {
  try {
    const files = await FileModel.find({ owner: req.user._id, trashed: true }).sort({ updatedAt: -1 });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list trash', error: err.message });
  }
};

exports.restoreFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.trashed = false;
    await file.save();
    res.json({ file });
  } catch (err) {
    res.status(500).json({ message: 'Failed to restore file', error: err.message });
  }
};

exports.getThumbnail = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file || !file.thumbnailKey) return res.status(404).end();

    const thumbPath = path.join(thumbsDir, file.thumbnailKey);
    if (!fs.existsSync(thumbPath)) return res.status(404).end();

    res.sendFile(thumbPath);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load thumbnail', error: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const filePath = path.join(uploadsDir, file.storageKey);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on disk' });

    res.download(filePath, file.name);
  } catch (err) {
    res.status(500).json({ message: 'Failed to download file', error: err.message });
  }
};

// Streams with HTTP range support so video/audio can be scrubbed in the browser
exports.streamFile = async (req, res) => {
  try {
    const file = await FileModel.findOne({ _id: req.params.id, owner: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const filePath = path.join(uploadsDir, file.storageKey);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on disk' });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': file.mimeType
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': file.mimeType,
        'Accept-Ranges': 'bytes'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to stream file', error: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ files: [], folders: [] });

    const regex = new RegExp(q.trim(), 'i');
    const [files, folders] = await Promise.all([
      FileModel.find({ owner: req.user._id, trashed: false, name: regex }).limit(100),
      require('../models/Folder').find({ owner: req.user._id, trashed: false, name: regex }).limit(100)
    ]);

    res.json({ files, folders });
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
};
