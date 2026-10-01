const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    storageUsed: { type: Number, default: 0 },
    storageLimit: {
      type: Number,
      default: () => Number(process.env.DEFAULT_STORAGE_LIMIT_BYTES) || 5 * 1024 * 1024 * 1024
    }
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    storageUsed: this.storageUsed,
    storageLimit: this.storageLimit
  };
};

module.exports = mongoose.model('User', UserSchema);
