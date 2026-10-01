const Folder = require('../models/Folder');
const FileModel = require('../models/File');

// Build breadcrumb trail from a folder up to root
async function buildBreadcrumbs(folderId, owner) {
  const trail = [];
  let current = folderId;
  while (current) {
    const folder = await Folder.findOne({ _id: current, owner });
    if (!folder) break;
    trail.unshift({ id: folder._id, name: folder.name });
    current = folder.parentFolder;
  }
  return trail;
}

exports.createFolder = async (req, res) => {
  try {
    const { name, parentFolder = null } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    if (parentFolder) {
      const parent = await Folder.findOne({ _id: parentFolder, owner: req.user._id });
      if (!parent) return res.status(404).json({ message: 'Parent folder not found' });
    }

    const duplicate = await Folder.findOne({
      owner: req.user._id,
      parentFolder: parentFolder || null,
      name: name.trim(),
      trashed: false
    });
    if (duplicate) {
      return res.status(409).json({ message: 'A folder with this name already exists here' });
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user._id,
      parentFolder: parentFolder || null
    });

    res.status(201).json({ folder });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create folder', error: err.message });
  }
};

// List contents (subfolders + files) of a given folder (or root if none)
exports.listContents = async (req, res) => {
  try {
    const parentFolder = req.query.parentFolder || null;

    const [folders, files] = await Promise.all([
      Folder.find({ owner: req.user._id, parentFolder, trashed: false }).sort({ name: 1 }),
      FileModel.find({ owner: req.user._id, parentFolder, trashed: false }).sort({ name: 1 })
    ]);

    const breadcrumbs = parentFolder ? await buildBreadcrumbs(parentFolder, req.user._id) : [];

    res.json({ folders, files, breadcrumbs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list contents', error: err.message });
  }
};

exports.renameFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'New name is required' });
    }
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    folder.name = name.trim();
    await folder.save();
    res.json({ folder });
  } catch (err) {
    res.status(500).json({ message: 'Failed to rename folder', error: err.message });
  }
};

exports.moveFolder = async (req, res) => {
  try {
    const { parentFolder = null } = req.body;
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (String(parentFolder) === String(folder._id)) {
      return res.status(400).json({ message: 'Cannot move a folder into itself' });
    }

    folder.parentFolder = parentFolder || null;
    await folder.save();
    res.json({ folder });
  } catch (err) {
    res.status(500).json({ message: 'Failed to move folder', error: err.message });
  }
};

// Recursively trash a folder and everything inside it
async function trashRecursive(folderId, owner) {
  const subfolders = await Folder.find({ owner, parentFolder: folderId });
  for (const sub of subfolders) {
    await trashRecursive(sub._id, owner);
  }
  await Folder.updateOne({ _id: folderId, owner }, { trashed: true });
  await FileModel.updateMany({ owner, parentFolder: folderId }, { trashed: true });
}

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, owner: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    await trashRecursive(folder._id, req.user._id);
    res.json({ message: 'Folder moved to trash' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete folder', error: err.message });
  }
};

exports.getTree = async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id, trashed: false }).sort({ name: 1 });
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load folder tree', error: err.message });
  }
};
