const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    storageKey: { type: String, required: true }, // filename on disk in uploads/
    thumbnailKey: { type: String, default: null },
    category: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'archive', 'other'],
      default: 'other'
    },
    trashed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

FileSchema.index({ owner: 1, parentFolder: 1, name: 1 });

module.exports = mongoose.model('File', FileSchema);
