import mongoose from 'mongoose';

const safetyCheckInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
  scheduledFor: { type: Date, required: true, index: true },
  venue: { type: String, trim: true, maxlength: 150, required: true },
  trustedContactName: { type: String, trim: true, maxlength: 80, default: '' },
  trustedContactPhone: { type: String, trim: true, maxlength: 30, default: '' },
  status: {
    type: String,
    enum: ['scheduled', 'safe', 'needs-help', 'cancelled', 'overdue'],
    default: 'scheduled',
    index: true,
  },
  checkedInAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('SafetyCheckIn', safetyCheckInSchema);
