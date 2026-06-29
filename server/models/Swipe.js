import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
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
  action: {
    type: String,
    enum: ['pass', 'like', 'favorite'],
    required: true,
  },
}, { timestamps: true });

swipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
swipeSchema.index({ fromUser: 1, createdAt: -1 });

export default mongoose.model('Swipe', swipeSchema);
