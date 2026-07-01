import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'passed'],
    default: 'pending',
    index: true,
  },
  kind: { type: String, enum: ['like', 'super-like'], default: 'like', index: true },
  note: { type: String, trim: true, maxlength: 280, default: '' },
}, { timestamps: true });

likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
likeSchema.index({ toUser: 1, status: 1, createdAt: -1 });
likeSchema.index({ fromUser: 1, status: 1, createdAt: -1 });

export default mongoose.model('Like', likeSchema);
