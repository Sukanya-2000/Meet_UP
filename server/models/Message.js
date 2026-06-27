import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    index: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  text: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  attachments: [{
    url: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    kind: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'file'],
      default: 'file',
    },
  }],
  deliveredAt: {
    type: Date,
    default: null,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

messageSchema.index({ matchId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });

messageSchema.pre('validate', function normalizeText(next) {
  if (!this.text && this.message) this.text = this.message;
  if (!this.message && this.text) this.message = this.text;
  if (!this.message && this.attachments?.length) this.message = '[Media]';
  if (!this.text && this.attachments?.length) this.text = '';
  next();
});

export default mongoose.model('Message', messageSchema);
