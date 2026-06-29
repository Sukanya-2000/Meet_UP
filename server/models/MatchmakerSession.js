import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voterName: { type: String, trim: true, maxlength: 80, default: '' },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vote: { type: String, enum: ['yes', 'no', 'maybe'], required: true },
  note: { type: String, trim: true, maxlength: 240, default: '' },
}, { timestamps: true, _id: false });

const matchmakerSessionSchema = new mongoose.Schema({
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'closed'],
    default: 'active',
    index: true,
  },
  votes: [voteSchema],
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
}, { timestamps: true });

export default mongoose.model('MatchmakerSession', matchmakerSessionSchema);
