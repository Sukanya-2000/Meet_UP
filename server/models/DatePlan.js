import mongoose from 'mongoose';

const trustedContactSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 80, default: '' },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
  email: { type: String, trim: true, lowercase: true, maxlength: 160, default: '' },
}, { _id: false });

const datePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    index: true,
  },
  venue: { type: String, trim: true, maxlength: 160, default: '' },
  scheduledFor: { type: Date, index: true },
  trustedContacts: [trustedContactSchema],
  shareToken: { type: String, unique: true, sparse: true, index: true },
  status: {
    type: String,
    enum: ['draft', 'shared', 'checked-in', 'arrived', 'emergency', 'completed', 'cancelled'],
    default: 'draft',
    index: true,
  },
  liveNote: { type: String, trim: true, maxlength: 500, default: '' },
  arrivedAt: { type: Date, default: null }, finishedAt: { type: Date, default: null }, cancelledAt: { type: Date, default: null }, emergencyAt: { type: Date, default: null },
  history: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.model('DatePlan', datePlanSchema);
