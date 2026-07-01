import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    unique: true,
    index: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  active: { type: Boolean, default: true, index: true },
  closedAt: { type: Date, default: null },
}, { timestamps: true });

conversationSchema.path('participants').validate(
  (participants) => participants.length === 2,
  'Conversation must have exactly two participants',
);

export default mongoose.model('Conversation', conversationSchema);
