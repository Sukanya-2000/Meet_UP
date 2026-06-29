import mongoose from 'mongoose';

const astrologyCompatibilityCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  score: { type: Number, min: 0, max: 100, required: true },
  label: { type: String, trim: true, maxlength: 80, default: '' },
  aspects: [{ type: String, trim: true, maxlength: 120 }],
  calculatedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

astrologyCompatibilityCacheSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

export default mongoose.model('AstrologyCompatibilityCache', astrologyCompatibilityCacheSchema);
