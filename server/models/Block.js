import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  blockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  blockedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reason: { type: String, trim: true, maxlength: 300, default: '' },
}, { timestamps: true });

blockSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
export default mongoose.model('Block', blockSchema);
