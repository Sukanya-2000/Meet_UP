import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  deviceName: { type: String, trim: true, maxlength: 120, default: 'Unknown device' },
  userAgent: { type: String, maxlength: 500, default: '' },
  ipAddress: { type: String, maxlength: 80, default: '' },
  lastUsedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('UserSession', schema);
