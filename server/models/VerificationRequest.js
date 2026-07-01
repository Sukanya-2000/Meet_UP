import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documentUrl: { type: String, trim: true, default: '' },
  selfieUrl: { type: String, trim: true, default: '' },
  type: { type: String, enum: ['selfie','liveness','identity'], default: 'selfie' },
  attempt: { type: Number, min: 1, max: 5, default: 1 },
  challenge: { type: String, maxlength: 200, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  note: { type: String, trim: true, maxlength: 500, default: '' },
  history: [{ status: String, note: String, at: { type: Date, default: Date.now }, actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } }],
}, { timestamps: true });

verificationRequestSchema.index({ userId: 1, status: 1 });
export default mongoose.model('VerificationRequest', verificationRequestSchema);
