const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    trashed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

FolderSchema.index({ owner: 1, parentFolder: 1, name: 1 });

module.exports = mongoose.model('Folder', FolderSchema);
