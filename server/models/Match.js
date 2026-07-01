import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  matchedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'unmatched'],
    default: 'active',
  },
  unmatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  unmatchedAt: { type: Date, default: null },
  unmatchReason: { type: String, trim: true, maxlength: 300, default: '' },
  expiresAt: { type: Date, default: null, index: true },
  graceEndsAt: { type: Date, default: null },
  extendedUntil: { type: Date, default: null },
  extensionCount: { type: Number, min: 0, default: 0 },
  firstMoveRule: { type: String, enum: ['anyone','women-first','opening-move','custom'], default: 'anyone' },
  firstMessageSentAt: { type: Date, default: null },
}, { timestamps: true });

matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model('Match', matchSchema);
