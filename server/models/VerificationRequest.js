import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documentUrl: { type: String, trim: true, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  note: { type: String, trim: true, maxlength: 500, default: '' },
}, { timestamps: true });

verificationRequestSchema.index({ userId: 1, status: 1 });
export default mongoose.model('VerificationRequest', verificationRequestSchema);
