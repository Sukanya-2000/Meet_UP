import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['like', 'match', 'message', 'verification', 'subscription', 'moderation', 'safety', 'system'],
    required: true,
  },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, required: true, trim: true, maxlength: 500 },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  readAt: { type: Date, default: null },
  deepLink: { type: String, maxlength: 300, default: '' },
}, { timestamps: true });
notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
